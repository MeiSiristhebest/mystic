import React from 'react';
import { motion } from 'framer-motion';
import { Moon, EyeOff } from 'lucide-react';
import { OracleInput } from './OracleInput';

interface ShadowWorkRitualProps {
  step: 'input' | 'exploring';
  issue: string;
  setIssue: (val: string) => void;
  onStart: () => void;
  isExploring: boolean;
}

export const ShadowWorkRitual: React.FC<ShadowWorkRitualProps> = ({
  step,
  issue,
  setIssue,
  onStart,
  isExploring
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
            <div className="flex justify-center">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-mystic-purple/30 blur-2xl absolute"
              />
              <Moon className="w-12 h-12 text-mystic-purple relative z-10" />
            </div>
            <h2 className="text-3xl font-serif text-mystic-ink tracking-[0.2em]">直面内心的阴影</h2>
            <p className="text-mystic-ink/40 text-sm max-w-lg mx-auto leading-relaxed">
              阴影并非邪恶，而是被我们遗忘的生命力。在这里，请诚实地表达那些令你感到不安、羞耻或难以面对的情绪。
            </p>
          </div>

          <OracleInput 
            value={issue}
            onChange={setIssue}
            onSend={onStart}
            placeholder="描述那个让你感到沉重或困惑的阴影..."
            buttonText="深入潜意识"
            disabled={isExploring}
          />

          <div className="flex justify-center gap-8 text-[10px] text-mystic-ink/20 uppercase tracking-[0.5em] pt-12">
            <div className="flex items-center gap-2">
              <EyeOff className="w-3 h-3" />
              <span>完全隐私</span>
            </div>
            <span>•</span>
            <span>深度整合</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
