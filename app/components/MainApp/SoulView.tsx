"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Wand2,
  RefreshCw,
} from "lucide-react";
import { useJourney } from "@/hooks/useJourney";
import { 
  getSunSign, 
  getAscendant, 
  getDescendant, 
  getRulingPlanet 
} from "@/lib/astrology";
import { MysticImage } from "./MysticImage";
import BreathingLoading from "../BreathingLoading";
import { useAppStore } from "@/lib/store";
import { MoodCheckIn } from "./MoodCheckIn";
import { useAIStream } from "@/hooks/useAIStream";
import { MODELS, AKASHA_PERSONA } from "@/lib/ai";
import { getSoulAdvicePrompt } from "@/lib/prompts";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";
import { cleanMysticContent } from "@/lib/utils";

export function SoulView() {
  const profile = useAppStore((state) => state.profile);
  const isLoaded = useAppStore((state) => state.isLoaded);
  const setIsProfileModalOpen = useAppStore((state) => state.setIsProfileModalOpen);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const updateProfile = useAppStore((state) => state.updateProfile);
  
  const { entries, addEntry, isLoaded: journeyLoaded } = useJourney();
  const [dailyAdvice, setDailyAdvice] = useState<string[]>([]);
  const [isInitializingAdvice, setIsInitializingAdvice] = useState(true);

  const aiOptions = useMemo(() => ({
    model: MODELS.FLASH, // Use FLASH for faster dashboard loading
    config: { responseMimeType: "application/json" }
  }), []);

  const { stream } = useAIStream(aiOptions);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (!isLoaded || !journeyLoaded) return;

    const initAdvice = async () => {
      const cacheKey = `soul_advice_v1_${todayStr}`;
      try {
        const cached = await getFromIndexedDB(cacheKey);
        if (cached && Array.isArray(cached)) {
          setDailyAdvice(cached);
          setIsInitializingAdvice(false);
          return;
        }
      } catch (e) {
        console.warn("Advice cache read failed", e);
      }

      const profileContext = JSON.stringify(profile);
      const recentHistory = entries.slice(0, 5).map(e => `${e.title}: ${e.summary}`).join('\n');
      const prompt = getSoulAdvicePrompt(profileContext, recentHistory);

      let fullOutput = "";
      try {
        for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
          fullOutput += chunk;
        }
        const data = JSON.parse(fullOutput.replace(/```json|```/g, '').trim());
        if (data.tips && Array.isArray(data.tips)) {
          setDailyAdvice(data.tips);
          await saveToIndexedDB(cacheKey, data.tips);
        }
      } catch (err) {
        console.error("Failed to generate soul advice", err);
        setDailyAdvice([
          "在冥想中寻找内心的宁静",
          "尝试用艺术表达潜意识",
          "关注梦境中的符号指引"
        ]);
      } finally {
        setIsInitializingAdvice(false);
      }
    };

    initAdvice();
  }, [isLoaded, journeyLoaded, profile, entries, stream, todayStr]);
  
  const handleMoodSelect = async (moodValue: string) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const mood = moods.find(m => m.value === moodValue);
    
    const currentBaseline = profile.emotionalBaseline || [];
    const existingIndex = currentBaseline.findIndex(e => e.date === dateStr);
    
    let newBaseline;
    if (existingIndex >= 0) {
      const words = [...new Set([...currentBaseline[existingIndex].words, mood?.label || ""])];
      newBaseline = currentBaseline.map((e, i) => i === existingIndex ? { ...e, words } : e);
    } else {
      newBaseline = [...currentBaseline, { date: dateStr, words: [mood?.label || ""] }];
    }
    
    updateProfile({ emotionalBaseline: newBaseline });

    await addEntry({
      type: 'subconscious',
      title: `能量打卡：${mood?.label || "觉察"}`,
      summary: `今日灵魂频率调频至 ${mood?.label}。在星辰的流动中，你记录下了这一刻的内在共鸣。`,
      details: {
        type: 'subconscious',
        text: `你于 ${dateStr} 完成了一次灵魂频率打卡。当前状态：${mood?.label}。建议通过冥想进一步加深对此能量的觉察。`,
        messages: [{ role: 'model', content: `我感知到了你的频率，${profile.name || "旅人"}。${mood?.label}的能量正在你的生命中流淌。保持这份觉察，它是通往个体化之路的基石。` }]
      }
    });
  };

  const birthDate = profile.birthDate ? new Date(profile.birthDate) : null;
  const sunSign = birthDate ? getSunSign(birthDate) : "未知";
  const ascendant = birthDate && profile.birthTime ? getAscendant(birthDate, profile.birthTime) : "未知";
  const descendant = ascendant !== "未知" ? getDescendant(ascendant) : "未知";
  const rulingPlanet = sunSign !== "未知" ? getRulingPlanet(sunSign) : "未知";
  
  const mbti = profile.mbti || "未设置";
  let archetype = profile.jungianArchetype?.split('(')[0].trim() || "";
  
  if (archetype && /[\u0080-\u00ff]/.test(archetype) && !/[\u4e00-\u9fa5]/.test(archetype)) {
    archetype = "";
  }
  const coreIssues = profile.coreIssues && profile.coreIssues.length > 0 ? profile.coreIssues : ["暂无记录"];
  
  const energyLevels = useMemo(() => {
    const levels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayEmotion = profile.emotionalBaseline?.find(e => e.date === dateStr);
      if (dayEmotion) {
        levels.push(Math.min(100, 40 + dayEmotion.words.length * 15));
      } else {
        levels.push(40 + Math.sin(i) * 10);
      }
    }
    return levels;
  }, [profile.emotionalBaseline]);

