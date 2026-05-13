"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Download,
  Sun,
  Moon,
  Zap,
  User,
  Activity,
  RefreshCw,
  ChevronRight,
  BookOpen
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
import { cleanMysticContent } from "@/lib/utils";

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
    cosmicEnergy: string;
    energySuggestion: string;
  } | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);

  const isLoaded = isProfileLoaded && journeyLoaded;
  const lastEntry = entries[0];
  const sunSign = profile.birthDate ? getSunSign(new Date(profile.birthDate)) : "探索者";

  const { greeting, isNight, todayStr, fullDateDisplay } = useMemo(() => {
    const d = new Date();
    const hour = d.getHours();
    let g = "夜安";
    if (hour >= 5 && hour < 12) g = "早安";
    else if (hour >= 12 && hour < 18) g = "午安";
    else if (hour >= 18 && hour < 22) g = "晚安";
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return { 
      greeting: g, 
      isNight: hour >= 18 || hour < 5,
      todayStr: `${year}-${month}-${day}`,
      fullDateDisplay: `${year}年${month}月${day}日`
    };
  }, []);

  const { addEntry } = useJourney();
  const [isInscribing, setIsInscribing] = useState(false);

  const handleInscribe = async () => {
    if (!dailyData || isInscribing) return;
    setIsInscribing(true);
    try {
      await addEntry({
        type: 'subconscious',
        title: `每日神谕：${dailyData.subMotto}`,
        summary: cleanMysticContent(dailyData.reading),
        details: {
          type: 'subconscious',
          text: dailyData.reading,
          imagePrompt: dailyData.imagePrompt,
          messages: [{ role: 'model', content: dailyData.reading }]
        }
      });
    } catch (err) {
      console.error("Failed to inscribe", err);
    } finally {
      setIsInscribing(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    
    const initDaily = async () => {
      const cacheKey = `daily_oracle_v8_${todayStr}`; 
      
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
请结合用户的档案信息，生成一段具有深度艺术感、玄奥且充满力量的文字。
文字风格应接近诗歌，充满意象。
必须严格输出纯净的 JSON 格式。
</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>

<output_schema>
{
  "subMotto": "Poetic short motto (e.g. 命运的低语)",
  "oracle": "Deep philosophical oracle text (30-60 chars)",
  "imagePrompt": "Artistic cosmic mystical prompt with eye of akasha and sacred geometry",
  "cosmicEnergy": "Short phrase describing today's cosmic vibe (e.g. 平衡, 激荡, 沉静)",
  "energySuggestion": "One-sentence spiritual advice based on user profile and today's energy"
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
          cosmicEnergy: data.cosmicEnergy || "平衡",
          energySuggestion: data.energySuggestion || "保持内心的宁静，在变幻中寻找恒常的真理。"
        };
        
        await saveToIndexedDB(cacheKey, newDaily);
        setDailyData(newDaily);
      } catch (err) {
        console.error("Failed to generate daily reading:", err);
        setDailyData({
          date: todayStr,
          reading: "即使在烈日熔金的繁华中，你的心亦如寒潭之水，映照着世间的渴望与疲惫。别让过度给予灼伤了真实的自我，学会在静默中为灵魂筑起一道清凉的屏障。",
          subMotto: "守护那份隐秘的温柔",
          imagePrompt: "Mystical eye of akasha, cosmic nebula, sacred geometry, gold and deep purple",
          cosmicEnergy: "平衡",
          energySuggestion: "建议今日独处三十分钟，以冷色调冥想平复内心如火的热忱，重拾理性的边界感。"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initDaily();
  }, [isLoaded, profile, todayStr, stream]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-amber-200/40 tracking-[0.3em] animate-pulse">正在同步今日宇宙频率...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-20"
    >
      {/* 1. Header: Date & Greeting */}
      <header className="space-y-6">
        <div className="flex items-center gap-4 text-[10px] text-amber-200/30 font-serif tracking-[0.3em] uppercase">
          <span>{fullDateDisplay}</span>
          <span className="w-1 h-1 rounded-full bg-amber-500/20" />
          <span>宇宙能量：{dailyData?.cosmicEnergy}</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif text-amber-100/90 tracking-tight leading-none">
          {greeting}, <span className="gold-gradient-text italic font-light">{profile.name || "旅人"}</span>
        </h1>
      </header>

      {/* 2. Main Oracle Card (Cinematic Overlay) */}
      <section ref={posterRef} className="relative group">
        <div className="relative aspect-[4/5] md:aspect-[1.4/1] rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-white/10">
          <div className="absolute inset-0 z-0">
            <MysticImage 
              prompt={dailyData?.imagePrompt || "Abstract mystical cosmic art"} 
              aspectRatio="3:4" 
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[25s] ease-out opacity-80"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-transparent to-[#050308]/40 z-10" />
          <div className="absolute inset-0 bg-black/10 z-10" />
          <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 md:p-24 text-center space-y-16">
            <div className="space-y-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto" />
              <span className="text-[10px] font-serif tracking-[0.6em] text-amber-500/60 uppercase">今日神谕</span>
            </div>

            <p className="text-2xl md:text-5xl lg:text-6xl font-serif text-amber-50/95 leading-[1.7] italic max-w-5xl drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] px-4">
              「 {dailyData?.reading ? cleanMysticContent(dailyData.reading).replace(/「|」/g, '') : "正在感应阿卡夏场域..."} 」
            </p>

            <div className="flex flex-col items-center gap-10">
              <span className="text-xs md:text-xl text-amber-200/40 font-serif tracking-[0.4em] uppercase">{dailyData?.subMotto}</span>
              
              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={handleInscribe}
                  disabled={isInscribing}
                  className="flex items-center gap-3 px-10 py-4 rounded-full bg-black/40 border border-white/10 text-amber-200/70 hover:text-amber-100 hover:border-amber-500/40 transition-all text-[10px] tracking-[0.3em] uppercase backdrop-blur-2xl group/btn"
                >
                  <Sparkles className={`w-3.5 h-3.5 transition-transform group-hover/btn:scale-110 ${isInscribing ? 'animate-spin text-amber-500' : ''}`} />
                  {isInscribing ? "记录中" : "铭刻至日记"}
                </button>
                <button 
                  onClick={() => handleGeneratePoster(posterRef.current!, `oracle-${todayStr}.jpg`)}
                  disabled={isGeneratingPoster}
                  className="flex items-center gap-3 px-10 py-4 rounded-full bg-black/40 border border-white/10 text-amber-200/70 hover:text-amber-100 hover:border-amber-500/40 transition-all text-[10px] tracking-[0.3em] uppercase backdrop-blur-2xl group/btn"
                >
                  <Download className="w-3.5 h-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                  {isGeneratingPoster ? "导出中" : "收藏卡片"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-12 right-12 z-30 opacity-20 flex items-center gap-3">
             <span className="text-[9px] font-serif tracking-[0.2em] text-amber-100/60 uppercase">长按保存卡片</span>
             <Download className="w-3 h-3 text-amber-100/60" />
          </div>
        </div>
      </section>

      {/* 3. Stats Grid (3-column) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Sun, label: "太阳", value: sunSign },
          { icon: User, label: "性别", value: profile.gender || "未设定" },
          { icon: Activity, label: "MBTI", value: profile.mbti || "未觉醒" }
        ].map((stat, i) => (
          <div key={i} className="luxury-card p-12 flex flex-col items-center text-center space-y-6 group hover:border-amber-500/20 transition-all duration-700">
            <div className="w-16 h-16 rounded-3xl border border-amber-500/10 flex items-center justify-center bg-amber-500/5 group-hover:bg-amber-500/10 group-hover:scale-110 transition-all duration-700">
              <stat.icon className="w-7 h-7 text-amber-200/30 group-hover:text-amber-200 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-serif tracking-[0.5em] text-amber-100/20 uppercase">{stat.label}</p>
              <p className="text-3xl font-serif text-amber-100/80 tracking-wide">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 4. Energy Suggestion (Horizontal Bar) */}
      <section className="luxury-card p-8 md:p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-[#C9A84C]/5 border-[#C9A84C]/20 group">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-[0_0_40px_rgba(201,168,76,0.15)] group-hover:scale-105 transition-transform duration-700">
          <Zap className="w-8 h-8 text-amber-400 fill-amber-400/20" />
        </div>
        <div className="space-y-3 text-center md:text-left flex-1">
          <p className="text-[10px] font-serif tracking-[0.6em] text-amber-500/40 uppercase">今日能量建议</p>
          <p className="text-xl md:text-2xl font-serif text-amber-50/90 leading-relaxed italic pr-4">
            {cleanMysticContent(dailyData?.energySuggestion || "")}
          </p>
        </div>
      </section>

      {/* 5. Quick Start Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-8">
          <h3 className="text-2xl font-serif tracking-[0.5em] uppercase text-amber-100/40">快速开始</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-amber-500/10 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <button 
            onClick={() => {
              setHandoff({ system: 'tarot', context: '今日单牌占卜' });
              setActiveTab("explore");
            }}
            className="luxury-card p-12 text-left group transition-all min-h-[340px] flex flex-col justify-between relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-1000">
              <Sparkles className="w-28 h-28" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-serif tracking-[0.6em] text-amber-500/30 uppercase">TAROT</p>
              <div className="h-px w-8 bg-amber-500/20" />
            </div>
            <div className="space-y-4 relative z-10">
              <h4 className="text-5xl font-serif text-amber-50/90 tracking-widest">每日单牌占卜</h4>
              <p className="text-base text-white/30 font-serif leading-relaxed max-w-xs">抽取今日指引，洞察潜意识中的微光。</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("journal")}
            className="luxury-card p-12 text-left group transition-all min-h-[340px] flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 group-hover:-rotate-12 transition-all duration-1000">
              <BookOpen className="w-28 h-28" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-serif tracking-[0.6em] text-amber-500/30 uppercase">JOURNAL</p>
              <div className="h-px w-8 bg-amber-500/20" />
            </div>
            <div className="space-y-4 relative z-10">
              <h4 className="text-5xl font-serif text-amber-50/90 tracking-widest">
                {lastEntry ? "回顾往昔记录" : "开启首篇日记"}
              </h4>
              <p className="text-base text-white/30 font-serif leading-relaxed max-w-xs">
                {lastEntry 
                  ? `你最近的一份解读是“${lastEntry.title}”，点击继续探索。` 
                  : "尚未有任何灵魂记录，点击开启你的阿卡夏之旅。"}
              </p>
            </div>
          </button>
        </div>
      </section>
    </motion.div>
  );
}
