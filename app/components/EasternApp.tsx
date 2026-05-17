"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Star, Compass, Coins, Book, Map, Eye } from "lucide-react";
import dynamic from "next/dynamic";
import BreathingLoading from "./BreathingLoading";

const BaziApp = dynamic(() => import("./BaziApp"), { 
  loading: () => <BreathingLoading text="正在感应八字紫微星轨..." /> 
});
const IChingApp = dynamic(() => import("./IChingApp"), { 
  loading: () => <BreathingLoading text="正在推算易经玄妙爻辞..." /> 
});
const FaceReadingApp = dynamic(() => import("./FaceReadingApp"), { 
  loading: () => <BreathingLoading text="正在端详骨相面相..." /> 
});

type SubSystem = "bazi" | "ziwei" | "liunian" | "liuyao" | "meihua" | "qimen" | "mianxiang";

const SUB_SYSTEMS: { id: SubSystem; label: string; icon: any }[] = [
  { id: "bazi", label: "八字排盘", icon: Calendar },
  { id: "ziwei", label: "紫微斗数", icon: Star },
  { id: "liunian", label: "流年避坑", icon: Compass },
  { id: "liuyao", label: "六爻起卦", icon: Coins },
  { id: "meihua", label: "梅花易数", icon: Book },
  { id: "qimen", label: "奇门遁甲", icon: Map },
  { id: "mianxiang", label: "面相骨相", icon: Eye },
];

interface EasternAppProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function EasternApp({ initialHandoff, clearHandoff }: EasternAppProps) {
  const [activeTab, setActiveTab] = useState<SubSystem>(() => {
    if (initialHandoff?.modeId && SUB_SYSTEMS.some(s => s.id === initialHandoff.modeId)) {
      return initialHandoff.modeId as SubSystem;
    }
    return "bazi";
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialHandoff?.modeId && SUB_SYSTEMS.some(s => s.id === initialHandoff.modeId)) {
        setActiveTab(initialHandoff.modeId as SubSystem);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initialHandoff]);

  const isBaziGroup = activeTab === "bazi" || activeTab === "ziwei" || activeTab === "liunian";
  const isIChingGroup = activeTab === "liuyao" || activeTab === "meihua" || activeTab === "qimen";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-0">
      {/* 顶部华丽长廊导航条 */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-1.5 p-2 bg-[#0A070C]/90 rounded-full border border-amber-500/20 max-w-full overflow-x-auto custom-scrollbar shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {SUB_SYSTEMS.map((sys) => {
            const Icon = sys.icon;
            const isActive = activeTab === sys.id;
            return (
              <button
                key={sys.id}
                onClick={() => setActiveTab(sys.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-serif tracking-widest transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105"
                    : "text-amber-200/60 hover:text-amber-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-amber-500/60"}`} />
                {sys.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {isBaziGroup && (
            <BaziApp mode={activeTab} initialHandoff={initialHandoff} clearHandoff={clearHandoff} />
          )}
          {isIChingGroup && (
            <IChingApp mode={activeTab} initialHandoff={initialHandoff} clearHandoff={clearHandoff} />
          )}
          {activeTab === "mianxiang" && (
            <FaceReadingApp onReadingChange={() => {}} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
