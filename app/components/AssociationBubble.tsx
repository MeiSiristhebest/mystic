import React from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export interface AssociationBubbleProps {
  association: {
    target?: string;
    reason?: string;
    system?: string;
    modeId?: string;
  };
}

export const AssociationBubble = React.memo(({ association }: AssociationBubbleProps) => {
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const setActiveSubTab = useAppStore(state => state.setActiveSubTab);
  const setHandoff = useAppStore(state => state.setHandoff);

  if (!association) return null;

  const handleNavigate = () => {
    if (association.system === 'tarot') {
      setActiveTab('explore');
      setActiveSubTab('tarot');
    } else if (association.system === 'eastern') {
      setActiveTab('explore');
      setActiveSubTab('eastern');
    } else if (association.system === 'astrology' || association.system === 'ASTROLOGY') {
      setActiveTab('explore');
      setActiveSubTab('astrology');
    } else {
      setActiveTab('explore');
      if (association.system) setActiveSubTab(association.system.toLowerCase());
    }

    if (association.system && association.modeId) {
      setHandoff({
        system: association.system.toLowerCase(),
        modeId: association.modeId,
        question: association.reason,
        context: association.reason,
        autoTrigger: true
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="my-12 p-1 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 rounded-[2rem] relative group"
    >
      <div className="bg-[#0a0502]/90 backdrop-blur-xl rounded-[1.9rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border border-white/5">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center relative flex-shrink-0">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-500/40 transition-all"></div>
          <Compass className="w-8 h-8 text-amber-500 relative animate-spin-slow" />
        </div>
        
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500/60 text-[10px] uppercase tracking-[0.3em] font-serif">
            <Sparkles className="w-3 h-3" />
            <span>阿卡夏指引 · 灵觉共振</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <h4 className="text-lg text-amber-100 font-serif">前往探索：{association.target || "未知领域"}</h4>
          <p className="text-sm text-amber-200/40 leading-relaxed font-light italic">
            &quot;{association.reason || ""}&quot;
          </p>
        </div>

        <button
          onClick={handleNavigate}
          className="px-8 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-200 text-sm font-serif tracking-widest transition-all flex items-center gap-2 group-hover:scale-105 cursor-pointer"
        >
          即刻前往 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
});
AssociationBubble.displayName = "AssociationBubble";
