"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { getCryptoRandom } from "@/lib/random";

export default function ShadowWorkMirror() {
  const [offsets] = useState(() => [...Array(3)].map(() => ({
    x: [getCryptoRandom() * 20, getCryptoRandom() * -20, getCryptoRandom() * 20],
    y: [getCryptoRandom() * 20, getCryptoRandom() * -20, getCryptoRandom() * 20]
  })));

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#050308] overflow-hidden flex items-center justify-center p-8">
      {/* Dark Mirror Base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.1)_0%,transparent_80%)]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="relative w-full max-w-lg aspect-[3/4] rounded-[60px] border-2 border-zinc-800/40 bg-zinc-900/5 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        {/* Mirror Surface effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-zinc-800/10" />
        <motion.div 
          animate={{ x: [-100, 100], opacity: [0, 0.2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/2 bg-white/5 skew-x-[-20deg]"
        />
        
        {/* Inner Shadow Entities */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                x: offsets[i].x,
                y: offsets[i].y,
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10 + i * 2, repeat: Infinity }}
              className="absolute w-64 h-64 rounded-full bg-zinc-800 blur-[60px]"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
