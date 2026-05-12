'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Download, RefreshCw } from 'lucide-react';

interface RitualLayoutProps {
  title: string;
  subtitle?: string;
  onReset: () => void;
  onShare: () => void;
  isGeneratingPoster: boolean;
  isResultsVisible: boolean;
  children: React.ReactNode;
  posterRef: React.RefObject<HTMLDivElement | null>;
  resetLabel?: string;
}

export default function RitualLayout({
  title,
  subtitle,
  onReset,
  onShare,
  isGeneratingPoster,
  isResultsVisible,
  children,
  posterRef,
  resetLabel = "重新开始"
}: RitualLayoutProps) {
  return (
    <div className="w-full flex flex-col items-center">
      {!isResultsVisible ? (
        <>{children}</>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl relative"
        >
          <div
            ref={posterRef}
            data-poster-container
            className="w-full glass-panel p-8 md:p-12 rounded-3xl relative pb-8"
          >
            {/* Poster Header (Only visible in screenshot) */}
            <div className="hidden show-in-poster w-full text-center mb-8 pt-4">
              <h2 className="text-4xl font-serif text-amber-400 mb-4 tracking-widest">
                阿卡夏之窗 · {title}
              </h2>
              {subtitle && (
                <p className="text-amber-500/80 text-lg italic">
                  &quot;{subtitle}&quot;
                </p>
              )}
            </div>

            {/* Content Area */}
            {children}

            {/* Poster Footer (Only visible in screenshot) */}
            <div className="hidden show-in-poster w-full text-center mt-12 pt-8 border-t border-amber-500/20">
              <div className="flex items-center justify-center gap-2 text-amber-500/60 mb-2">
                <Sparkles size={16} />
                <span className="font-serif tracking-widest text-sm">阿卡夏之窗 AI 命理</span>
                <Sparkles size={16} />
              </div>
              <p className="text-xs text-amber-500/40 font-mono">
                {new Date().toLocaleDateString()} · 仅供娱乐与自我探索
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 hide-in-poster">
            <button
              onClick={onReset}
              className="px-6 py-2 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full font-serif transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              {resetLabel}
            </button>
            <button
              onClick={onShare}
              disabled={isGeneratingPoster}
              className="glass-button px-6 py-2 text-amber-200 rounded-full font-serif hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Download size={16} className={isGeneratingPoster ? "animate-bounce" : ""} />
              {isGeneratingPoster ? "生成中..." : "生成分享海报"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
