"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, RefreshCw, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";

import { CATEGORIES, SPREAD_MODES } from "./constants";
import { useAIStream } from "@/hooks/useAIStream";
import { useAIChat } from "@/hooks/useAIChat";
import { MODELS } from "@/lib/ai";
import { getTarotPrompt } from '@/lib/prompts';
import { getDailyTarotCards } from "@/lib/tarot-data";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAppStore } from "@/lib/store";
import BreathingLoading from "../BreathingLoading";

import { RitualLayout } from "./Visuals";

const TarotRitualManager = dynamic(() => import("./TarotRitualManager"), {
  loading: () => <BreathingLoading text="正在同步集体潜意识..." />
});
const TarotReadingResult = dynamic(() => import("./TarotReadingResult"), {
  loading: () => <BreathingLoading text="正在感应塔罗能量..." />
});

interface MysticTarotProps {
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export function MysticTarot({ initialHandoff, clearHandoff }: MysticTarotProps = {}) {
  const [step, setStep] = useState<"input" | "ritual" | "result">("input");
  const [question, setQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [selectedSpread, setSelectedSpread] = useState(SPREAD_MODES[0].id);
  const [cards, setCards] = useState<any[]>([]);
  const [reading, setReading] = useState("");
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const { messages, setMessages, sendMessage, isLoading: isChatLoading, error: chatError } = useAIChat({
    type: 'tarot',
    model: MODELS.PRO
  });
  const { addEntry, updateEntry } = useJourney();
  const { getProfileContext } = useUserProfile();
  const setHandoff = useAppStore((state: any) => state.setHandoff);

  useEffect(() => {
    if (initialHandoff) {
      const q = initialHandoff.question || initialHandoff.context;
      const m = initialHandoff.modeId;
      
      if (q) setQuestion(q);
      if (m && SPREAD_MODES.some(s => s.id === m)) {
        setSelectedSpread(m);
      }
      
      // Auto-trigger ritual if requested
      if (initialHandoff.autoTrigger && q && q.length > 2) {
        const targetSpread = SPREAD_MODES.find(s => s.id === (m || selectedSpread));
        if (targetSpread) {
          setCards(getDailyTarotCards(targetSpread.cardCount));
          setStep("ritual");
        }
      }
      clearHandoff?.();
    }
  }, [initialHandoff, clearHandoff, selectedSpread]);

  const handleStartRitual = () => {
    if (!question.trim()) return;
    const spread = SPREAD_MODES.find(s => s.id === selectedSpread);
    if (!spread) return;
    
    setCards(getDailyTarotCards(spread.cardCount));
    setStep("ritual");
  };

  const handleRitualComplete = async () => {
    setStep("result");
    const spread = SPREAD_MODES.find(s => s.id === selectedSpread);
    const category = CATEGORIES.find(c => c.id === selectedCategory);
    const cardNames = cards.map(c => `${c.name}${c.isReversed ? '(逆位)' : '(正位)'}`).join('、');
    const profileContext = getProfileContext();

    const prompt = getTarotPrompt({
      category,
      spread,
      cardNames,
      question,
      profileContext
    });

    try {
      const res = await sendMessage(prompt, {
        title: `塔罗：${question.substring(0, 20)}...`,
        details: {
          type: 'tarot',
          cards,
          spread: spread?.name,
          question
        }
      });
      if (res) setReading(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (userMsg: string) => {
    if (!currentEntryId || isChatLoading) return;

    try {
      // Pin the original context in the AI's "mind" by reinforcing the cards and question
      const contextPin = `[系统提醒：请始终基于本次占卜的问题“${question}”和牌面“${cards.map(c => c.name).join('、')}”进行回答。]`;
      const response = await sendMessage(`${contextPin}\n\n${userMsg}`);
      
      const updatedMessages = [
        ...messages, 
        { role: 'user' as const, content: userMsg }, 
        { role: 'model' as const, content: response }
      ];
      
      updateEntry(currentEntryId, { 
        details: { 
          type: 'tarot',
          text: response,
          cards,
          spread: SPREAD_MODES.find(s => s.id === selectedSpread)?.name,
          question, 
          messages: updatedMessages 
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReset = () => {
    setStep("input");
    setQuestion("");
    setReading("");
    setCards([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-0">
      <AnimatePresence mode="wait">
        {step === "input" && (
          <RitualLayout 
            title="开启塔罗之门" 
            subtitle="静心冥想，在阿卡夏记录中寻找你的答案"
          >
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 md:p-12 rounded-[40px] space-y-10 border-amber-500/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.3em]">1. 你的困惑</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="在此倾诉你内心的波澜..."
                    className="w-full h-48 bg-black/40 border border-white/5 rounded-[2rem] p-8 text-amber-100 placeholder-white/5 focus:ring-2 focus:ring-amber-500/30 transition-all resize-none font-serif text-lg leading-relaxed"
                  />
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.3em]">2. 咨询类别</label>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-6 py-3 rounded-full border text-xs font-serif tracking-widest transition-all ${
                            selectedCategory === cat.id 
                              ? "bg-amber-500/30 border-amber-500/60 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                              : "bg-white/5 border-white/5 text-amber-100/30 hover:bg-white/10"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.3em]">3. 选择牌阵</label>
                      <button 
                        onClick={() => setHandoff({ system: 'oracle', question })}
                        className="text-[10px] text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 font-serif tracking-widest"
                      >
                        <Sparkles className="w-3 h-3" /> 智能建议
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-4">
                      {SPREAD_MODES.map(spread => (
                        <button
                          key={spread.id}
                          onClick={() => setSelectedSpread(spread.id)}
                          className={`p-6 rounded-[1.5rem] border text-left transition-all relative group/card ${
                            selectedSpread === spread.id
                              ? "bg-amber-500/20 border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20"
                              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className={`text-base font-serif transition-colors ${selectedSpread === spread.id ? 'text-amber-100' : 'text-amber-100/50 group-hover/card:text-amber-100/80'}`}>{spread.name}</div>
                            <span className="text-[10px] font-mono text-amber-500/40">{spread.cardCount} 抽</span>
                          </div>
                          <div className="text-[10px] text-white/20 line-clamp-2 leading-relaxed group-hover/card:text-white/30 transition-colors">{spread.description}</div>
                          {selectedSpread === spread.id && (
                            <motion.div 
                              layoutId="active-spread"
                              className="absolute inset-0 border-2 border-amber-500/30 rounded-[1.5rem] pointer-events-none"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-10">
                <button
                  onClick={handleStartRitual}
                  disabled={!question.trim()}
                  className="px-20 py-5 bg-gradient-to-r from-amber-800 to-amber-950 text-amber-100 rounded-full font-serif tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_70px_rgba(180,110,20,0.3)] hover:scale-105 transition-all disabled:opacity-30 group uppercase text-sm"
                >
                  开启占卜仪式 <ChevronRight className="inline-block ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          </RitualLayout>
        )}

        {step === "ritual" && (
          <TarotRitualManager 
            cards={cards} 
            onComplete={handleRitualComplete} 
          />
        )}

        {step === "result" && (
          <TarotReadingResult 
            question={question}
            cards={cards}
            reading={reading}
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


