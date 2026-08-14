'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HexagramDisplayProps {
  lines: number[];
}

export function HexagramDisplay({ lines }: HexagramDisplayProps) {
  if (!lines || lines.length !== 6) return null;
  
  const hasChanging = lines.some(l => l === 6 || l === 9);
  
  const renderHexagram = (hexLines: number[], title: string, showChanging: boolean) => {
    const reversedLines = [...hexLines].reverse();
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-[#C9A84C] font-serif text-sm tracking-[0.3em] font-medium uppercase">{title}</span>
        <div className="flex flex-col gap-2.5 w-full max-w-[180px] p-4 rounded-2xl bg-[#080510]/80 border border-[#C9A84C]/25 shadow-inner">
          {reversedLines.map((val, idx) => {
            const isYang = val === 7 || val === 9;
            const isChanging = showChanging && (val === 6 || val === 9);
            const originalIndex = 5 - idx;
            const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
            return (
              <div key={idx} className="flex items-center gap-3 w-full">
                <span className="text-[#C9A84C]/50 font-serif text-[10px] w-8 text-right tracking-wider">
                  {lineNames[originalIndex]}
                </span>
                <div className="flex-1 flex items-center justify-center gap-1.5 h-3.5 relative">
                  {isYang ? (
                    <div className="w-full h-full bg-gradient-to-r from-[#C9A84C] via-[#F5E6AD] to-[#C9A84C] rounded-sm shadow-[0_0_10px_rgba(201,168,76,0.4)]" />
                  ) : (
                    <>
                      <div className="w-[45%] h-full bg-gradient-to-r from-[#C9A84C] to-[#F5E6AD] rounded-sm shadow-[0_0_10px_rgba(201,168,76,0.3)]" />
                      <div className="w-[10%]" />
                      <div className="w-[45%] h-full bg-gradient-to-l from-[#C9A84C] to-[#F5E6AD] rounded-sm shadow-[0_0_10px_rgba(201,168,76,0.3)]" />
                    </>
                  )}
                  {isChanging && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-ping" />
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
      className="flex flex-col items-center gap-6 mb-8 p-8 obsidian-glass rounded-[2.5rem] border border-[#C9A84C]/35 w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center gap-2 text-[#F5E6AD] font-serif text-base tracking-[0.3em]">
        <Sparkles size={18} className="text-[#C9A84C]" />
        <span>易经天地卦象推演</span>
      </div>
      <div className="flex items-center justify-center gap-8 md:gap-16 w-full flex-wrap sm:flex-nowrap">
        {renderHexagram(lines, '本卦 · 初始场域', true)}
        {hasChanging && (
          <>
            <div className="text-[#C9A84C] animate-pulse flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono tracking-widest uppercase">变爻显化</span>
              <ArrowRight size={22} />
            </div>
            {renderHexagram(changedLines, '之卦 · 未来归宿', false)}
          </>
        )}
      </div>
    </motion.div>
  );
}
