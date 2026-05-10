'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Compass, Calendar, Coins, BookOpen, User, Eye, Map } from 'lucide-react';
import BaziApp from './BaziApp';
import IChingApp from './IChingApp';
import FaceReadingApp from './FaceReadingApp';

const EASTERN_MODES = [
  { id: 'bazi', name: '八字排盘', icon: Calendar },
  { id: 'ziwei', name: '紫微斗数', icon: Star },
  { id: 'liunian', name: '流年避坑', icon: Compass },
  { id: 'liuyao', name: '六爻起卦', icon: Coins },
  { id: 'meihua', name: '梅花易数', icon: BookOpen },
  { id: 'qimen', name: '奇门遁甲', icon: Map },
  { id: 'face', name: '面相骨相', icon: Eye },
];

export default function EasternApp() {
  const [mode, setMode] = useState('bazi');
  const [isReading, setIsReading] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      {!isReading && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8 w-full max-w-5xl"
        >
          <div className="w-full overflow-x-auto hide-scrollbar pb-2 flex justify-start lg:justify-center px-4">
            <div className="flex p-1.5 bg-black/50 rounded-2xl md:rounded-full border border-amber-500/30 gap-2 shadow-[0_0_20px_rgba(245,158,11,0.1)] shrink-0">
              {EASTERN_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-4 md:px-6 py-2.5 rounded-xl md:rounded-full text-sm font-serif tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                    mode === m.id
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'text-amber-300/60 hover:text-amber-200 hover:bg-amber-500/10'
                  }`}
                >
                  <m.icon className="inline-block w-4 h-4 mr-2 mb-0.5" />
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {['bazi', 'ziwei', 'liunian'].includes(mode) && (
        <BaziApp mode={mode} onReadingChange={setIsReading} />
      )}
      {['liuyao', 'meihua', 'qimen'].includes(mode) && (
        <IChingApp mode={mode} onReadingChange={setIsReading} />
      )}
      {mode === 'face' && (
        <FaceReadingApp onReadingChange={setIsReading} />
      )}
    </div>
  );
}
