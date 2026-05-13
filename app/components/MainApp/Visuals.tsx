"use client";

import { useState } from "react";
import { motion } from "motion/react";

export function AmbientCosmicBackground() {
  const [particles] = useState(() => [...Array(30)].map((_, i) => ({
    id: i,
    x: Math.random() * 100 + "%",
    y: Math.random() * 100 + "%",
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10
  })));

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[#050308]" />
      
      {/* Nebulas */}
      <motion.div 
        animate={{ 
          opacity: [0.15, 0.35, 0.15],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-purple-900/30 blur-[120px]"
      />
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-amber-900/20 blur-[100px]"
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y,
              opacity: p.opacity
            }}
            animate={{ 
              y: ["0%", "100%"],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              ease: "linear",
              delay: p.delay
            }}
            className="absolute w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          />
        ))}
      </div>
      
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.svg')] mix-blend-overlay" />
    </div>
  );
}

export function CardFrame({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative p-[2px] rounded-2xl overflow-hidden group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/40 via-amber-200/20 to-amber-700/40 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-[#080510] rounded-[14px] overflow-hidden h-full">
        {children}
      </div>
    </div>
  );
}

export function RitualLayout({ 
  children, 
  title, 
  subtitle,
  onBack,
  className = "" 
}: { 
  children: React.ReactNode, 
  title?: string, 
  subtitle?: string,
  onBack?: () => void,
  className?: string
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`space-y-12 ${className}`}
    >
      {(title || onBack) && (
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          {title && (
             <>
               <h2 className="text-4xl md:text-5xl font-serif gold-gradient-text tracking-[0.2em]">{title}</h2>
               {subtitle && <p className="text-[#E8DFB8]/40 font-serif italic">{subtitle}</p>}
             </>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
