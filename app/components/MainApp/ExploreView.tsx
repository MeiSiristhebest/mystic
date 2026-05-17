"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Moon,
  Star,
  Compass,
  Zap,
  ArrowLeft,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MysticImage } from "./MysticImage";
import BreathingLoading from "../BreathingLoading";
import { useAppStore } from "@/lib/store";
import { DivinationHandoff } from "@/app/types/divination";

const MysticTarot = dynamic(() => import("./MysticTarot").then(mod => mod.MysticTarot), { 
  loading: () => <BreathingLoading text="正在感应塔罗能量..." /> 
});
const AstrologyApp = dynamic(() => import("../AstrologyApp"), { 
  loading: () => <BreathingLoading text="正在连接星辰..." /> 
});
const EasternApp = dynamic(() => import("../EasternApp"), { 
  loading: () => <BreathingLoading text="正在对齐东方历法..." /> 
});
const SoulLab = dynamic(() => import("./SoulLab"), { 
  loading: () => <BreathingLoading text="正在激活心灵实验室..." /> 
});
const OmniOracleGuide = dynamic(() => import("./OmniOracleGuide").then(mod => mod.OmniOracleGuide), {
  ssr: false
});

interface SystemCardProps {
  system: any;
  isActive: boolean;
  onClick: () => void;
}

function SystemCard({ system, isActive, onClick }: SystemCardProps) {
  const Icon = system.icon;
  return (
    <div
      role="button"
      onClick={onClick}
      className={`obsidian-glass rounded-[3rem] p-10 text-left transition-all duration-700 group relative overflow-hidden min-h-[340px] flex flex-col justify-end cursor-pointer ${
        isActive ? "border-[#C9A84C]/60 bg-[#C9A84C]/10 shadow-[0_0_80px_rgba(201,168,76,0.2)]" : "hover:border-[#C9A84C]/40 hover:shadow-[0_0_50px_rgba(201,168,76,0.1)]"
      }`}
    >
      <div className="absolute inset-0 z-0">
        <MysticImage 
          prompt={system.prompt} 
          className={`w-full h-full object-cover transition-all duration-1000 ${isActive ? "opacity-70 scale-110" : "opacity-30 group-hover:opacity-50 group-hover:scale-105"}`}
          aspectRatio="3:4"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#080510] via-[#080510]/60 to-transparent z-10" />
      <div className="relative z-20">
        <div className="w-16 h-16 rounded-3xl border border-[#C9A84C]/20 flex items-center justify-center bg-[#C9A84C]/5 mb-6 group-hover:bg-[#C9A84C]/15 group-hover:scale-110 transition-all duration-700">
          <Icon className={`w-8 h-8 transition-colors ${
            isActive ? "text-[#C9A84C]" : "text-[#C9A84C]/50 group-hover:text-[#C9A84C]"
          }`} />
        </div>
        <h3 className={`text-3xl font-serif mb-3 tracking-wide transition-colors ${isActive ? "gold-gradient-text" : "text-[#E8DFB8] group-hover:text-white"}`}>
          {system.name}
        </h3>
        <p className="text-[#E8DFB8]/60 text-sm font-serif leading-relaxed line-clamp-3">{system.desc}</p>
      </div>
    </div>
  );
}

