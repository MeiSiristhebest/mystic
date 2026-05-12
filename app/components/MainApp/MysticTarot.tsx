"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

import { CATEGORIES, SPREAD_MODES } from "./constants";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA, MODELS } from "@/lib/ai";
import { getDailyTarotCards } from "@/lib/tarot-data";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAppStore } from "@/lib/store";
import BreathingLoading from "../BreathingLoading";

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

  const { stream, isLoading: isStreaming, abort } = useAIStream({ model: MODELS.PRO });
  const { addEntry } = useJourney();
  const { getProfileContext } = useUserProfile();
  const setHandoff = useAppStore((state: any) => state.setHandoff);

  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        const q = initialHandoff.question || initialHandoff.context;
        const m = initialHandoff.modeId;
        
        if (q) setQuestion(q);
        if (m) setSelectedSpread(m);
        
        // Auto-trigger if we have a full question
        if (q && q.length > 5) {
          const spread = SPREAD_MODES.find(s => s.id === (m || selectedSpread));
          if (spread) {
            setCards(getDailyTarotCards(spread.cardCount));
            setStep("ritual");
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
    
    setCards(getDailyTarotCards(spread.cardCount));
    setStep("ritual");
  };

  const handleRitualComplete = async () => {
    setStep("result");
    const spread = SPREAD_MODES.find(s => s.id === selectedSpread);
    const category = CATEGORIES.find(c => c.id === selectedCategory);
    const cardNames = cards.map(c => `${c.name}${c.isReversed ? '(逆位)' : '(正位)'}`).join('、');
    const profileContext = getProfileContext();

    const prompt = `
<instruction>
这是一次正式的塔罗占卜。你是阿卡夏记录的引导者。
用户的问题：${question}
咨询类别：${category?.name}
牌阵：${spread?.name}（${spread?.positions.join('、')}）
抽到的牌：${cardNames}
请结合以上信息，为用户提供一份深刻、专业且具有启发性的解读报告。</instruction>

<user_profile>
${profileContext}
</user_profile>

<output_format>
请使用Markdown格式，包含：
## ☯️ 牌阵解析
## 🔍 深度解读
## 🌟 灵魂指引
[SOUL_MOTTO]一句今日格言[/SOUL_MOTTO]
</output_format>
    `;

    let fullResponse = "";
    for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
      fullResponse += chunk;
      setReading(fullResponse);
    }

    // Save to Journey
    const id = await addEntry({
      type: "tarot",
      title: `塔罗：${question.substring(0, 20)}...`,
      summary: fullResponse.substring(0, 100) + "...",
      details: {
        type: 'tarot',
        text: fullResponse,
        cards,
        spread: spread?.name,
        question,
        messages: [{ role: 'model', content: fullResponse }]
      }
    });
    setCurrentEntryId(id || null);
  };

  const handleReset = () => {
    abort();
    setStep("input");
    setQuestion("");
    setReading("");
    setCards([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-0">
      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-8 md:p-12 rounded-3xl space-y-10"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/10">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-3xl font-serif text-amber-100 tracking-widest">开启塔罗之门</h2>
              <p className="text-amber-200/40 font-serif text-sm">静心冥想，在阿卡夏记录中寻找你的答案</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.2em]">1. 你的困惑</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例如：我最近的事业发展如何？我该如何处理这段感情？"
                  className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-amber-100 placeholder-white/5 focus:ring-2 focus:ring-amber-500/30 transition-all resize-none font-serif"
                />
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.2em]">2. 咨询类别</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full border text-xs font-serif tracking-widest transition-all ${
                          selectedCategory === cat.id 
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-200" 
                            : "bg-white/5 border-white/5 text-amber-100/40 hover:bg-white/10"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-serif text-amber-500/60 uppercase tracking-[0.2em]">3. 选择牌阵</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SPREAD_MODES.slice(0, 4).map(spread => (
                      <button
                        key={spread.id}
                        onClick={() => setSelectedSpread(spread.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedSpread === spread.id
                            ? "bg-amber-500/10 border-amber-500/40"
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className={`text-sm font-serif mb-1 ${selectedSpread === spread.id ? 'text-amber-200' : 'text-amber-100/60'}`}>{spread.name}</div>
                        <div className="text-[10px] text-white/20 line-clamp-1">{spread.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={handleStartRitual}
                disabled={!question.trim()}
                className="px-16 py-4 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 rounded-full font-serif tracking-[0.3em] shadow-[0_0_30px_rgba(180,110,20,0.3)] hover:shadow-[0_0_50px_rgba(180,110,20,0.5)] transition-all disabled:opacity-30 group"
              >
                开启占卜仪式 <ChevronRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
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
            isStreaming={isStreaming}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
