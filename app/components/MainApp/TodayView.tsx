"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  RefreshCw,
  Download,
  Sun,
  Moon,
  Zap,
  User,
  Activity
} from "lucide-react";

// Components & Hooks
import { MysticImage } from "./MysticImage";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useJourney } from "@/hooks/useJourney";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA, MODELS } from "@/lib/ai";
import { getSunSign } from "@/lib/astrology";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";
import { useAppStore } from "@/lib/store";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { entries, isLoaded: journeyLoaded } = useJourney();
  const aiOptions = useMemo(() => ({ 
    model: MODELS.PRO,
    config: { responseMimeType: "application/json" } 
  }), []);

  const { stream } = useAIStream(aiOptions);
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

  const { greeting, isNight, todayStr } = useMemo(() => {
    const d = new Date();
    const hour = d.getHours();
    let g = "夜安";
    if (hour >= 5 && hour < 12) g = "早安";
    else if (hour >= 12 && hour < 18) g = "午安";
    else if (hour >= 18 && hour < 22) g = "晚安";
    
    return { 
      greeting: g, 
      isNight: hour >= 18 || hour < 5,
      todayStr: d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const initDaily = async () => {
      const cacheKey = `daily_oracle_v5_${todayStr}`; 
      
      try {
        const cached = await getFromIndexedDB(cacheKey);
        if (cached) {
          setDailyData(cached as any);
          setIsInitializing(false);
          return;
        }
      } catch (e) {
        console.warn("Cache read failed", e);
      }
      
      const prompt = `
<instruction>
你是阿卡夏记录的守护者。请为用户生成今日专属的灵魂寄语和神谕。
现在的时刻是：${greeting}。
请结合用户的档案信息，生成一段具有深度艺术感、玄奥且充满力量的文字。
必须严格输出纯净的 JSON 格式。
</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>

<output_schema>
{
  "subMotto": "string (10-15 chars, poetic motto)",
  "oracle": "string (30-60 chars, philosophical oracle)",
  "imagePrompt": "string (artistic prompt for Nano Banana 2 image generation)"
}
</output_schema>
      `;

      let fullOutput = "";
      try {
        for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
          fullOutput += chunk;
        }

        const data = JSON.parse(fullOutput.replace(/```json|```/g, '').trim());
        const newDaily = {
          date: todayStr,
          reading: data.oracle,
          subMotto: data.subMotto,
          imagePrompt: data.imagePrompt,
        };
        
        await saveToIndexedDB(cacheKey, newDaily);
        setDailyData(newDaily);
      } catch (err) {
        console.error("Failed to generate daily reading:", err);
        setDailyData({
          date: todayStr,
          reading: "枷锁已开，无需向世界索求公义，唯需向内心回归神性。",
          subMotto: "你是星尘的碎片，也是宇宙的观测者。",
          imagePrompt: "Abstract mystical cosmic art gold and purple"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initDaily();
  }, [isLoaded, profile, todayStr, greeting, stream]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin relative" />
        </div>
        <p className="font-serif text-amber-200/40 tracking-[0.3em] animate-pulse text-sm">正在同步今日宇宙频率...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16"
    >
      {/* 1. 顶部三宫格 - 还原经典布局 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="luxury-card p-8 flex flex-col items-center text-center space-y-4 group">
          <div className="w-12 h-12 rounded-full border border-amber-500/10 flex items-center justify-center bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">
            {isNight ? <Moon className="w-5 h-5 text-amber-200/40 group-hover:text-amber-200 transition-colors" /> : <Sun className="w-5 h-5 text-amber-200/40 group-hover:text-amber-200 transition-colors" />}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.4em] text-amber-100/30 uppercase">太阳星座</p>
            <p className="text-2xl font-serif text-amber-100">{sunSign}</p>
          </div>
        </div>
        <div className="luxury-card p-8 flex flex-col items-center text-center space-y-4 group">
          <div className="w-12 h-12 rounded-full border border-amber-500/10 flex items-center justify-center bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">
            <User className="w-5 h-5 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.4em] text-amber-100/30 uppercase">旅人身份</p>
            <p className="text-2xl font-serif text-amber-100">{profile.name || "探索者"}</p>
          </div>
        </div>
        <div className="luxury-card p-8 flex flex-col items-center text-center space-y-4 group">
          <div className="w-12 h-12 rounded-full border border-amber-500/10 flex items-center justify-center bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">
            <Activity className="w-5 h-5 text-amber-200/40 group-hover:text-amber-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-serif tracking-[0.4em] text-amber-100/30 uppercase">灵魂档案</p>
            <p className="text-2xl font-serif text-amber-100">{profile.mbti || "未觉醒"}</p>
          </div>
        </div>
      </section>

      {/* 2. 今日能量建议 - 还原长条栏 */}
      <section className="luxury-card p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group hover:border-amber-500/30 transition-all bg-[#C9A84C]/5 border-[#C9A84C]/20">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
          <Zap className="w-7 h-7 text-amber-400 relative" />
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
             <p className="text-[10px] font-serif tracking-[0.5em] text-amber-200/40 uppercase">今日灵魂指引 · ORACLE</p>
             <div className="h-px w-12 bg-amber-500/20" />
          </div>
          <p className="text-xl md:text-2xl font-serif text-amber-50/90 leading-relaxed italic drop-shadow-[0_0_10px_rgba(201,168,76,0.2)]">
            「 {dailyData?.reading.replace(/「|」/g, '') || "枷锁已开，无需向世界索求公义，唯需向内心回归神性。"} 」
          </p>
          <p className="text-sm text-amber-200/30 font-serif tracking-widest">
            {dailyData?.subMotto || "你是星尘的碎片，也是宇宙的观测者。"}
          </p>
        </div>
      </section>

      {/* 3. 核心神谕卡 (Poster) */}
      <section ref={posterRef} className="relative group p-1">
        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
          <div className="relative aspect-[4/5] md:aspect-[21/9] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <MysticImage 
                prompt={dailyData?.imagePrompt || "Abstract mystical cosmic art"} 
                aspectRatio="21:9" 
                className="w-full h-full object-cover opacity-60 mix-blend-screen scale-105 group-hover:scale-110 transition-transform duration-[15s]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#050308]/90 z-10" />
            
            <div className="relative z-20 text-center px-10 py-16 flex flex-col items-center gap-10">
               <button 
                onClick={() => handleGeneratePoster(posterRef.current!, `oracle-${todayStr}.jpg`)}
                disabled={isGeneratingPoster}
                className="group relative px-10 py-4 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 border border-amber-500/20"
              >
                <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-2xl" />
                <div className="relative flex items-center gap-4 text-amber-200/70 group-hover:text-amber-100 font-serif tracking-[0.5em] text-[10px] uppercase transition-colors">
                  <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  <span>{isGeneratingPoster ? "正在刻印..." : "收藏今日神谕"}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 快速开始 - 还原大型卡片网格 */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <h3 className="text-xl font-serif tracking-[0.4em] uppercase text-amber-100/60">深度探索</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => {
              setHandoff({ system: 'tarot', context: '今日单牌占卜' });
              setActiveTab("explore");
            }}
            className="luxury-card p-12 text-left space-y-8 group hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-serif tracking-[0.5em] text-amber-500/30 group-hover:text-amber-500/50 uppercase">Daily Card</p>
            <div className="space-y-3">
              <h4 className="text-4xl font-serif gold-gradient-text tracking-widest">每日单牌占卜</h4>
              <p className="text-sm text-white/30 font-serif leading-relaxed max-w-[240px]">抽取今日指引，洞察潜意识中的微妙波动。</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("journal")}
            className="luxury-card p-12 text-left space-y-8 group hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-serif tracking-[0.5em] text-amber-500/30 group-hover:text-amber-500/50 uppercase">Chronicle</p>
            <div className="space-y-3">
              <h4 className="text-4xl font-serif text-white/80 tracking-widest">查阅阿卡夏记录</h4>
              <p className="text-sm text-white/30 font-serif leading-relaxed">
                {lastEntry ? `你最近一次的探索是“${lastEntry.title}”。` : "暂无最近记录，开启你的命运探索。"}
              </p>
            </div>
          </button>
        </div>
      </section>
    </motion.div>
  );
}
