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
import { getCloudDailyOracle, saveCloudDailyOracle } from "@/app/actions/aiActions";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { entries, isLoaded: journeyLoaded } = useJourney();
  const aiOptions = useMemo(() => ({ 
    model: MODELS.FLASH,
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
      
      // 1. Try local IndexedDB
      try {
        const cached = await getFromIndexedDB(cacheKey);
        if (cached) {
          setDailyData(cached as any);
          setIsInitializing(false);
          return;
        }
      } catch (e) {
        console.warn("Local cache read failed", e);
      }

      // 2. Try global Cloud Firestore
      try {
        const cloudCached = await getCloudDailyOracle(cacheKey);
        if (cloudCached) {
          await saveToIndexedDB(cacheKey, cloudCached);
          setDailyData(cloudCached as any);
          setIsInitializing(false);
          return;
        }
      } catch (e) {
        console.warn("Cloud cache read failed", e);
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
        saveCloudDailyOracle(cacheKey, newDaily).catch(e => console.warn("Cloud save failed", e));
        setDailyData(newDaily);
      } catch (err) {
        console.error("Failed to generate daily reading:", err);
        const fallbackDaily = {
          date: todayStr,
          reading: "即使在烈日熔金的繁华中，你的心亦如寒潭之水，映照着世间的渴望与疲惫。别让过度给予灼伤了真实的自我，学会在静默中为灵魂筑起一道清凉的屏障。",
          subMotto: "守护那份隐秘的温柔",
          imagePrompt: "Mystical eye of akasha, cosmic nebula, sacred geometry, gold and deep purple",
          cosmicEnergy: "平衡",
          energySuggestion: "建议今日独处三十分钟，以冷色调冥想平复内心如火的热忱，重拾理性的边界感。"
        };
        await saveToIndexedDB(cacheKey, fallbackDaily);
        setDailyData(fallbackDaily);
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
      className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-10 md:space-y-12"
    >
      {/* 1. Header: Date & Greeting */}
      <header className="space-y-3">
        <div className="flex items-center gap-3 text-[10px] text-[#C9A84C]/60 font-serif tracking-[0.3em] uppercase">
          <span>{fullDateDisplay}</span>
          <span className="w-1 h-1 rounded-full bg-[#C9A84C]/40" />
          <span>宇宙能量：{dailyData?.cosmicEnergy}</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-[#E8DFB8]/90 tracking-tight leading-none">
          {greeting}, <span className="gold-gradient-text italic font-light">{profile.name || "旅人"}</span>
        </h1>
      </header>

      {/* 2. Main Oracle Card (Cinematic Overlay) */}
      <section ref={posterRef} className="relative group aura-ring rounded-[3.5rem]">
        <div className="relative min-h-[400px] md:min-h-[480px] rounded-[3.5rem] overflow-hidden obsidian-glass liquid-border shadow-[0_40px_100px_rgba(0,0,0,0.95)] flex flex-col justify-center">
          <div className="absolute inset-0 z-0">
            <MysticImage 
              prompt={dailyData?.imagePrompt || "Abstract mystical cosmic art"} 
              aspectRatio="3:4" 
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[30s] ease-out opacity-85"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/65 to-[#050308]/30 z-10" />
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

          <div className="relative z-20 flex flex-col items-center justify-center p-6 md:p-12 text-center space-y-8 my-auto">
            <div className="space-y-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent mx-auto" />
              <span className="text-[10px] font-serif tracking-[0.8em] text-[#C9A84C] uppercase font-medium">今日神谕</span>
            </div>

            <p className="text-xl md:text-2xl lg:text-3xl font-serif text-[#E8DFB8] leading-[2] tracking-[0.03em] italic max-w-4xl drop-shadow-[0_0_40px_rgba(201,168,76,0.3)] px-4 md:px-8">
              「 {dailyData?.reading ? cleanMysticContent(dailyData.reading).replace(/「|」/g, '') : "正在感应阿卡夏场域..."} 」
            </p>

            <div className="flex flex-col items-center gap-6 w-full pt-2">
              <span className="text-xs md:text-base text-[#C9A84C]/70 font-serif tracking-[0.5em] uppercase font-light">{dailyData?.subMotto}</span>
              
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={handleInscribe}
                  disabled={isInscribing}
                  className="flex items-center gap-2.5 px-8 md:px-10 py-3.5 rounded-full bg-[#080510]/90 border border-[#C9A84C]/40 text-[#E8DFB8]/90 hover:text-white hover:border-[#C9A84C] hover:bg-[#080510] transition-all duration-500 text-[11px] tracking-[0.4em] uppercase backdrop-blur-3xl shadow-[0_0_25px_rgba(201,168,76,0.2)] group/btn cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#C9A84C] transition-transform group-hover/btn:scale-125 ${isInscribing ? 'animate-spin' : ''}`} />
                  {isInscribing ? "记录中" : "铭刻至日记"}
                </button>
                <button 
                  onClick={() => handleGeneratePoster(posterRef.current!, `oracle-${todayStr}.jpg`)}
                  disabled={isGeneratingPoster}
                  className="flex items-center gap-2.5 px-8 md:px-10 py-3.5 rounded-full bg-[#080510]/90 border border-[#C9A84C]/40 text-[#E8DFB8]/90 hover:text-white hover:border-[#C9A84C] hover:bg-[#080510] transition-all duration-500 text-[11px] tracking-[0.4em] uppercase backdrop-blur-3xl shadow-[0_0_25px_rgba(201,168,76,0.2)] group/btn cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C9A84C] group-hover/btn:translate-y-1 transition-transform" />
                  {isGeneratingPoster ? "导出中" : "收藏卡片"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-5 right-6 z-30 opacity-40 flex items-center gap-2 font-mono pointer-events-none">
             <span className="text-[9px] font-serif tracking-[0.3em] text-[#E8DFB8]/60 uppercase">阿卡夏共鸣</span>
             <Sparkles className="w-3 h-3 text-[#C9A84C]" />
          </div>
        </div>
      </section>

      {/* 3. Stats Grid (3-column) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Sun, label: "太阳", value: sunSign },
          { icon: User, label: "性别", value: (profile.gender === '男' || profile.gender === 'male') ? '乾 (男)' : (profile.gender === '女' || profile.gender === 'female') ? '坤 (女)' : profile.gender || "未设定" },
          { icon: Activity, label: "MBTI", value: profile.mbti || "未觉醒" }
        ].map((stat, i) => (
          <div key={i} className="obsidian-glass rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-4 group hover:border-[#C9A84C]/40 transition-all duration-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5 hover:shadow-[0_0_40px_rgba(201,168,76,0.15)]">
            <div className="w-12 h-12 rounded-2xl border border-[#C9A84C]/20 flex items-center justify-center bg-[#C9A84C]/5 group-hover:bg-[#C9A84C]/15 group-hover:scale-110 transition-all duration-700">
              <stat.icon className="w-6 h-6 text-[#C9A84C]/60 group-hover:text-[#C9A84C] transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono tracking-[0.5em] text-[#C9A84C]/60 uppercase">{stat.label}</p>
              <p className="text-xl md:text-2xl font-serif text-[#E8DFB8] tracking-wide font-medium">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 4. Energy Suggestion (Horizontal Bar) */}
      <section className="obsidian-glass aura-ring p-6 md:p-8 rounded-[3rem] flex flex-col md:flex-row items-center gap-6 md:gap-8 border border-[#C9A84C]/30 group shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0 border border-[#C9A84C]/40 shadow-[0_0_30px_rgba(201,168,76,0.25)] group-hover:scale-110 transition-transform duration-700">
          <Zap className="w-7 h-7 text-[#C9A84C] fill-[#C9A84C]/20 animate-pulse" />
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <p className="text-[10px] font-mono tracking-[0.6em] text-[#C9A84C]/70 uppercase">今日能量建议</p>
          <p className="text-lg md:text-xl font-serif text-[#E8DFB8] leading-[1.8] tracking-[0.02em] italic pr-4 font-light">
            {cleanMysticContent(dailyData?.energySuggestion || "")}
          </p>
        </div>
      </section>

      {/* 5. Quick Start Section */}
      <section className="space-y-8 pt-4">
        <div className="flex items-center gap-6">
          <h3 className="text-lg font-serif tracking-[0.5em] uppercase text-[#C9A84C]/60">快速开始</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-[#C9A84C]/20 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => {
              setHandoff({ system: 'tarot', context: '今日单牌占卜' });
              setActiveTab("explore");
            }}
            className="obsidian-glass border border-[#C9A84C]/25 hover:border-[#C9A84C]/50 rounded-[2.5rem] p-8 text-left group transition-all duration-500 min-h-[220px] flex flex-col justify-between relative overflow-hidden shadow-xl cursor-pointer"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
              <Sparkles className="w-24 h-24 text-[#C9A84C]" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono tracking-[0.5em] text-[#C9A84C]/50 uppercase">TAROT RITUAL</p>
              <div className="h-px w-12 bg-[#C9A84C]/20" />
            </div>
            <div className="space-y-2 relative z-10">
              <h4 className="text-2xl md:text-3xl font-serif text-[#E8DFB8] tracking-wider group-hover:text-white transition-colors font-medium">每日单牌占卜</h4>
              <p className="text-xs text-[#E8DFB8]/60 font-serif leading-relaxed max-w-xs font-light">抽取今日灵性指引，洞察潜意识波澜。</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("journal")}
            className="obsidian-glass border border-[#C9A84C]/25 hover:border-[#C9A84C]/50 rounded-[2.5rem] p-8 text-left group transition-all duration-500 min-h-[220px] flex flex-col justify-between relative overflow-hidden shadow-xl cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
              <BookOpen className="w-24 h-24 text-[#C9A84C]" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono tracking-[0.5em] text-[#C9A84C]/50 uppercase">AKASHIC JOURNAL</p>
              <div className="h-px w-12 bg-[#C9A84C]/20" />
            </div>
            <div className="space-y-2 relative z-10">
              <h4 className="text-2xl md:text-3xl font-serif text-[#E8DFB8] tracking-wider group-hover:text-white transition-colors font-medium">
                {lastEntry ? "回顾往昔记录" : "开启首篇日记"}
              </h4>
              <p className="text-xs text-[#E8DFB8]/60 font-serif leading-relaxed max-w-xs font-light">
                {lastEntry 
                  ? `最近解读：「${lastEntry.title}」` 
                  : "尚未有任何灵魂记录，点击开启你的阿卡夏之旅。"}
              </p>
            </div>
          </button>
        </div>
      </section>
    </motion.div>
  );
}
