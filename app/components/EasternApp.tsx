"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Book } from "lucide-react";
import dynamic from "next/dynamic";
import BreathingLoading from "./BreathingLoading";

const BaziApp = dynamic(() => import("./BaziApp"), { 
  loading: () => <BreathingLoading text="正在推算八字命盘..." /> 
});
const IChingApp = dynamic(() => import("./IChingApp"), { 
  loading: () => <BreathingLoading text="正在起卦..." /> 
});

interface EasternAppProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function EasternApp({ initialHandoff, clearHandoff }: EasternAppProps) {
  const [activeTab, setActiveTab] = useState<"bazi" | "iching">(
    initialHandoff?.modeId === "iching" || initialHandoff?.system === "iching" ? "iching" : "bazi"
  );

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="flex p-1 bg-black/50 rounded-full border border-amber-500/30">
          <button
            onClick={() => setActiveTab("bazi")}
            className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
              activeTab === "bazi"
                ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                : "text-amber-300/60 hover:text-amber-200"
            }`}
          >
            <Compass className="inline-block w-4 h-4 mr-2 mb-0.5" />
            八字命理
          </button>
          <button
            onClick={() => setActiveTab("iching")}
            className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
              activeTab === "iching"
                ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                : "text-amber-300/60 hover:text-amber-200"
            }`}
          >
            <Book className="inline-block w-4 h-4 mr-2 mb-0.5" />
            易经占卜
          </button>
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
          {activeTab === "bazi" ? (
            <BaziApp initialHandoff={initialHandoff} clearHandoff={clearHandoff} />
          ) : (
            <IChingApp initialHandoff={initialHandoff} clearHandoff={clearHandoff} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
