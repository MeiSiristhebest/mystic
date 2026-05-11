import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Zap } from 'lucide-react';
import { OracleInput } from './OracleInput';

interface SubconsciousRitualProps {
  step: 'input' | 'parsing';
  content: string;
  setContent: (val: string) => void;
  onStart: () => void;
  isParsing: boolean;
}

export const SubconsciousRitual: React.FC<SubconsciousRitualProps> = ({
  step,
  content,
  setContent,
  onStart,
  isParsing
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      {step === 'input' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-12"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center relative">
              <motion.div 
                animate={{ 
                  scale: [1, 1.4, 1],
                  rotate: 360
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border border-mystic-gold/10 absolute opacity-20"
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="w-40 h-40 rounded-full bg-blue-500/10 blur-3xl absolute"
              />
              <Cloud className="w-12 h-12 text-mystic-ink/40 relative z-10" />
            </div>
            <h2 className="text-3xl font-serif text-mystic-ink tracking-[0.2em]">解析潜意识之语</h2>
            <p className="text-mystic-ink/40 text-sm max-w-lg mx-auto leading-relaxed">
              记录那些破碎的梦境、突如其来的直觉，或是脑海中挥之不去的画面。
            </p>
          </div>

          <OracleInput 
            value={content}
            onChange={setContent}
            onSend={onStart}
            placeholder="捕捉那些轻飘的意象碎片..."
            buttonText="解码潜意识"
            disabled={isParsing}
          />

          <div className="flex justify-center gap-8 text-[10px] text-mystic-ink/20 uppercase tracking-[0.5em] pt-12">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>直觉触发</span>
            </div>
            <span>•</span>
            <span>符号解码</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
