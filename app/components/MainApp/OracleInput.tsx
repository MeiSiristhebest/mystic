import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface OracleInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  buttonText?: string;
}

export const OracleInput: React.FC<OracleInputProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "输入您的困惑，由阿卡夏为您指引...",
  disabled = false,
  buttonText = "开启启示"
}) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div 
        className="glass-panel rounded-2xl p-1 relative overflow-hidden group"
        whileFocus={{ boxShadow: "0 0 20px rgba(201, 168, 76, 0.3)" }}
      >
        {/* Breathing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mystic-gold/10 to-transparent animate-shimmer pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row gap-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none focus:ring-0 text-mystic-ink placeholder-mystic-ink/40 p-4 min-h-[100px] resize-none text-lg font-serif"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <div className="p-2 flex items-end justify-end">
            <button
              onClick={onSend}
              disabled={disabled || !value.trim()}
              className="bg-mystic-gold hover:bg-mystic-gold-bright disabled:bg-white/10 text-mystic-void px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold shadow-lg disabled:opacity-50 group"
            >
              <Sparkles className={`w-5 h-5 transition-transform ${value.trim() ? 'group-hover:rotate-12' : ''}`} />
              <span>{buttonText}</span>
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Decorative Elements */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-4 text-[10px] text-mystic-gold/40 tracking-[0.3em] uppercase">
        <span>Intent</span>
        <span>•</span>
        <span>Focus</span>
        <span>•</span>
        <span>Insight</span>
      </div>
    </div>
  );
};
