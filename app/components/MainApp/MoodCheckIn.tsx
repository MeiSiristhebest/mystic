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
    <div className="w-full mt-6">
      <div className="p-4 md:p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
        <h3 className="text-xs md:text-sm font-serif text-amber-200/60 mb-6 text-center tracking-widest uppercase">
          此刻你的灵魂处于何种频率？
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => onSelect?.(mood.value)}
              className="flex flex-col items-center gap-2 group"
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl md:text-2xl group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-300"
              >
                {mood.emoji}
              </motion.div>
              <span className="text-[8px] md:text-[10px] font-serif text-amber-100/30 tracking-wider group-hover:text-amber-200 transition-colors text-center leading-tight">
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
