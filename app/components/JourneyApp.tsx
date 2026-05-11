import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useJourney, JourneyEntry } from "@/hooks/useJourney";
import { Trash2, Book, Sparkles, Compass, Star, Sun, Moon, X, ChevronRight, Send, Download, Maximize2, Minimize2 } from "lucide-react";
import MysticMarkdown from "./MysticMarkdown";
import BreathingLoading from "./BreathingLoading";
import { AKASHA_PERSONA, DEFAULT_MODEL } from "@/lib/ai";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { useAIStream } from "@/hooks/useAIStream";
import { SpreadLayoutRenderer, CardMeaningModal, AmbientCosmicBackground } from "./MainApp/TarotComponents";
import { SPREAD_MODES } from "./MainApp/constants";
import { TarotCard } from "@/lib/tarot-data";

export default function JourneyApp() {
  const { entries, deleteEntry, updateEntry, clearJourney } = useJourney();
  const [selectedEntry, setSelectedEntry] = useState<JourneyEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const posterRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const { stream, isLoading: isStreaming, error: streamError, abort } = useAIStream();

  const [prevSelectedEntryId, setPrevSelectedEntryId] = useState<string | null>(null);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [cardMeaningsCache, setCardMeaningsCache] = useState<Record<string, string>>({});

  // Sync chat messages when selected entry changes (React 19 pattern)
  const currentId = selectedEntry?.id || null;
  if (currentId !== prevSelectedEntryId) {
    setChatMessages(selectedEntry?.details?.messages || []);
    setPrevSelectedEntryId(currentId);
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const onGeneratePoster = async () => {
    if (!posterRef.current || !selectedEntry) return;
    await handleGeneratePoster(posterRef.current, `akasha-journey-${selectedEntry.id}.jpg`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedEntry) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setIsAskingFollowUp(true);
    
    const newMsgs = [...chatMessages, { role: "user", content: userMsg } as const];
    setChatMessages([...newMsgs, { role: "model", content: "" }]);

    try {
      let fullResponse = "";
      const systemInstruction = "你是一个神秘的阿卡夏记录解读器，请用神秘、深邃、富有哲理的语气回答用户的追问。请基于之前的对话上下文进行回答。";
      
      for await (const chunk of stream(userMsg, systemInstruction)) {
        fullResponse += chunk;
        setChatMessages([...newMsgs, { role: "model", content: fullResponse }]);
      }
      
      const finalMsgs = [...newMsgs, { role: "model", content: fullResponse } as const];
      
      // Update entry
      const fullText = finalMsgs.map(m => m.role === 'user' ? `**你**：${m.content}` : `**阿卡夏**：${m.content}`).join('\n\n---\n\n');
      updateEntry(selectedEntry.id, {
        details: {
          ...selectedEntry.details,
          text: fullText,
          messages: finalMsgs
        } as JourneyEntry['details']
      });
      
      // Update local selected entry so it doesn't revert if closed and reopened
      setSelectedEntry({
        ...selectedEntry,
        details: {
          ...selectedEntry.details,
          text: fullText,
          messages: finalMsgs
        } as JourneyEntry['details']
      });

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(err);
        setChatMessages([...newMsgs, { role: "model", content: "抱歉，我的灵觉暂时受到了干扰，请稍后再试。" }]);
      }
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const handleDeleteEntry = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteEntry(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "tarot": return <Sparkles className="w-5 h-5 text-amber-400" />;
      case "iching": return <Compass className="w-5 h-5 text-amber-400" />;
      case "bazi": return <Star className="w-5 h-5 text-amber-400" />;
      case "daily": return <Sun className="w-5 h-5 text-amber-400" />;
      case "astrology": return <Moon className="w-5 h-5 text-amber-400" />;
      case "face_reading": return <Sparkles className="w-5 h-5 text-amber-400" />;
      default: return <Book className="w-5 h-5 text-amber-400" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "tarot": return "塔罗占卜";
      case "iching": return "易经占卜";
      case "bazi": return "命理排盘";
      case "daily": return "今日启示";
      case "astrology": return "星象人格";
      case "face_reading": return "相术分析";
      default: return "未知记录";
    }
  };

  const renderDetails = (entry: JourneyEntry) => {
    if (typeof entry.details === 'string') {
      return <MysticMarkdown content={entry.details} />;
    }

    const hasText = entry.details && typeof entry.details.text === 'string';
    const textContent = (hasText && entry.details) ? <MysticMarkdown content={entry.details.text} /> : null;

    let metadataContent = null;

    if (entry.type === 'tarot' && entry.details && 'cards' in entry.details) {
      const tarotDetails = entry.details as any;
      const modeData = SPREAD_MODES.find(m => m.name === tarotDetails.mode) || SPREAD_MODES[1];
      const positions = modeData.positions;
      // All cards are revealed in diary view
      const revealedCards = new Array(tarotDetails.cards.length).fill(true);

      metadataContent = (
        <div className="space-y-4 mb-6 pb-6 border-b border-amber-500/20 relative z-10">
          <div className="flex items-center justify-center mb-8">
            <span className="px-4 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-sm border border-amber-500/30">
              {tarotDetails.mode || '未知牌阵'}
            </span>
          </div>
          <SpreadLayoutRenderer 
            mode={modeData.id} 
            cards={tarotDetails.cards} 
            revealedCards={revealedCards} 
            handleRevealCard={() => {}} 
            setSelectedCard={setSelectedCard} 
            cardSize={modeData.cardCount > 6 ? "small" : "medium"} 
            positions={positions} 
          />
          {tarotDetails.question && (
            <div className="mt-8 p-6 bg-amber-900/10 border border-amber-500/20 rounded-2xl italic text-amber-200/70 text-center font-serif">
              &quot;{tarotDetails.question}&quot;
            </div>
          )}
        </div>
      );
    } else if (entry.type === 'bazi' && entry.details && 'birthDate' in entry.details) {
      metadataContent = (
        <div className="space-y-4 text-amber-100/80 mb-6 pb-6 border-b border-amber-500/20">
          <p><strong>排盘模式：</strong> {entry.details.mode === 'bazi' ? '八字' : entry.details.mode === 'liunian' ? '流年避坑' : '紫微斗数'}</p>
          <p><strong>出生日期：</strong> {entry.details.birthDate} {entry.details.birthTime}</p>
          <p><strong>性别：</strong> {entry.details.gender === 'male' ? '男' : '女'}</p>
          {entry.details.fullName && <p><strong>姓名：</strong> {entry.details.fullName}</p>}
          <p><strong>出生地点：</strong> {entry.details.birthPlace || '未提供'}</p>
        </div>
      );
    } else if (entry.type === 'iching' && entry.details && 'data' in entry.details) {
      metadataContent = (
        <div className="space-y-4 text-amber-100/80 mb-6 pb-6 border-b border-amber-500/20">
          <p><strong>占卜方式：</strong> {entry.details.data?.method === 'coins' ? '铜钱起卦' : '数字起卦'}</p>
          <p><strong>卦象数据：</strong> {JSON.stringify(entry.details.data)}</p>
        </div>
      );
    } else if (entry.type === 'daily' && entry.details && 'sign' in entry.details) {
      metadataContent = (
        <div className="space-y-4 text-amber-100/80 mb-6 pb-6 border-b border-amber-500/20">
          <p><strong>星座：</strong> {entry.details.sign}</p>
        </div>
      );
    }

    if (!metadataContent && !hasText) {
      return <p className="text-amber-100/40 italic">（该记录无详细内容）</p>;
    }

    return (
      <>
        {metadataContent}
        {textContent}
        {!hasText && metadataContent && (
          <p className="text-amber-100/40 italic mt-6 text-sm">（早期记录未保存完整解读文本）</p>
        )}
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif text-amber-100 flex items-center">
          <Book className="w-8 h-8 mr-3 text-amber-400" />
          命运日记本
        </h2>
        {entries.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空日记
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/5">
          <Book className="w-16 h-16 mx-auto text-amber-100/20 mb-4" />
          <p className="text-amber-100/60 text-lg">
            你的命运日记还是空白的。
            <br />
            去进行一次占卜，记录下宇宙的启示吧。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedEntry(entry)}
              className="bg-black/40 backdrop-blur-md border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                    {getIcon(entry.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-amber-100 line-clamp-1" title={entry.title}>
                      {entry.title}
                    </h3>
                    <div className="flex items-center text-xs text-amber-100/50 mt-1">
                      <span className="mr-2">{getTypeName(entry.type)}</span>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteEntry(e, entry.id)}
                  className="p-1.5 text-amber-100/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="删除记录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-amber-100/70 text-sm italic border-l-2 border-amber-500/30 pl-3 py-1 line-clamp-3 flex-grow">
                {entry.summary}
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end items-center text-amber-400/60 group-hover:text-amber-400 text-sm transition-colors">
                <span>查看详情</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[#1a0f0a]/90 backdrop-blur-xl border border-amber-500/30 p-6 sm:p-8 flex flex-col relative shadow-2xl shadow-amber-900/20 overflow-hidden transition-all duration-500 ease-in-out ${
                isFullScreen 
                  ? "fixed inset-0 w-full h-full rounded-none" 
                  : "rounded-2xl max-w-3xl w-full max-h-[85vh]"
              }`}
            >
              {isFullScreen && <AmbientCosmicBackground />}
              
              <div className="flex justify-between items-start mb-6 pr-40 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    {getIcon(selectedEntry.type)}
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif text-amber-100 mb-2">
                      {selectedEntry.title}
                    </h3>
                    <div className="flex items-center text-sm text-amber-100/50">
                      <span className="mr-4 bg-black/30 px-2 py-1 rounded">{getTypeName(selectedEntry.type)}</span>
                      <span>{new Date(selectedEntry.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex items-center space-x-3 z-20">
                <button
                  onClick={onGeneratePoster}
                  disabled={isGeneratingPoster}
                  className="flex flex-row items-center whitespace-nowrap px-4 py-2 text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingPoster ? (
                    <span className="animate-pulse">生成中...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1.5" />
                      保存海报
                    </>
                  )}
                </button>
                <div className="w-[1px] h-4 bg-amber-500/20 mx-1" /> {/* Subtle Divider */}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 text-amber-100/50 hover:text-amber-100 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                  title={isFullScreen ? "退出全屏" : "全屏沉浸阅读"}
                >
                  {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setSelectedEntry(null); abort(); setIsFullScreen(false); }}
                  className="p-2 text-amber-100/50 hover:text-amber-100 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div 
                ref={scrollContainerRef}
                className="flex-grow overflow-y-auto pr-2 pb-4 space-y-6 relative z-10"
              >
                <div ref={posterRef} className={`bg-black/20 p-4 sm:p-8 rounded-xl ${isFullScreen ? 'max-w-5xl mx-auto' : ''}`}>
                  <div className="prose prose-invert prose-amber max-w-none font-serif leading-relaxed text-amber-100/90 markdown-body">
                    {renderDetails(selectedEntry)}
                  </div>
                </div>
              </div>

              {/* Chat Input for Follow-up */}
              <div className={`mt-4 pt-4 border-t border-amber-500/20 relative z-10 ${isFullScreen ? 'max-w-3xl mx-auto w-full' : ''}`}>
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="继续追问阿卡夏..."
                    disabled={isAskingFollowUp}
                    className="w-full bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-xl py-4 pl-6 pr-12 text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isAskingFollowUp}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-amber-500/20 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/30 disabled:opacity-50 transition-colors"
                  >
                    {isAskingFollowUp ? (
                      <span className="px-1 font-serif tracking-widest animate-pulse">...</span>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCard && (
          <CardMeaningModal 
            card={selectedCard} 
            onClose={() => setSelectedCard(null)} 
            cache={cardMeaningsCache} 
            setCache={setCardMeaningsCache} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a0f0a] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-900/20 text-center"
            >
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-amber-100 mb-2">清空命运日记</h3>
              <p className="text-amber-100/70 mb-6">确定要清空所有日记吗？此操作不可恢复。</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-black/40 text-amber-100/70 hover:text-amber-100 hover:bg-black/60 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    clearJourney();
                    setShowClearConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors"
                >
                  确定清空
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
