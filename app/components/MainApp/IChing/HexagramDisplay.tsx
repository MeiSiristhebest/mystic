'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronRight } from 'lucide-react';

interface HexagramDisplayProps {
  lines: number[];
}

export function HexagramDisplay({ lines }: HexagramDisplayProps) {
  if (!lines || lines.length !== 6) return null;
  
  const hasChanging = lines.some(l => l === 6 || l === 9);
  
  const renderHexagram = (hexLines: number[], title: string, showChanging: boolean) => {
    const reversedLines = [...hexLines].reverse();
    return (
      <div className="flex flex-col items-center gap-2">
        <h4 className="text-amber-500/80 font-serif text-sm mb-2">{title}</h4>
        <div className="flex flex-col gap-2 w-full max-w-[160px]">
          {reversedLines.map((val, idx) => {
            const isYang = val === 7 || val === 9;
            const isChanging = showChanging && (val === 6 || val === 9);
            const originalIndex = 5 - idx;
            const lineNames = ["初", "二", "三", "四", "五", "上"];
            return (
              <div key={idx} className="flex items-center gap-3 w-full">
                <span className="text-amber-500/40 font-serif text-[10px] w-6 text-right">
                  {lineNames[originalIndex]}
                </span>
                <div className="flex-1 flex items-center justify-center gap-1.5 h-4 relative">
                  {isYang ? (
                    <div className="w-full h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                  ) : (
                    <>
                      <div className="w-[45%] h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                      <div className="w-[10%]" />
                      <div className="w-[45%] h-full bg-gradient-to-l from-amber-700 to-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                    </>
                  )}
                  {isChanging && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const changedLines = lines.map(l => {
    if (l === 6) return 7;
    if (l === 9) return 8;
    return l;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-6 mb-8 p-6 bg-black/30 rounded-2xl border border-amber-500/20 w-full"
    >
      <h3 className="text-amber-400 font-serif text-lg flex items-center gap-2">
        <Sparkles size={18} />
        卦象推演
      </h3>
      <div className="flex items-center justify-center gap-8 md:gap-16 w-full">
        {renderHexagram(lines, '本卦', true)}
        {hasChanging && (
          <>
            <div className="text-amber-500/40 animate-pulse">
              <ChevronRight size={24} />
            </div>
            {renderHexagram(changedLines, '变卦', false)}
          </>
        )}
      </div>
    </motion.div>
  );
}
