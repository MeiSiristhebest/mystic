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

export function MoodCheckIn({ onSelect }: { onSelect?: (mood: string) => void }) {
  return (
    <div className="w-full max-w-2xl mx-auto p-8 glass-panel rounded-3xl border border-white/5">
      <h3 className="text-xl font-serif text-amber-200/80 mb-8 text-center tracking-widest">
        此刻你的灵魂处于何种频率？
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onSelect?.(mood.value)}
            className="flex flex-col items-center gap-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-500"
            >
              {mood.emoji}
            </motion.div>
            <span className="text-[10px] font-serif text-amber-100/40 tracking-widest group-hover:text-amber-200 transition-colors">
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
