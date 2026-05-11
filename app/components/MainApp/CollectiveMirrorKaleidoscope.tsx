import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CollectiveMirrorKaleidoscopeProps {
  onFocusComplete: () => void;
}

export const CollectiveMirrorKaleidoscope: React.FC<CollectiveMirrorKaleidoscopeProps> = ({
  onFocusComplete
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    setTimeout(() => {
      onFocusComplete();
    }, 3500); // Wait for the kaleidoscope to align
  };

  // Generate kaleidoscope shards
  const shards = Array.from({ length: 12 });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif text-mystic-ink tracking-[0.2em]">集体镜像</h2>
        <p className="text-mystic-ink/40 text-sm">
          {isFocused ? "正在提取全球情绪共振..." : "点击聚焦，看清混沌之中的集体潜流"}
        </p>
      </div>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center overflow-hidden rounded-full border border-mystic-gold/20 shadow-[inset_0_0_50px_rgba(201,168,76,0.1)]">
        
        {/* Background Blur */}
        <div className="absolute inset-0 bg-mystic-void" />
        <motion.div 
          animate={isFocused ? { scale: [1, 1.2, 1], opacity: 0.8 } : { scale: [1, 1.1, 1], opacity: 0.3 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle,_#C9A84C_0%,_transparent_70%)] blur-2xl" 
        />

        {/* The Kaleidoscope Shards */}
        <div className="relative w-full h-full flex items-center justify-center">
          {shards.map((_, i) => {
            const rotation = i * 30; // 360 / 12
            return (
              <motion.div
                key={i}
                initial={{ rotate: rotation + Math.random() * 45, x: Math.random() * 20 - 10, y: Math.random() * 20 - 10, opacity: 0.5 }}
                animate={isFocused ? {
                  rotate: rotation,
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: [1, 1.1, 1]
                } : {
                  rotate: rotation + Math.random() * 20,
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={isFocused ? { 
                  duration: 2, 
                  type: "spring", 
                  stiffness: 40 
                } : { 
                  duration: Math.random() * 2 + 2, 
                  repeat: Infinity, 
                  repeatType: "mirror" 
                }}
                className="absolute w-0 h-0 border-l-[40px] sm:border-l-[60px] border-l-transparent border-r-[40px] sm:border-r-[60px] border-r-transparent border-b-[80px] sm:border-b-[120px] border-b-mystic-gold/40 origin-bottom mix-blend-screen"
                style={{
                  transformOrigin: '50% 100%',
                  marginTop: '-80px', // Half of border-b to center it
                }}
              />
            );
          })}
        </div>

        {/* Center Glow when focused */}
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.8], scale: [0, 2, 1] }}
            transition={{ duration: 1.5, delay: 1 }}
            className="absolute w-16 h-16 rounded-full bg-white blur-xl mix-blend-screen z-10"
          />
        )}
      </div>

      {!isFocused && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleFocus}
          className="px-12 py-4 rounded-full border border-mystic-gold/60 bg-mystic-gold/10 text-mystic-gold font-bold tracking-widest hover:bg-mystic-gold hover:text-mystic-void transition-all duration-500 backdrop-blur-sm"
        >
          聚焦共振
        </motion.button>
      )}
    </div>
  );
};
