"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function IChingRitualManager({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage < 2) setStage(s => s + 1);
      else onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  const messages = [
    "正在摇动铜钱...",
    "观察阴阳爻变...",
    "推演八卦生克..."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-16">
      <div className="flex gap-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ 
              y: stage < 1 ? [0, -40, 0] : 0,
              rotate: stage < 1 ? [0, 360, 720] : 0
            }}
            transition={{ duration: 0.5, repeat: stage < 1 ? Infinity : 0, delay: i * 0.1 }}
            className="w-16 h-16 rounded-full border-4 border-amber-500/40 bg-amber-900/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(180,110,20,0.2)]"
          >
            <div className="w-4 h-4 border-2 border-amber-500/40" />
            <div className="absolute inset-2 border border-amber-500/10 rounded-full" />
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-serif text-amber-100 tracking-[0.4em] uppercase">
          {messages[stage]}
        </h3>
        <div className="w-64 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(stage + 1) * 33.3}%` }}
            className="h-full bg-amber-500 shadow-[0_0_10px_#b46e14]"
          />
        </div>
      </div>
    </div>
  );
}
