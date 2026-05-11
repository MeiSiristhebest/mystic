"use client";

import { motion } from "motion/react";
import { Sparkles, Zap, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface CollectiveMirrorRitualProps {
  onComplete: () => void;
}

export default function CollectiveMirrorRitual({ onComplete }: CollectiveMirrorRitualProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
      <div className="relative w-64 h-64">
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-cyan-500/20 rounded-full border-dashed"
        />
        
        {/* Inner Pulses */}
        <div className="absolute inset-4 rounded-full bg-cyan-500/5 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-32 h-32 rounded-full bg-cyan-400/20 blur-xl"
          />
          <Users className="w-16 h-16 text-cyan-400 relative z-10" />
        </div>

        {/* Floating Sparks */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: 360,
              scale: [1, 1.5, 1],
              opacity: [0.2, 1, 0.2]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: i * 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 100 + i * 20, height: 100 + i * 20 }}
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-serif text-cyan-100 tracking-[0.3em] uppercase">正在感应集体镜像</h3>
        <p className="text-cyan-400/40 text-sm font-serif tracking-widest">正在连接阿卡夏全球潜意识网格... {progress}%</p>
        
        <div className="w-64 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-cyan-400 shadow-[0_0_10px_cyan]"
          />
        </div>
      </div>
    </div>
  );
}
