"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { playMysticChime, triggerHapticVibration, playCardSound } from "@/lib/audio";

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
      
      // Play card shuffling sound periodically
      playCardSound();
      const s1 = setTimeout(playCardSound, 800);
      const s2 = setTimeout(playCardSound, 1600);
      const s3 = setTimeout(playCardSound, 2400);

      const timer = setTimeout(() => setPhase("dealing"), 3500);
      return () => {
        clearTimeout(s1); clearTimeout(s2); clearTimeout(s3);
        clearTimeout(timer);
      };
    }
    
    if (phase === "dealing") {
      triggerHapticVibration([10, 30, 10]);
      
      // Play card sounds staggered as cards drop onto the table
      const timers = cards.map((_, idx) => setTimeout(playCardSound, idx * 150));
      const nextPhaseTimer = setTimeout(() => setPhase("revealing"), Math.max(2000, cards.length * 150 + 500));
      
      return () => {
        timers.forEach(t => clearTimeout(t));
        clearTimeout(nextPhaseTimer);
      };
    }
  }, [phase, cards.length]);

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
            <div className="relative w-52 h-72" style={{ perspective: "1500px" }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    x: [0, (i - 2) * 65, (i - 2) * -35, 0],
                    rotateZ: [0, (i - 2) * 18, (i - 2) * -12, 0],
                    rotateY: [0, (i - 2) * 25, (i - 2) * -15, 0],
                    y: [0, Math.abs(i - 2) * 30, Math.abs(i - 2) * -20, 0],
                    scale: [1, 1.08, 0.92, 1],
                    zIndex: [5 - i, 10 + i, 5 - i]
                  }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                  className="absolute inset-0 obsidian-glass border border-[#C9A84C]/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute inset-3 border border-[#C9A84C]/20 rounded-2xl bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-overlay flex items-center justify-center">
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
            className="flex flex-col items-center gap-16 w-full max-w-5xl mx-auto"
          >
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 w-full" style={{ perspective: "2000px" }}>
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 150, rotateZ: -20, rotateY: 180, opacity: 0 }}
                  animate={{ 
                    scale: i === revealedCount && phase === "revealing" ? 1.08 : 1, 
                    y: 0, 
                    rotateZ: 0, 
                    rotateY: i < revealedCount ? 0 : 180,
                    opacity: 1
                  }}
                  whileHover={
                     i >= revealedCount && phase === "revealing" && i === revealedCount 
                     ? { scale: 1.12, rotateZ: 2, rotateX: 10, rotateY: 175 } 
                     : i < revealedCount ? { scale: 1.03, y: -10 } : {}
                  }
                  transition={{ 
                    delay: phase === "dealing" ? i * 0.15 : 0, 
                    type: "spring", 
                    stiffness: 90, 
                    damping: 14,
                    mass: 1.1
                  }}
                  onClick={() => phase === "revealing" && i === revealedCount && handleRevealCard()}
                  className={`relative w-36 h-56 md:w-[11rem] md:h-[18rem] rounded-[2rem] cursor-pointer gpu-accelerated`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Card Front (Revealed Face) */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-b from-[#1a1033] to-[#080510] border border-[#C9A84C]/60 flex flex-col items-center justify-center p-6 text-center rounded-[2rem] ${i < revealedCount ? 'shadow-[0_0_50px_rgba(201,168,76,0.3)]' : ''}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
                  >
                    <div className="absolute inset-2 border border-[#C9A84C]/20 rounded-[1.5rem] pointer-events-none" />
                    <Sparkles className="w-8 h-8 text-[#C9A84C] mb-4" />
                    <span className="font-serif text-[#E8DFB8] text-base md:text-lg tracking-widest font-medium drop-shadow-md">{card.name}</span>
                  </div>

                  {/* Card Back (Hidden Face) */}
                  <div 
                    className={`absolute inset-0 obsidian-glass rounded-[2rem] shadow-2xl ${i === revealedCount && phase === "revealing" ? "border-2 border-[#C9A84C] shadow-[0_0_40px_rgba(201,168,76,0.6)] animate-pulse" : "border border-white/15 hover:border-[#C9A84C]/50"}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="absolute inset-4 border border-[#C9A84C]/30 rounded-2xl flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60">
                       <Sparkles className={`w-8 h-8 md:w-10 md:h-10 text-[#C9A84C]/40 mb-3 ${i === revealedCount && phase === "revealing" ? 'animate-spin-slow' : ''}`} />
                       <span className="text-[10px] font-mono tracking-[0.4em] text-[#C9A84C]/60 uppercase">{i === revealedCount && phase === "revealing" ? "点击翻开" : `CARD ${i + 1}`}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="space-y-4 text-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent mx-auto" />
              <motion.p 
                key={revealedCount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-serif tracking-[0.5em] uppercase transition-all duration-700 ${revealedCount === cards.length ? 'text-2xl md:text-3xl text-[#E8DFB8] scale-110 gold-gradient-text' : 'text-sm md:text-lg text-[#E8DFB8]/70'}`}
              >
                {phase === "dealing" ? "正在布排牌阵坐标..." : revealedCount < cards.length ? `请感应并翻开第 ${revealedCount + 1} 张牌` : "✦ 阵法显化，正在解读深层启示 ✦"}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
