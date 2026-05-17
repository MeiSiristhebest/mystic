"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, RefreshCw, ChevronRight, ChevronLeft, Layers } from "lucide-react";
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
import { playMysticChime, triggerHapticVibration } from "@/lib/audio";
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
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollBy = (offset: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const { messages, setMessages, sendMessage, isLoading: isChatLoading, error: chatError } = useAIChat({
    type: 'tarot',
    model: MODELS.PRO
  });
  const { addEntry, updateEntry } = useJourney();
  const { getProfileContext } = useUserProfile();
  const setHandoff = useAppStore((state: any) => state.setHandoff);

  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        const q = initialHandoff.prefillQuestion || initialHandoff.question || initialHandoff.context;
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
            playMysticChime();
            triggerHapticVibration();
          }
        }
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff, selectedSpread]);

  const handleStartRitual = () => {
    if (!question.trim()) return;
    const spread = SPREAD_MODES.find(s => s.id === selectedSpread);
    if (!spread) return;
    
    playMysticChime();
    triggerHapticVibration();

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
      }, undefined, question || "开启塔罗牌阵解读");
      if (res) setReading(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (userMsg: string) => {
    if (!currentEntryId || isChatLoading) return;

    try {
      const contextPin = `[系统提醒：请始终基于本次占卜的问题“${question}”和牌面“${cards.map(c => c.name).join('、')}”进行回答。]`;
      await sendMessage(`${contextPin}\n\n${userMsg}`, undefined, undefined, userMsg);
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
              className="glass-panel p-8 md:p-12 rounded-[40px] space-y-12 border-amber-500/20 max-w-6xl w-full mx-auto overflow-hidden"
            >
              {/* 上半部分：困惑倾诉与类别选择并列 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-4">
                  <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.3em]">1. 你的困惑</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="在此倾诉你内心的波澜..."
                    className="w-full h-40 bg-black/40 border border-white/5 rounded-[2rem] p-6 text-amber-100 placeholder-white/5 focus:ring-2 focus:ring-amber-500/30 transition-all resize-none font-serif text-lg leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.3em]">2. 咨询类别</label>
                  <div className="flex flex-wrap gap-2.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-5 py-3 rounded-full border text-xs font-serif tracking-widest transition-all ${
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
              </div>

              {/* 下半部分：贯穿屏幕的横向牌阵走廊 */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.3em]">3. 选择牌阵</label>
                  <button 
                    onClick={() => setHandoff({ system: 'oracle', question })}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2 font-serif tracking-widest px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-full hover:bg-amber-500/20 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" /> 唤醒全知向导匹配
                  </button>
                </div>

                <div className="relative group/carousel py-2">
                  {/* 悬浮在卡牌走廊左侧中央的控制键 */}
                  <button 
                    onClick={() => scrollBy(-320)} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-6 z-20 w-12 h-12 rounded-full bg-[#0A070C] border-2 border-amber-500/40 hover:border-amber-500 text-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.95)] hover:scale-110 hover:bg-black transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div ref={carouselRef} className="flex overflow-x-auto gap-6 pb-6 pt-2 px-4 custom-scrollbar snap-x scroll-smooth">
                    {SPREAD_MODES.map(spread => (
                      <button
                        key={spread.id}
                        onClick={() => setSelectedSpread(spread.id)}
                        className={`w-[280px] min-h-[310px] shrink-0 snap-center rounded-[2.5rem] p-7 flex flex-col justify-between text-left transition-all duration-500 group relative border backdrop-blur-md cursor-pointer ${
                          selectedSpread === spread.id
                            ? "bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-black/60 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40 -translate-y-2"
                            : "bg-black/50 border-white/10 hover:border-amber-500/40 hover:bg-black/70 hover:-translate-y-1"
                        }`}
                      >
                        {/* 卡片头部：图标与药丸 */}
                        <div className="flex justify-between items-center mb-6">
                          <div className={`p-3 rounded-2xl border transition-colors ${selectedSpread === spread.id ? 'bg-amber-500/30 border-amber-500/60 text-amber-300' : 'bg-white/5 border-white/10 text-white/40 group-hover:text-amber-500/60'}`}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-serif tracking-wider transition-colors ${selectedSpread === spread.id ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'border border-amber-500/30 text-amber-200/50 group-hover:border-amber-500/60 group-hover:text-amber-200'}`}>
                            {spread.cardCount} 张牌
                          </span>
                        </div>

                        {/* 卡片中段：标题与描述 */}
                        <div className="space-y-3 my-auto py-4">
                          <h4 className={`text-xl font-serif tracking-wide transition-colors ${selectedSpread === spread.id ? 'text-amber-100 font-bold' : 'text-amber-100/70 group-hover:text-amber-100'}`}>{spread.name}</h4>
                          <p className="text-xs text-white/40 line-clamp-3 leading-relaxed font-serif group-hover:text-white/60 transition-colors">{spread.description}</p>
                        </div>

                        {/* 卡片底部：牌面框示意图 */}
                        <div className="pt-4 border-t border-white/10 mt-6 flex gap-1.5 items-center justify-start opacity-50 group-hover:opacity-90 transition-opacity">
                          {Array.from({ length: Math.min(5, spread.cardCount) }).map((_, i) => (
                            <div key={i} className={`w-3.5 h-5 rounded border ${selectedSpread === spread.id ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'border-amber-500/30 bg-white/5'}`} />
                          ))}
                          {spread.cardCount > 5 && <span className="text-[10px] text-amber-500/60 ml-1 font-mono font-bold">+{spread.cardCount - 5}</span>}
                        </div>

                        {selectedSpread === spread.id && (
                          <motion.div 
                            layoutId="active-spread"
                            className="absolute inset-0 border-2 border-amber-500/40 rounded-[2.5rem] pointer-events-none"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 悬浮在卡牌走廊右侧中央的控制键 */}
                  <button 
                    onClick={() => scrollBy(320)} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-6 z-20 w-12 h-12 rounded-full bg-[#0A070C] border-2 border-amber-500/40 hover:border-amber-500 text-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.95)] hover:scale-110 hover:bg-black transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-8 border-t border-white/5">
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
            reading={reading || (messages.length > 0 ? messages[0].content : "")}
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


