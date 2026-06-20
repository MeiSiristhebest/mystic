"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { playCoinSound, triggerHapticVibration } from "@/lib/audio";

interface IChingCoinTossProps {
  isTossing: boolean;
  results?: ("yang" | "yin")[]; // 3 coin results
  onTossComplete?: () => void;
}

export function IChingCoinToss({ isTossing, results = ["yang", "yang", "yin"], onTossComplete }: IChingCoinTossProps) {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (isTossing) {
      const initTimer = setTimeout(() => {
        setLanded(false);
      }, 0);
      triggerHapticVibration([15, 30, 15]);
      
      // Coins land after 1.6s
      const timer = setTimeout(() => {
        setLanded(true);
        playCoinSound();
        triggerHapticVibration([25, 60, 25]);
        setTimeout(() => onTossComplete?.(), 800);
      }, 1600);

      return () => {
        clearTimeout(initTimer);
        clearTimeout(timer);
      };
    }
  }, [isTossing, onTossComplete]);

  return (
    <div className="flex justify-center items-center gap-6 md:gap-12 py-12" style={{ perspective: "1500px" }}>
      {[0, 1, 2].map(i => {
        const result = results[i] || "yang";
        const finalRotationY = result === "yang" ? 0 : 180;
        
        return (
          <motion.div
            key={i}
            initial={{ y: 0, rotateX: 60, rotateY: 0, rotateZ: (i - 1) * 15 }}
            animate={isTossing ? {
              y: [0, -180 - (i * 20), 0],
              x: [0, (i - 1) * 40, (i - 1) * 10],
              rotateX: [60, 1080 + 60, 60 + (landed ? 0 : 15)],
              rotateY: [0, 1440, finalRotationY],
              rotateZ: [(i - 1) * 15, 720, (i - 1) * 25],
              scale: [1, 1.3, 1]
            } : {
              y: 0,
              rotateX: 60,
              rotateY: finalRotationY,
              rotateZ: (i - 1) * 25,
              scale: 1
            }}
            transition={isTossing ? {
              duration: 1.6,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            } : { type: "spring", stiffness: 120 }}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full cursor-pointer gpu-accelerated shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Coin Front (Yang - 4 Characters) */}
            <div 
              className="absolute inset-0 rounded-full border-4 border-[#D4AF37] flex items-center justify-center shadow-inner"
              style={{ 
                backfaceVisibility: "hidden", 
                background: "radial-gradient(circle, #B8860B 0%, #800000 80%, #4A0000 100%)",
                transform: "rotateY(0deg)"
              }}
            >
              <div className="absolute inset-2 border border-[#D4AF37]/30 rounded-full" />
              {/* Square Hole in Middle ("天圆地方") */}
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#080510] border-2 border-[#D4AF37] shadow-[inset_0_0_10px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center">
                 <div className="w-6 h-6 border border-[#D4AF37]/20" />
              </div>
              
              {/* 4 Chinese Characters: 乾隆通宝 / 天地玄黄 */}
              <span className="absolute top-2.5 text-xs md:text-sm font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">乾</span>
              <span className="absolute bottom-2.5 text-xs md:text-sm font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">隆</span>
              <span className="absolute right-2.5 text-xs md:text-sm font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">通</span>
              <span className="absolute left-2.5 text-xs md:text-sm font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">宝</span>
            </div>

            {/* Coin Back (Yin - Cloud/Dragon Pattern) */}
            <div 
              className="absolute inset-0 rounded-full border-4 border-[#D4AF37] flex items-center justify-center shadow-inner"
              style={{ 
                backfaceVisibility: "hidden", 
                background: "radial-gradient(circle, #8B6508 0%, #3A1F04 80%, #1A0D00 100%)",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="absolute inset-2 border border-[#D4AF37]/30 rounded-full" />
              {/* Square Hole in Middle */}
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#080510] border-2 border-[#D4AF37] shadow-[inset_0_0_10px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center">
                 <div className="w-6 h-6 border border-[#D4AF37]/20" />
              </div>

              {/* Yin Symbols / Manchu patterns */}
              <div className="absolute inset-3 rounded-full opacity-30 border border-dashed border-[#D4AF37] animate-spin-slow" />
              <span className="absolute top-3 text-[10px] md:text-xs font-serif text-[#D4AF37]/80 tracking-widest">☯︎</span>
              <span className="absolute bottom-3 text-[10px] md:text-xs font-serif text-[#D4AF37]/80 tracking-widest">☯︎</span>
            </div>
            
            {/* Rim depth shadow */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/80 rounded-full blur-md -z-10" />
          </motion.div>
        );
      })}
    </div>
  );
}
