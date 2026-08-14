"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Sparkles, Compass, Zap } from "lucide-react";
import { IChingCoinToss } from "./IChing/IChingCoinToss";
import { playMysticChime, triggerHapticVibration } from "@/lib/audio";

interface IChingRitualManagerProps {
  lines: number[];
  isTossing: boolean;
  currentCoins: ("yang" | "yin")[];
  onToss: () => void;
  onQuickCast?: () => void;
  onComplete: () => void;
}

const LINE_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
const LINE_VALUES: Record<number, { name: string; type: "yang" | "yin"; changing: boolean }> = {
  6: { name: "老阴 (动)", type: "yin", changing: true },
  7: { name: "少阳", type: "yang", changing: false },
  8: { name: "少阴", type: "yin", changing: false },
  9: { name: "老阳 (动)", type: "yang", changing: true }
};

export default function IChingRitualManager({
  lines,
  isTossing,
  currentCoins,
  onToss,
  onQuickCast,
  onComplete
}: IChingRitualManagerProps) {
  const [stageText, setStageText] = useState("✦ 请点击铜钱或下方按钮起卦 ✦");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTossing) {
        setStageText("正在摇动青铜钱，感应天地阴阳气场...");
      } else if (lines.length > 0 && lines.length < 6) {
        const lastLine = lines[lines.length - 1];
        const info = LINE_VALUES[lastLine];
        setStageText(`第 ${lines.length} 爻显化：${info?.name || ""} ✦ 请继续第 ${lines.length + 1} 次起卦`);
      } else if (lines.length === 6) {
        setStageText("✦ 六爻既成，乾坤已定，正在开启解卦 ✦");
        playMysticChime();
        triggerHapticVibration([30, 80, 30]);
      }
    }, 0);

    let completeTimer: NodeJS.Timeout;
    if (lines.length === 6 && !isTossing) {
      completeTimer = setTimeout(onComplete, 1600);
    }

    return () => {
      clearTimeout(timer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [isTossing, lines, onComplete]);

  const slotIndices = [5, 4, 3, 2, 1, 0];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[500px] gap-6 py-2">
      {/* 3D Coin Toss Area */}
      <div className="w-full flex items-center justify-center">
        <IChingCoinToss 
          isTossing={isTossing} 
          results={currentCoins} 
          onClick={lines.length < 6 && !isTossing ? onToss : undefined}
        />
      </div>

      {/* Status Banner */}
      <div className="space-y-2 text-center">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent mx-auto" />
        <p className="font-serif text-[#E8DFB8]/90 tracking-wider md:tracking-[0.3em] text-xs md:text-sm animate-pulse">
          {stageText}
        </p>
      </div>

      {/* Hexagram Stacking Canvas (Bottom-Up) */}
      <div className="w-full max-w-[300px] md:max-w-[340px] obsidian-glass liquid-border rounded-[2rem] p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        
        {/* Rotating Bagua in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#C9A84C]/10 rounded-full flex items-center justify-center opacity-30 pointer-events-none animate-spin-slow">
           <Compass className="w-36 h-36 text-[#C9A84C]/10" />
        </div>

        {slotIndices.map(idx => {
          const val = lines[idx];
          const isCast = val !== undefined;
          const info = isCast ? LINE_VALUES[val] : null;

          return (
            <div key={idx} className="flex items-center gap-3 h-8 relative z-10">
              <span className={`font-serif text-xs w-10 text-right tracking-widest ${isCast ? 'text-[#C9A84C] font-bold' : 'text-[#C9A84C]/30'}`}>
                {LINE_NAMES[idx]}
              </span>

              <div className="flex-1 flex items-center justify-center h-4 relative">
                {!isCast ? (
                  <div className="w-full h-1 bg-[#C9A84C]/10 rounded-full border border-dashed border-[#C9A84C]/20" />
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 120, damping: 12 }}
                      className="w-full h-full flex items-center justify-center relative"
                    >
                      {info?.type === "yang" ? (
                        <div className="w-full h-full bg-gradient-to-r from-[#C9A84C] via-[#F5E6AD] to-[#C9A84C] rounded-sm shadow-[0_0_12px_rgba(201,168,76,0.4)] animate-pulse" />
                      ) : (
                        <>
                          <div className="w-[44%] h-full bg-gradient-to-r from-[#C9A84C] to-[#F5E6AD] rounded-sm shadow-[0_0_12px_rgba(201,168,76,0.3)]" />
                          <div className="w-[12%]" />
                          <div className="w-[44%] h-full bg-gradient-to-l from-[#C9A84C] to-[#F5E6AD] rounded-sm shadow-[0_0_12px_rgba(201,168,76,0.3)]" />
                        </>
                      )}

                      {info?.changing && (
                        <div className="absolute inset-0 bg-red-500/25 rounded-sm animate-pulse border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              <span className="font-serif text-[10px] w-12 text-left text-[#C9A84C]/80 tracking-wider">
                {info?.changing ? "动爻" : (info ? (info.type === "yang" ? "阳" : "阴") : "")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      {lines.length < 6 && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onToss}
            disabled={isTossing}
            className="px-10 py-3.5 rounded-full font-serif text-base tracking-[0.2em] bg-gradient-to-r from-[#805010] to-[#B46E14] hover:from-[#906015] hover:to-[#C9A84C] text-[#E8DFB8] shadow-[0_0_25px_rgba(180,110,20,0.4)] border border-[#C9A84C]/40 disabled:opacity-50 cursor-pointer transition-all"
          >
            {isTossing ? "感应起卦中..." : `第 ${lines.length + 1} 次起卦`}
          </motion.button>

          {onQuickCast && lines.length === 0 && (
            <button
              onClick={onQuickCast}
              disabled={isTossing}
              className="px-5 py-2.5 rounded-full font-serif text-xs tracking-wider border border-[#C9A84C]/30 text-[#C9A84C]/70 hover:text-[#C9A84C] hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              一键快速成卦
            </button>
          )}
        </div>
      )}
    </div>
  );
}
