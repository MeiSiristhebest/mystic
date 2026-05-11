import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ShadowWorkMirrorProps {
  onShatterComplete: () => void;
}

export const ShadowWorkMirror: React.FC<ShadowWorkMirrorProps> = ({
  onShatterComplete
}) => {
  const [isShattering, setIsShattering] = useState(false);

  const handleShatter = () => {
    setIsShattering(true);
    setTimeout(() => {
      onShatterComplete();
    }, 2500); // Wait for the shatter animation to finish
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif text-mystic-ink tracking-[0.2em]">直面深渊</h2>
        <p className="text-mystic-ink/40 text-sm">
          {isShattering ? "防御机制已瓦解..." : "点击击碎潜意识的伪装"}
        </p>
      </div>

      <div className="relative w-64 h-80 sm:w-80 sm:h-96 cursor-pointer group" onClick={!isShattering ? handleShatter : undefined}>
        {/* The Mirror Frame */}
        <div className="absolute inset-0 rounded-[40%] border-4 border-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Fog / Dark Surface */}
          <motion.div 
            animate={{ 
              opacity: isShattering ? 0 : [0.7, 0.9, 0.7],
              scale: isShattering ? 1.5 : 1
            }}
            transition={{ duration: isShattering ? 0.5 : 4, repeat: isShattering ? 0 : Infinity }}
            className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#050505]"
          >
            {/* Swirling Fog */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent blur-2xl"
            />
          </motion.div>

          {/* Shatter Effect (SVG overlay shown on click) */}
          {isShattering && (
            <motion.div 
              className="absolute inset-0 z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [1, 1, 0], scale: 1.1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              {/* Simplified Shatter Lines */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                  d="M50 50 L0 0 M50 50 L100 0 M50 50 L0 100 M50 50 L100 100 M50 50 L50 0 M50 50 L50 100 M50 50 L0 50 M50 50 L100 50 M50 50 L20 0 M50 50 L80 100" 
                  stroke="rgba(255,255,255,0.8)" 
                  strokeWidth="0.5" 
                  fill="none" 
                />
                {/* Fragments flying out (approximated with circles for simplicity in SVG) */}
                <motion.circle cx="30" cy="30" r="2" fill="white" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: -50, y: -50, opacity: 0 }} transition={{ duration: 1.5 }} />
                <motion.circle cx="70" cy="70" r="3" fill="white" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: 50, y: 50, opacity: 0 }} transition={{ duration: 1.5 }} />
                <motion.circle cx="80" cy="20" r="1.5" fill="white" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: 50, y: -50, opacity: 0 }} transition={{ duration: 1.5 }} />
              </svg>
              
              {/* Bright Flash */}
              <motion.div 
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>
          )}

          {/* User Reflection hint (before shatter) */}
          {!isShattering && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity duration-1000">
               <div className="w-32 h-40 bg-white blur-3xl rounded-[50%]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
