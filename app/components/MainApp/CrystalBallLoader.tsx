import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

interface CrystalBallLoaderProps {
  text?: string;
  evidenceTexts?: string[];
}

const DEFAULT_EVIDENCE = [
  "正在链接阿卡夏记录...",
  "检索星体运行轨迹...",
  "解析潜意识能量场...",
  "比对历史共时性数据...",
  "凝练灵魂箴言..."
];

export const CrystalBallLoader: React.FC<CrystalBallLoaderProps> = ({ 
  text = "正在感应阿卡夏场...",
  evidenceTexts = DEFAULT_EVIDENCE
}) => {
  const [evidenceIndex, setEvidenceIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvidenceIndex((prev) => (prev + 1) % evidenceTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [evidenceTexts.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-32 h-32 mb-8">
        {/* Outer Glow */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-mystic-gold/20 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* The Ball */}
        <div className="absolute inset-0 rounded-full border border-mystic-gold/30 bg-mystic-void overflow-hidden">
          {/* Inner Swirls */}
          <motion.div 
            className="absolute inset-0 opacity-40"
            style={{ 
              background: 'radial-gradient(circle at center, #c5a059 0%, transparent 70%)',
              filter: 'blur(10px)'
            }}
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          <motion.div 
            className="absolute inset-0 opacity-30"
            style={{ 
              background: 'conic-gradient(from 0deg at 50% 50%, transparent, #E8DFB8, transparent)',
              filter: 'blur(5px)'
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Top Reflection */}
          <div className="absolute top-2 left-1/4 w-1/2 h-1/4 bg-white/10 rounded-[50%] blur-sm" />
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <motion.p 
          className="text-mystic-gold font-serif italic text-lg tracking-widest"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
        
        {/* Evidence Chain */}
        <div className="h-6 flex items-center justify-center gap-2 text-mystic-gold/50 text-xs font-mono">
          <Activity className="w-3 h-3 animate-pulse" />
          <div className="relative overflow-hidden h-4 w-48">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={evidenceIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="absolute inset-0 text-center"
              >
                {evidenceTexts[evidenceIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