export function ExploreView() {
  const [subTab, setSubTab] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [handoffData, setHandoffData] = useState<DivinationHandoff | null>(null);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const activeSubTab = useAppStore((state) => state.activeSubTab);
  const setActiveSubTab = useAppStore((state) => state.setActiveSubTab);
  const globalHandoff = useAppStore((state: any) => state.handoff);
  const setGlobalHandoff = useAppStore((state: any) => state.setHandoff);

  // Sync with global activeSubTab
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (activeSubTab) {
      setSubTab(activeSubTab);
      setActiveSubTab(null);
    }
  }, [activeSubTab, setActiveSubTab]);

  // Sync with global handoff (e.g. from TodayView or Tarot)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (globalHandoff) {
      if (globalHandoff.system === 'oracle') {
        setIsGuideOpen(true);
        setGlobalHandoff(null);
        return;
      }
      
      const timer = setTimeout(() => {
        setHandoffData(globalHandoff);
        setSubTab(globalHandoff.system);
        setGlobalHandoff(null); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [globalHandoff, setGlobalHandoff]);

  const systems = [
    { 
      id: "tarot", 
      name: "塔罗仪式", 
      icon: Sparkles, 
      desc: "西方神秘学的基石。通过78张卡片，洞察能量的微妙流动与潜意识投射。", 
      prompt: "Mysterious tarot cards floating in a nebula, golden sacred geometry, ethereal light"
    },
    { 
      id: "eastern", 
      name: "东方命理", 
      icon: Compass, 
      desc: "融合八字、易经、紫微与相学。通过干支历法与古老卦象，推演人生起伏。", 
      prompt: "Ancient Chinese astrology, bagua, yin yang, golden dragon in cosmic clouds, ink wash style"
    },
    { 
      id: "astrology", 
      name: "星象人格", 
      icon: Moon, 
      desc: "结合现代占星与心理学。解读星盘、合盘与MBTI，探索性格蓝图与命运契机。", 
      prompt: "Zodiac wheel, constellations, glowing planets, nebula background, celestial map"
    },
    { 
      id: "soul", 
      name: "心灵实验室", 
      icon: Zap, 
      desc: "深层心理探索。包含阴影工作、灵魂合参、梦境解析等进阶神秘学工具。", 
      prompt: "Ethereal soul discovery, glowing compass, sacred geometry, cosmic light"
    },
  ];

  const handleBackToSystems = () => {
    setSubTab("");
    setHandoffData(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <AnimatePresence mode="wait">
        {!subTab ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            <header className="max-w-2xl space-y-6">
              <h1 className="editorial-title">探索<span className="gold-gradient-text">宇宙</span></h1>
              <p className="text-xl text-[#E8DFB8]/60 font-serif leading-relaxed">
                选择一个神秘系统，开启你的探索之旅。无论是当下的困惑，还是长远的人生蓝图，星辰皆有回应。
              </p>
            </header>

            {/* Guide Entry Point */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              onClick={() => setIsGuideOpen(true)}
              className="w-full relative obsidian-glass aura-ring rounded-[3.5rem] p-10 sm:p-16 cursor-pointer group overflow-hidden flex flex-col items-center justify-center text-center border border-[#C9A84C]/40 shadow-[0_0_80px_rgba(201,168,76,0.15)]"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen pointer-events-none" />
              <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-700 shadow-[0_0_40px_rgba(201,168,76,0.2)]">
                <Sparkles className="w-10 h-10 text-[#C9A84C] animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-5xl font-serif gold-gradient-text mb-4 tracking-widest uppercase">
                唤醒全知向导
              </h2>
              <p className="text-lg md:text-xl text-[#E8DFB8]/70 font-serif max-w-xl italic">
                迷茫的旅人，不知从何问起？让我进入阿卡夏之眼为你指引。
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {systems.map((system) => (
                <SystemCard 
                  key={system.id}
                  system={system}
                  isActive={false}
                  onClick={() => {
                    setSubTab(system.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ritual-room"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={handleBackToSystems}
                className="flex items-center gap-3 text-amber-500/50 hover:text-amber-500 transition-colors font-serif uppercase tracking-[0.3em] text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回圣殿</span>
              </button>
              <div className="flex items-center gap-4 px-4 py-2 bg-amber-500/5 border border-amber-500/20 rounded-full">
                <Sparkles className="w-4 h-4 text-amber-500/60" />
                <span className="font-serif text-amber-200/60 text-xs tracking-widest uppercase">
                  {systems.find(s => s.id === subTab)?.name}
                </span>
              </div>
            </div>

            <div className="ritual-container">
              {subTab === "tarot" && <MysticTarot initialHandoff={handoffData} clearHandoff={() => setHandoffData(null)} />}
              {subTab === "eastern" && <EasternApp initialHandoff={handoffData} clearHandoff={() => setHandoffData(null)} />}
              {subTab === "astrology" && <AstrologyApp initialHandoff={handoffData} clearHandoff={() => setHandoffData(null)} />}
              {subTab === "soul" && <SoulLab initialHandoff={handoffData} clearHandoff={() => setHandoffData(null)} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGuideOpen && (
          <OmniOracleGuide 
            onClose={() => setIsGuideOpen(false)} 
            onHandoff={(data: any) => {
              setIsGuideOpen(false);
              setHandoffData(data);
              setSubTab(data.system);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
