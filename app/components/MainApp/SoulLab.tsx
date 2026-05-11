'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Moon, 
  Clock, 
  Users, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import BreathingLoading from '../BreathingLoading';

const ShadowWorkApp = dynamic(() => import("../ShadowWorkApp"), { 
  loading: () => <BreathingLoading text="正在深入潜意识..." /> 
});
const SynastryApp = dynamic(() => import("../SynastryApp"), { 
  loading: () => <BreathingLoading text="正在观测缘分引力..." /> 
});
const CollectiveMirrorApp = dynamic(() => import("../CollectiveMirrorApp"), { 
  loading: () => <BreathingLoading text="正在连接集体无意识..." /> 
});
const TimeWisdomApp = dynamic(() => import("../TimeWisdomApp"), { 
  loading: () => <BreathingLoading text="正在校准宇宙时序..." /> 
});
const SubconsciousApp = dynamic(() => import("../SubconsciousApp"), { 
  loading: () => <BreathingLoading text="正在解密梦境幻象..." /> 
});

const LAB_MODES = [
  { id: 'synastry', name: '命运合参', icon: Zap, desc: '八字+星象+塔罗的三才合参' },
  { id: 'shadow', name: '阴影工作', icon: Moon, desc: '荣格心理学深度转化' },
  { id: 'time', name: '时间智慧', icon: Clock, desc: '宇宙律动的时间引导' },
  { id: 'subconscious', name: '潜意识剧场', icon: Dna, desc: '梦境与潜意识投射解析' },
  { id: 'collective', name: '集体镜像', icon: Users, desc: '集体无意识与共时性' },
];

export default function SoulLab() {
  const [mode, setMode] = useState('synastry');

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-center mb-10 w-full max-w-5xl">
        <div className="w-full overflow-x-auto hide-scrollbar pb-2 flex justify-start lg:justify-center px-4">
          <div className="flex p-1.5 bg-black/50 rounded-2xl md:rounded-full border border-[#C9A84C]/30 gap-2 shadow-[0_0_20px_rgba(201,168,76,0.1)] shrink-0">
            {LAB_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-4 md:px-6 py-2.5 rounded-xl md:rounded-full text-sm font-serif tracking-widest transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                  mode === m.id
                    ? 'bg-[#C9A84C] text-black shadow-[0_0_15px_rgba(201,168,76,0.4)] font-bold'
                    : 'text-[#E8DFB8]/60 hover:text-[#E8DFB8] hover:bg-[#C9A84C]/10'
                }`}
              >
                <m.icon className="w-4 h-4" />
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl transition-all duration-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {mode === 'synastry' && <SynastryApp />}
            {mode === 'shadow' && <ShadowWorkApp />}
            {mode === 'time' && <TimeWisdomApp />}
            {mode === 'subconscious' && <SubconsciousApp />}
            {mode === 'collective' && <CollectiveMirrorApp />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
