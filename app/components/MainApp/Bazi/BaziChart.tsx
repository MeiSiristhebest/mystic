'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface BaziChartProps {
  baziString: string;
}

export function BaziChart({ baziString }: BaziChartProps) {
  if (!baziString) return null;
  
  const pillars = baziString.split(' ').map(p => ({
    gan: p[0],
    zhi: p[1]
  }));

  const pillarNames = ["年柱", "月柱", "日柱", "时柱"];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-black/40 border border-amber-500/20 rounded-3xl p-8 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={48} className="text-amber-500" />
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-500/30" />
        <h3 className="px-6 text-xl font-serif text-amber-400 tracking-[0.4em] uppercase">四柱八字 · 排盘</h3>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-500/30" />
      </div>

      <div className="grid grid-cols-4 gap-4 md:gap-8">
        {pillars.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <span className="text-xs text-amber-500/40 font-serif tracking-widest">{pillarNames[i]}</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-16 md:w-16 md:h-20 flex items-center justify-center bg-amber-500/10 rounded-xl border border-amber-500/30">
                <span className="text-3xl md:text-4xl font-serif text-amber-200">{p.gan}</span>
              </div>
              <div className="w-12 h-16 md:w-16 md:h-20 flex items-center justify-center bg-amber-500/5 rounded-xl border border-amber-500/20">
                <span className="text-3xl md:text-4xl font-serif text-amber-400/80">{p.zhi}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
