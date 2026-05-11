"use client";

import { motion } from "motion/react";

export default function CollectiveMirrorKaleidoscope() {
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#080510]/60 backdrop-blur-xl" />
      
      {/* Kaleidoscope Patterns */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <motion.div
          key={angle}
          animate={{ 
            rotate: [angle, angle + 360],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-64 h-64 border border-cyan-500/20"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 blur-xl" />
        </motion.div>
      ))}

      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="relative z-10 w-48 h-48 border-2 border-cyan-500/10 rounded-full flex items-center justify-center"
      >
        <div className="w-40 h-40 border border-cyan-500/20 rounded-full border-dashed" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
      </motion.div>
    </div>
  );
}
