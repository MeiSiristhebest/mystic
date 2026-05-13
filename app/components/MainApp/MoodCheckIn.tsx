"use client";

import { motion } from "motion/react";

const moods = [
  { emoji: "✨", label: "充满灵感", value: "inspired" },
  { emoji: "🌙", label: "平静宁和", value: "calm" },
  { emoji: "🔥", label: "动力十足", value: "energetic" },
  { emoji: "🌧️", label: "略显忧郁", value: "melancholy" },
  { emoji: "🌀", label: "有些迷茫", value: "confused" },
  { emoji: "🌿", label: "正在疗愈", value: "healing" },
];

interface MoodCheckInProps {
  onSelect?: (mood: string) => void;
  selectedMood?: string;
}

export function MoodCheckIn({ onSelect, selectedMood }: MoodCheckInProps) {
  return (
    <div className="w-full">
      <h3 className="text-[10px] font-serif text-amber-200/30 mb-6 text-center tracking-[0.3em] uppercase">
        此刻你的灵魂处于何种频率？
      </h3>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-10">
        {moods.map((mood) => {
          const isActive = selectedMood === mood.value || selectedMood === mood.label;
          return (
            <button
              key={mood.value}
              onClick={() => onSelect?.(mood.value)}
              className={`flex flex-col items-center gap-3 group transition-all active:scale-95 ${isActive ? 'scale-110' : ''}`}
              style={{ width: 'calc(33.33% - 1.5rem)', minWidth: '70px', maxWidth: '100px' }}
            >
              <motion.div
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className={`w-14 h-14 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl transition-all duration-500 ${
                  isActive 
                    ? "bg-amber-500/30 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.3)]" 
                    : "bg-white/5 border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/40"
                }`}
              >
                <span className="drop-shadow-lg">{mood.emoji}</span>
              </motion.div>
              <span className={`text-[10px] md:text-xs font-serif tracking-[0.1em] transition-colors text-center w-full whitespace-nowrap ${
                isActive ? "text-amber-200 font-bold" : "text-amber-100/40 group-hover:text-amber-200"
              }`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
