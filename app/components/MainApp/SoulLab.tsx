"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Eye } from "lucide-react";
import dynamic from "next/dynamic";
import BreathingLoading from "../BreathingLoading";

const ShadowWorkApp = dynamic(() => import("../ShadowWorkApp"), { 
  loading: () => <BreathingLoading text="正在潜入阴影深处..." /> 
});
const SubconsciousApp = dynamic(() => import("../SubconsciousApp"), { 
  loading: () => <BreathingLoading text="正在链接潜意识剧场..." /> 
});

interface SoulLabProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function SoulLab({ initialHandoff, clearHandoff }: SoulLabProps) {
  const [activeTab, setActiveTab] = useState<"shadow" | "subconscious">(
    initialHandoff?.soulLabTab === "subconscious" || initialHandoff?.system === "subconscious" ? "subconscious" : "shadow"
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialHandoff?.soulLabTab === "subconscious" || initialHandoff?.system === "subconscious") {
        setActiveTab("subconscious");
      } else if (initialHandoff?.soulLabTab === "shadow") {
        setActiveTab("shadow");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initialHandoff]);

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="flex p-1 bg-black/50 rounded-full border border-purple-500/30">
          <button
            onClick={() => setActiveTab("shadow")}
            className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
              activeTab === "shadow"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                : "text-purple-300/60 hover:text-purple-200"
            }`}
          >
            <Moon className="inline-block w-4 h-4 mr-2 mb-0.5" />
            阴影工作
          </button>
          <button
            onClick={() => setActiveTab("subconscious")}
            className={`px-6 py-2 rounded-full text-sm font-serif tracking-widest transition-all ${
              activeTab === "subconscious"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                : "text-purple-300/60 hover:text-purple-200"
            }`}
          >
            <Eye className="inline-block w-4 h-4 mr-2 mb-0.5" />
            潜意识剧场
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
          {activeTab === "shadow" ? (
            <ShadowWorkApp initialHandoff={initialHandoff} clearHandoff={clearHandoff} />
          ) : (
            <SubconsciousApp initialHandoff={initialHandoff} clearHandoff={clearHandoff} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
