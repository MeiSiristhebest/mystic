import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import { SPREAD_MODES, CATEGORIES } from "./constants";
import { generateContent, AKASHA_PERSONA, MODELS } from "@/lib/ai";
import { SoulCard } from "./TarotComponents";
import { useTarotDeck } from "@/hooks/useTarotDeck";
import { useTarotReading } from "@/hooks/useTarotReading";
import { TarotRitualManager } from "./TarotRitualManager";
import { TarotReadingResult } from "./TarotReadingResult";
import { handleGeneratePoster } from "@/lib/utils";

interface MysticTarotProps {
  initialHandoff?: any;
}

export default function MysticTarot({ initialHandoff }: MysticTarotProps) {
  // UI States
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [mode, setMode] = useState(SPREAD_MODES[1].id);
  const [question, setQuestion] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [recommendError, setRecommendError] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const soulCardRef = useRef<HTMLDivElement>(null);
  const soulCardFullRef = useRef<HTMLDivElement>(null);

  // Custom Hooks
  const {
    deckCards, isShuffling, selectedIndices, isSelectingCards,
    drawnCards, revealedCards, startShuffle, selectCard,
    revealCard, resetDeck, revealAll
  } = useTarotDeck();

  const {
    messages, isReading, isAskingFollowUp, isSocraticMode, setIsSocraticMode,
    soulMotto, currentEntryId, generateReading, handleFollowUp, abort, onReset: resetReading
  } = useTarotReading();

  const currentMode = useMemo(() => SPREAD_MODES.find((m) => m.id === mode) || SPREAD_MODES[1], [mode]);

  // Derived Step
  const step = useMemo(() => {
    if (messages.length > 0) return 'reading';
    if (drawnCards.length > 0) return 'revealing';
    if (isSelectingCards) return 'selecting';
    if (isShuffling) return 'shuffling';
    return 'input';
  }, [messages, drawnCards, isSelectingCards, isShuffling]);

  // Handlers
  const onStartShuffle = () => {
    if (!question.trim()) return;
    startShuffle();
  };

  const onSelectCard = (index: number) => selectCard(index, currentMode.cardCount);

  const handleRecommendMode = async () => {
    if (!question.trim()) {
      setRecommendError("请先输入您的疑问，我才能为您推荐最合适的牌阵。");
      return;
    }
    setRecommendError("");
    setIsRecommending(true);
    try {
      const prompt = `
      你是一位资深塔罗占卜大师。用户提出了一个问题："${question}"。
      请根据这个问题，从以下分类和牌阵中，推荐最合适的一个分类和一个牌阵。

      分类列表：
      ${CATEGORIES.map((c) => `${c.id} (${c.name})`).join(", ")}

      牌阵列表：
      ${SPREAD_MODES.map((m) => `${m.id} (${m.name}: ${m.description})`).join("\n")}
      `;

      const text = await generateContent(prompt, AKASHA_PERSONA, {
        model: MODELS.LITE,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            categoryId: { type: "STRING" },
            modeId: { type: "STRING" },
          },
          required: ["categoryId", "modeId"],
        },
      });
      const result = JSON.parse(text || "{}");
      if (result.categoryId && CATEGORIES.some((c) => c.id === result.categoryId)) {
        setCategory(result.categoryId);
      }
      if (result.modeId && SPREAD_MODES.some((m) => m.id === result.modeId)) {
        setMode(result.modeId);
      }
    } catch (error) {
      console.error("推荐失败:", error);
      setRecommendError("感应中断，请尝试手动选择。");
    } finally {
      setIsRecommending(false);
    }
  };

  const onReset = () => {
    resetDeck();
    setQuestion("");
    setShowExportOptions(false);
    setFollowUpText("");
    // We don't reset entries, just the UI view
    window.location.reload(); // Hard reset for clean ritual state
  };

  const onShare = () => setShowExportOptions(true);

  // Auto-generate reading when all cards revealed
  useEffect(() => {
    if (drawnCards.length > 0 && revealedCards.every(r => r) && messages.length === 0 && !isReading) {
      generateReading(drawnCards, mode, category, question, zodiacSign);
    }
  }, [revealedCards, drawnCards, isReading, messages.length, generateReading, mode, category, question, zodiacSign]);

  // Handoff Logic
  useEffect(() => {
    if (initialHandoff && initialHandoff.system === 'tarot') {
      setQuestion(initialHandoff.question || "");
      if (initialHandoff.mode) setMode(initialHandoff.mode);
    }
  }, [initialHandoff]);

  return (
    <div className="min-h-[80vh] flex flex-col pt-12 relative overflow-hidden">
      {/* Configuration Header - Only shown in input phase */}
      {step === 'input' && (
        <div className="max-w-6xl mx-auto w-full px-4 mb-12 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-6 py-2 rounded-full text-xs transition-all tracking-widest ${
                    category === c.id ? "bg-mystic-gold text-mystic-void font-bold shadow-lg" : "text-mystic-ink/60 hover:text-mystic-gold"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar snap-x"
            >
              {SPREAD_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-shrink-0 w-64 p-6 rounded-2xl border transition-all text-left snap-start ${
                    mode === m.id ? "glass-panel-heavy border-mystic-gold shadow-gold" : "glass-panel border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-widest ${mode === m.id ? 'text-mystic-gold' : 'text-mystic-ink/40'}`}>
                      {m.cardCount} Cards
                    </span>
                    {mode === m.id && <Wand2 className="w-4 h-4 text-mystic-gold animate-pulse" />}
                  </div>
                  <h3 className="text-mystic-ink font-serif text-lg mb-2">{m.name}</h3>
                  <p className="text-mystic-ink/40 text-xs leading-relaxed">{m.description}</p>
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 -ml-5"
            >
              <ChevronLeft className="w-6 h-6 text-mystic-gold" />
            </button>
            <button 
              onClick={() => {
                if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 -mr-5"
            >
              <ChevronRight className="w-6 h-6 text-mystic-gold" />
            </button>
          </div>
        </div>
      )}

      {/* Main Orchestrator */}
      <div className="flex-1 w-full px-4">
        {step !== 'reading' ? (
          <TarotRitualManager 
            step={step as any}
            question={question}
            setQuestion={setQuestion}
            isRecommending={isRecommending}
            recommendError={recommendError}
            handleRecommendMode={handleRecommendMode}
            startShuffle={onStartShuffle}
            isShuffling={isShuffling}
            deckCards={deckCards}
            selectedIndices={selectedIndices}
            selectCard={onSelectCard}
            drawnCards={drawnCards}
            revealedCards={revealedCards}
            revealCard={revealCard}
            cardCount={currentMode.cardCount}
            modeName={currentMode.name}
          />
        ) : (
          <TarotReadingResult 
            messages={messages}
            isReading={isReading}
            soulMotto={soulMotto}
            isAskingFollowUp={isAskingFollowUp}
            followUpText={followUpText}
            setFollowUpText={setFollowUpText}
            onFollowUp={() => handleFollowUp(followUpText, drawnCards, currentMode.name)}
            onReset={onReset}
            onShare={onShare}
            isSocraticMode={isSocraticMode}
            setIsSocraticMode={setIsSocraticMode}
          />
        )}
      </div>

      {/* Modals & Export Components */}
      {showExportOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel-heavy rounded-3xl p-8 max-w-sm w-full space-y-6"
          >
            <h3 className="text-xl font-serif text-mystic-gold text-center">选择导出格式</h3>
            <div className="grid gap-4">
              <button
                onClick={() => handleGeneratePoster(soulCardRef.current!, `soul-card-${mode}.jpg`)}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-mystic-gold hover:text-mystic-void transition-all font-bold"
              >
                生成灵魂卡 (精简)
              </button>
              <button
                onClick={() => handleGeneratePoster(soulCardFullRef.current!, `soul-full-${mode}.jpg`)}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-mystic-gold hover:text-mystic-void transition-all font-bold"
              >
                生成全景海报 (包含解读)
              </button>
              <button
                onClick={() => setShowExportOptions(false)}
                className="w-full py-2 text-mystic-ink/40 text-sm"
              >
                取消
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Off-screen Export DOM */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div ref={soulCardRef}>
          <SoulCard 
            question={question} 
            cards={drawnCards} 
            motto={soulMotto} 
            date={new Date().toLocaleDateString()} 
          />
        </div>
        <div ref={soulCardFullRef}>
          <SoulCard 
            question={question} 
            cards={drawnCards} 
            motto={soulMotto} 
            date={new Date().toLocaleDateString()} 
            fullReading={messages.map(m => m.content).join('\n\n')} 
          />
        </div>
      </div>
    </div>
  );
}
