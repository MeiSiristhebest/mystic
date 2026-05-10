"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

export function MoodCheckIn() {
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [words, setWords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = profile.emotionalBaseline?.some((e: any) => e.date === today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!words.trim()) return;

    setIsSubmitting(true);
    const wordList = words.split(/[,，\s]+/).filter(w => w.trim());
    
    const newBaseline = [...(profile.emotionalBaseline || [])];
    const todayIndex = newBaseline.findIndex(e => e.date === today);
    
    if (todayIndex >= 0) {
      newBaseline[todayIndex].words = [...new Set([...newBaseline[todayIndex].words, ...wordList])];
    } else {
      newBaseline.push({ date: today, words: wordList });
    }

    updateProfile({ emotionalBaseline: newBaseline });
    setWords("");
    setIsSubmitting(false);
  };

  if (hasCheckedInToday && !words) {
    return (
      <div className="text-center p-4 border border-[#C9A84C]/20 rounded-xl bg-[#C9A84C]/5">
        <p className="text-sm text-[#C9A84C]">今日情绪已记录，能量正在流转。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-[#E8DFB8]/60 font-serif">记录当下的情绪词汇（用空格或逗号分隔），它们将化作你的灵魂能量：</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          placeholder="例如：平静 期待 焦虑..."
          className="flex-1 bg-black/40 border border-[#C9A84C]/20 rounded-lg px-4 py-2 text-sm text-[#E8DFB8] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting || !words.trim()}
          className="px-4 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded-lg text-sm hover:bg-[#C9A84C]/30 transition-colors disabled:opacity-50"
        >
          注入能量
        </button>
      </div>
    </form>
  );
}
