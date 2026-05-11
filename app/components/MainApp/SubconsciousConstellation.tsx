"use client";

import { motion } from "motion/react";

export default function SubconsciousConstellation() {
  const stars = [...Array(40)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5
  }));

  return (
    <div className="relative w-full h-[400px] bg-[#050308] rounded-3xl overflow-hidden border border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
      
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {stars.map((star, i) => i < stars.length - 1 && (
          <line
            key={i}
            x1={`${stars[i].x}%`}
            y1={`${stars[i].y}%`}
            x2={`${stars[i+1].x}%`}
            y2={`${stars[i+1].y}%`}
            stroke="rgba(147,197,253,0.1)"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          className="absolute bg-blue-200 rounded-full shadow-[0_0_8px_white]"
          style={{ 
            left: `${star.x}%`, 
            top: `${star.y}%`, 
            width: star.size, 
            height: star.size 
          }}
        />
      ))}
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="w-96 h-96 bg-blue-500 rounded-full blur-[100px]"
        />
      </div>
    </div>
  );
}
