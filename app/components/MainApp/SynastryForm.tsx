import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users } from 'lucide-react';
import { PartnerData } from '@/hooks/useSynastryAnalysis';

interface SynastryFormProps {
  partner: PartnerData;
  setPartner: (data: PartnerData) => void;
  question: string;
  setQuestion: (val: string) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  userName: string;
}

export const SynastryForm: React.FC<SynastryFormProps> = ({
  partner,
  setPartner,
  question,
  setQuestion,
  onSubmit,
  isAnalyzing,
  userName
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif gold-gradient-text tracking-[0.2em]">灵魂共鸣分析</h2>
        <p className="text-mystic-ink/60 text-sm">探寻两个生命轨迹交织时的深层意义</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Connection Icon */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-12 h-12 rounded-full bg-mystic-gold/20 flex items-center justify-center blur-sm"
          />
          <Heart className="w-8 h-8 text-mystic-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Self Section */}
        <div className="glass-panel rounded-3xl p-8 space-y-4 border-l-2 border-mystic-gold/30">
          <div className="text-mystic-gold/40 uppercase tracking-widest text-xs">主体 (Self)</div>
          <h3 className="text-2xl font-serif text-mystic-ink">{userName || "我"}</h3>
          <p className="text-mystic-ink/40 text-sm italic">已加载您的阿卡夏档案，作为分析的基础频率。</p>
        </div>

        {/* Partner Section */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 border-r-2 border-mystic-gold/30">
          <div className="text-mystic-gold/40 uppercase tracking-widest text-xs">对方 (Partner)</div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="对方姓名 / 称呼"
              value={partner.name}
              onChange={(e) => setPartner({ ...partner, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-mystic-ink placeholder-mystic-ink/20 outline-none focus:border-mystic-gold/50 transition-all"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="生日 (选填)"
                value={partner.birthday}
                onChange={(e) => setPartner({ ...partner, birthday: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-mystic-ink placeholder-mystic-ink/20 outline-none focus:border-mystic-gold/50 transition-all"
              />
              <input
                type="text"
                placeholder="星座 (选填)"
                value={partner.zodiac}
                onChange={(e) => setPartner({ ...partner, zodiac: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-mystic-ink placeholder-mystic-ink/20 outline-none focus:border-mystic-gold/50 transition-all"
              />
            </div>
            <textarea
              placeholder="添加更多关于对方或你们关系的描述..."
              value={partner.description}
              onChange={(e) => setPartner({ ...partner, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[100px] text-sm text-mystic-ink placeholder-mystic-ink/20 outline-none focus:border-mystic-gold/50 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center text-xs text-mystic-gold/40 uppercase tracking-widest">您的疑问 (Question)</div>
        <textarea
          placeholder="例如：我们未来可能的挑战是什么？或者：我们如何在精神上互相支持？"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg font-serif text-mystic-ink placeholder-mystic-ink/20 outline-none focus:border-mystic-gold/50 transition-all min-h-[120px] text-center"
        />
        
        <div className="flex justify-center">
          <button
            onClick={onSubmit}
            disabled={isAnalyzing || !partner.name}
            className="group relative px-12 py-4 rounded-full bg-mystic-gold text-mystic-void font-bold text-lg shadow-gold hover:shadow-gold-heavy transition-all disabled:opacity-30 flex items-center gap-3"
          >
            <Users className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>开启双人频率合成</span>
          </button>
        </div>
      </div>
    </div>
  );
};
