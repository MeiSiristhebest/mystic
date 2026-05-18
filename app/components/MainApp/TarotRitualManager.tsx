"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Layers } from "lucide-react";
import { playMysticChime, triggerHapticVibration, playCardSound } from "@/lib/audio";

interface TarotRitualManagerProps {
  cards: any[];
  onComplete: () => void;
}

export default function TarotRitualManager({ cards, onComplete }: TarotRitualManagerProps) {
  const [phase, setPhase] = useState<"shuffling" | "drawing" | "revealing">("shuffling");
  const [selectedDeckIndices, setSelectedDeckIndices] = useState<number[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  // 78 dummy cards for the full tarot deck
  const fullDeck = useRef(Array.from({ length: 78 }, (_, i) => i)).current;

  useEffect(() => {
    if (phase === "shuffling") {
      playMysticChime();
      triggerHapticVibration([15, 60, 15]);
      
      playCardSound();
      const audioInterval = setInterval(() => {
        playCardSound();
        triggerHapticVibration([10, 30, 10]);
      }, 550);

      const timer = setTimeout(() => setPhase("drawing"), 3500);
      return () => {
        clearInterval(audioInterval);
        clearTimeout(timer);
      };
    }
  }, [phase]);

  const handleDrawCard = (deckIndex: number) => {
    if (phase !== "drawing" || selectedDeckIndices.includes(deckIndex) || selectedDeckIndices.length >= cards.length) return;

    playCardSound();
    triggerHapticVibration([10, 40, 10]);
    const newSelected = [...selectedDeckIndices, deckIndex];
    setSelectedDeckIndices(newSelected);

    if (newSelected.length === cards.length) {
      playMysticChime();
      triggerHapticVibration([20, 80, 20]);
      setTimeout(() => setPhase("revealing"), 1200);
    }
  };

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 space-y-12 select-none">
      <AnimatePresence mode="wait">
        {phase === "shuffling" && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-12 my-auto"
          >
            <div className="relative w-52 h-72" style={{ perspective: "1500px" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    animate={{ 
                      x: [0, isLeft ? -110 - (i * 2) : 110 + (i * 2), isLeft ? -30 : 30, 0],
                      y: [i * -2, (isLeft ? -30 : -20) + (i * 3), -10, i * -2],
                      rotateZ: [(i - 5.5) * 1.5, isLeft ? -20 - (i * 1.2) : 20 + (i * 1.2), isLeft ? 10 : -10, (i % 3 - 1) * 2],
                      rotateY: [0, isLeft ? -25 : 25, isLeft ? -10 : 10, 0],
                      rotateX: [0, isLeft ? 12 : -12, isLeft ? 5 : -5, 0],
                      scale: [1, 1.05, 1.02, 1],
                      zIndex: [i, isLeft ? i : i + 6, isLeft ? 12 - i : i, i]
                    }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: (i % 2) * 0.05 }}
                    className="absolute inset-0 obsidian-glass border border-[#C9A84C]/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="absolute inset-3 border border-[#C9A84C]/20 rounded-2xl bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-overlay flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[#C9A84C]/40 animate-spin" style={{ animationDuration: '10s' }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent mx-auto" />
              <p className="font-serif text-[#E8DFB8]/70 tracking-[0.6em] animate-pulse uppercase text-sm">正在洗牌，连通阿卡夏之眼...</p>
            </div>
          </motion.div>
        )}

        {phase === "drawing" && (
          <motion.div
            key="draw"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12 px-4"
          >
            {/* Active Spread Slots Header */}
            <div className="flex flex-col items-center space-y-6 w-full">
              <span className="text-[11px] font-mono tracking-[0.6em] text-[#C9A84C] uppercase font-bold">已缔造命运卡槽 / SPREAD SLOTS</span>
              <div className="flex flex-wrap justify-center gap-6">
                {Array.from({ length: cards.length }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-20 h-32 md:w-24 md:h-36 rounded-2xl flex flex-col items-center justify-center border transition-all duration-500 ${idx < selectedDeckIndices.length ? "border-[#C9A84C] bg-gradient-to-br from-[#1c1233] to-[#0a0614] shadow-[0_0_30px_rgba(201,168,76,0.3)] scale-105" : "border-dashed border-white/20 bg-black/40"}`}
                  >
                    {idx < selectedDeckIndices.length ? (
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#C9A84C] animate-pulse" />
                        <span className="text-xs font-serif text-[#E8DFB8]">卡牌 {idx + 1}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-white/30 tracking-wider">待抽取</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 78-Card Full Deck Grid */}
            <div className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/5 text-xs text-[#E8DFB8]/60 font-serif tracking-widest">
                <span>✦ 阿卡夏全副塔罗密卷 (78张)</span>
                <span>请凭直觉点选卡牌</span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-13 gap-3 md:gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {fullDeck.map(deckIdx => {
                  const isPicked = selectedDeckIndices.includes(deckIdx);
                  return (
                    <motion.div
                      key={deckIdx}
                      whileHover={!isPicked && selectedDeckIndices.length < cards.length ? { scale: 1.15, y: -6 } : {}}
                      whileTap={!isPicked && selectedDeckIndices.length < cards.length ? { scale: 0.95 } : {}}
                      onClick={() => handleDrawCard(deckIdx)}
                      className={`relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 ${isPicked ? "opacity-15 scale-90 pointer-events-none border border-white/10" : "cursor-pointer obsidian-glass border border-[#C9A84C]/30 shadow-lg hover:border-[#C9A84C] hover:shadow-[0_10px_20px_rgba(201,168,76,0.4)] group"}`}
                    >
                      <div className="absolute inset-1 border border-[#C9A84C]/15 rounded-lg pointer-events-none flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60">
                        <Layers className="w-3.5 h-3.5 text-[#C9A84C]/40 group-hover:text-[#C9A84C] transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Banner */}
            <div className="space-y-3 text-center">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent mx-auto" />
              <p className="font-serif tracking-[0.5em] text-base md:text-xl text-[#E8DFB8] uppercase">
                {selectedDeckIndices.length < cards.length ? `请感应并抽取 ${cards.length} 张牌 （已选 ${selectedDeckIndices.length} / ${cards.length}）` : "✦ 抽取完毕，正在凝结命运印记 ✦"}
              </p>
            </div>
          </motion.div>
        )}

        {phase === "revealing" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-16 w-full max-w-5xl mx-auto px-4"
          >
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 w-full" style={{ perspective: "2000px" }}>
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, y: 50, rotateY: 180, opacity: 0 }}
                  animate={{ 
                    scale: i === revealedCount ? 1.08 : 1, 
                    y: 0, 
                    rotateY: i < revealedCount ? 0 : 180,
                    opacity: 1
                  }}
                  whileHover={
                     i === revealedCount 
                     ? { scale: 1.12, rotateZ: 2, rotateX: 10, rotateY: 175 } 
                     : i < revealedCount ? { scale: 1.03, y: -10 } : {}
                  }
                  transition={{ 
                    type: "spring", 
                    stiffness: 90, 
                    damping: 14,
                    mass: 1.1
                  }}
                  onClick={() => i === revealedCount && handleRevealCard()}
                  className="relative w-36 h-56 md:w-[11rem] md:h-[18rem] rounded-[2rem] cursor-pointer"
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
                    className={`absolute inset-0 obsidian-glass rounded-[2rem] shadow-2xl ${i === revealedCount ? "border-2 border-[#C9A84C] shadow-[0_0_40px_rgba(201,168,76,0.6)] animate-pulse" : "border border-white/15 hover:border-[#C9A84C]/50"}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="absolute inset-4 border border-[#C9A84C]/30 rounded-2xl flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60">
                       <Sparkles className={`w-8 h-8 md:w-10 md:h-10 text-[#C9A84C]/40 mb-3 ${i === revealedCount ? 'animate-spin-slow' : ''}`} />
                       <span className="text-[10px] font-mono tracking-[0.4em] text-[#C9A84C]/60 uppercase">{i === revealedCount ? "点击翻开" : `CARD ${i + 1}`}</span>
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
                {revealedCount < cards.length ? `请感应并翻开第 ${revealedCount + 1} 张牌` : "✦ 阵法显化，正在解读深层启示 ✦"}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
