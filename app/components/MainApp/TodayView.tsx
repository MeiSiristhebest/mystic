"use client";

import { useState, useEffect, useRef } from "react";
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
  const { stream, isLoading: isGenerating } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setHandoff = useAppStore((state: any) => state.setHandoff);
  
  const isLoaded = isProfileLoaded && journeyLoaded;
  const lastEntry = entries[0];
  const isProfileComplete = profile.name && profile.mbti && profile.jungianArchetype;
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const sunSign = profile.birthDate ? getSunSign(new Date(profile.birthDate)) : "探索者";
  const name = profile.name || "旅人";
  
  const [greeting, setGreeting] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const [dailyData, setDailyData] = useState({
    oracle: "「 星辰已为你排好阵列，只待你勇敢一跃。」",
    pitfall: "保持内心平和，避免情绪化决策。",
    luckyColor: "月光白，带来平静与直觉。",
    imagePrompt: "A mystical oracle card floating in a nebula, cosmic eye, sacred geometry"
  });

  useEffect(() => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) setGreeting("早安");
    else if (hour >= 12 && hour < 18) setGreeting("午安");
    else if (hour >= 18 && hour < 22) setGreeting("晚安");
    else setGreeting("夜安");
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    await handleGeneratePoster(cardRef.current, `mystic-oracle-${dateStr}.jpg`);
  };

  useEffect(() => {
    if (!isLoaded) return;
    
    const initDaily = async () => {
      const todayStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const hour = new Date().getHours();
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
        const pitfall = pitfallMatch ? pitfallMatch[1].trim() : "勿因外物纷扰而失去内心的平静。";
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
  }, [isLoaded, profile.name, greeting]);

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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center md:justify-start gap-4"
        >
          <span className="micro-label">{dateStr}</span>
          <div className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
          <span className="micro-label">宇宙能量：对齐</span>
        </motion.div>
        <h1 className="editorial-title">
          {greeting}，<span className="gold-gradient-text">{name}</span>
        </h1>
      </header>

      {/* Main Oracle Card */}
      <section ref={cardRef} className="luxury-card relative overflow-hidden group min-h-[300px] flex items-center bg-[#050308] p-0">
        <div className="absolute inset-0 z-0">
          <MysticImage 
            prompt={dailyData.imagePrompt} 
            className="w-full h-full opacity-50 group-hover:opacity-70 transition-opacity duration-1000"
            aspectRatio="16:9"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080510] via-transparent to-transparent z-0" />
        
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 z-10">
          <Sparkles className="w-32 h-32 text-[#C9A84C]" />
        </div>
        
        <div className="space-y-8 relative z-20 p-8 md:p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#C9A84C]/40" />
            <span className="font-serif text-sm tracking-[0.3em] text-[#C9A84C]">今日神谕</span>
          </div>
          {isGenerating ? (
            <div className="space-y-4 max-w-3xl">
              <div className="h-8 bg-white/5 animate-pulse rounded w-full" />
              <div className="h-8 bg-white/5 animate-pulse rounded w-3/4" />
            </div>
          ) : (
            <motion.blockquote 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl md:text-5xl font-serif leading-tight gold-gradient-text italic max-w-3xl"
            >
              {dailyData.oracle}
            </motion.blockquote>
          )}
          <div className="flex justify-end hide-in-poster">
            <button 
              onClick={handleDownload}
              className="text-xs font-serif tracking-[0.2em] text-[#E8DFB8]/40 hover:text-[#C9A84C] transition-colors flex items-center gap-2"
            >
              点击保存卡片 <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Profile Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "本命星", sign: sunSign, icon: Sun },
          { label: "灵魂载体", sign: profile.gender || "未定", icon: User },
          { label: "思维阵列", sign: profile.mbti || "待测", icon: Activity },
        ].map((item, i) => (
          <div key={i} className="cinematic-panel rounded-3xl p-8 flex flex-col items-center gap-4 group hover:border-[#C9A84C]/20 transition-all duration-700">
            <item.icon className="w-8 h-8 text-[#C9A84C]/60 group-hover:text-[#C9A84C] transition-colors duration-700" />
            <div className="text-center">
              <p className="micro-label mb-1 text-[#C9A84C]/80">{item.label}</p>
              <p className="font-serif text-xl tracking-widest text-[#E8DFB8]">{item.sign}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Dynamic AI Insights (Pitfall & Lucky Color) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="luxury-card p-6 border-[#C9A84C]/20 bg-[#C9A84C]/5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <div className="space-y-2">
            <p className="micro-label text-[#C9A84C]">今日避坑</p>
            <p className="text-sm font-serif leading-relaxed text-[#E8DFB8]/80">
              {isGenerating ? "正在推演潜藏风险..." : dailyData.pitfall}
            </p>
          </div>
        </div>

        <div className="luxury-card p-6 border-[#9B7FD4]/20 bg-[#9B7FD4]/5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#9B7FD4]/10 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-[#9B7FD4]" />
          </div>
          <div className="space-y-2">
            <p className="micro-label text-[#9B7FD4]">幸运色彩</p>
            <p className="text-sm font-serif leading-relaxed text-[#E8DFB8]/80">
              {isGenerating ? "正在捕捉幸运波长..." : dailyData.luckyColor}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-widest text-[#E8DFB8]">宇宙导航</h2>
          <div className="h-px flex-1 mx-8 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => {
              setHandoff({ system: 'tarot', modeId: 'time', question: '我的今日运势指引' });
              setActiveTab("explore");
            }} 
            className="luxury-card p-0 text-left group overflow-hidden relative flex flex-col md:flex-row items-stretch"
          >
            <div className="p-8 flex-1 relative z-10 flex flex-col justify-center">
              <p className="micro-label mb-3 text-[#C9A84C]">Tarot Ritual</p>
              <h3 className="text-2xl font-serif mb-4 text-[#E8DFB8] group-hover:gold-gradient-text transition-all">每日单牌占卜</h3>
              <p className="text-[#E8DFB8]/40 text-sm leading-relaxed max-w-[200px]">抽取今日指引，洞察潜意识中的微光。</p>
            </div>
            <div className="w-full md:w-48 bg-white/5 relative overflow-hidden flex items-center justify-center p-8 group-hover:bg-[#C9A84C]/5 transition-colors">
              <div className="w-24 h-36 relative perspective-1000 group-hover:scale-110 transition-transform duration-700">
                <TarotCardBack size="medium" className="shadow-[0_0_30px_rgba(201,168,76,0.2)]" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab(lastEntry ? "journal" : "discovery")} 
            className="luxury-card p-10 text-left group hover:bg-[#C9A84C]/5 flex flex-col justify-center"
          >
            <p className="micro-label mb-4 text-[#C9A84C]">{lastEntry ? "LATEST JOURNEY" : "SOUL PROFILE"}</p>
            <h3 className="text-2xl font-serif mb-4 text-[#E8DFB8] group-hover:gold-gradient-text transition-all">
              {lastEntry ? "上次占卜回溯" : (isProfileComplete ? "查阅灵魂档案" : "开启灵魂探索")}
            </h3>
            <p className="text-[#E8DFB8]/40 text-sm leading-relaxed">
              {lastEntry 
                ? `你关于“${lastEntry.title}”的解读记录仍在日记本中。` 
                : (isProfileComplete ? "你的灵魂蓝图已绘就，随时可查阅深度解读。" : "完善你的出生信息与性格偏好，绘就完整的灵魂蓝图。")}
            </p>
          </button>
        </div>
      </section>
    </div>
  );
}