const moods = [
  { emoji: "✨", label: "充满灵感", value: "inspired" },
  { emoji: "🌙", label: "平静宁和", value: "calm" },
  { emoji: "🔥", label: "动力十足", value: "energetic" },
  { emoji: "🌧️", label: "略显忧郁", value: "melancholy" },
  { emoji: "🌀", label: "有些迷茫", value: "confused" },
  { emoji: "🌿", label: "正在疗愈", value: "healing" },
];

  if (!isLoaded) return <BreathingLoading text="正在同步灵魂频率..." />;

  const isProfileIncomplete = !profile.name || !profile.birthDate;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="editorial-title">灵魂<span className="gold-gradient-text">档案</span></h1>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 rounded-full border border-[#C9A84C]/40 text-sm font-serif tracking-widest hover:bg-[#C9A84C]/10 transition-all flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            编辑档案
          </button>
        </div>
        <p className="text-xl text-[#E8DFB8]/60 font-serif leading-relaxed">
          {profile.name ? `欢迎回来，${profile.name}。` : ""}这是你与宇宙连接的独特印记。每一颗星辰的排列，都构成了你不可复制的灵魂底色。
        </p>
      </header>

      {isProfileIncomplete && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="luxury-card p-8 border-amber-500/30 bg-amber-500/5 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-serif text-amber-300">完善你的灵魂档案</h4>
            <p className="text-sm text-amber-100/60">填写出生日期与基础信息，解锁精准的星象解析与心理原型分析。</p>
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="px-8 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-serif tracking-widest hover:bg-amber-500/30 transition-all"
          >
            立即完善
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Archetype & Stats (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero Archetype Card */}
          <section className="luxury-card p-10 relative overflow-hidden min-h-[460px] flex flex-col justify-end">
            <div className="absolute inset-0 z-0">
              <MysticImage 
                prompt={`A glowing ethereal soul essence for ${archetype || 'Seeker'}, nebula heart, cosmic energy flow, sacred geometry`} 
                className="w-full h-full opacity-40 scale-110 group-hover:scale-100 transition-transform duration-[20s]"
                aspectRatio="16:9"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#080510] via-transparent to-transparent z-10" />
            
            <div className="relative z-20 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/10 backdrop-blur-md">
                  <User className="w-6 h-6 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-serif tracking-[0.4em] text-amber-500/60 uppercase">核心人格 Archetype</p>
                  <h3 className="text-4xl md:text-5xl font-serif gold-gradient-text tracking-widest">
                    {archetype || "尚未觉醒"}
                  </h3>
                </div>
              </div>
              
              {!archetype && (
                <button 
                  onClick={() => setActiveTab("discovery")}
                  className="px-6 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 hover:bg-amber-500/30 transition-all flex items-center gap-2 w-fit"
                >
                  <Wand2 className="w-3 h-3" /> 开启原型探索
                </button>
              )}
            </div>
          </section>

          {/* Traits Grid */}
          <section className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: "太阳", value: sunSign, icon: "☀️" },
              { label: "上升", value: ascendant, icon: "↗️" },
              { label: "守护星", value: rulingPlanet, icon: "🪐" },
              { label: "生肖", value: profile.zodiac || "未设置", icon: "🐉" },
              { label: "八字", value: profile.bazi || "未设置", icon: "☯️" },
              { label: "MBTI", value: mbti, icon: "🧠" },
            ].map((trait, i) => (
              <div key={i} className="luxury-card p-6 flex flex-col items-center text-center space-y-3 group hover:border-amber-500/30 transition-all">
                <span className="text-2xl mb-1 opacity-50 group-hover:opacity-100 transition-opacity">{trait.icon}</span>
                <p className="micro-label text-amber-500/40">{trait.label}</p>
                <p className="font-serif text-lg text-amber-100">{trait.value}</p>
              </div>
            ))}
          </section>

          {/* Life Events Timeline */}
          <section className="luxury-card p-10 space-y-10">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-2xl tracking-[0.2em] text-amber-100/80">生命节点</h4>
              <div className="h-px flex-1 mx-8 bg-gradient-to-r from-amber-500/20 to-transparent" />
            </div>
            
            <div className="relative space-y-12 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-amber-500/40 before:via-amber-500/10 before:to-transparent">
              {profile.lifeEvents && profile.lifeEvents.length > 0 ? (
                profile.lifeEvents.slice(-4).map((event) => (
                  <div key={event.id} className="relative pl-10 group">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-amber-500/40 bg-[#080510] z-10 group-hover:scale-125 group-hover:border-amber-500 transition-all" />
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-amber-500/40 tracking-widest uppercase">{event.date}</span>
                      <p className="text-lg font-serif text-amber-100/90 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 space-y-6 opacity-30">
                  <p className="font-serif italic text-lg">暂无重大生命节点记录，在阿卡夏中留下你的足迹...</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Energy & Advice (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Energy Fluctuation */}
          <section className="luxury-card p-8 space-y-8">
            <h4 className="font-serif text-xl tracking-widest text-center gold-gradient-text">能量波动</h4>
            <div className="flex flex-col items-center space-y-8">
              <div className="h-40 flex items-end justify-center gap-3 w-full px-4">
                {energyLevels.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 max-w-[12px] bg-gradient-to-t from-amber-500/5 via-amber-500/30 to-amber-500/60 rounded-full"
                  />
                ))}
              </div>
              <MoodCheckIn 
                onSelect={handleMoodSelect} 
                selectedMood={profile.emotionalBaseline?.find(e => e.date === new Date().toISOString().split('T')[0])?.words[0]}
              />
            </div>
          </section>

          {/* Core Issues */}
          <section className="luxury-card p-8 space-y-6">
            <h4 className="font-serif text-xl tracking-widest">核心议题</h4>
            <div className="flex flex-wrap gap-2">
              {coreIssues.map((word) => (
                <span key={word} className="px-4 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 text-xs font-serif text-amber-200/60">
                  {word}
                </span>
              ))}
            </div>
          </section>

          {/* Growth Advice */}
          <section className="luxury-card p-8 space-y-8 border-amber-500/20 bg-amber-500/[0.02]">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-xl tracking-widest">成长建议</h4>
              {isInitializingAdvice && <RefreshCw className="w-4 h-4 animate-spin text-amber-500/40" />}
            </div>
            <div className="space-y-8">
              {dailyAdvice.length > 0 ? (
                dailyAdvice.map((tip, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <span className="text-amber-500/40 font-serif text-xs mt-1">0{i+1}</span>
                    <p className="text-sm text-amber-100/70 font-serif leading-relaxed group-hover:text-amber-100 transition-colors">
                      {cleanMysticContent(tip)}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-xs text-amber-200/20 italic text-center py-4">完善档案后，阿卡夏将为你提供个性化建议</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
