import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Globe } from 'lucide-react';
import { OracleInput } from './OracleInput';

interface TimeWisdomRitualProps {
  step: 'input' | 'observing';
  question: string;
  setQuestion: (val: string) => void;
  onStart: () => void;
  isObserving: boolean;
}

export const TimeWisdomRitual: React.FC<TimeWisdomRitualProps> = ({
  step,
  question,
  setQuestion,
  onStart,
  isObserving
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
              {/* Rotating Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 rounded-full border border-mystic-gold/10 absolute flex items-center justify-center"
              >
                <div className="w-1 h-1 bg-mystic-gold rounded-full absolute top-0" />
              </motion.div>
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 rounded-full border border-mystic-gold/5 absolute"
              />
              <Clock className="w-12 h-12 text-mystic-gold/40 relative z-10" />
            </div>
            <h2 className="text-3xl font-serif text-mystic-ink tracking-[0.2em]">观测时间流</h2>
            <p className="text-mystic-ink/40 text-sm max-w-lg mx-auto leading-relaxed">
              将您的疑问置于当下的全球能量场中，听取来自时间维度的智慧。
            </p>
          </div>

          <OracleInput 
            value={question}
            onChange={setQuestion}
            onSend={onStart}
            placeholder="关于当下的时局或个人时机..."
            buttonText="观测当下"
            disabled={isObserving}
          />

          <div className="flex justify-center gap-8 text-[10px] text-mystic-ink/20 uppercase tracking-[0.5em] pt-12">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>全球共时性</span>
            </div>
            <span>•</span>
            <span>实时观测</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
