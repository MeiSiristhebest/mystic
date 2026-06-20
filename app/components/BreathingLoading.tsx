'use client';

import React from 'react';
import { motion } from 'motion/react';

interface BreathingLoadingProps {
  text?: string;
}

export default function BreathingLoading({ text = "阿卡夏正在感应中..." }: BreathingLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8 select-none">
      <div className="relative w-32 h-32 flex items-center justify-center">
        
        {/* Outer ring: Delicate dotted gold circle, counter-rotating */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
          className="absolute inset-0 border border-[#C9A84C]/20 border-dashed rounded-full"
        />

        {/* Mid ring: Soft purple-gold aura, rotating and breathing */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [0.95, 1.05, 0.95],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ willChange: "transform, opacity" }}
          className="absolute inset-3 border border-[#C9A84C]/10 rounded-full bg-gradient-to-tr from-[#C9A84C]/3 via-transparent to-[#9B7FD4]/3"
        />

        {/* Inner ring: Staggered pulse ring */}
        <motion.div 
          animate={{ 
            scale: [0.85, 1.15, 0.85],
            opacity: [0.2, 0.45, 0.2]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{ willChange: "transform, opacity" }}
          className="absolute inset-6 bg-[#C9A84C]/5 rounded-full filter blur-[2px]"
        />

        {/* Inner Core: Deep glowing mystic core */}
        <motion.div 
          animate={{ 
            scale: [0.92, 1.08, 0.92],
            opacity: [0.5, 0.85, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ willChange: "transform, opacity" }}
          className="absolute inset-10 bg-gradient-to-tr from-[#C9A84C]/50 via-[#F5E6AD]/70 to-[#C9A84C]/50 rounded-full shadow-[0_0_20px_rgba(201,168,76,0.3)] filter blur-[1px]"
        />
      </div>
      
      <p className="text-[#E8DFB8]/75 font-serif italic tracking-[0.25em] animate-pulse text-base drop-shadow-[0_0_10px_rgba(232,223,184,0.15)]">
        {text}
      </p>
    </div>
  );
}
