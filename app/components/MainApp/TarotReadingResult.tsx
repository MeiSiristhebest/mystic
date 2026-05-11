"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import MysticMarkdown from "../MysticMarkdown";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";

interface TarotReadingResultProps {
  question: string;
  cards: any[];
  reading: string;
  isStreaming: boolean;
  onReset: () => void;
}

export default function TarotReadingResult({
  question,
  cards,
  reading,
  isStreaming,
  onReset
}: TarotReadingResultProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();

  return (
    <div className="space-y-12 pb-20">
      <div 
        ref={posterRef}
        className="glass-panel p-8 md:p-16 rounded-[40px] relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Sparkles className="w-64 h-64 text-amber-500" />
        </div>

        {/* Question Header */}
        <div className="relative z-10 text-center mb-16 space-y-4">
          <p className="text-xs font-serif text-amber-500/60 uppercase tracking-[0.4em]">询问之事</p>
          <h2 className="text-2xl md:text-3xl font-serif text-amber-100 italic tracking-wide">&quot;{question}&quot;</h2>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <MysticMarkdown content={reading} cards={cards} />
          
          {isStreaming && (
            <div className="flex items-center gap-3 mt-8 justify-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              <p className="text-sm font-serif text-amber-200/40 tracking-widest italic">阿卡夏正在传达深层启示...</p>
            </div>
          )}
        </div>

        {/* Poster Branding */}
        <div className="hidden show-in-poster mt-20 pt-12 border-t border-amber-500/20 text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
             <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/40" />
             <span className="font-serif tracking-[0.3em] text-amber-500/60 text-sm">阿卡夏之窗 · 塔罗占卜</span>
             <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
          <p className="text-[10px] text-amber-500/30 font-mono tracking-widest uppercase">
            {new Date().toLocaleDateString()} · Akasha AI Oracle
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {!isStreaming && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button
            onClick={onReset}
            className="px-10 py-4 border border-amber-500/20 text-amber-500 hover:bg-amber-500/10 rounded-full font-serif tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重起一卦
          </button>
          <button
            onClick={() => handleGeneratePoster(posterRef.current, `tarot-${Date.now()}.jpg`)}
            disabled={isGeneratingPoster}
            className="px-10 py-4 bg-amber-600 text-white rounded-full font-serif tracking-widest shadow-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPoster ? "生成中..." : "保存分享海报"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
