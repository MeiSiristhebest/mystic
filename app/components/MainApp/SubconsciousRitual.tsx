"use client";

import { motion } from "motion/react";
import { Moon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function SubconsciousRitual({ onComplete }: { onComplete: () => void }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPulse(p => (p + 1) % 100), 50);
    const finish = setTimeout(onComplete, 6000);
    return () => { clearInterval(timer); clearTimeout(finish); };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-16">
      <div className="relative w-40 h-40">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Moon className="w-16 h-16 text-blue-300/60" />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4"
            >
              <Sparkles className="w-6 h-6 text-amber-200" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <h3 className="text-2xl font-serif text-blue-100 tracking-[0.5em] uppercase">正在潜入潜意识深海</h3>
        <div className="flex gap-1 justify-center h-1 items-center">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [4, 12, 4], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              className="w-1 bg-blue-400 rounded-full"
            />
          ))}
        </div>
        <p className="text-[10px] font-serif text-blue-400/40 tracking-widest uppercase">
          Deep Dive Synchronizing: {Math.floor(pulse)}%
        </p>
      </div>
    </div>
  );
}
