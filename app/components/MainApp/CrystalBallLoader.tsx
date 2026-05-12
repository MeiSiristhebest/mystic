"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function CrystalBallLoader({ text }: { text?: string }) {
  const [sparkles] = useState(() => [...Array(8)].map((_, i) => ({
    id: i,
    x: Math.random() * 100 + "%",
    y: Math.random() * 100 + "%",
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2
  })));

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative w-40 h-40">
        {/* Glow */}
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
        
        {/* Crystal Ball Shape */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] overflow-hidden">
          {/* Inner Swirls */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,rgba(147,197,253,0.3),transparent)] blur-xl"
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
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: s.duration, 
                repeat: Infinity,
                delay: s.delay
              }}
              className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
            />
          ))}
        </div>
        
        {/* Reflection Highlight */}
        <div className="absolute top-4 left-8 w-8 h-4 bg-white/20 rounded-[50%] blur-sm rotate-[-30deg]" />
      </div>
      
      {text && (
        <p className="text-sm font-serif text-blue-200/40 tracking-[0.3em] uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
