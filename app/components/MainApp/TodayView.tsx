"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Sparkles,
  Star,
  RefreshCw,
  Download,
  Sun,
  Moon,
  Zap
} from "lucide-react";

// Components & Hooks
import { MysticImage } from "./MysticImage";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useJourney } from "@/hooks/useJourney";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA } from "@/lib/ai";
import { getSunSign } from "@/lib/astrology";
import { getDailyTarotCards } from "@/lib/tarot-data";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";
import { useAppStore } from "@/lib/store";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { entries, isLoaded: journeyLoaded } = useJourney();
  const { stream } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setHandoff = useAppStore((state: any) => state.setHandoff);
  const posterRef = useRef<HTMLDivElement>(null);
  
  const [dailyData, setDailyData] = useState<{
    date: string;
    reading: string;
    subMotto: string;
    imagePrompt: string;
  } | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);

  const isLoaded = isProfileLoaded && journeyLoaded;
  const lastEntry = entries[0];
  const sunSign = profile.birthDate ? getSunSign(new Date(profile.birthDate)) : "探索者";

  const { greeting, dateStr, isNight } = useMemo(() => {
    const d = new Date();
    const hour = d.getHours();
    let g = "夜安";
    if (hour >= 5 && hour < 12) g = "早安";
    else if (hour >= 12 && hour < 18) g = "午安";
    else if (hour >= 18 && hour < 22) g = "晚安";
    return { 
      greeting: g, 
      dateStr: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
      isNight: hour >= 18 || hour < 5
    };
  }, []);

  // 智能推荐逻辑 (Smart Card Logic from commit 3eeb634e)
  const smartCard = useMemo(() => {
    if (lastEntry) {
      return {
        label: "Continue Journey",
        title: "继续探索命运",
        desc: `你还有关于“${lastEntry.title}”的解读尚未读完。`,
        action: () => setActiveTab("journal")
      };
    }
    
    const recommendation = profile.mbti?.includes('I') 
      ? { title: "开启阴影工作", sys: "shadow", desc: "由于你的内向直觉特质，此时适合进行一次潜意识探索。" }
      : { title: "星象深度解析", sys: "astrology", desc: "当前的群星相位正影响着你的能量，建议查阅。" };

    return {
      label: "Recommendation",
      title: recommendation.title,
      desc: recommendation.desc,
      action: () => {
        setHandoff({ system: recommendation.sys, context: `基于${profile.mbti || "旅人"}能量的智能推荐` });
        setActiveTab("explore");
      }
    };
  }, [lastEntry, profile, setActiveTab, setHandoff]);

  useEffect(() => {
    if (!isLoaded) return;
    
    const initDaily = async () => {
      const now = new Date();
      const today = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const hour = now.getHours();
      const timePeriod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : hour >= 18 && hour < 22 ? 'evening' : 'night';
      const cacheKey = `daily_minimal_v2_${today}_${timePeriod}_${profile.name || 'guest'}`;
      
      const cached = await getFromIndexedDB(cacheKey);
      if (cached) {
        setDailyData(cached as any);
        setIsInitializing(false);
        return;
      }
      
      const prompt = `
<instruction>
你是阿卡夏记录的守护者。请为用户生成今日专属的灵魂寄语和神谕。
现在的时刻是：${greeting}。
请结合用户的档案信息，生成一段具有深度艺术感、玄奥且充满力量的文字。</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>

<output_format>
请严格按照以下JSON格式输出：
{
  "subMotto": "一句简短的灵魂寄语（位于问候语下方，10-15字）",
  "oracle": "今日核心神谕（带有哲理性，1-3句话，约30-60字，不含引号。）",
  "imagePrompt": "一张匹配该神谕意境的神秘主义艺术大图提示词，High Fantasy, Cosmic, Mystical, Cinematic"
}
</output_format>
      `;

      let fullOutput = "";
      try {
        for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
          fullOutput += chunk;
        }

        const data = JSON.parse(fullOutput.replace(/```json|```/g, '').trim());
        const newDaily = {
          date: today,
          reading: data.oracle,
          subMotto: data.subMotto,
          imagePrompt: data.imagePrompt,
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
  }, [isLoaded, profile, stream, greeting]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="font-serif text-amber-200/40 tracking-[0.2em]">正在同步今日星象...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-24 pb-20 px-8">
      
      {/* 1. 艺术问候语区 */}
      <header className="flex items-start gap-10 pt-16">
        <div className="relative w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02]">
          {isNight ? <Moon className="w-10 h-10 text-amber-200/30" /> : <Sun className="w-10 h-10 text-amber-200/30" />}
          <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-pulse" />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-serif tracking-[0.6em] text-white/20 uppercase">{dateStr}</p>
          <h1 className="text-6xl md:text-7xl font-serif tracking-tight text-white/90">
            {greeting}，<span className="font-medium">{profile.name || "旅人"}。</span>
          </h1>
          <p className="text-lg md:text-xl font-serif text-white/40 italic tracking-wider">
            {dailyData?.subMotto || "你是星尘的碎片，也是宇宙的观测者。"}
          </p>
        </div>
      </header>

      {/* 2. 核心神谕卡 (Poster Card) */}
      <section ref={posterRef} className="relative group p-1">
        <div className="relative rounded-[48px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          <div className="relative aspect-[16/10] md:aspect-[21/9] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <MysticImage 
                prompt={dailyData?.imagePrompt || "Abstract mystical cosmic art"} 
                aspectRatio="21:9" 
                className="w-full h-full object-cover opacity-70 mix-blend-screen scale-105 group-hover:scale-110 transition-transform duration-[12s]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-[#050308]/90 z-10" />
            <div className="relative z-20 text-center px-12 md:px-32 py-20 flex flex-col items-center gap-12">
              <div className="space-y-6">
                <p className="text-xs md:text-sm font-serif tracking-[1em] text-amber-500/50 uppercase ml-[1em]">今日神谕 · ORACLE</p>
                <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto" />
              </div>
              <h2 className="text-3xl md:text-5xl font-serif leading-[1.6] gold-gradient-text drop-shadow-[0_0_30px_rgba(201,168,76,0.5)] max-w-5xl tracking-wide px-4">
                「 {dailyData?.reading || "枷锁已开，无需向世界索求公义，唯需向内心回归神性。"} 」
              </h2>
              <button 
                onClick={() => handleGeneratePoster(posterRef.current!, `oracle-${dailyData?.date}.jpg`)}
                disabled={isGeneratingPoster}
                className="mt-8 px-10 py-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-xs font-serif tracking-[0.4em] text-white/50 hover:text-white hover:border-white/30 transition-all flex items-center gap-4 group"
              >
                <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                {isGeneratingPoster ? "正在生成..." : "保存这张神谕卡"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 状态看板与每日指标 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="luxury-card p-10 space-y-4 text-center group hover:bg-white/[0.02] transition-colors">
          <p className="text-[10px] font-serif tracking-[0.5em] text-white/20 uppercase">太阳星座</p>
          <p className="text-4xl font-serif text-amber-100/90 tracking-widest">{sunSign}</p>
        </div>
        <div className="luxury-card p-10 space-y-4 text-center group hover:bg-white/[0.02] transition-colors">
          <p className="text-[10px] font-serif tracking-[0.5em] text-white/20 uppercase">今日避坑</p>
          <p className="text-base font-serif text-white/60 leading-relaxed">避免情绪化决策，在喧嚣中保持独立的观察。</p>
        </div>
        <div className="luxury-card p-10 space-y-4 text-center group hover:bg-white/[0.02] transition-colors">
          <p className="text-[10px] font-serif tracking-[0.5em] text-white/20 uppercase">幸运色彩</p>
          <p className="text-base font-serif text-purple-200/50 tracking-[0.3em]">丁香紫 · 月光银</p>
        </div>
      </section>

      {/* 4. 快速开始 (智能引导卡片) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
        <button 
          onClick={() => { setHandoff({ system: 'tarot', context: '今日单牌占卜' }); setActiveTab("explore"); }}
          className="luxury-card p-16 text-left space-y-8 group hover:bg-white/[0.04] transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-24 h-24" />
          </div>
          <p className="text-xs font-serif tracking-[0.8em] text-amber-500/20 uppercase">Daily Card</p>
          <h4 className="text-5xl font-serif gold-gradient-text">每日单牌占卜</h4>
        </button>

        <button 
          onClick={smartCard.action}
          className="luxury-card p-16 text-left space-y-8 group hover:bg-white/[0.04] transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-24 h-24" />
          </div>
          <p className="text-xs font-serif tracking-[0.8em] text-white/10 uppercase">{smartCard.label}</p>
          <h4 className="text-5xl font-serif text-white/80">{smartCard.title}</h4>
          <p className="text-base text-white/30 font-serif leading-relaxed">{smartCard.desc}</p>
        </button>
      </section>
    </motion.div>
  );
}
