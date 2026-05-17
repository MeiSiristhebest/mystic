"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function CrystalBallLoader({ text }: { text?: string }) {
  const [sparkles] = useState(() => [...Array(12)].map((_, i) => ({
    id: i,
    x: Math.random() * 100 + "%",
    y: Math.random() * 100 + "%",
    duration: 1.5 + Math.random() * 2.5,
    delay: Math.random() * 2
  })));

  return (
    <div className="flex flex-col items-center justify-center space-y-12 my-12">
      <div className="relative w-48 h-48 aura-ring rounded-full">
        {/* Glow */}
        <div className="absolute inset-0 bg-[#C9A84C]/20 blur-3xl rounded-full animate-pulse" />
        
        {/* Crystal Ball Shape */}
        <div className="absolute inset-0 rounded-full border border-[#C9A84C]/50 obsidian-glass shadow-[inset_0_0_40px_rgba(201,168,76,0.3)] overflow-hidden flex items-center justify-center">
          {/* Outer Astrolabe Ring */}
          <div className="absolute inset-2 border border-[#C9A84C]/20 rounded-full border-dashed animate-spin" style={{ animationDuration: '30s' }} />
          <div className="absolute inset-6 border border-[#E8DFB8]/15 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
          
          {/* Inner Swirls */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,rgba(201,168,76,0.4),transparent)] blur-2xl"
          />
          
          {/* Sparkles */}
          {sparkles.map((s) => (
            <motion.div
              key={s.id}
              initial={{ 
                x: s.x, 
                y: s.y,
                opacity: 0
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{ 
                duration: s.duration, 
                repeat: Infinity,
                delay: s.delay
              }}
              className="absolute w-1.5 h-1.5 bg-[#E8DFB8] rounded-full shadow-[0_0_15px_#C9A84C]"
            />
          ))}
          
          <div className="w-12 h-12 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.5)]">
            <div className="w-4 h-4 rounded-full bg-[#E8DFB8] shadow-[0_0_20px_#fff] animate-ping" />
          </div>
        </div>
        
        {/* Reflection Highlight */}
        <div className="absolute top-4 left-8 w-12 h-6 bg-[#E8DFB8]/30 rounded-[50%] blur-md rotate-[-30deg] pointer-events-none" />
      </div>
      
      {text && (
        <div className="space-y-3 text-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent mx-auto" />
          <p className="text-sm font-serif text-[#E8DFB8] tracking-[0.5em] uppercase animate-pulse drop-shadow-md">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
