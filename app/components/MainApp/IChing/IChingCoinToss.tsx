"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { playCoinSound, triggerHapticVibration } from "@/lib/audio";

interface IChingCoinTossProps {
  isTossing: boolean;
  results?: ("yang" | "yin")[]; // 3 coin results
  onTossComplete?: () => void;
  onClick?: () => void;
}

export function IChingCoinToss({ 
  isTossing, 
  results = ["yang", "yang", "yin"], 
  onTossComplete,
  onClick 
}: IChingCoinTossProps) {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (isTossing) {
      const initTimer = setTimeout(() => {
        setLanded(false);
      }, 0);
      triggerHapticVibration([15, 30, 15]);
      
      // Coins land after 1.4s
      const timer = setTimeout(() => {
        setLanded(true);
        playCoinSound();
        triggerHapticVibration([25, 60, 25]);
        setTimeout(() => onTossComplete?.(), 600);
      }, 1400);

      return () => {
        clearTimeout(initTimer);
        clearTimeout(timer);
      };
    }
  }, [isTossing, onTossComplete]);

  return (
    <div 
      onClick={onClick}
      className="flex justify-center items-center gap-3 sm:gap-6 md:gap-8 py-6 w-full cursor-pointer select-none" 
      style={{ perspective: "1200px" }}
      title="点击铜钱亦可起卦"
    >
      {[0, 1, 2].map(i => {
        const result = results[i] || "yang";
        const finalRotationY = result === "yang" ? 0 : 180;
        
        return (
          <motion.div
            key={i}
            initial={{ y: 0, rotateX: 50, rotateY: 0, rotateZ: (i - 1) * 12 }}
            animate={isTossing ? {
              y: [0, -140 - (i * 15), 0],
              x: [0, (i - 1) * 30, (i - 1) * 8],
              rotateX: [50, 720 + 50, 50 + (landed ? 0 : 10)],
              rotateY: [0, 1080, finalRotationY],
              rotateZ: [(i - 1) * 12, 360, (i - 1) * 15],
              scale: [1, 1.2, 1]
            } : {
              y: 0,
              rotateX: 50,
              rotateY: finalRotationY,
              rotateZ: (i - 1) * 15,
              scale: 1
            }}
            transition={isTossing ? {
              duration: 1.4,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            } : { type: "spring", stiffness: 120 }}
            className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full gpu-accelerated shadow-[0_20px_40px_rgba(0,0,0,0.9)] shrink-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Coin Front (Yang - 乾隆通宝) */}
            <div 
              className="absolute inset-0 rounded-full border-2 sm:border-4 border-[#D4AF37] flex items-center justify-center shadow-inner"
              style={{ 
                backfaceVisibility: "hidden", 
                background: "radial-gradient(circle, #B8860B 0%, #800000 80%, #4A0000 100%)",
                transform: "rotateY(0deg)"
              }}
            >
              <div className="absolute inset-1.5 border border-[#D4AF37]/30 rounded-full" />
              {/* Square Hole */}
              <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#080510] border sm:border-2 border-[#D4AF37] shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center">
                 <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 border border-[#D4AF37]/20" />
              </div>
              
              {/* 4 Chinese Characters: 乾隆通宝 */}
              <span className="absolute top-1 sm:top-1.5 text-[9px] sm:text-xs font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">乾</span>
              <span className="absolute bottom-1 sm:bottom-1.5 text-[9px] sm:text-xs font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">隆</span>
              <span className="absolute right-1 sm:right-1.5 text-[9px] sm:text-xs font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">通</span>
              <span className="absolute left-1 sm:left-1.5 text-[9px] sm:text-xs font-serif font-bold text-[#D4AF37] tracking-widest drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">宝</span>
            </div>

            {/* Coin Back (Yin - 背面满文/阴阳太极) */}
            <div 
              className="absolute inset-0 rounded-full border-2 sm:border-4 border-[#D4AF37] flex items-center justify-center shadow-inner"
              style={{ 
                backfaceVisibility: "hidden", 
                background: "radial-gradient(circle, #8B6508 0%, #3A1F04 80%, #1A0D00 100%)",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="absolute inset-1.5 border border-[#D4AF37]/30 rounded-full" />
              {/* Square Hole */}
              <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#080510] border sm:border-2 border-[#D4AF37] shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center">
                 <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 border border-[#D4AF37]/20" />
              </div>

              {/* Yin Symbols */}
              <span className="absolute top-1 sm:top-1.5 text-[8px] sm:text-[10px] font-serif text-[#D4AF37]/80">☯︎</span>
              <span className="absolute bottom-1 sm:bottom-1.5 text-[8px] sm:text-[10px] font-serif text-[#D4AF37]/80">☯︎</span>
            </div>
            
            {/* Shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-black/80 rounded-full blur-sm -z-10" />
          </motion.div>
        );
      })}
    </div>
  );
}
