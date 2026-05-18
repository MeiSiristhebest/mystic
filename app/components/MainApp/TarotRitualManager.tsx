"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { playMysticChime, triggerHapticVibration, playCardSound } from "@/lib/audio";
import { TarotCardBack } from "./TarotCardBack";

interface TarotRitualManagerProps {
  cards: any[];
  spread?: {
    id: string;
    name: string;
    cardCount: number;
    positions: string[];
    description: string;
  };
  onComplete: () => void;
}

export default function TarotRitualManager({ cards, spread, onComplete }: TarotRitualManagerProps) {
  const [phase, setPhase] = useState<"shuffling" | "drawing" | "revealing">("shuffling");
  const [selectedDeckIndices, setSelectedDeckIndices] = useState<number[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 78 dummy cards for the full tarot deck
  const fullDeck = useRef(Array.from({ length: 78 }, (_, i) => i)).current;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (phase === "shuffling") {
      playMysticChime();
      triggerHapticVibration([15, 60, 15]);
      
      playCardSound();
      const audioInterval = setInterval(() => {
        playCardSound();
        setTimeout(playCardSound, 1540); // Sound on fan collapse
        triggerHapticVibration([10, 30, 10]);
      }, 2200);

      const timer = setTimeout(() => setPhase("drawing"), 4400); // 2 full fan cycles
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
            className="flex flex-col items-center gap-16 my-auto"
          >
            <div className="relative w-48 h-72" style={{ perspective: "1500px" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i - 5.5) * 12; // -66 to +66 degrees
                const xOffset = Math.sin(angle * Math.PI / 180) * 120;
                const yOffset = Math.cos(angle * Math.PI / 180) * -30 + 30;

                return (
                  <motion.div
                    key={i}
                    animate={{ 
                      x: [0, xOffset, xOffset, 0],
                      y: [0, yOffset, yOffset, 0],
                      rotateZ: [0, angle, angle, 0],
                      scale: [1, 1.1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2.2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      times: [0, 0.4, 0.7, 1] 
                    }}
                    className="absolute inset-0 origin-bottom shadow-2xl"
                  >
                    <TarotCardBack glowing={i === 11} />
                  </motion.div>
                );
              })}
            </div>
            <div className="space-y-3 text-center mt-12">
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
            className="flex flex-col items-center justify-between w-full h-full max-w-6xl mx-auto px-4 py-4 relative"
          >
            {/* Active Spread Slots Header (Top) */}
            <div className="flex flex-col items-center space-y-10 w-full mt-4">
              <div className="flex flex-col items-center space-y-2 text-center">
                <span className="text-[12px] font-mono tracking-[0.8em] text-[#C9A84C] uppercase font-bold drop-shadow-[0_0_10px_rgba(201,168,76,0.5)]">
                  {spread ? `已感应卡牌 / ${spread.name}` : "已绘流生命运卡槽 / SPREAD SLOTS"}
                </span>
                {spread?.description && (
                  <span className="text-xs text-[#E8DFB8]/50 font-serif tracking-wider">{spread.description}</span>
                )}
              </div>

              {/* Dynamic Spread Positions Grid */}
              <div className={`grid gap-x-8 gap-y-12 md:gap-x-12 ${
                cards.length === 1 ? "grid-cols-1" :
                cards.length === 2 ? "grid-cols-2" :
                cards.length === 3 ? "grid-cols-3" :
                cards.length === 4 ? "grid-cols-2" :
                cards.length === 5 ? "grid-cols-3 md:grid-cols-5" :
                cards.length === 7 ? "grid-cols-4 md:grid-cols-7" :
                "grid-cols-4 md:grid-cols-5"
              }`}>
                {Array.from({ length: cards.length }).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-4">
                    <div 
                      className={`w-24 h-36 md:w-[7rem] md:h-[10.5rem] rounded-xl md:rounded-[1.25rem] flex flex-col items-center justify-center transition-all duration-500 relative ${idx < selectedDeckIndices.length ? "scale-105 shadow-[0_0_35px_rgba(201,168,76,0.4)]" : "border border-dashed border-[#C9A84C]/30 bg-[#05020a]/60"}`}
                    >
                      {idx < selectedDeckIndices.length ? (
                        <TarotCardBack glowing />
                      ) : (
                        <span className="text-xs font-mono text-[#C9A84C]/40 tracking-wider">待抽取</span>
                      )}
                    </div>
                    {/* Position Label */}
                    <div className="px-4 py-1.5 rounded-full bg-black/80 border border-[#C9A84C]/40 shadow-[0_0_15px_rgba(201,168,76,0.2)] text-[#C9A84C] text-[11px] font-serif tracking-widest text-center min-w-[80px]">
                      {spread?.positions?.[idx] || `第 ${idx + 1} 张`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* True 78-Card Arc Fan Layout (Middle) */}
            <div className="w-full mt-12 mb-16 relative flex flex-col items-center">
              <div className="flex items-center justify-between pb-4 mb-10 w-full max-w-4xl border-b border-[#C9A84C]/20 text-xs text-[#C9A84C]/70 font-serif tracking-widest px-4 md:px-12">
                <span>✦ 阿卡夏全副塔罗密卷 (78张)</span>
                <span>请凭直觉点选卡牌</span>
              </div>
              
              {/* True Arc Fan without overflow constraints */}
              <div className="relative w-full h-[260px] md:h-[320px] flex justify-center items-end">
                  {fullDeck.map((deckIdx) => {
                    const isPicked = selectedDeckIndices.includes(deckIdx);
                    const totalCards = 78;
                    const centerIndex = (totalCards - 1) / 2;
                    const offsetFromCenter = deckIdx - centerIndex;
                    
                    // Responsive hand-fan math: tighter arc on mobile to ensure all cards fit in viewport
                    const rotation = offsetFromCenter * (isMobile ? 1.4 : 1.8);
                    const origin = isMobile ? 'center 180px' : 'center 250px';
                    
                    return (
                      <motion.div
                        key={deckIdx}
                        initial={{ opacity: 0, y: 150, rotate: rotation }}
                        animate={{ opacity: 1, y: 0, rotate: rotation }}
                        transition={{ delay: deckIdx * 0.008 }}
                        whileHover={!isPicked && selectedDeckIndices.length < cards.length ? { scale: 1.15, y: -40, zIndex: 100 } : {}}
                        whileTap={!isPicked && selectedDeckIndices.length < cards.length ? { scale: 0.95 } : {}}
                        onClick={() => handleDrawCard(deckIdx)}
                        className={`absolute bottom-0 w-[4.5rem] h-[6.75rem] md:w-[6rem] md:h-[9rem] shrink-0 transition-all duration-500 ${isPicked ? "opacity-0 pointer-events-none translate-y-[-100px] scale-50" : "cursor-pointer hover:z-50"}`}
                        style={{ 
                          transformOrigin: origin, // Anchor rotation far below the card to create a wide arc
                          zIndex: deckIdx 
                        }}
                      >
                        <TarotCardBack className="shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:border-[#C9A84C]" />
                      </motion.div>
                    );
                  })}
              </div>
            </div>

            {/* Prompt Banner (Absolute Bottom) */}
            <div className="absolute -bottom-8 left-0 right-0 flex flex-col items-center space-y-4">
              <p className="font-serif tracking-[0.5em] text-sm md:text-lg text-[#E8DFB8] uppercase drop-shadow-md">
                {selectedDeckIndices.length < cards.length ? `请感应并抽取 ${cards.length} 张牌 （已选 ${selectedDeckIndices.length} / ${cards.length}）` : "✦ 抽取完毕，正在凝结命运印记 ✦"}
              </p>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/80 to-transparent mx-auto" />
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
            <div className={`grid gap-x-10 gap-y-16 md:gap-x-14 ${
                cards.length === 1 ? "grid-cols-1" :
                cards.length === 2 ? "grid-cols-2" :
                cards.length === 3 ? "grid-cols-3" :
                cards.length === 4 ? "grid-cols-2" :
                cards.length === 5 ? "grid-cols-3 md:grid-cols-5" :
                cards.length === 7 ? "grid-cols-4 md:grid-cols-7" :
                "grid-cols-4 md:grid-cols-5"
              } w-full justify-items-center`} style={{ perspective: "2000px" }}>
              {cards.map((card, i) => (
                <div key={i} className="flex flex-col items-center space-y-5">
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
                      className="absolute inset-0"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <TarotCardBack glowing={i === revealedCount} />
                      {i === revealedCount && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl md:rounded-[1.25rem]">
                          <span className="text-[11px] font-mono tracking-[0.4em] text-[#C9A84C] uppercase bg-black/60 px-4 py-2 rounded-full border border-[#C9A84C]/50 backdrop-blur-sm animate-pulse">点击翻开</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  {/* Position Label under revealed card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: i <= revealedCount ? 1 : 0.4, y: 0 }}
                    className={`px-5 py-1.5 rounded-full bg-black/80 border text-xs font-serif tracking-widest text-center transition-colors duration-500 ${
                      i === revealedCount 
                        ? 'border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                        : i < revealedCount
                        ? 'border-[#C9A84C]/60 text-[#E8DFB8]'
                        : 'border-white/10 text-white/30'
                    }`}
                  >
                    {spread?.positions?.[i] || `第 ${i + 1} 张`}
                  </motion.div>
                </div>
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
