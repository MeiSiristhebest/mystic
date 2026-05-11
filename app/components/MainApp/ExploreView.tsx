"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Moon,
  Star,
  Compass,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MysticImage } from "./MysticImage";
import BreathingLoading from "../BreathingLoading";
import { useAppStore } from "@/lib/store";
import { MysticTarot } from "@/app/components/MainApp/MysticTarot";
import { OmniOracleGuide, HandoffData } from "./OmniOracleGuide";

const AstrologyApp = dynamic(() => import("../AstrologyApp"), { 
  loading: () => <BreathingLoading text="正在连接星辰..." /> 
});
const EasternApp = dynamic(() => import("../EasternApp"), { 
  loading: () => <BreathingLoading text="正在对齐东方历法..." /> 
});

export function ExploreView() {
  const [subTab, setSubTab] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [handoffData, setHandoffData] = useState<HandoffData | null>(null);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const systems = [
    { id: "tarot", name: "塔罗占卜", icon: Sparkles, desc: "通过78张神秘卡片，洞察当下与未来的能量流动。" },
    { id: "eastern", name: "东方命理", icon: Star, desc: "八字、紫微、六爻，传承千年的东方智慧推演。" },
    { id: "astrology", name: "星象人格", icon: Moon, desc: "解读星盘与天象，探索灵魂的蓝图与性格底色。" },
    { id: "discovery", name: "发现自我", icon: Compass, desc: "通过MBTI、八字与原型探索，开启你的深度灵魂发现之旅。", isSpecial: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <header className="max-w-2xl space-y-6">
        <h1 className="editorial-title">探索<span className="gold-gradient-text">宇宙</span></h1>
        <p className="text-xl text-[#E8DFB8]/60 font-serif leading-relaxed">
          选择一个神秘系统，开启你的探索之旅。无论是当下的困惑，还是长远的人生蓝图，星辰皆有回应。
        </p>
      </header>

      {/* Prominent Omni-Oracle Entry Point */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsGuideOpen(true)}
        className="w-full relative luxury-card p-8 sm:p-12 cursor-pointer group overflow-hidden flex flex-col items-center justify-center text-center border-[#C9A84C]/40 bg-[#C9A84C]/5 shadow-[0_0_30px_rgba(201,168,76,0.15)]"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 group-hover:opacity-40 transition-opacity duration-1000 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A84C]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        <Sparkles className="w-12 h-12 text-[#C9A84C] mb-6 animate-pulse" />
        <h2 className="text-3xl sm:text-4xl font-serif gold-gradient-text mb-4 tracking-widest">
          唤醒全知向导
        </h2>
        <p className="text-[#E8DFB8]/70 text-lg sm:text-xl font-serif max-w-2xl">
          &quot;迷茫的旅人，不知从何问起？让我通过深邃的对话，为你指引通往真理的阵法。&quot;
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {systems.map((system) => {
          const Icon = system.icon;
          const isActive = subTab === system.id;
          const prompts: Record<string, string> = {
            tarot: "Mysterious tarot cards floating in a nebula, golden sacred geometry, ethereal light",
            eastern: "Ancient Chinese astrology, bagua, yin yang, golden dragon in cosmic clouds, ink wash style",
            astrology: "Zodiac wheel, constellations, glowing planets, nebula background, celestial map",
            discovery: "Ethereal soul discovery, glowing compass, sacred geometry, cosmic light"
          };
          return (
            <div
              key={system.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (system.id === "discovery") {
                  setActiveTab("discovery");
                } else {
                  setSubTab(system.id);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && setSubTab(system.id)}
              className={`luxury-card p-10 text-left transition-all duration-700 group relative overflow-hidden min-h-[320px] flex flex-col justify-end cursor-pointer ${
                isActive ? "border-[#C9A84C]/40 bg-[#C9A84C]/5" : "hover:bg-white/5"
              }`}
            >
              <div className="absolute inset-0 z-0">
                <MysticImage 
                  prompt={prompts[system.id]} 
                  className={`w-full h-full transition-all duration-1000 ${isActive ? "opacity-60 scale-105" : "opacity-20 group-hover:opacity-40"}`}
                  aspectRatio="3:4"
                />
              </div>
              <div className="relative z-10">
                <Icon className={`w-12 h-12 mb-8 transition-all duration-700 ${
                  isActive ? "text-[#C9A84C] scale-110" : "text-[#E8DFB8]/20 group-hover:text-[#E8DFB8]/40"
                }`} />
                <h3 className={`text-3xl font-serif mb-4 transition-colors ${isActive ? "gold-gradient-text" : ""}`}>
                  {system.name}
                </h3>
                <p className="text-[#E8DFB8]/40 leading-relaxed">{system.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-12 border-t border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={subTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
          >
            {subTab === "tarot" && <MysticTarot initialHandoff={handoffData} clearHandoff={() => setHandoffData(null)} />}
            {subTab === "eastern" && <EasternApp initialHandoff={handoffData} clearHandoff={() => setHandoffData(null)} />}
            {subTab === "astrology" && <AstrologyApp />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isGuideOpen && (
          <OmniOracleGuide 
            onClose={() => setIsGuideOpen(false)} 
            onHandoff={(data) => {
              setIsGuideOpen(false);
              setHandoffData(data);
              setSubTab(data.system);
              // Scroll down to the app area
              setTimeout(() => {
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }, 500);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
