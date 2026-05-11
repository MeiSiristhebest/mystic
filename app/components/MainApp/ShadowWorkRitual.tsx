"use client";

import { motion } from "motion/react";
import { Ghost, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function ShadowWorkRitual({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage < 3) setStage(s => s + 1);
      else onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  const messages = [
    "正在映照深层阴影...",
    "直面被压抑的情绪...",
    "整合真实的自我碎片...",
    "灵魂光影调和中..."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
      <div className="relative w-48 h-48">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black rounded-full border border-zinc-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Ghost className="w-16 h-16 text-zinc-500/40" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-xl font-serif text-zinc-400 tracking-[0.4em] uppercase">
          {messages[stage]}
        </h3>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-500 ${i === stage ? 'bg-zinc-400 scale-125 shadow-[0_0_8px_white]' : 'bg-zinc-800'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
