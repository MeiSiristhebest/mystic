"use client";

import { motion } from "motion/react";

export default function TimeWisdomAstrolabe() {
  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
      {/* Outer Rotating Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-orange-500/10 flex items-center justify-center"
          style={{ padding: `${i * 20}px` }}
        >
          <div className="w-full h-full rounded-full border border-orange-500/5 border-dashed" />
          {/* Hour Markers */}
          {[...Array(12)].map((_, j) => (
            <div
              key={j}
              className="absolute w-1 h-1 bg-orange-500/20 rounded-full"
              style={{
                transform: `rotate(${j * 30}deg) translateY(-${150 - i * 20}px)`
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Center Core */}
      <div className="relative w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.2)]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"
        />
        <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316]" />
      </div>
      
      {/* Clock Hands */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-1 h-32 bg-gradient-to-t from-orange-500 to-transparent origin-bottom bottom-1/2 rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3600, repeat: Infinity, ease: "linear" }}
        className="absolute w-1 h-24 bg-gradient-to-t from-orange-700 to-transparent origin-bottom bottom-1/2 rounded-full"
      />
    </div>
  );
}
