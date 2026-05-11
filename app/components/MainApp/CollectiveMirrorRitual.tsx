import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity } from 'lucide-react';

interface CollectiveMirrorRitualProps {
  onStart: () => void;
  isReflecting: boolean;
}

export const CollectiveMirrorRitual: React.FC<CollectiveMirrorRitualProps> = ({
  onStart,
  isReflecting
}) => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center relative">
          {/* Mirror Effect Rings */}
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%"]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-56 h-56 border-2 border-mystic-gold/20 absolute opacity-30"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 border border-white/10 absolute rounded-full"
          />
          <div className="w-16 h-16 bg-mystic-gold/10 rounded-full flex items-center justify-center relative z-10 backdrop-blur-xl">
            <Users className="w-8 h-8 text-mystic-gold/60" />
          </div>
        </div>
        
        <h2 className="text-3xl font-serif gold-gradient-text tracking-[0.3em] pt-8">开启集体镜像</h2>
        <p className="text-mystic-ink/40 text-sm max-w-lg mx-auto leading-relaxed italic">
          跳出个体的小我，观测全人类共同编织的意识涟漪。
        </p>
      </motion.div>

      <div className="flex flex-col items-center gap-8">
        <button
          onClick={onStart}
          disabled={isReflecting}
          className="px-12 py-5 rounded-full glass-panel-heavy text-mystic-gold font-bold tracking-widest hover:bg-mystic-gold hover:text-mystic-void transition-all duration-500 shadow-gold group"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 group-hover:scale-125 transition-transform" />
            <span>观测集体潜意识</span>
          </div>
        </button>

        <div className="flex gap-8 text-[10px] text-mystic-ink/20 uppercase tracking-[0.5em]">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>去中心化分析</span>
          </div>
          <span>•</span>
          <span>社会原型观测</span>
        </div>
      </div>
    </div>
  );
};
