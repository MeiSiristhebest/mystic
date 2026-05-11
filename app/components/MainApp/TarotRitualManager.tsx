import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle } from 'lucide-react';
import { OracleInput } from './OracleInput';
import { CrystalBallLoader } from './CrystalBallLoader';
import { TarotCard } from './TarotComponents';
import { TarotCard as TarotCardType } from '@/lib/tarot-data';

interface TarotRitualManagerProps {
  step: 'input' | 'shuffling' | 'selecting' | 'revealing';
  question: string;
  setQuestion: (val: string) => void;
  isRecommending: boolean;
  recommendError: string;
  handleRecommendMode: () => void;
  startShuffle: () => void;
  isShuffling: boolean;
  deckCards: TarotCardType[];
  selectedIndices: number[];
  selectCard: (index: number) => void;
  drawnCards: TarotCardType[];
  revealedCards: boolean[];
  revealCard: (index: number) => void;
  cardCount: number;
  modeName: string;
}

export const TarotRitualManager: React.FC<TarotRitualManagerProps> = ({
  step,
  question,
  setQuestion,
  isRecommending,
  recommendError,
  handleRecommendMode,
  startShuffle,
  isShuffling,
  deckCards,
  selectedIndices,
  selectCard,
  drawnCards,
  revealedCards,
  revealCard,
  cardCount,
  modeName
}) => {
  return (
    <AnimatePresence mode="wait">
      {step === 'input' && (
        <motion.div 
          key="input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-serif gold-gradient-text tracking-[0.2em]">冥想并输入您的疑问</h2>
            <p className="text-mystic-ink/60 text-sm max-w-lg mx-auto">
              在心中默念您的困惑，让宇宙的能量流经您的指尖。
            </p>
          </div>

          <OracleInput 
            value={question}
            onChange={setQuestion}
            onSend={startShuffle}
            buttonText="开始洗牌"
            disabled={isShuffling}
          />

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleRecommendMode}
              disabled={isRecommending || isShuffling}
              className="text-mystic-gold/60 hover:text-mystic-gold text-sm transition-colors flex items-center gap-2 group"
            >
              <HelpCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>不确定选择什么牌阵？点此由阿卡夏为您推荐</span>
            </button>
            {isRecommending && <span className="text-xs text-mystic-gold animate-pulse">正在感应最契合您的能量路径...</span>}
            {recommendError && <span className="text-xs text-red-400/80">{recommendError}</span>}
          </div>
        </motion.div>
      )}

      {step === 'shuffling' && (
        <motion.div 
          key="shuffling"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <CrystalBallLoader text="正在洗炼命运之牌..." />
        </motion.div>
      )}

      {step === 'selecting' && (
        <motion.div 
          key="selecting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h3 className="text-xl font-serif text-mystic-gold mb-2">凭直觉选择 {cardCount} 张牌</h3>
            <p className="text-mystic-ink/40 text-xs">已选择 {selectedIndices.length} / {cardCount}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {deckCards.map((card, i) => (
              <TarotCard
                key={i}
                card={card}
                isRevealed={false}
                isSelected={selectedIndices.includes(i)}
                onClick={() => selectCard(i)}
                size="sm"
              />
            ))}
          </div>
        </motion.div>
      )}

      {step === 'revealing' && (
        <motion.div 
          key="revealing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h3 className="text-2xl font-serif text-mystic-gold tracking-widest">{modeName}</h3>
            <p className="text-mystic-ink/40 text-xs mt-2">点击卡牌，揭示命运的伏笔</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {drawnCards.map((card, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <TarotCard
                  card={card}
                  isRevealed={revealedCards[i]}
                  onClick={() => revealCard(i)}
                  size="lg"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
