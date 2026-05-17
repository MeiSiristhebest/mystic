"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { playMysticChime, triggerHapticVibration } from "@/lib/audio";

interface TarotRitualManagerProps {
  cards: any[];
  onComplete: () => void;
}

export default function TarotRitualManager({ cards, onComplete }: TarotRitualManagerProps) {
  const [phase, setPhase] = useState<"shuffling" | "dealing" | "revealing">("shuffling");
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (phase === "shuffling") {
      playMysticChime();
      triggerHapticVibration([15, 60, 15]);
      const timer = setTimeout(() => setPhase("dealing"), 3500);
      return () => clearTimeout(timer);
    }
    
    if (phase === "dealing") {
      triggerHapticVibration([10, 30, 10]);
      const timer = setTimeout(() => setPhase("revealing"), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleRevealCard = () => {
    if (revealedCount < cards.length) {
      playMysticChime();
      triggerHapticVibration([20, 80, 20]);
      setRevealedCount(prev => prev + 1);
      if (revealedCount + 1 === cards.length) {
        setTimeout(onComplete, 2000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-16">
      <AnimatePresence mode="wait">
        {phase === "shuffling" && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="relative w-52 h-72 perspective">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    x: [0, (i - 2) * 55, (i - 2) * -20, 0],
                    rotate: [0, (i - 2) * 15, (i - 2) * -10, 0],
                    y: [0, Math.abs(i - 2) * 20, Math.abs(i - 2) * -10, 0],
                    scale: [1, 1.05, 0.95, 1]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  className="absolute inset-0 obsidian-glass border border-[#C9A84C]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                  style={{ zIndex: 5 - i }}
                >
                  <div className="absolute inset-3 border border-[#C9A84C]/20 rounded-xl bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-overlay flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#C9A84C]/40 animate-spin" style={{ animationDuration: '10s' }} />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent mx-auto" />
              <p className="font-serif text-[#E8DFB8]/70 tracking-[0.6em] animate-pulse uppercase text-sm">正在洗牌，连通阿卡夏之眼...</p>
            </div>
          </motion.div>
        )}

        {(phase === "dealing" || phase === "revealing") && (
          <motion.div
            key="deal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-16"
          >
            <div className="flex flex-wrap justify-center gap-8">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 120, rotate: -30 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  transition={{ delay: i * 0.15, type: "spring", damping: 15 }}
                  onClick={() => phase === "revealing" && i === revealedCount && handleRevealCard()}
                  className={`relative w-36 h-56 md:w-44 md:h-72 rounded-[2rem] transition-all duration-700 cursor-pointer overflow-hidden ${
                    i < revealedCount ? "border border-[#C9A84C] shadow-[0_0_50px_rgba(201,168,76,0.3)] scale-105" : 
                    i === revealedCount && phase === "revealing" ? "border-2 border-[#C9A84C] animate-pulse scale-110 shadow-[0_0_40px_rgba(201,168,76,0.4)]" :
                    "border border-white/15 hover:border-[#C9A84C]/50 shadow-2xl"
                  }`}
                >
                  {/* Card Back */}
                  <div className={`absolute inset-0 obsidian-glass transition-all duration-1000 preserve-3d ${i < revealedCount ? 'rotate-y-180 opacity-0 pointer-events-none' : ''}`}>
                    <div className="absolute inset-4 border border-[#C9A84C]/30 rounded-2xl flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60">
                       <Sparkles className="w-10 h-10 text-[#C9A84C]/40 mb-2" />
                       <span className="text-[9px] font-mono tracking-[0.4em] text-[#C9A84C]/40 uppercase">{i === revealedCount && phase === "revealing" ? "点击感应" : `CARD ${i + 1}`}</span>
                    </div>
                  </div>
                  
                  {/* Card Front */}
                  <div className={`absolute inset-0 bg-gradient-to-b from-[#1a1033] to-[#080510] border border-[#C9A84C]/60 flex flex-col items-center justify-center p-6 text-center transition-all duration-1000 backface-hidden ${i < revealedCount ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0'}`}>
                    <div className="absolute inset-2 border border-[#C9A84C]/20 rounded-[1.5rem] pointer-events-none" />
                    <Sparkles className="w-8 h-8 text-[#C9A84C] mb-4" />
                    <span className="font-serif text-[#E8DFB8] text-base md:text-lg tracking-widest font-medium drop-shadow-md">{card.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="space-y-4 text-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent mx-auto" />
              <p className={`font-serif tracking-[0.5em] uppercase transition-all duration-700 ${revealedCount === cards.length ? 'text-3xl text-[#E8DFB8] scale-110 gold-gradient-text' : 'text-sm md:text-lg text-[#E8DFB8]/70'}`}>
                {phase === "dealing" ? "正在布排牌阵坐标..." : revealedCount < cards.length ? `请点击翻开第 ${revealedCount + 1} 张牌` : "✦ 阵法显化，正在解读深层启示 ✦"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
