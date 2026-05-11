import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SynastryRitualProps {
  userName: string;
  partnerName: string;
  onMergeComplete: () => void;
}

export const SynastryRitual: React.FC<SynastryRitualProps> = ({
  userName,
  partnerName,
  onMergeComplete
}) => {
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = () => {
    setIsMerging(true);
    // After the animation finishes, trigger the completion callback
    setTimeout(() => {
      onMergeComplete();
    }, 3000); // 3 seconds duration for the dramatic merging
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif gold-gradient-text tracking-[0.2em] opacity-80">
          {isMerging ? "灵魂共振中..." : "准备融合"}
        </h2>
        <p className="text-mystic-ink/40 text-sm">
          {isMerging ? "正在对齐阿卡夏频率" : "请注视中心，点击融合两颗灵魂频率"}
        </p>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* User Orb (Left) */}
        <motion.div
          initial={{ x: -100, scale: 1 }}
          animate={isMerging ? { 
            x: 0, 
            scale: [1, 1.5, 0],
            rotate: 360 * 2
          } : {
            x: -80,
            y: [0, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={isMerging ? { duration: 2, ease: "easeInOut" } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-blue-500/20 blur-xl absolute mix-blend-screen" />
          <div className="w-16 h-16 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] z-10">
            <span className="text-blue-200/80 font-serif text-sm px-2 truncate max-w-[60px]">{userName}</span>
          </div>
        </motion.div>

        {/* Partner Orb (Right) */}
        <motion.div
          initial={{ x: 100, scale: 1 }}
          animate={isMerging ? { 
            x: 0, 
            scale: [1, 1.5, 0],
            rotate: -360 * 2
          } : {
            x: 80,
            y: [0, 10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={isMerging ? { duration: 2, ease: "easeInOut" } : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-mystic-gold/20 blur-xl absolute mix-blend-screen" />
          <div className="w-16 h-16 rounded-full border border-mystic-gold/30 bg-mystic-gold/10 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.3)] z-10">
            <span className="text-mystic-gold/80 font-serif text-sm px-2 truncate max-w-[60px]">{partnerName}</span>
          </div>
        </motion.div>

        {/* The Supernova Flash */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isMerging ? { opacity: [0, 1, 1, 0], scale: [0, 5, 20, 30] } : { opacity: 0, scale: 0 }}
          transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
          className="absolute w-10 h-10 bg-white rounded-full blur-xl z-20"
        />
      </div>

      {!isMerging && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleMerge}
          className="px-12 py-4 rounded-full glass-panel-heavy border-mystic-gold/30 text-mystic-gold font-bold tracking-widest hover:bg-mystic-gold hover:text-mystic-void transition-all duration-500 shadow-gold group"
        >
          融合频率
        </motion.button>
      )}
    </div>
  );
};
