"use client";

import { motion } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function SynastryRitual({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage < 3) setStage(s => s + 1);
      else onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  const messages = [
    "正在对齐灵魂频率...",
    "扫描情感共振回路...",
    "推演缘分因果轨迹...",
    "共鸣场建立完成"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-pink-500/20 rounded-full border-dashed"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border border-purple-500/10 rounded-full"
        />
        
        <div className="relative flex items-center gap-1">
          <motion.div
            animate={{ x: [-10, 0], opacity: [0, 1] }}
            transition={{ duration: 1 }}
          >
            <Heart className="w-12 h-12 text-pink-500/60 fill-pink-500/10" />
          </motion.div>
          <motion.div
            animate={{ x: [10, 0], opacity: [0, 1] }}
            transition={{ duration: 1 }}
          >
            <Heart className="w-12 h-12 text-purple-500/60 fill-purple-500/10" />
          </motion.div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-xl font-serif text-pink-100 tracking-[0.3em] uppercase">
          {messages[stage]}
        </h3>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i <= stage ? 'bg-pink-500' : 'bg-white/5'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
