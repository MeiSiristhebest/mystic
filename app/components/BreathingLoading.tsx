'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface BreathingLoadingProps {
  text?: string;
}

export default function BreathingLoading({ text = "阿卡夏正在感应中..." }: BreathingLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8 select-none w-full">
      <div className="relative w-36 h-36 flex items-center justify-center">
        
        {/* Outer Sacred Geometry Ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-[#C9A84C]/30 border-dashed rounded-full"
        />

        {/* Dynamic Halo Glow */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [0.95, 1.08, 0.95],
            opacity: [0.35, 0.7, 0.35]
          }}
          transition={{ 
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-3 border border-[#C9A84C]/20 rounded-full bg-gradient-to-tr from-[#C9A84C]/10 via-[#2D1B4E]/30 to-[#C9A84C]/10 blur-[1px]"
        />

        {/* Inner Core Pulsing Ring */}
        <motion.div 
          animate={{ 
            scale: [0.88, 1.12, 0.88],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.3
          }}
          className="absolute inset-8 bg-[#C9A84C]/10 rounded-full blur-[4px]"
        />

        {/* Central Alchemy Star */}
        <motion.div 
          animate={{ 
            scale: [0.95, 1.15, 0.95],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative z-10 flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5E6AD] to-[#C9A84C] flex items-center justify-center shadow-[0_0_25px_rgba(201,168,76,0.6)]">
            <span className="text-black font-serif text-sm font-bold">✦</span>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <p className="font-serif text-[#E8DFB8] tracking-[0.35em] text-sm md:text-base font-light text-center drop-shadow-[0_0_15px_rgba(201,168,76,0.3)]">
          {text}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-[#C9A84C]/60 font-mono tracking-[0.5em] uppercase">
          <span>SACRED HARMONY</span>
        </div>
      </motion.div>
    </div>
  );
}
