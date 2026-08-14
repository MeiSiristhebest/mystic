"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  BookOpen,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";

// Components & Hooks
import { MysticImage } from "./MysticImage";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useJourney } from "@/hooks/useJourney";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA } from "@/lib/ai";
import { getSunSign } from "@/lib/astrology";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";
import { useAppStore } from "@/lib/store";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { cleanMysticContent, safeParseAIJSON } from "@/lib/utils";
import { getCloudDailyOracle, saveCloudDailyOracle } from "@/app/actions/aiActions";
import { getDailyOraclePrompt } from "@/lib/prompts";
import { getDailyAlmanac } from "@/lib/daily-almanac";
import { routeUserIntent, OracleRouteResult } from "@/lib/smart-oracle-router";

export function TodayView() {
  const { profile, isLoaded: isProfileLoaded, getProfileContext } = useUserProfile();
  const { entries, isLoaded: journeyLoaded } = useJourney();

  const aiOptions = useMemo(() => ({ 
    config: { response_format: "json_object" } 
  }), []);

  const { stream } = useAIStream(aiOptions);
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setActiveSubTab = useAppStore((state: any) => state.setActiveSubTab);
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

  // 心念直达灵犀罗盘状态
  const [compassInput, setCompassInput] = useState("");
  const [routedResult, setRoutedResult] = useState<OracleRouteResult | null>(null);

  const { greeting, isNight, todayStr, fullDateDisplay } = useMemo(() => {
    const d = new Date();
    const hour = d.getHours();
    let g = "晚安";
    if (hour >= 5 && hour < 12) g = "早安";
    else if (hour >= 12 && hour < 18) g = "午安";
    
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

  // 计算今日天地干支与个人开运黄历
  const almanac = useMemo(() => {
    return getDailyAlmanac(new Date(), profile.birthDate);
  }, [profile.birthDate]);

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

  const fetchDailyOracle = async (force = false) => {
    const cacheKey = `daily_oracle_v12_${todayStr}`; 
    
    if (!force) {
      try {
        const cached = await getFromIndexedDB(cacheKey);
        if (cached && (cached as any).reading) {
          setDailyData(cached as any);
          setIsInitializing(false);
          return;
        }
      } catch (e) {
        console.warn("Local cache read failed", e);
      }

      try {
        const cloudCached = await getCloudDailyOracle(cacheKey);
        if (cloudCached && (cloudCached as any).reading) {
          await saveToIndexedDB(cacheKey, cloudCached);
          setDailyData(cloudCached as any);
          setIsInitializing(false);
          return;
        }
      } catch (e) {
        console.warn("Cloud cache read failed", e);
      }
    }
    
    const prompt = getDailyOraclePrompt({
      todayStr,
      sunSign,
      hasProfile: !!profile.birthDate,
      profileContext: getProfileContext()
    });


    let fullOutput = "";
    try {
      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullOutput += chunk;
      }

      const data = safeParseAIJSON(fullOutput, { 
        reading: "",
        oracle: "", 
        subMotto: "", 
        imagePrompt: "", 
        cosmicEnergy: "", 
        energySuggestion: "" 
      });

      const newDaily = {
        date: todayStr,
        reading: data.reading || data.oracle || "「当水星踏入双子的流影之河，灵魂正在重织未被言说的叙事 🌌✨ 今日，宇宙邀请你凝视内在的阴影镜像——那些被压抑的渴望与焦虑并非阻碍，而是通往自性化的隐秘通道 🔮 在星象与水火的交织中，觉察你的追逐与逃避模式，允许脆弱如羽翼舒展 🦋 这是一场从分裂到整合的仪式性回归 🪐 」",
        subMotto: data.subMotto || "你逃避的阴影，正是你渴望的光芒 🌙",
        imagePrompt: data.imagePrompt || "Breathtaking high-end mystical wallpaper, deep cosmic nebula, ethereal golden sacred geometry, cinematic lighting",
        cosmicEnergy: data.cosmicEnergy || "水火交融 · 自性觉醒",
        energySuggestion: data.energySuggestion || "今日请试着在繁杂的讯息中抽身片刻，允许内在的脆弱与渴望舒展，在静穆中整合被压抑的真实自我。"
      };
      
      await saveToIndexedDB(cacheKey, newDaily);
      saveCloudDailyOracle(cacheKey, newDaily).catch(e => console.warn("Cloud save failed", e));
      setDailyData(newDaily);
    } catch (err) {
      console.error("Failed to generate daily reading:", err);
      const fallbackDaily = {
        date: todayStr,
        reading: "「当水星踏入双子的流影之河，灵魂正在重织未被言说的叙事 🌌✨ 今日，宇宙邀请你凝视内在的阴影镜像——那些被压抑的渴望与焦虑并非阻碍，而是通往自性化的隐秘通道 🔮 在星象与水火的交织中，觉察你的追逐与逃避模式，允许脆弱如羽翼舒展 🦋 这是一场从分裂到整合的仪式性回归 🪐 」",
        subMotto: "你逃避的阴影，正是你渴望的光芒 🌙",
        imagePrompt: "Breathtaking high-end mystical wallpaper, deep cosmic nebula, ethereal golden sacred geometry, cinematic lighting",
        cosmicEnergy: "水火交融 · 自性觉醒",
        energySuggestion: "今日请试着在繁杂的讯息中抽身片刻，允许内在的脆弱与渴望舒展，在静穆中整合被压抑的真实自我。"
      };
      await saveToIndexedDB(cacheKey, fallbackDaily);
      setDailyData(fallbackDaily);
    }
 finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    fetchDailyOracle(false);
  }, [isLoaded, todayStr]);

  const handleCompassSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!compassInput.trim()) return;
    const result = routeUserIntent(compassInput);
    setRoutedResult(result);
  };

  const handleLaunchRoutedDivination = () => {
    if (!routedResult) return;
    setHandoff(routedResult.handoffPayload);
    if (routedResult.subTab && setActiveSubTab) {
      setActiveSubTab(routedResult.subTab);
    }
    setActiveTab(routedResult.systemTab);
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-amber-200/60 tracking-[0.3em] animate-pulse">正在同步今日宇宙频率...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-12 md:space-y-16"
    >
      {/* ── 1. 顶部日期与优雅问候 ── */}
      <header className="space-y-3 max-w-4xl">
        <div className="flex items-center gap-3 text-[11px] text-[#C9A84C]/80 font-serif tracking-[0.3em] uppercase">
          <span>{fullDateDisplay}</span>
          <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
          <span>岁次 {almanac.ganzhiYear} · {almanac.ganzhiDay}日 · 宇宙能量：{dailyData?.cosmicEnergy || "觉照"}</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-[#E8DFB8] tracking-tight leading-[1.1] max-w-3xl">
          {greeting}, <span className="gold-gradient-text italic font-light pr-3 inline-block">{profile.name || "旅人"}</span>
        </h1>
      </header>

      {/* ── 2. 【今日神谕】核心视觉大卡片 (绝对 C 位经典殿堂卡) ── */}
      <section ref={posterRef} className="relative group aura-ring rounded-[3.5rem]">
        <div className="relative min-h-[420px] md:min-h-[500px] rounded-[3.5rem] overflow-hidden obsidian-glass liquid-border shadow-[0_40px_100px_rgba(0,0,0,0.95)] flex flex-col justify-center">
          <div className="absolute inset-0 z-0">
            <MysticImage 
              prompt={dailyData?.imagePrompt || `Breathtaking high-end mystical wallpaper, deep cosmic nebula, ethereal golden sacred geometry, cinematic lighting, day ${todayStr}`} 
              aspectRatio="3:4" 
              seed={dailyData?.date || todayStr}
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[30s] ease-out opacity-85"
            />

          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050308]/95 via-[#050308]/65 to-[#050308]/40 z-10" />
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('/patterns/stardust.png')] pointer-events-none" />

          <div className="relative z-20 flex flex-col items-center justify-center p-6 md:p-12 text-center space-y-8 my-auto">
            <div className="space-y-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#C9A84C]/80 to-transparent mx-auto" />
              <span className="text-xs font-serif tracking-[0.8em] text-[#C9A84C] uppercase font-bold">今日神谕</span>
            </div>

            {/* Oracle Text with 100% Guaranteed High-End Golden Typography */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-xl md:text-2xl lg:text-3xl font-serif text-[#FBF5D8] leading-[2] tracking-[0.03em] italic max-w-4xl drop-shadow-[0_4px_25px_rgba(201,168,76,0.5)] px-4 md:px-8"
            >
              {dailyData?.reading ? (
                dailyData.reading.startsWith("「") ? dailyData.reading : `「 ${dailyData.reading} 」`
              ) : (
                "「 在裂隙之中，万物有光得以涌入。 」"
              )}
            </motion.p>

            <div className="flex flex-col items-center gap-6 w-full pt-2">
              <span className="text-sm md:text-base text-[#C9A84C] font-serif tracking-[0.4em] uppercase font-medium drop-shadow-md">
                {dailyData?.subMotto || "向内观照 · 觉醒"}
              </span>
              
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={handleInscribe}
                  disabled={isInscribing}
                  className="flex items-center gap-2.5 px-8 md:px-10 py-3.5 rounded-full bg-[#080510]/90 border border-[#C9A84C]/50 text-[#E8DFB8] hover:text-white hover:border-[#C9A84C] hover:bg-[#12081f] transition-all duration-500 text-[11px] tracking-[0.4em] uppercase backdrop-blur-3xl shadow-[0_0_25px_rgba(201,168,76,0.25)] group/btn cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#C9A84C] transition-transform group-hover/btn:scale-125 ${isInscribing ? 'animate-spin' : ''}`} />
                  {isInscribing ? "记录中" : "铭刻至日记"}
                </button>
                <button 
                  onClick={() => handleGeneratePoster(posterRef.current!, `oracle-${todayStr}.jpg`)}
                  disabled={isGeneratingPoster}
                  className="flex items-center gap-2.5 px-8 md:px-10 py-3.5 rounded-full bg-[#080510]/90 border border-[#C9A84C]/50 text-[#E8DFB8] hover:text-white hover:border-[#C9A84C] hover:bg-[#12081f] transition-all duration-500 text-[11px] tracking-[0.4em] uppercase backdrop-blur-3xl shadow-[0_0_25px_rgba(201,168,76,0.25)] group/btn cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C9A84C] group-hover/btn:translate-y-1 transition-transform" />
                  {isGeneratingPoster ? "导出中" : "收藏卡片"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-5 right-6 z-30 opacity-60 flex items-center gap-2 font-mono pointer-events-none">
             <span className="text-[10px] font-serif tracking-[0.3em] text-[#E8DFB8]/80 uppercase">阿卡夏共鸣</span>
             <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
        </div>
      </section>

      {/* ── 3. 【太阳 / 性别 / MBTI】个人灵魂属性 3 格卡片 (100% 经典回归) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Sun, label: "太阳星座", value: sunSign },
          { icon: User, label: "乾坤属性", value: (profile.gender === '男' || profile.gender === 'male') ? '乾造 (男)' : (profile.gender === '女' || profile.gender === 'female') ? '坤造 (女)' : profile.gender || "未设定" },
          { icon: Activity, label: "MBTI 灵魂原型", value: profile.mbti || "未觉醒" }
        ].map((stat, i) => (
          <div key={i} className="obsidian-glass rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-4 group hover:border-[#C9A84C]/40 transition-all duration-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5 hover:shadow-[0_0_40px_rgba(201,168,76,0.15)]">
            <div className="w-12 h-12 rounded-2xl border border-[#C9A84C]/20 flex items-center justify-center bg-[#C9A84C]/5 group-hover:bg-[#C9A84C]/15 group-hover:scale-110 transition-all duration-700">
              <stat.icon className="w-6 h-6 text-[#C9A84C]/60 group-hover:text-[#C9A84C] transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-serif tracking-[0.4em] text-[#C9A84C]/60 uppercase">{stat.label}</div>
              <div className="text-xl font-serif text-[#E8DFB8] tracking-widest">{stat.value}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── 4. 【今日宇宙能量指引】与【时空开运黄历】有机融合殿堂卡 ── */}
      <section className="obsidian-glass rounded-[3rem] p-8 md:p-12 border border-[#C9A84C]/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-8">
        {/* Tier 1: 顶部全宽能量指引金言 */}
        <div className="space-y-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] shrink-0 shadow-[0_0_20px_rgba(201,168,76,0.2)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.4em] text-[#C9A84C] uppercase font-bold">COSMIC ENERGY</div>
              <h3 className="font-serif text-xl md:text-2xl text-[#FFFDF6] tracking-wider font-bold">今日宇宙能量指引</h3>
            </div>
          </div>
          <p className="font-serif text-base md:text-lg text-[#FBF5D8] leading-relaxed pl-1 max-w-5xl">
            {dailyData?.energySuggestion || "今日请试着在繁杂的讯息中抽身片刻，允许内在的脆弱与渴望舒展，在静穆中整合被压抑的真实自我。"}
          </p>
        </div>

        {/* Tier 2: 中层 4 格开运罗盘金徽 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 md:p-5 rounded-2xl bg-[#0c0617]/80 border border-[#C9A84C]/25 text-center space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono text-[#C9A84C]/70 uppercase tracking-widest block">贵人方位</span>
            <span className="text-sm md:text-base font-serif text-[#E8DFB8] font-bold block">{almanac.nobleDirection}</span>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-[#0c0617]/80 border border-[#C9A84C]/25 text-center space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono text-[#C9A84C]/70 uppercase tracking-widest block">生肖贵人</span>
            <span className="text-sm md:text-base font-serif text-[#E8DFB8] font-bold block">属【{almanac.nobleZodiac}】</span>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-[#0c0617]/80 border border-[#C9A84C]/25 text-center space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono text-[#C9A84C]/70 uppercase tracking-widest block">开运能量色</span>
            <span className="text-sm md:text-base font-serif text-[#E8DFB8] font-bold block">{almanac.luckyColor}</span>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-[#0c0617]/80 border border-[#C9A84C]/25 text-center space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono text-[#C9A84C]/70 uppercase tracking-widest block">财神吉方</span>
            <span className="text-sm md:text-base font-serif text-[#E8DFB8] font-bold block">{almanac.wealthDirection}</span>
          </div>
        </div>

        {/* Tier 3: 底层双子翼等高平衡卡 (50% / 50%) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* 左翼：命盘时空共振 */}
          <div className="p-6 rounded-2xl bg-[#0c0617]/80 border border-white/10 space-y-3 flex flex-col justify-between shadow-inner">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#C9A84C] tracking-[0.3em] uppercase block font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 命盘时空共振 (Personal Blueprint)
              </span>
              <p className="text-xs md:text-sm text-[#E8DFB8]/80 font-serif leading-relaxed">
                {profile.birthDate 
                  ? almanac.personalElementRelation 
                  : "当前为天地通用气场。前往个人档案绑定生辰八字，可解锁精准的日主生克合盘与个人喜忌。"}
              </p>
            </div>
            <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase pt-2 border-t border-white/5">
              {profile.birthDate ? "✦ 个人日主与流日合盘已校准" : "✦ 宏观天地时空气场"}
            </div>
          </div>

          {/* 右翼：今日宜忌决策徽章 */}
          <div className="p-6 rounded-2xl bg-[#0c0617]/80 border border-white/10 space-y-4 flex flex-col justify-between shadow-inner">
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs md:text-sm font-serif">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-400 font-bold mr-1 shrink-0">宜：</span>
                <div className="flex flex-wrap gap-2">
                  {almanac.suitable.slice(0, 4).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-serif">
                      ✦ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs md:text-sm font-serif">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-rose-400 font-bold mr-1 shrink-0">忌：</span>
                <div className="flex flex-wrap gap-2">
                  {almanac.unsuitable.slice(0, 3).map((u, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-serif">
                      ✕ {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase pt-2 border-t border-white/5">
              ✦ 顺应天时 · 趋吉避凶
            </div>
          </div>
        </div>
      </section>


      {/* ── 5. 【最近探索足迹】卡片 (100% 经典回归) ── */}
      {lastEntry && (
        <section className="obsidian-glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#C9A84C]/30 transition-all duration-700">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A84C]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-serif tracking-[0.3em] text-[#C9A84C]/60 uppercase">最近探索足迹</div>
              <div className="text-lg font-serif text-[#E8DFB8]">{lastEntry.customTitle || lastEntry.title}</div>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('journey')}
            className="px-6 py-2.5 rounded-full border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 font-serif text-xs tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>回顾灵魂卷轴</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* ── 6. 底部轻巧灵犀罗盘（心有所念，直问苍穹）── */}
      <section className="p-6 md:p-8 rounded-[2.5rem] bg-[#0c0617]/50 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C] uppercase tracking-widest font-bold">
            <Compass className="w-4 h-4 text-[#C9A84C]" />
            <span>灵犀直达 · 智能术数罗盘</span>
          </div>
          <span className="text-[11px] text-white/30 font-serif">输入当下心中所惑，快速为你导向最适合的卦阵殿堂</span>
        </div>

        <form onSubmit={handleCompassSearch} className="flex gap-3">
          <input
            type="text"
            value={compassInput}
            onChange={(e) => {
              setCompassInput(e.target.value);
              if (routedResult) setRoutedResult(null);
            }}
            placeholder="例如：明天面试能否通过？近期感情走向？下半年财运如何？"
            className="flex-1 bg-black/40 border border-white/10 rounded-full px-6 py-3.5 text-xs md:text-sm font-serif text-[#FFFDF6] placeholder-white/20 focus:outline-none focus:border-[#C9A84C] transition-all"
          />
          <button
            type="submit"
            disabled={!compassInput.trim()}
            className="px-6 py-3.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#F5E6AD] font-serif text-xs tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#080510] transition-all cursor-pointer disabled:opacity-30 shrink-0 flex items-center gap-1.5 font-bold"
          >
            <span>感应</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <AnimatePresence>
          {routedResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-[#1b102e]/80 border border-[#C9A84C]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#F5E6AD] font-serif font-bold">
                  <span>✦ 推荐：{routedResult.systemName}</span>
                  <span className="text-[10px] opacity-70 font-normal">({routedResult.badge})</span>
                </div>
                <p className="text-xs text-[#E8DFB8]/70 font-serif">{routedResult.rationale}</p>
              </div>
              <button
                onClick={handleLaunchRoutedDivination}
                className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-[#080510] font-serif text-xs font-bold tracking-widest uppercase hover:bg-[#E8DFB8] transition-all cursor-pointer shrink-0"
              >
                直达启卦
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
