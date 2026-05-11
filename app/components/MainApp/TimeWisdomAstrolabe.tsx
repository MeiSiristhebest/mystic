import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TimeWisdomAstrolabeProps {
  onLockComplete: () => void;
}

export const TimeWisdomAstrolabe: React.FC<TimeWisdomAstrolabeProps> = ({
  onLockComplete
}) => {
  const [isLocked, setIsLocked] = useState(false);

  const handleLock = () => {
    setIsLocked(true);
    setTimeout(() => {
      onLockComplete();
    }, 3000); // 3 seconds for the alignment animation to finish
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif text-mystic-gold tracking-[0.2em] drop-shadow-[0_0_10px_rgba(201,168,76,0.5)]">
          星盘校准
        </h2>
        <p className="text-mystic-ink/40 text-sm">
          {isLocked ? "时间节点已锁定..." : "点击锁定当前的宇宙时间线"}
        </p>
      </div>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-mystic-gold/10 rounded-full blur-3xl" />

        {/* Outer Ring */}
        <motion.div
          animate={isLocked ? { rotate: 0 } : { rotate: 360 }}
          transition={isLocked ? { duration: 1.5, type: "spring", stiffness: 50 } : { duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-mystic-gold/20 border-dashed"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-mystic-gold shadow-[0_0_10px_rgba(201,168,76,1)]" />
        </motion.div>

        {/* Middle Ring */}
        <motion.div
          animate={isLocked ? { rotate: 0 } : { rotate: -360 }}
          transition={isLocked ? { duration: 1.8, type: "spring", stiffness: 45 } : { duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 sm:inset-6 rounded-full border-2 border-mystic-gold/40 border-dotted flex items-center justify-center"
        >
          {/* Symbols on middle ring */}
          <div className="absolute top-0 w-2 h-2 rounded-full bg-mystic-ink/60" />
          <div className="absolute bottom-0 w-2 h-2 rounded-full bg-mystic-ink/60" />
          <div className="absolute left-0 w-2 h-2 rounded-full bg-mystic-ink/60" />
          <div className="absolute right-0 w-2 h-2 rounded-full bg-mystic-ink/60" />
        </motion.div>

        {/* Inner Ring */}
        <motion.div
          animate={isLocked ? { rotate: 0 } : { rotate: 360 }}
          transition={isLocked ? { duration: 2.1, type: "spring", stiffness: 40 } : { duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-10 sm:inset-14 rounded-full border border-mystic-gold/60"
        >
           <div className="absolute top-2 right-4 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]" />
        </motion.div>

        {/* Center Core */}
        <div className="absolute w-12 h-12 rounded-full bg-mystic-void border border-mystic-gold z-10 flex items-center justify-center overflow-hidden">
           <motion.div 
             animate={isLocked ? { scale: [1, 2, 0.8, 1], opacity: [0.5, 1, 0.8, 1] } : { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
             transition={isLocked ? { duration: 1, ease: "easeOut" } : { duration: 2, repeat: Infinity }}
             className="w-full h-full bg-[radial-gradient(circle,_#C9A84C_0%,_transparent_70%)]"
           />
        </div>

        {/* Final Lock Flash */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
            transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-mystic-gold/30 rounded-full blur-md z-20 pointer-events-none"
          />
        )}
      </div>

      {!isLocked && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleLock}
          className="px-12 py-4 rounded-full glass-panel border border-mystic-gold/40 text-mystic-gold font-bold tracking-widest hover:bg-mystic-gold hover:text-mystic-void transition-all duration-300 shadow-[0_0_15px_rgba(201,168,76,0.2)]"
        >
          锁定时间
        </motion.button>
      )}
    </div>
  );
};
