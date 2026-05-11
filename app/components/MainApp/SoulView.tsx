"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  User,
  Wand2,
  Zap,
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

export function SoulView() {
  const profile = useAppStore((state) => state.profile);
  const isLoaded = useAppStore((state) => state.isLoaded);
  const setIsProfileModalOpen = useAppStore((state) => state.setIsProfileModalOpen);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  
  const { entries } = useJourney();
  
  const birthDate = profile.birthDate ? new Date(profile.birthDate) : null;
  const sunSign = birthDate ? getSunSign(birthDate) : "未知";
  const ascendant = birthDate && profile.birthTime ? getAscendant(birthDate, profile.birthTime) : "未知";
  const descendant = ascendant !== "未知" ? getDescendant(ascendant) : "未知";
  const rulingPlanet = sunSign !== "未知" ? getRulingPlanet(sunSign) : "未知";
  
  const mbti = profile.mbti || "未设置";
  let archetype = profile.jungianArchetype?.split('(')[0].trim() || "";
  
  // Basic check for garbled text
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
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayEmotion = profile.emotionalBaseline?.find(e => e.date === dateStr);
      if (dayEmotion) {
        levels.push(Math.min(100, 40 + dayEmotion.words.length * 15));
      } else {
        levels.push(40 + Math.sin(i) * 10);
      }
    }
    return levels;
  }, [profile.emotionalBaseline]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="luxury-card p-10 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
            <div className="absolute inset-0 z-0">
              <MysticImage 
                prompt={`A glowing ethereal soul essence for ${archetype || 'Seeker'}, nebula heart, cosmic energy flow, sacred geometry`} 
                className="w-full h-full opacity-30"
                aspectRatio="16:9"
              />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#C9A84C]/40 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <div>
                  {archetype ? (
                    <>
                      <h3 className="text-3xl font-serif gold-gradient-text">核心人格：{archetype}</h3>
                      <p className="micro-label">Soul Core: The {profile.jungianArchetype?.split('(')[1]?.replace(')', '') || 'Seeker'}</p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif text-[#E8DFB8]/40 italic">核心人格：尚未觉醒</h3>
                      <button 
                        onClick={() => setActiveTab("discovery")}
                        className="text-xs text-[#C9A84C] hover:underline flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3" /> 开启原型探索，发现你的灵魂本色
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "太阳", value: sunSign },
                  { label: "上升", value: ascendant },
                  { label: "下降", value: descendant },
                  { label: "生肖", value: profile.zodiac || "未设置" },
                  { label: "八字", value: profile.bazi || "未设置" },
                  { label: "守护星", value: rulingPlanet },
                  { label: "性别", value: profile.gender || "未设置" },
                  { label: "MBTI", value: mbti },
                  { label: "状态", value: profile.currentStatus ? "已同步" : "待更新" },
                ].map((trait, i) => (
                  <div key={i} className="cinematic-panel bg-black/40 backdrop-blur-xl p-6 rounded-2xl text-center border border-white/5">
                    <p className="micro-label mb-2 text-[#C9A84C] opacity-80">{trait.label}</p>
                    <p className="font-serif text-lg text-[#E8DFB8] drop-shadow-md">{trait.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="luxury-card p-8 space-y-6">
              <h4 className="font-serif text-xl tracking-widest">核心人生议题</h4>
              <div className="flex flex-wrap gap-3">
                {coreIssues.map((word) => (
                  <span key={word} className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm font-serif tracking-widest hover:border-[#C9A84C]/40 transition-colors">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div className="luxury-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-xl tracking-widest">能量波动</h4>
              </div>
              <div className="h-32 flex items-end gap-1 md:gap-2">
                {energyLevels.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-[#C9A84C]/20 to-[#C9A84C]/60 rounded-t-lg relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#C9A84C] font-mono">
                      {Math.round(h)}
                    </div>
                  </motion.div>
                ))}
              </div>
              <MoodCheckIn />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="luxury-card p-8 space-y-8">
            <h4 className="font-serif text-xl tracking-widest text-center">当前生命节点</h4>
            <div className="space-y-6">
              {profile.lifeEvents && profile.lifeEvents.length > 0 ? (
                profile.lifeEvents.slice(-3).map((event) => (
                  <div key={event.id} className="relative pl-6 border-l border-[#C9A84C]/20">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-[#C9A84C]" />
                    <p className="text-xs text-[#C9A84C]/60 mb-1">{event.date}</p>
                    <p className="text-sm font-serif leading-relaxed">{event.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-[#C9A84C]/10 blur-3xl rounded-full animate-pulse" />
                    <MysticImage 
                      prompt="A quiet serene landscape, misty mountains, zen atmosphere" 
                      className="w-full h-full rounded-full border-2 border-[#C9A84C]/20"
                      aspectRatio="1:1"
                    />
                  </div>
                  <p className="text-sm text-[#E8DFB8]/40 italic">暂无重大生命节点记录</p>
                </div>
              )}
            </div>
          </section>

          <section className="luxury-card p-8 space-y-6">
            <h4 className="font-serif text-xl tracking-widest">成长建议</h4>
            <ul className="space-y-4">
              {profile.currentStatus ? (
                [
                  "在冥想中寻找内心的宁静",
                  "尝试用艺术表达潜意识",
                  "关注梦境中的符号指引",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/40 mt-2 group-hover:scale-150 transition-transform" />
                    <p className="text-sm text-[#E8DFB8]/70 font-serif leading-relaxed">{tip}</p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-[#E8DFB8]/40 italic text-center">完善档案后，阿卡夏将为你提供个性化建议</p>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
