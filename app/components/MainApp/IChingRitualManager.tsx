import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OracleInput } from './OracleInput';
import { LineResult, CoinResult } from '@/hooks/useIChingRitual';

interface IChingRitualManagerProps {
  step: 'input' | 'tossing' | 'result';
  question: string;
  setQuestion: (val: string) => void;
  lines: LineResult[];
  isTossing: boolean;
  currentToss: CoinResult[];
  tossCoins: () => void;
  onStart: () => void;
}

export const IChingRitualManager: React.FC<IChingRitualManagerProps> = ({
  step,
  question,
  setQuestion,
  lines,
  isTossing,
  currentToss,
  tossCoins,
  onStart
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {step === 'input' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-serif gold-gradient-text tracking-[0.2em]">问卜易经</h2>
            <p className="text-mystic-ink/60 text-sm">至诚感通，六爻定吉凶</p>
          </div>
          <OracleInput 
            value={question}
            onChange={setQuestion}
            onSend={onStart}
            buttonText="开启仪式"
            placeholder="请输心中所求之愿..."
          />
        </motion.div>
      )}

      {(step === 'tossing' || step === 'result') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Hexagram Building Area */}
          <div className="flex flex-col-reverse gap-4 items-center justify-center min-h-[300px] glass-panel rounded-3xl p-8 border-mystic-gold/10">
            {Array.from({ length: 6 }).map((_, i) => {
              const line = lines[i];
              return (
                <div key={i} className="w-full h-8 flex items-center justify-center relative">
                  {line ? (
                    <motion.div 
                      initial={{ scaleX: 0, opacity: 0, filter: "blur(4px)" }}
                      animate={{ scaleX: 1, opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.8, ease: "easeOut", type: "spring", stiffness: 50 }}
                      className="w-48 h-4 flex gap-2 origin-left"
                    >
                      {/* 6: 老阴 (--)x, 7: 少阳 (—), 8: 少阴 (--), 9: 老阳 (—)o */}
                      {line === 7 || line === 9 ? (
                        <div className={`w-full h-full rounded-full ${line === 9 ? 'bg-mystic-gold shadow-gold animate-pulse' : 'bg-mystic-gold/60'}`} />
                      ) : (
                        <>
                          <div className={`flex-1 h-full rounded-full ${line === 6 ? 'bg-mystic-ink shadow-lg animate-pulse' : 'bg-mystic-ink/40'}`} />
                          <div className={`flex-1 h-full rounded-full ${line === 6 ? 'bg-mystic-ink shadow-lg animate-pulse' : 'bg-mystic-ink/40'}`} />
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <div className="w-48 h-px bg-white/5" />
                  )}
                  {i === lines.length && !isTossing && (
                    <motion.div 
                      className="absolute -right-8 text-mystic-gold animate-bounce"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      ←
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interaction Area */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <AnimatePresence mode="wait">
              {isTossing ? (
                <motion.div 
                  key="tossing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="flex gap-6"
                >
                  {currentToss.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 0, rotateX: 0, rotateY: 0, scale: 1 }}
                      animate={{ 
                        y: [0, -150, 0], 
                        rotateX: [0, 360 * 4, 360 * 8], 
                        rotateY: [0, 360 * 2, 360 * 4],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{ 
                        duration: 0.8, 
                        ease: "easeInOut",
                        delay: i * 0.1 // Stagger the toss slightly
                      }}
                      className="w-16 h-16 rounded-full border-[3px] border-mystic-gold bg-[#1a1508] flex items-center justify-center shadow-[inset_0_0_10px_rgba(201,168,76,0.5),_0_0_20px_rgba(201,168,76,0.4)] relative"
                    >
                      {/* Inner coin detail */}
                      <div className="absolute inset-2 border border-mystic-gold/50 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border border-mystic-gold/40 rotate-45" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-6"
                >
                  {lines.length < 6 ? (
                    <>
                      <p className="text-mystic-ink/60 italic font-serif">
                        第 {lines.length + 1} 次投掷：静心，然后点击
                      </p>
                      <button
                        onClick={tossCoins}
                        className="w-32 h-32 rounded-full border-2 border-mystic-gold/30 hover:border-mystic-gold transition-all flex items-center justify-center group relative"
                      >
                        <div className="absolute inset-0 bg-mystic-gold/10 rounded-full blur-xl group-hover:bg-mystic-gold/20 transition-all" />
                        <span className="text-mystic-gold font-bold group-hover:scale-110 transition-transform">投掷</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-mystic-gold text-sm tracking-[0.5em] mb-8">六爻已定</div>
                      <motion.p 
                        className="text-mystic-ink/60 text-xs mb-4"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        卦象已成，请阿卡夏开解...
                      </motion.p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
