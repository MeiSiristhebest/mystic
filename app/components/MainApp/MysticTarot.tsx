"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Moon,
  Sun,
  Star,
  Layers,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Download,
} from "lucide-react";
import Image from "next/image";
import {
  generateDeck,
  shuffleDeck,
  TarotCard as TarotCardType,
} from "@/lib/tarot-data";
import MysticMarkdown from "../MysticMarkdown";
import SoulCard from "../SoulCard";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { useAIStream } from "@/hooks/useAIStream";
import { AKASHA_PERSONA, SOCRATIC_PERSONA, generateContent } from "@/lib/ai";
import { playCardSound } from "@/lib/audio";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";
import { CATEGORIES, SPREAD_MODES } from "./constants";
import { MysticImage } from "./MysticImage";
import BreathingLoading from "../BreathingLoading";
import { useAppStore } from "@/lib/store";
import { TarotCardView, CardMeaningModal, SpreadLayoutRenderer, AmbientCosmicBackground } from "./TarotComponents";
import { HandoffData } from "./OmniOracleGuide";

export function MysticTarot({ initialHandoff, clearHandoff }: { initialHandoff?: HandoffData | null, clearHandoff?: () => void }) {
  const { getProfileContext } = useUserProfile();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general");
  const [mode, setMode] = useState("time");
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isSelectingCards, setIsSelectingCards] = useState(false);
  const [deckCards, setDeckCards] = useState<TarotCardType[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<TarotCardType[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [zodiacSign, setZodiacSign] = useState("");
  const [recommendError, setRecommendError] = useState("");
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [cardMeaningsCache, setCardMeaningsCache] = useState<Record<string, string>>({});
  
  const [soulMotto, setSoulMotto] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const soulCardRef = useRef<HTMLDivElement>(null);
  const soulCardFullRef = useRef<HTMLDivElement>(null);

  const { addEntry, updateEntry } = useJourney();
  const { stream, isLoading: isReading, error: streamError, abort } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [isSocraticMode, setIsSocraticMode] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const currentMode = SPREAD_MODES.find((m) => m.id === mode) || SPREAD_MODES[1];

  const onGeneratePosterSimple = async () => {
    if (!soulCardRef.current) return;
    setShowExportOptions(false);
    handleGeneratePoster(soulCardRef.current, `soul-card-simple-${mode}.jpg`);
  };

  const onGeneratePosterFull = async () => {
    if (!soulCardFullRef.current) return;
    setShowExportOptions(false);
    handleGeneratePoster(soulCardFullRef.current, `soul-card-full-${mode}.jpg`);
  };

  const [followUpText, setFollowUpText] = useState("");

  const onFollowUp = async () => {
    if (!followUpText.trim()) return;
    const text = followUpText.trim();
    setFollowUpText("");
    await handleFollowUp(text);
  };

  const onReset = () => {
    setDrawnCards([]);
    setQuestion("");
    setMessages([]);
    setCurrentEntryId(null);
    abort();
  };

  const [prevHandoff, setPrevHandoff] = useState<any>(null);

  // Sync state when handoff data is received
  if (initialHandoff && initialHandoff.system === 'tarot' && initialHandoff !== prevHandoff) {
    setQuestion(initialHandoff.question || "");
    if (initialHandoff.modeId && SPREAD_MODES.some(m => m.id === initialHandoff.modeId)) {
      setMode(initialHandoff.modeId);
    }
    setPrevHandoff(initialHandoff);
    
    // Auto trigger draw cards after a brief delay
    setTimeout(() => {
      handleDrawCards();
      if (clearHandoff) clearHandoff();
    }, 500);
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 256;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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

      请仅返回一个JSON对象，包含 'categoryId' 和 'modeId' 两个字段。不要包含任何其他文本。
      `;
      const text = await generateContent(prompt, AKASHA_PERSONA, {
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
      console.error("推荐牌阵失败:", error);
      setRecommendError("推荐牌阵失败，请稍后再试或手动选择。");
    } finally {
      setIsRecommending(false);
    }
  };

  const handleDrawCards = useCallback(() => {
    if (isShuffling) return;
    setIsShuffling(true);
    setDrawnCards([]);
    setDeckCards([]);
    setSelectedIndices([]);
    setMessages([]);
    
    setTimeout(() => {
      const deck = shuffleDeck(generateDeck());
      setDeckCards(deck);
      setIsShuffling(false);
      setIsSelectingCards(true);
    }, 3500);
  }, [isShuffling]);



  const handleSelectCardFromDeck = (index: number) => {
    if (selectedIndices.includes(index)) return;
    if (selectedIndices.length >= currentMode.cardCount) return;

    playCardSound();
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === currentMode.cardCount) {
      setTimeout(() => {
        const selectedCards = newSelected.map(i => deckCards[i]);
        setDrawnCards(selectedCards);
        setRevealedCards(new Array(currentMode.cardCount).fill(false));
        setIsSelectingCards(false);
      }, 800);
    }
  };

  const handleRevealCard = (index: number) => {
    if (revealedCards[index]) return;

    playCardSound();
    const newRevealed = [...revealedCards];
    newRevealed[index] = true;
    setRevealedCards(newRevealed);
  };

  const generateReading = async () => {
    try {
      const categoryName = CATEGORIES.find((c) => c.id === category)?.name || "综合运势";
      const cardsList = drawnCards
        .map((card, index) => {
          return `${index + 1}. ${currentMode.positions[index]}：${card.name} ${card.isReversed ? "（逆位）" : "（正位）"}`;
        })
        .join("\n        ");

      const profileContext = getProfileContext();

      const prompt = `
<instruction>
你正在进行一次正式的塔罗占卜仪式。请基于提供的牌阵和用户信息，用中文撰写一份专业、深刻的解读报告。
</instruction>

<divination_context>
  <spread_mode>${currentMode.name} (共${currentMode.cardCount}张牌)</spread_mode>
  <category>${categoryName}</category>
</divination_context>

<user_profile>
  ${profileContext}
  ${zodiacSign ? `<zodiac>${zodiacSign}</zodiac>` : ""}
</user_profile>

<user_question>
  ${question ? question : "未提供具体问题，请进行深度整体运势解读"}
</user_question>

<drawn_cards>
  ${cardsList}
</drawn_cards>

<output_format>
使用Markdown排版，必须且只能包含以下三个二级标题（##）：
## 🔮 牌阵解析
## 🌌 牌面间的能量连结
## 🌟 最终神谕与指引

在文章末尾，必须单独提炼一句20字内的灵魂箴言，严格使用以下XML标签包裹：
[SOUL_MOTTO] 你的灵魂箴言内容 [/SOUL_MOTTO]
</output_format>
      `;

      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);

      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullResponse += chunk;
        setMessages([{ role: 'model', content: fullResponse }]);
      }

      const mottoMatch = fullResponse.match(/\[SOUL_MOTTO\]([\s\S]*?)\[\/SOUL_MOTTO\]/);
      if (mottoMatch && mottoMatch[1]) {
        setSoulMotto(mottoMatch[1].trim());
        const cleanedResponse = fullResponse.replace(/\[SOUL_MOTTO\][\s\S]*?\[\/SOUL_MOTTO\]/g, '').trim();
        setMessages([{ role: 'model', content: cleanedResponse }]);
      }

      try {
        const displayTitle = question 
          ? (question.length > 25 ? `${question.substring(0, 25)}...` : question)
          : categoryName;

        const id = await addEntry({
          type: 'tarot',
          title: `塔罗：${displayTitle}`,
          summary: fullResponse.substring(0, 100) + '...',
          details: { 
            type: 'tarot',
            text: fullResponse, 
            cards: drawnCards, 
            mode: currentMode.name, 
            question: question,
            messages: [{ role: 'model', content: fullResponse }] 
          }
        });
        setCurrentEntryId(id || null);
      } catch (e) {
        console.error('Failed to save journey', e);
      }
    } catch (err) {
      console.error("Error generating reading:", err);
    }
  };

  useEffect(() => {
    if (
      drawnCards.length > 0 &&
      drawnCards.length === currentMode.cardCount &&
      revealedCards.every((r) => r) &&
      !isReading &&
      messages.length === 0
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      generateReading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedCards, drawnCards, isReading, messages.length]);

  const handleFollowUp = async (text: string) => {
    if (!text.trim() || isReading || !currentEntryId) return;

    const userMsg = text.trim();
    setIsAskingFollowUp(true);
    
    const newMessages: { role: 'user' | 'model'; content: string }[] = [...messages, { role: 'user', content: userMsg }];
    setMessages([...newMessages, { role: 'model', content: "" }]);

    try {
      let fullResponse = "";
      const historyContext = newMessages.slice(0, -1).map(m => `${m.role === 'user' ? '用户' : '阿卡夏'}: ${m.content}`).join('\n\n');
      const promptWithHistory = `以下是之前的对话记录：\n${historyContext}\n\n用户的新回复：${userMsg}`;
      const personaToUse = isSocraticMode ? SOCRATIC_PERSONA : AKASHA_PERSONA;

      for await (const chunk of stream(promptWithHistory, personaToUse)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }
      
      const finalMsgs: { role: 'user' | 'model'; content: string }[] = [...newMessages, { role: 'model', content: fullResponse }];
      
      // When updating, we need to provide the full details object for union types
      updateEntry(currentEntryId, { 
        details: { 
          type: 'tarot',
          text: messages[0]?.content || "", // The first reading text
          cards: drawnCards,
          mode: currentMode.name,
          messages: finalMsgs 
        }
      });
    } catch (err) {
      console.error("Error generating follow-up:", err);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  let cardSize: "small" | "medium" | "large" = "large";
  if (currentMode.cardCount > 6) cardSize = "small";
  else if (currentMode.cardCount > 3) cardSize = "medium";

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <div className="absolute top-10 left-10 text-amber-500/20 animate-pulse"><Moon size={64} /></div>
      <div className="absolute bottom-20 right-10 text-amber-500/20 animate-pulse delay-1000"><Sun size={64} /></div>
      <div className="absolute top-40 right-20 text-amber-500/20 animate-pulse delay-500"><Star size={48} /></div>
      <div className="absolute bottom-40 left-20 text-amber-500/20 animate-pulse delay-700"><Star size={32} /></div>

      <div className="max-w-6xl w-full z-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-serif mb-4 tracking-wider gold-gradient-text drop-shadow-lg">星象塔罗</h1>
          <p className="text-amber-200/70 font-serif italic text-lg md:text-xl max-w-2xl mx-auto">&quot;倾听宇宙的指引，探索未知的命运&quot;</p>
        </motion.div>

        {isShuffling ? (
          <div className="w-full max-w-2xl glass-panel p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-32 h-48 mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ x: [0, i % 2 === 0 ? 40 : -40, 0], y: [0, -20, 0], rotateZ: [0, i % 2 === 0 ? 15 : -15, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="absolute inset-0 rounded-xl border border-amber-500/40 bg-black/80" />
              ))}
            </div>
            <h2 className="text-2xl font-serif text-amber-300 mb-4 tracking-widest animate-pulse">正在洗牌与切牌...</h2>
          </div>
        ) : isSelectingCards ? (
          <div className="w-full glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center justify-center">
            <h2 className="text-2xl font-serif text-amber-300 mb-8">请凭直觉抽取 {currentMode.cardCount} 张牌 ({selectedIndices.length}/{currentMode.cardCount})</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {deckCards.map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSelectCardFromDeck(idx)} 
                  className={`w-10 h-16 sm:w-16 sm:h-24 rounded-lg border cursor-pointer transition-all relative overflow-hidden ${
                    selectedIndices.includes(idx) 
                      ? "opacity-0 scale-50 pointer-events-none" 
                      : "border-[#C9A84C]/30 hover:border-[#C9A84C] bg-[#080510] hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:-translate-y-1"
                  }`}
                >
                  <div className="absolute inset-1 border border-[#C9A84C]/10 rounded flex items-center justify-center">
                    <Moon className="text-[#C9A84C]/20" size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : drawnCards.length === 0 ? (
          <div className="w-full max-w-5xl space-y-8">
              <div className="luxury-card p-8 rounded-2xl flex flex-col gap-8 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <AmbientCosmicBackground />
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-serif uppercase tracking-widest mb-3">1. 选择占卜领域</label>
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button 
                            key={cat.id} 
                            onClick={() => setCategory(cat.id)} 
                            className={`py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${category === cat.id ? "glass-button active text-[#C9A84C]" : "glass-button text-[#E8DFB8]/60 hover:text-[#E8DFB8]"}`}
                          >
                            <Icon size={16} />
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3"><label className="text-sm font-serif uppercase tracking-widest">2. 你的问题（选填）</label><button onClick={handleRecommendMode} disabled={isRecommending} className="text-xs text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-full border border-[#C9A84C]/30 flex items-center gap-1 hover:bg-[#C9A84C]/20 transition-colors"><Wand2 size={12} />智能推荐牌阵</button></div>
                    <textarea rows={4} className="glass-input w-full p-4 text-[#E8DFB8]" placeholder="例如：我最近的感情走向如何？或 我该如何突破事业瓶颈？" value={question} onChange={(e) => setQuestion(e.target.value)} />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <label className="block text-sm font-serif uppercase tracking-widest mb-3">3. 你的星座（选填，用于星象塔罗共振）</label>
                  <div className="flex flex-wrap gap-2">
                    {["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"].map((sign) => (
                      <button 
                        key={sign} 
                        onClick={() => setZodiacSign(zodiacSign === sign ? "" : sign)} 
                        className={`px-4 py-1.5 rounded-full text-xs transition-all ${zodiacSign === sign ? "bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/50" : "bg-white/5 text-[#E8DFB8]/40 border border-white/5 hover:bg-white/10"}`}
                      >
                        {sign}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-serif uppercase tracking-widest">4. 选择牌阵模式</label>
                    <div className="flex gap-2 text-[#C9A84C]">
                      <button onClick={() => scroll("left")} className="p-1.5 hover:bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20 transition-colors" title="向左滑动">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => scroll("right")} className="p-1.5 hover:bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20 transition-colors" title="向右滑动">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-stretch">
                    {SPREAD_MODES.map((m) => (
                      <button 
                        key={m.id} 
                        onClick={() => setMode(m.id)} 
                        className={`min-w-[260px] max-w-[260px] rounded-2xl p-6 text-left transition-all flex flex-col justify-between ${mode === m.id ? "glass-button active border-[#C9A84C]/50" : "glass-button hover:border-white/20"}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${mode === m.id ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-white/5 text-[#E8DFB8]/60"}`}>
                              <Layers size={18} />
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full ${mode === m.id ? "bg-[#C9A84C] text-[#080510] font-bold" : "bg-white/5 text-[#E8DFB8]/40"}`}>
                              {m.cardCount} 张牌
                            </span>
                          </div>
                          <h3 className="text-lg font-serif mb-2 text-[#E8DFB8]">{m.name}</h3>
                          <p className="text-sm text-[#E8DFB8]/50 line-clamp-2">{m.description}</p>
                        </div>
                        
                        <div className="mt-8 flex gap-1 justify-start opacity-50 pt-4 border-t border-white/10">
                          {Array.from({ length: Math.min(m.cardCount, 5) }).map((_, i) => (
                            <div key={i} className={`w-4 h-6 border rounded-sm ${mode === m.id ? "border-[#C9A84C]" : "border-[#E8DFB8]/30"}`} />
                          ))}
                          {m.cardCount > 5 && <span className="text-xs text-[#E8DFB8]/30 ml-1 self-end">+{m.cardCount - 5}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative z-10 flex justify-center mt-4">
                  <button onClick={handleDrawCards} className="group relative px-12 py-4 bg-gradient-to-r from-[#C9A84C] to-[#9b7b2d] text-[#080510] rounded-full font-serif text-lg tracking-wider font-bold hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all flex items-center gap-2">
                    <Sparkles size={20} />
                    开始占卜仪式 ({currentMode.cardCount}张)
                  </button>
                </div>
              </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {!revealedCards.every((r) => r) && (
              <button onClick={() => setRevealedCards(new Array(currentMode.cardCount).fill(true))} className="mb-8 px-6 py-3 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-200 font-serif">一键翻开所有牌</button>
            )}
            <div ref={posterRef} className="w-full flex flex-col items-center relative pb-8">
              {revealedCards.every((r) => r) && (
                <AmbientCosmicBackground />
              )}
              <SpreadLayoutRenderer mode={currentMode.id} cards={drawnCards} revealedCards={revealedCards} handleRevealCard={handleRevealCard} setSelectedCard={setSelectedCard} cardSize={cardSize} positions={currentMode.positions} />
              <AnimatePresence>
                {revealedCards.every((r) => r) && (
                  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl glass-panel p-8 md:p-12 rounded-3xl mt-12">
                    {isReading && messages.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center space-y-10">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
                          <div className="absolute inset-4 border border-amber-500/40 rounded-full animate-[spin_8s_linear_infinite]" />
                          <div className="absolute inset-8 border border-amber-500/60 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                          <Sparkles className="text-amber-400 animate-pulse" size={40} />
                        </div>
                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-serif gold-gradient-text animate-pulse">正在感应阿卡夏记录...</h3>
                          <p className="text-amber-100/40 font-serif text-sm tracking-widest italic">星辰正在交汇，命运的脉络正逐渐清晰</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {messages.map((msg, idx) => (
                          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-center"}`}>
                            <div className={`w-full rounded-2xl p-6 ${msg.role === "user" ? "glass-panel bg-amber-900/20" : "glass-panel bg-black/40 markdown-body"}`}>
                              {msg.role === "user" ? <p className="font-serif">{msg.content}</p> : <MysticMarkdown content={msg.content} cards={drawnCards} hideCards={idx > 0} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!isReading && messages.length > 0 && (
                      <div className="mt-8 flex flex-col gap-4">
                        <div className="flex gap-3"><input type="text" value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} placeholder="向阿卡夏追问..." className="glass-input flex-1 rounded-full px-6 py-3" /><button onClick={onFollowUp} className="glass-button active p-3 rounded-full"><Send size={20} /></button></div>
                        <div className="flex gap-4"><button onClick={() => setIsSocraticMode(!isSocraticMode)} className={`glass-button flex-1 py-3 rounded-full ${isSocraticMode ? "bg-amber-500/20 text-amber-300" : ""}`}>{isSocraticMode ? "深潜模式 ON" : "开启深潜模式"}</button><button onClick={() => setShowExportOptions(!showExportOptions)} className="glass-button flex-1 py-3 rounded-full">导出卡片</button><button onClick={onReset} className="glass-button flex-1 py-3 rounded-full">重置</button></div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCard && <CardMeaningModal card={selectedCard} onClose={() => setSelectedCard(null)} cache={cardMeaningsCache} setCache={setCardMeaningsCache} />}
      </AnimatePresence>
      
      {/* Export components (hidden) */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div ref={soulCardRef}><SoulCard question={question} cards={drawnCards} motto={soulMotto} date={new Date().toLocaleDateString()} /></div>
        <div ref={soulCardFullRef}><SoulCard question={question} cards={drawnCards} motto={soulMotto} date={new Date().toLocaleDateString()} fullReading={messages.map(m => m.content).join('\n\n')} /></div>
      </div>
    </div>
  );
}


