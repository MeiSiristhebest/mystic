"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { playMysticChime, triggerHapticVibration, playCardSound } from "@/lib/audio";
import { TarotCardBack } from "./TarotCardBack";
import { SpreadGeometry } from "./SpreadGeometry";

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
  const fullDeck = Array.from({ length: 78 }, (_, i) => i);

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

  const handleRevealAll = () => {
    if (revealedCount < cards.length) {
      playMysticChime();
      triggerHapticVibration([30, 100, 30]);
      setRevealedCount(cards.length);
      setTimeout(onComplete, 2200);
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
            <div className="relative w-56 h-84 md:w-64 md:h-96" style={{ perspective: "1500px" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i - 5.5) * 12; // -66 to +66 degrees
                const xOffset = Math.sin(angle * Math.PI / 180) * 130;
                const yOffset = Math.cos(angle * Math.PI / 180) * -35 + 35;

                return (
                  <motion.div
                    key={i}
                    animate={{ 
                      x: [0, xOffset, xOffset, 0],
                      y: [0, yOffset, yOffset, 0],
                      rotateZ: [0, angle, angle, 0],
                      scale: [1, 1.12, 1.12, 1],
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
            className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 space-y-16 relative"
          >
            {/* ── 视口 1 (上半页)：命运牌槽展示区 (提供极佳的占卜专注度) ── */}
            <div className="flex flex-col items-center justify-center min-h-[75vh] w-full pt-4 pb-12">
              <div className="flex flex-col items-center space-y-3 text-center mb-16">
                <span className="text-xs font-mono tracking-[0.8em] text-[#C9A84C] uppercase font-bold drop-shadow-[0_0_10px_rgba(201,168,76,0.5)]">
                  {spread ? `已感应流生命运法阵 / ${spread.name}` : "已绘流生命运卡槽 / SPREAD SLOTS"}
                </span>
                {spread?.description && (
                  <span className="text-sm text-[#E8DFB8]/60 font-serif tracking-wider max-w-2xl px-4">{spread.description}</span>
                )}
              </div>

              {/* 真实神秘学牌型占位框 */}
              <div className="w-full relative mt-4">
                <SpreadGeometry 
                  spreadId={spread?.id}
                  count={cards.length}
                  renderCard={(idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-4">
                      <div 
                        className={`w-32 h-48 md:w-[10.5rem] md:h-[15.5rem] rounded-xl md:rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-500 relative ${idx < selectedDeckIndices.length ? "scale-105 shadow-[0_0_35px_rgba(201,168,76,0.4)]" : "border border-dashed border-[#C9A84C]/30 bg-[#05020a]/60"}`}
                      >
                        {idx < selectedDeckIndices.length ? (
                          <TarotCardBack glowing />
                        ) : (
                          <span className="text-xs font-mono text-[#C9A84C]/40 tracking-wider">待抽取</span>
                        )}
                      </div>
                      {/* 牌位名称标签 */}
                      <div className="px-5 py-2 rounded-full bg-black/85 border border-[#C9A84C]/40 shadow-[0_0_15px_rgba(201,168,76,0.2)] text-[#C9A84C] text-xs font-serif tracking-widest text-center min-w-[90px] whitespace-nowrap">
                        {spread?.positions?.[idx] || `第 ${idx + 1} 张`}
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* ── 仪式过渡分割线 ── */}
            <div className="w-full flex items-center justify-center my-12 relative opacity-70">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C9A84C]/60" />
              <span className="mx-6 text-xs font-serif tracking-[0.6em] text-[#C9A84C] uppercase flex items-center gap-2 animate-pulse">
                ✦ 向下滑动，触碰阿卡夏密卷抽取命运印记 ✦
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C9A84C]/60" />
            </div>

            {/* ── 视口 2 (下半页)：一整页沉浸式 78 张宏大扇形牌面场 ── */}
            <div className="w-full min-h-[90vh] flex flex-col items-center justify-end relative pt-12 pb-24">
              <div className="flex items-center justify-between pb-4 mb-12 w-full max-w-5xl border-b border-[#C9A84C]/20 text-xs md:text-sm text-[#C9A84C]/70 font-serif tracking-widest px-6 md:px-12">
                <span>✦ 阿卡夏全副塔罗密卷 (78张)</span>
                <span>请凭直觉触摸牌背感应抽取</span>
              </div>

              {/*
                Arc fan pattern with HUGE premium cards (96x144 desktop / 64x96 mobile).
                Radius: massive 480px desktop sweep.
                Container height: 640px desktop anchor.
              */}
              <div
                className="relative w-full"
                style={{
                  height: isMobile ? '380px' : '640px',
                  overflow: 'visible',
                }}
              >
                {fullDeck.map((deckIdx) => {
                  const isPicked = selectedDeckIndices.includes(deckIdx);
                  const canDraw = !isPicked && selectedDeckIndices.length < cards.length;
                  const totalCards = 78;
                  const centerIndex = (totalCards - 1) / 2;
                  const offset = deckIdx - centerIndex;

                  // Massive arc geometry
                  const totalDeg = isMobile ? 120 : 150;
                  const rotation = offset * (totalDeg / (totalCards - 1));
                  const radius = isMobile ? 300 : 480;  // massive upward sweep distance
                  const cardW = isMobile ? 64 : 96;
                  const cardH = isMobile ? 96 : 144;

                  return (
                    // OUTER: pure CSS arc positioning — NO Framer Motion
                    <div
                      key={deckIdx}
                      className="absolute"
                      style={{
                        width: cardW,
                        height: cardH,
                        bottom: 0,
                        left: '50%',
                        marginLeft: -cardW / 2,
                        transform: `rotate(${rotation}deg) translateY(-${radius}px)`,
                        transformOrigin: 'center bottom',
                        zIndex: isPicked ? -1 : (39 - Math.abs(Math.round(offset))),
                        pointerEvents: isPicked ? 'none' : 'auto',
                      }}
                    >
                      {/* INNER: Framer Motion handles entrance + hover */}
                      <motion.div
                        className={`w-full h-full ${canDraw ? 'cursor-pointer' : ''}`}
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: isPicked ? 0 : 1, scale: isPicked ? 0 : 1 }}
                        transition={{ delay: deckIdx * 0.004, duration: 0.3, ease: 'easeOut' }}
                        whileHover={canDraw ? { scale: 1.35, y: -30, transition: { duration: 0.15 } } : {}}
                        onClick={() => canDraw && handleDrawCard(deckIdx)}
                        style={{ filter: canDraw ? 'drop-shadow(0 0 10px rgba(201,168,76,0.4))' : 'none' }}
                      >
                        <TarotCardBack />
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* 抽取进度指示横幅 (固定在底部区域) */}
              <div className="mt-12 mb-4 flex flex-col items-center space-y-4 w-full">
                <p className="font-serif tracking-[0.5em] text-sm md:text-xl text-[#E8DFB8] uppercase drop-shadow-[0_0_15px_rgba(201,168,76,0.5)] text-center">
                  {selectedDeckIndices.length < cards.length ? `请感应并抽取 ${cards.length} 张牌 （已选 ${selectedDeckIndices.length} / ${cards.length}）` : "✦ 命运契印凝结完毕 ✦"}
                </p>
                <div className="w-36 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto shadow-[0_0_10px_#C9A84C]" />
              </div>
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
            <div className="w-full relative" style={{ perspective: "2000px" }}>
              <SpreadGeometry
                spreadId={spread?.id}
                count={cards.length}
                renderCard={(i) => (
                  <div key={i} className="flex flex-col items-center space-y-5">
                    <motion.div
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
                      className="relative w-40 h-60 md:w-[12.5rem] md:h-[19.5rem] rounded-[2rem] cursor-pointer"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Card Front (Revealed Face) — Flawlessly isolated so no flash possible */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-b from-[#1a1033] to-[#080510] border border-[#C9A84C]/60 flex flex-col items-center justify-center p-6 text-center rounded-[2rem] ${i < revealedCount ? 'shadow-[0_0_50px_rgba(201,168,76,0.3)]' : ''}`}
                        style={{ 
                          backfaceVisibility: 'hidden', 
                          transform: 'rotateY(0deg)',
                          opacity: i < revealedCount ? 1 : 0,
                          visibility: i < revealedCount ? 'visible' : 'hidden',
                        }}
                      >
                        {i < revealedCount && (
                          <>
                            <div className="absolute inset-2 border border-[#C9A84C]/20 rounded-[1.5rem] pointer-events-none" />
                            <Sparkles className="w-8 h-8 text-[#C9A84C] mb-4" />
                            <span className="font-serif text-[#E8DFB8] text-base md:text-xl tracking-widest font-medium drop-shadow-md">{cards[i]?.name}</span>
                          </>
                        )}
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
                      className={`px-5 py-1.5 rounded-full bg-black/80 border text-xs font-serif tracking-widest text-center transition-colors duration-500 whitespace-nowrap ${
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
                )}
              />
            </div>
            
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent mx-auto" />
              <motion.p 
                key={revealedCount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-serif tracking-[0.5em] uppercase transition-all duration-700 ${revealedCount === cards.length ? 'text-2xl md:text-3xl text-[#E8DFB8] scale-110 gold-gradient-text' : 'text-sm md:text-lg text-[#E8DFB8]/70'}`}
              >
                {revealedCount < cards.length ? `请感应并翻开第 ${revealedCount + 1} 张牌` : "✦ 阵法显化，正在解读深层启示 ✦"}
              </motion.p>

              {/* 一键翻开按钮 */}
              {revealedCount < cards.length && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(201,168,76,0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRevealAll}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-[#2c1a0e] to-[#1a0f08] border border-[#C9A84C]/60 text-[#E8DFB8] text-sm font-serif tracking-widest uppercase shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all cursor-pointer"
                >
                  ✦ 一键揭晓密卷 / REVEAL ALL ✦
                </motion.button>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
