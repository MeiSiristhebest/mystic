import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SubconsciousConstellationProps {
  onDecodeComplete: () => void;
}

// Generate random star positions once per component mount
const generateStars = (count: number) => {
  return Array.from({ length: count }).map(() => ({
    x: Math.random() * 80 + 10, // 10% to 90%
    y: Math.random() * 80 + 10,
    size: Math.random() * 3 + 2, // 2px to 5px
  }));
};

export const SubconsciousConstellation: React.FC<SubconsciousConstellationProps> = ({
  onDecodeComplete
}) => {
  const [isDecoding, setIsDecoding] = useState(false);
  const [stars] = useState(() => generateStars(8));

  const handleDecode = () => {
    setIsDecoding(true);
    setTimeout(() => {
      onDecodeComplete();
    }, 4000); // 4 seconds for the lines to draw and glow
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif text-mystic-ink tracking-[0.2em]">符号解码</h2>
        <p className="text-mystic-ink/40 text-sm">
          {isDecoding ? "正在串联潜意识碎片..." : "点击以连接孤立的意象"}
        </p>
      </div>

      <div className="relative w-full max-w-md h-80 sm:h-96 rounded-3xl border border-mystic-gold/10 overflow-hidden bg-[#0a0a0f] shadow-inner shadow-mystic-gold/5">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50" />

        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Draw lines between stars if decoding */}
          {isDecoding && (
            <motion.path
              d={stars.reduce((acc, star, i) => {
                if (i === 0) return `M ${star.x}% ${star.y}%`;
                return `${acc} L ${star.x}% ${star.y}%`;
              }, "")}
              fill="none"
              stroke="#C9A84C"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          )}

          {/* Render Stars */}
          {stars.map((star, i) => (
            <motion.circle
              key={i}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size}
              fill="#E8DFB8"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 1, 0.2], 
                scale: [1, 1.2, 1] 
              }}
              transition={{ 
                duration: Math.random() * 2 + 2, 
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}

          {/* Star Halos when decoded */}
          {isDecoding && stars.map((star, i) => (
            <motion.circle
              key={`halo-${i}`}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * 4}
              fill="url(#goldGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2, duration: 1 }}
            />
          ))}

          <defs>
            <radialGradient id="goldGlow">
              <stop offset="0%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>

        {/* Constellation overlay glow */}
        {isDecoding && (
          <motion.div
            className="absolute inset-0 bg-mystic-gold/5 mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ delay: 2.5, duration: 1.5 }}
          />
        )}
      </div>

      {!isDecoding && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleDecode}
          className="px-12 py-4 rounded-full border border-mystic-gold/40 text-mystic-gold font-bold tracking-widest hover:bg-mystic-gold/10 transition-all duration-300"
        >
          连接意象
        </motion.button>
      )}
    </div>
  );
};
