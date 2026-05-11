"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Sun,
  User,
  Activity,
  Zap,
  Download,
  Star,
  RefreshCw
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useJourney } from "@/hooks/useJourney";
import { getSunSign } from "@/lib/astrology";
import { AKASHA_PERSONA } from "@/lib/ai";
import { useAIStream } from "@/hooks/useAIStream";
import { MysticImage } from "./MysticImage";
import { TarotCardBack } from "./TarotComponents";
import { saveToIndexedDB, getFromIndexedDB } from "@/lib/storage";
import { useAppStore } from "@/lib/store";
import { getDailyTarotCards } from "@/lib/tarot-data";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { entries, isLoaded: journeyLoaded } = useJourney();
  const { stream } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setHandoff = useAppStore((state: any) => state.setHandoff);
  
  const isLoaded = isProfileLoaded && journeyLoaded;
  const lastEntry = entries[0];
  const isProfileComplete = profile.name && profile.mbti && profile.jungianArchetype;
  
  // Use useMemo for stable date and greeting during a session
  const { today, dateStr, greeting } = useMemo(() => {
    const d = new Date();
    const ds = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const hour = d.getHours();
    let g = "夜安";
    if (hour >= 5 && hour < 12) g = "早安";
    else if (hour >= 12 && hour < 18) g = "午安";
    else if (hour >= 18 && hour < 22) g = "晚安";
    
    return { today: d, dateStr: ds, greeting: g };
  }, []);

  const sunSign = profile.birthDate ? getSunSign(new Date(profile.birthDate)) : "探索者";
  const name = profile.name || "旅人";
  
  const [isInitializing, setIsInitializing] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const [dailyData, setDailyData] = useState({
    oracle: "「 星辰已为你排好阵列，只待你勇敢一跃。」",
    pitfall: "保持内心平和，避免情绪化决策。",
    luckyColor: "月光白，带来平静与直觉。",
    imagePrompt: "A mystical oracle card floating in a nebula, cosmic eye, sacred geometry"
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    await handleGeneratePoster(cardRef.current, `mystic-oracle-${dateStr}.jpg`);
  };

  useEffect(() => {
    if (!isLoaded) return;
    
    const initDaily = async () => {
      const todayStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const hour = today.getHours();
      const timePeriod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : hour >= 18 && hour < 22 ? 'evening' : 'night';
      const cacheKey = `daily_merged_v1_${todayStr}_${timePeriod}_${profile.name || 'guest'}`;
      
      try {
        const cached = await getFromIndexedDB(cacheKey);
        if (cached) {
          setDailyData(cached as any);
          setIsInitializing(false);
          return;
        }
      } catch (e) {
        console.warn("IndexedDB read failed", e);
      }
      
      const cards = getDailyTarotCards(3);
      const cardNames = cards.map(c => `${c.name}${c.isReversed ? '(逆位)' : '(正位)'}`).join('、');
      
      const prompt = `
<instruction>
今日是${todayStr}，${greeting}。请为用户生成今日专属的灵魂神谕与能量指引。
用户抽到了三张塔罗牌：${cardNames}。
请严格使用以下标签返回数据，不需要其他多余文本：
[SOUL_MOTTO] 一句充满力量的简短格言，作为今日神谕，20字以内 [/SOUL_MOTTO]
[PITFALL] 今日需要避免的事情或心态，20字以内 [/PITFALL]
[LUCKY_COLOR] 今日的幸运色及简短理由，15字以内 [/LUCKY_COLOR]
</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>
      `;

      let fullResponse = "";
      try {
        for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
          fullResponse += chunk;
        }

        const mottoMatch = fullResponse.match(/\[SOUL_MOTTO\]([\s\S]*?)\[\/SOUL_MOTTO\]/);
        const pitfallMatch = fullResponse.match(/\[PITFALL\]([\s\S]*?)\[\/PITFALL\]/);
        const colorMatch = fullResponse.match(/\[LUCKY_COLOR\]([\s\S]*?)\[\/LUCKY_COLOR\]/);
        
        const oracle = mottoMatch ? `「 ${mottoMatch[1].trim()} 」` : "「 星辰的轨迹已经显现，跟随直觉指引方向。」";
        const pitfall = pitfallMatch ? pitfallMatch[1].trim() : "勿因外物纷扰而失去内心的平衡。";
        const luckyColor = colorMatch ? colorMatch[1].trim() : "星空蓝，增强理智与觉察力。";

        const newDaily = {
          oracle,
          pitfall,
          luckyColor,
          imagePrompt: `A mystical, ethereal representation of ${cardNames.split('、')[0]} in a cosmic, dreamlike style, high fantasy, 8k resolution`,
        };
        
        await saveToIndexedDB(cacheKey, newDaily);
        setDailyData(newDaily);
      } catch (err) {
        console.error("Failed to generate daily reading:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, profile.name, greeting, today]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-[#C9A84C] animate-spin" />
        <p className="font-serif text-[#E8DFB8]/40 tracking-[0.2em]">正在同步宇宙频率与灵魂轨迹...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="space-y-4 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="w-12 h-12 rounded-full border border-[#C9A84C]/40 flex items-center justify-center">
            <Sun className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <div>
            <p className="micro-label opacity-60">{dateStr}</p>
            <h1 className="editorial-title text-3xl md:text-5xl">{greeting}，{name}。</h1>
          </div>
        </div>
        <p className="text-[#E8DFB8]/40 font-serif tracking-widest text-sm md:text-base">
          你是星尘的碎片，也是宇宙的观测者。
        </p>
      </header>

      {/* Main Oracle Card */}
      <section className="relative group">
        <div 
          ref={cardRef}
          className="luxury-card aspect-[16/9] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center"
        >
          <div className="absolute inset-0 z-0 scale-105 group-hover:scale-110 transition-transform duration-[2s]">
             <MysticImage 
               prompt={dailyData.imagePrompt}
               className="w-full h-full opacity-40 mix-blend-lighten"
               aspectRatio="16:9"
             />
          </div>
          
          <div className="relative z-10 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="micro-label text-[#C9A84C]">今日神谕 · Oracle</span>
              <h2 className="text-2xl md:text-4xl font-serif leading-relaxed gold-gradient-text drop-shadow-2xl px-4">
                {dailyData.oracle}
              </h2>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <button 
               onClick={handleDownload}
               disabled={isGeneratingPoster}
               className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-[#C9A84C]/30 text-xs font-serif tracking-widest hover:bg-[#C9A84C]/20 transition-all flex items-center gap-2"
             >
               <Download className="w-4 h-4" />
               {isGeneratingPoster ? "生成中..." : "保存这张神谕卡"}
             </button>
          </div>
        </div>
      </section>

      {/* Today's Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="cinematic-panel p-8 space-y-4 group hover:border-[#C9A84C]/30 transition-all">
          <div className="flex items-center gap-3">
             <Star className="w-5 h-5 text-[#C9A84C] opacity-60" />
             <h4 className="micro-label">今日避坑</h4>
          </div>
          <p className="font-serif text-lg leading-relaxed text-[#E8DFB8]/80">
            {dailyData.pitfall}
          </p>
        </div>

        <div className="cinematic-panel p-8 space-y-4 group hover:border-[#C9A84C]/30 transition-all">
          <div className="flex items-center gap-3">
             <Sparkles className="w-5 h-5 text-[#C9A84C] opacity-60" />
             <h4 className="micro-label">幸运色彩</h4>
          </div>
          <p className="font-serif text-lg leading-relaxed text-[#E8DFB8]/80">
            {dailyData.luckyColor}
          </p>
        </div>

        <div className="cinematic-panel p-8 space-y-4 group hover:border-[#C9A84C]/30 transition-all">
          <div className="flex items-center gap-3">
             <Activity className="w-5 h-5 text-[#C9A84C] opacity-60" />
             <h4 className="micro-label">灵魂底色</h4>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-serif text-lg text-[#E8DFB8]/80">{sunSign}</p>
            <span className="text-[10px] font-serif border border-[#C9A84C]/20 px-2 py-0.5 rounded text-[#C9A84C]/60 italic">
              {profile.mbti || "未觉醒"}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Access Grid (The Tarot Flips) */}
      <section className="space-y-8">
        <h4 className="micro-label opacity-40 text-center">宇宙导航 · Universal Navigation</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { id: "tarot", name: "塔罗占卜", system: "tarot", context: "我想进行一次深度的命运探索" },
            { id: "iching", name: "易经起卦", system: "iching", context: "我想开启一次周易占卜" },
            { id: "astrology", name: "星象解析", system: "astrology", context: "我想了解我的星盘细节" },
            { id: "shadow", name: "阴影工作", system: "shadow", context: "我想直面我潜意识中的暗流" },
          ].map((item, i) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -10 }}
              onClick={() => {
                setHandoff({ system: item.system, context: item.context });
                setActiveTab("explore");
              }}
              className="flex flex-col items-center gap-4 cursor-pointer group"
            >
              <div className="relative transform-gpu transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front (Card Back Style) */}
                <TarotCardBack size="small" className="shadow-[0_0_30px_rgba(201,168,76,0.1)]" />
                
                {/* Back (Icon & Title) */}
                <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="w-full h-full bg-[#1a1210] border-2 border-[#C9A84C]/40 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <Zap className="w-6 h-6 text-[#C9A84C] mb-2 animate-pulse" />
                    <span className="text-xs font-serif tracking-widest gold-gradient-text">{item.name}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-serif tracking-[0.3em] opacity-40 group-hover:opacity-100 group-hover:text-[#C9A84C] transition-all">
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Records Footer */}
      {lastEntry && (
        <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
               <Activity className="w-4 h-4 text-[#C9A84C]/60" />
             </div>
             <div>
               <p className="text-[10px] micro-label">最后一次命运轨迹</p>
               <p className="text-sm font-serif">{lastEntry.title}</p>
             </div>
          </div>
          <button 
            onClick={() => setActiveTab("journal")}
            className="text-xs font-serif tracking-widest border-b border-[#C9A84C]/20 pb-1 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all"
          >
            查阅完整的阿卡夏记录 →
          </button>
        </footer>
      )}
    </div>
  );
}
