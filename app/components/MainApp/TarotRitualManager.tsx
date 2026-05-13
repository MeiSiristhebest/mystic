"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface TarotRitualManagerProps {
  cards: any[];
  onComplete: () => void;
}

export default function TarotRitualManager({ cards, onComplete }: TarotRitualManagerProps) {
  const [phase, setPhase] = useState<"shuffling" | "dealing" | "revealing">("shuffling");
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (phase === "shuffling") {
      const timer = setTimeout(() => setPhase("dealing"), 3000);
      return () => clearTimeout(timer);
    }
    
    if (phase === "dealing") {
      const timer = setTimeout(() => setPhase("revealing"), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleRevealCard = () => {
    if (revealedCount < cards.length) {
      setRevealedCount(prev => prev + 1);
      if (revealedCount + 1 === cards.length) {
        setTimeout(onComplete, 2000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <AnimatePresence mode="wait">
        {phase === "shuffling" && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="relative w-48 h-64">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    x: [0, (i - 2) * 40, 0],
                    rotate: [0, (i - 2) * 10, 0],
                    y: [0, Math.abs(i - 2) * 10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                  className="absolute inset-0 bg-[#1a1033] border border-amber-500/30 rounded-xl shadow-xl"
                  style={{ zIndex: 5 - i }}
                >
                  <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </motion.div>
              ))}
            </div>
            <p className="font-serif text-amber-200/60 tracking-[0.4em] animate-pulse">正在洗牌，混入时空波动...</p>
          </motion.div>
        )}

        {(phase === "dealing" || phase === "revealing") && (
          <motion.div
            key="deal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="flex flex-wrap justify-center gap-6">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 100, rotate: -20 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                  onClick={() => phase === "revealing" && i === revealedCount && handleRevealCard()}
                  className={`relative w-32 h-52 md:w-40 md:h-64 rounded-2xl border-2 transition-all duration-700 cursor-pointer overflow-hidden ${
                    i < revealedCount ? "border-amber-500/60 shadow-[0_0_30px_rgba(180,110,20,0.3)]" : 
                    i === revealedCount && phase === "revealing" ? "border-amber-500 animate-pulse scale-105" :
                    "border-white/10"
                  }`}
                >
                  {/* Card Back */}
                  <div className={`absolute inset-0 bg-[#080510] transition-transform duration-1000 preserve-3d ${i < revealedCount ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-4 border border-amber-500/20 rounded-xl flex items-center justify-center">
                       <Sparkles className="w-8 h-8 text-amber-500/20" />
                    </div>
                  </div>
                  
                  {/* Card Front (Placeholder until revealed fully in result) */}
                  <div className={`absolute inset-0 bg-[#1a1033] flex items-center justify-center p-4 text-center transition-transform duration-1000 backface-hidden rotate-y-180 ${i < revealedCount ? 'rotate-y-0' : ''}`}>
                    <span className="font-serif text-amber-200 text-sm tracking-widest">{card.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <p className="font-serif text-amber-200/60 tracking-[0.2em] text-center">
              {phase === "dealing" ? "正在布阵..." : revealedCount < cards.length ? `请点击翻开第 ${revealedCount + 1} 张牌` : "阵法已成，正在解读..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
