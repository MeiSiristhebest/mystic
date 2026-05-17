"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Sparkles, Compass } from "lucide-react";
import { IChingCoinToss } from "./IChing/IChingCoinToss";
import { playMysticChime, triggerHapticVibration } from "@/lib/audio";

interface IChingRitualManagerProps {
  lines: number[];
  isTossing: boolean;
  currentCoins: ("yang" | "yin")[];
  onToss: () => void;
  onComplete: () => void;
}

export default function IChingRitualManager({
  lines,
  isTossing,
  currentCoins,
  onToss,
  onComplete
}: IChingRitualManagerProps) {
  const [stageText, setStageText] = useState("屏息凝神，点击下方按钮抛掷铜钱");

  const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
  const lineValues: Record<number, { name: string; type: "yang" | "yin"; changing: boolean }> = {
    6: { name: "老阴 (动)", type: "yin", changing: true },
    7: { name: "少阳", type: "yang", changing: false },
    8: { name: "少阴", type: "yin", changing: false },
    9: { name: "老阳 (动)", type: "yang", changing: true }
  };

  useEffect(() => {
    if (isTossing) {
      setStageText(`正在摇动青铜钱，感应天地阴阳气场...`);
    } else if (lines.length > 0 && lines.length < 6) {
      const lastLine = lines[lines.length - 1];
      const info = lineValues[lastLine];
      setStageText(`第 ${lines.length} 爻显化：${info?.name || ""} ✦ 请继续第 ${lines.length + 1} 次起卦`);
    } else if (lines.length === 6) {
      setStageText("✦ 六爻既成，卦象圆满 ✦");
      playMysticChime();
      triggerHapticVibration([30, 80, 30]);
      const timer = setTimeout(onComplete, 2200);
      return () => clearTimeout(timer);
    }
  }, [isTossing, lines.length, onComplete]);

  // Render hexagram slots from top (5) to bottom (0)
  const slotIndices = [5, 4, 3, 2, 1, 0];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[550px] gap-8 py-4">
      {/* 3D Coin Toss Area */}
      <div className="w-full h-44 flex items-center justify-center">
        <IChingCoinToss 
          isTossing={isTossing} 
          results={currentCoins} 
        />
      </div>

      {/* Status Banner */}
      <div className="space-y-2 text-center my-2">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent mx-auto" />
        <p className="font-serif text-[#E8DFB8]/90 tracking-wider md:tracking-[0.3em] text-xs md:text-sm animate-pulse">
          {stageText}
        </p>
      </div>

      {/* Hexagram Stacking Canvas (Bottom-Up) */}
      <div className="w-full max-w-[280px] md:max-w-[320px] bg-black/40 border border-[#C9A84C]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        {/* Subtle rotating Bagua in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#C9A84C]/10 rounded-full flex items-center justify-center opacity-20 pointer-events-none animate-spin-slow">
           <Compass className="w-36 h-36 text-[#C9A84C]/20" />
        </div>

        {slotIndices.map(idx => {
          const val = lines[idx];
          const isCast = val !== undefined;
          const info = isCast ? lineValues[val] : null;

          return (
            <div key={idx} className="flex items-center gap-4 h-8 relative z-10">
              <span className={`font-serif text-xs w-12 text-right tracking-widest ${isCast ? 'text-[#C9A84C]' : 'text-[#C9A84C]/30'}`}>
                {lineNames[idx]}
              </span>

              <div className="flex-1 flex items-center justify-center h-4 relative">
                {!isCast ? (
                  /* Empty Slot Placeholder */
                  <div className="w-full h-1 bg-[#C9A84C]/10 rounded-full border border-dashed border-[#C9A84C]/20" />
                ) : (
                  /* Formed Line */
                  <AnimatePresence>
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100, damping: 12 }}
                      className="w-full h-full flex items-center justify-center relative"
                    >
                      {info?.type === "yang" ? (
                        /* Yang Line (Solid) */
                        <div className="w-full h-full bg-gradient-to-r from-[#B46E14] via-[#F59E0B] to-[#B46E14] rounded-sm shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                      ) : (
                        /* Yin Line (Broken) */
                        <>
                          <div className="w-[44%] h-full bg-gradient-to-r from-[#B46E14] to-[#F59E0B] rounded-sm shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                          <div className="w-[12%]" />
                          <div className="w-[44%] h-full bg-gradient-to-l from-[#B46E14] to-[#F59E0B] rounded-sm shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                        </>
                      )}

                      {/* Changing Line Pulsing Glow */}
                      {info?.changing && (
                        <div className="absolute inset-0 bg-red-500/25 rounded-sm animate-pulse border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              <span className="font-serif text-[10px] w-12 text-left text-[#C9A84C]/60 tracking-wider">
                {info?.changing ? "动爻" : (info ? (info.type === "yang" ? "阳" : "阴") : "")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {lines.length < 6 && (
        <button
          onClick={onToss}
          disabled={isTossing}
          className="group relative px-12 py-4 rounded-full font-serif text-lg tracking-[0.2em] bg-gradient-to-r from-[#805010] to-[#B46E14] hover:from-[#906015] hover:to-[#C9A84C] text-[#E8DFB8] shadow-[0_0_30px_rgba(180,110,20,0.4)] hover:shadow-[0_0_40px_rgba(201,168,76,0.6)] border border-[#C9A84C]/40 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
        >
          {isTossing ? "感应起卦中..." : `第 ${lines.length + 1} 次起卦`}
        </button>
      )}
    </div>
  );
}
