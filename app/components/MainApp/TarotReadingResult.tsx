"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { MessageSquare, Send, RefreshCw, Download, Sparkles } from "lucide-react";
import MysticMarkdown from "../MysticMarkdown";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import BreathingLoading from "../BreathingLoading";

interface TarotReadingResultProps {
  question: string;
  cards: any[];
  reading: string;
  messages: any[];
  isLoading: boolean;
  onSendMessage: (msg: string) => void;
  onReset: () => void;
}

export default function TarotReadingResult({
  question,
  cards,
  reading,
  messages,
  isLoading,
  onSendMessage,
  onReset
}: TarotReadingResultProps) {
  const [inputMessage, setInputMessage] = useState("");
  const posterRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  useEffect(() => {
    if (messages.length > 2) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      <div 
        ref={posterRef}
        className="glass-panel p-8 md:p-16 rounded-[40px] relative overflow-hidden shadow-[0_0_50px_rgba(180,110,20,0.1)]"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Sparkles className="w-64 h-64 text-amber-500" />
        </div>

        <div className="relative z-10 text-center mb-16 space-y-4">
          <p className="text-xs font-serif text-amber-500/60 uppercase tracking-[0.4em]">询问之事</p>
          <h2 className="text-2xl md:text-3xl font-serif text-amber-100 italic tracking-wide">&quot;{question}&quot;</h2>
        </div>

        <div className="relative z-10 space-y-12">
          {/* Initial Reading */}
          <MysticMarkdown content={reading} cards={cards} centered />

          {/* Follow-up Messages */}
          {messages.slice(1).map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-center'}`}
            >
              {msg.role === 'user' ? (
                <div 
                  className="max-w-[95%] md:max-w-[80%] rounded-[2.5rem] p-7 md:p-8 bg-gradient-to-br from-[#2a170d]/90 to-[#180c06]/90 border border-[#d97706]/40 text-[#fef3c7] shadow-[0_15px_35px_rgba(217,119,6,0.15)] backdrop-blur-md relative"
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#d97706]/20 text-[#d97706] text-xs font-mono tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#d97706] animate-ping" />
                    <span>👤 觉察者 · SEEKER</span>
                  </div>
                  <p className="font-serif text-base md:text-lg leading-relaxed text-justify">{msg.content}</p>
                </div>
              ) : (
                <div 
                  className="max-w-[100%] md:max-w-[95%] rounded-[3rem] p-8 md:p-12 bg-gradient-to-br from-[#0c0617]/95 via-[#080310]/95 to-[#06020a]/95 border border-[#C9A84C]/40 text-[#E8DFB8] shadow-[0_20px_50px_rgba(201,168,76,0.2)] backdrop-blur-xl relative overflow-hidden w-full"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 font-serif text-6xl text-[#C9A84C] select-none pointer-events-none">🌌</div>
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#C9A84C]/20 text-[#C9A84C] text-xs font-mono tracking-[0.4em] uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#C9A84C] shadow-[0_0_10px_#C9A84C] animate-pulse" />
                    <span>🌌 阿卡夏神谕 · AKASHA CHRONICLE</span>
                  </div>
                  <MysticMarkdown content={msg.content} isLoading={isLoading && idx === messages.length - 3} />
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <BreathingLoading text="阿卡夏正在传达深层启示..." />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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

      {/* Deep Dive Input Area */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/20">
        <form onSubmit={handleSend} className="relative flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="对此解读有何疑惑？开启深潜模式..."
              disabled={isLoading}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-amber-100 placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-all font-serif"
            />
            <MessageSquare className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl transition-all shadow-lg shadow-amber-900/20 disabled:opacity-30"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
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
      </div>
    </div>
  );
}
