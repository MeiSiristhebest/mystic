"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles, X, Compass, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function HandoffBanner() {
  const handoff = useAppStore((state: any) => state.handoff);
  const setHandoff = useAppStore((state: any) => state.setHandoff);

  if (!handoff || (!handoff.question && !handoff.context && !handoff.prefillQuestion)) {
    return null;
  }

  const carriedText = handoff.question || handoff.prefillQuestion || handoff.context;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="mb-8 p-4 md:p-5 rounded-2xl obsidian-glass border border-[#C9A84C]/40 shadow-[0_10px_30px_rgba(201,168,76,0.15)] relative overflow-hidden flex items-center justify-between gap-4"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 via-transparent to-[#C9A84C]/5 pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] shrink-0 animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-[#C9A84C] uppercase font-bold">
            <span>✦ 承接心念脉络 · 意图已就绪 ✦</span>
          </div>
          <p className="text-xs md:text-sm font-serif text-[#E8DFB8] line-clamp-1 italic">
            &ldquo;{carriedText}&rdquo;
          </p>
        </div>
      </div>

      <button
        onClick={() => setHandoff(null)}
        className="p-1.5 rounded-full text-[#C9A84C]/60 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors relative z-10 cursor-pointer"
        title="清除联动意图"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
