"use client";

import { useState, useEffect, useRef } from "react";
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

export function MysticTarot() {
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
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);
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

  const handleDrawCards = () => {
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
  };

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
        这是一次正式的塔罗占卜仪式。用户选择了【${currentMode.name}】（共${currentMode.cardCount}张牌）。
        本次占卜的领域是：【${categoryName}】
        ${zodiacSign ? `用户的太阳星座是：【${zodiacSign}】。` : ""}
        ${question ? `用户心中默念的问题是：“${question}”` : "用户提供深度整体运势解读。"}
        ${profileContext}
        
        牌阵展开如下：
        ${cardsList}
        
        请用中文提供专业、深刻的解读报告。Markdown格式，必须包含：
        ### 🔮 牌阵解析
        ### 🌌 牌面间的能量连结
        ### 🌟 最终神谕与指引

        最后提炼一句20字内的「灵魂箴言」：
        [SOUL_MOTTO] 你的灵魂箴言内容 [/SOUL_MOTTO]
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
        const id = await addEntry({
          type: 'tarot',
          title: question ? `塔罗占卜：${question}` : `塔罗占卜：${categoryName}`,
          summary: fullResponse.substring(0, 100) + '...',
          details: { 
            type: 'tarot',
            text: fullResponse, 
            cards: drawnCards, 
            mode: currentMode.name, 
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
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsProfessionalMode(false)} className={`px-6 py-2 rounded-full font-serif text-sm ${!isProfessionalMode ? "bg-[#C9A84C] text-[#080510]" : "bg-white/5 text-[#E8DFB8]/40"}`}>AI 引导模式</button>
              <button onClick={() => setIsProfessionalMode(true)} className={`px-6 py-2 rounded-full font-serif text-sm ${isProfessionalMode ? "bg-[#C9A84C] text-[#080510]" : "bg-white/5 text-[#E8DFB8]/40"}`}>专业牌阵模式</button>
            </div>
            {!isProfessionalMode ? (
              <div className="luxury-card p-10 md:p-16 space-y-12 relative overflow-hidden">
                <div className="absolute inset-0 z-0"><MysticImage prompt="A cosmic oracle holding a glowing crystal ball" className="w-full h-full opacity-40" /></div>
                <div className="relative z-10 text-center space-y-8">
                  <h2 className="text-3xl font-serif gold-gradient-text">今天，你心里在想什么？</h2>
                  <textarea className="glass-input-v2 w-full min-h-[150px] text-xl font-serif" placeholder="输入你的困惑..." value={question} onChange={(e) => setQuestion(e.target.value)} />
                  <button onClick={handleDrawCards} disabled={!question.trim()} className="action-button-luxury">开始占卜</button>
                </div>
              </div>
            ) : (
              <div className="luxury-card p-8 rounded-2xl flex flex-col gap-8 relative overflow-hidden">
                <div className="absolute inset-0 z-0"><MysticImage prompt="Sacred geometry patterns" className="w-full h-full opacity-30" /></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-serif uppercase tracking-widest mb-3">1. 选择占卜领域</label>
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map((cat) => (
                        <button key={cat.id} onClick={() => setCategory(cat.id)} className={`py-3 px-3 rounded-xl transition-all ${category === cat.id ? "glass-button active text-amber-300" : "glass-button"}`}>{cat.name}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3"><label className="text-sm font-serif uppercase tracking-widest">2. 你的问题</label><button onClick={handleRecommendMode} disabled={isRecommending || !question.trim()} className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">智能推荐牌阵</button></div>
                    <textarea rows={4} className="glass-input w-full p-4" placeholder="输入你的困惑..." value={question} onChange={(e) => setQuestion(e.target.value)} />
                  </div>
                </div>
                <div className="relative z-10"><label className="block text-sm font-serif uppercase tracking-widest mb-3">3. 选择牌阵</label>
                  <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {SPREAD_MODES.map((m) => (
                      <button key={m.id} onClick={() => setMode(m.id)} className={`min-w-[240px] rounded-2xl p-5 text-left transition-all ${mode === m.id ? "glass-button active" : "glass-button"}`}>{m.name} ({m.cardCount}张)</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleDrawCards} className="group relative px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-amber-50 rounded-full font-serif text-lg tracking-wider">开始占卜仪式</button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {!revealedCards.every((r) => r) && (
              <button onClick={() => setRevealedCards(new Array(currentMode.cardCount).fill(true))} className="mb-8 px-6 py-3 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-200 font-serif">一键翻开所有牌</button>
            )}
            <div ref={posterRef} className="w-full flex flex-col items-center relative pb-8">
              <SpreadLayoutRenderer mode={currentMode.id} cards={drawnCards} revealedCards={revealedCards} handleRevealCard={handleRevealCard} setSelectedCard={setSelectedCard} cardSize={cardSize} positions={currentMode.positions} />
              <AnimatePresence>
                {revealedCards.every((r) => r) && (
                  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl glass-panel p-8 md:p-12 rounded-3xl mt-12">
                    {isReading && messages.length === 0 ? <BreathingLoading text="正在查阅阿卡夏记录..." /> : (
                      <div className="space-y-8">
                        {messages.map((msg, idx) => (
                          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-center"}`}>
                            <div className={`rounded-2xl p-6 ${msg.role === "user" ? "glass-panel bg-amber-900/20" : "glass-panel bg-black/40 markdown-body"}`}>
                              {msg.role === "user" ? <p className="font-serif">{msg.content}</p> : <MysticMarkdown content={msg.content} cards={drawnCards} hideCards={idx > 1} />}
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

function TarotCardView({ card, isRevealed, onReveal, onSelect, delay, size = "large" }: any) {
  let dims = "w-36 h-60 sm:w-48 sm:h-80";
  if (size === "small") dims = "w-24 h-40 sm:w-32 sm:h-56";
  else if (size === "medium") dims = "w-28 h-48 sm:w-40 sm:h-64";

  return (
    <div className={`${dims} relative perspective-1200`} onClick={() => isRevealed ? onSelect() : onReveal()}>
      <motion.div animate={{ rotateY: isRevealed ? 0 : 180 }} transition={{ duration: 0.8 }} className="w-full h-full relative preserve-3d">
        {/* Card Back */}
        <div className="absolute inset-0 rounded-xl border-2 border-[#C9A84C]/40 bg-[#080510] backface-hidden rotate-y-180 overflow-hidden shadow-[0_0_20px_rgba(201,168,76,0.2)]">
          <div className="absolute inset-2 border border-[#C9A84C]/20 rounded-lg flex items-center justify-center">
            {/* Ornate Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-[#C9A84C]/30 flex items-center justify-center bg-black/40 shadow-[0_0_15px_rgba(201,168,76,0.1)]">
                <Moon className="text-[#C9A84C] opacity-60" size={32} />
              </div>
              <div className="mt-4 flex gap-2">
                <Star size={10} className="text-[#C9A84C]/30 animate-pulse" />
                <Star size={10} className="text-[#C9A84C]/30 animate-pulse delay-700" />
                <Star size={10} className="text-[#C9A84C]/30 animate-pulse delay-300" />
              </div>
            </div>
          </div>
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A84C]/40 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A84C]/40 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A84C]/40 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A84C]/40 rounded-br-xl" />
        </div>
        <div className="absolute inset-0 rounded-xl border-2 border-amber-400 bg-black backface-hidden flex flex-col p-2">
          <div className="flex-1 relative w-full"><Image src={`https://www.trustedtarot.com/img/cards/${card.englishName.toLowerCase().replace(/ /g, "-")}.png`} alt={card.name} fill className="object-contain" referrerPolicy="no-referrer" /></div>
          <div className="text-center bg-black/60 rounded-b-lg"><h3 className="text-amber-300 font-serif text-sm">{card.name}</h3>{card.isReversed && <span className="text-red-400 text-xs">逆位</span>}</div>
        </div>
      </motion.div>
    </div>
  );
}

function CardMeaningModal({ card, onClose, cache, setCache }: any) {
  const [loading, setLoading] = useState(false);
  const [meaning, setMeaning] = useState("");
  useEffect(() => {
    const fetch = async () => {
      const key = `${card.id}-${card.isReversed ? "rev" : "up"}`;
      if (cache[key]) { setMeaning(cache[key]); return; }
      setLoading(true);
      try {
        const text = await generateContent(`解释塔罗牌【${card.name}】在【${card.isReversed ? "逆位" : "正位"}】时的含义。使用Markdown。`);
        setMeaning(text || "");
        setCache((prev: any) => ({ ...prev, [key]: text }));
      } finally { setLoading(false); }
    };
    fetch();
  }, [card, cache, setCache]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-serif text-amber-300">{card.name}</h3><button onClick={onClose}><X /></button></div>
        {loading ? <p className="animate-pulse">正在感应...</p> : <MysticMarkdown content={meaning} />}
      </div>
    </div>
  );
}

function SpreadLayoutRenderer({ mode, cards, revealedCards, handleRevealCard, setSelectedCard, cardSize, positions }: any) {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {cards.map((c: any, i: number) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-xs text-amber-500 mb-2">{positions[i]}</span>
          <TarotCardView card={c} isRevealed={revealedCards[i]} onReveal={() => handleRevealCard(i)} onSelect={() => setSelectedCard(c)} size={cardSize} />
        </div>
      ))}
    </div>
  );
}
