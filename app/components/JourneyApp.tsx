'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Calendar, 
  Clock, 
  Trash2, 
  Search, 
  Filter, 
  Zap, 
  ChevronRight, 
  Download,
  X,
  History,
  Sparkles,
  ArrowLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useJourney } from '@/hooks/useJourney';
import { useAIChat } from '@/hooks/useAIChat';
import { useAIStream } from '@/hooks/useAIStream';
import { useUserProfile } from '@/hooks/useUserProfile';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { JourneyEntry } from '@/app/types/divination';
import MysticChatInterface from './MainApp/MysticChatInterface';
import EntryDetailRenderer from './MainApp/Journey/EntryDetailRenderer';
import BreathingLoading from './BreathingLoading';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';

export default function JourneyApp() {
  const { entries, deleteEntry, clearJourney, isLoaded, updateEntry } = useJourney();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [chatInput, setChatInput] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [echoText, setEchoText] = useState("");
  const [isEchoing, setIsEchoing] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const { stream } = useAIStream({ model: MODELS.FLASH });
  const { profile } = useUserProfile();

  const selectedEntry = useMemo(() => 
    entries.find(e => e.id === selectedEntryId), 
  [entries, selectedEntryId]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const title = e.title || '';
      const summary = e.summary || '';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || e.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [entries, searchQuery, filterType]);

  const { 
    messages, setMessages, sendMessage, isLoading, isStreaming, setCurrentEntryId 
  } = useAIChat({ type: selectedEntry?.type || 'tarot' });

  // Sync messages and echo when entry is selected
  useEffect(() => {
    if (selectedEntry) {
      setMessages(selectedEntry.details?.messages || [{ role: 'model', content: selectedEntry.details?.text || selectedEntry.summary }]);
      setCurrentEntryId(selectedEntry.id);
      setEchoText(selectedEntry.details?.echo || "");
    } else {
      setMessages([]);
      setCurrentEntryId(null);
      setEchoText("");
      setIsFullScreen(false);
    }
  }, [selectedEntry, setMessages, setCurrentEntryId]);

  const handleBack = () => {
    setSelectedEntryId(null);
    setChatInput('');
    setIsFullScreen(false);
  };

  const handleGenerateEcho = async () => {
    if (!selectedEntry || isEchoing) return;
    setIsEchoing(true);
    
    const prompt = `
<instruction>
你是阿卡夏记录的守护者。请对用户过去的这段占卜记录进行“命运回响”分析。
请结合用户当前的灵魂档案，分析这段记录在当下的现实意义，并给出一个跨越时空的深层建议。
文字要简练、玄奥、充满诗意。
</instruction>

<user_profile>
${JSON.stringify(profile)}
</user_profile>

<historical_entry>
类型: ${selectedEntry.type}
标题: ${selectedEntry.title}
内容: ${selectedEntry.summary}
</historical_entry>
    `;

    try {
      let fullEcho = "";
      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullEcho += chunk;
        setEchoText(fullEcho);
      }
      
      // Save echo to entry
      if (selectedEntry.details) {
        updateEntry(selectedEntry.id, {
          details: {
            ...selectedEntry.details,
            echo: fullEcho
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEchoing(false);
    }
  };

  if (!isLoaded) return <BreathingLoading text="正在打开阿卡夏记录..." />;

  return (
    <div className={`max-w-7xl mx-auto px-6 py-12 min-h-[80vh] ${isFullScreen ? 'overflow-hidden' : ''}`}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-500/60 uppercase tracking-[0.4em] text-xs">
            <History size={14} />
            <span>Akashic Records</span>
          </div>
          <h1 className="text-5xl font-serif gold-gradient-text">命运<span className="text-white/90">旅程</span></h1>
          <p className="text-[#E8DFB8]/40 font-serif max-w-md">这里记录了你与宇宙的每一次对话，每一个觉察的瞬间。</p>
        </div>

        {!selectedEntry && entries.length > 0 && (
          <button 
            onClick={() => { if(confirm('确定要清空所有记录吗？此操作不可逆。')) clearJourney(); }}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-red-500/20 text-red-400/60 hover:bg-red-500/10 transition-all text-sm font-serif"
          >
            <Trash2 size={14} />
            清空记录
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!selectedEntry ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="搜索你的觉察记录..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-amber-100 focus:border-amber-500/30 transition-all font-serif"
                />
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-4 py-2 relative">
                <Filter size={16} className="text-amber-500/40" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-amber-100 font-serif text-sm focus:outline-none appearance-none cursor-pointer pr-8 pl-2 py-1 transition-colors min-w-[120px]"
                >
                  <option value="all" className="bg-[#080510]">所有类别</option>
                  <option value="tarot" className="bg-[#080510]">塔罗占卜</option>
                  <option value="bazi" className="bg-[#080510]">命理八字</option>
                  <option value="iching" className="bg-[#080510]">周易占卜</option>
                  <option value="astrology" className="bg-[#080510]">星象解析</option>
                  <option value="shadow_work" className="bg-[#080510]">阴影工作</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/40 pointer-events-none" />
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center opacity-40">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center">
                  <History size={32} />
                </div>
                <p className="font-serif italic tracking-widest">暂无相关记录，开启你的第一次占卜吧</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntries.map((entry) => (
                  <motion.div 
                    layoutId={entry.id}
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id)}
                    className="luxury-card p-6 cursor-pointer group hover:border-amber-500/40 transition-all flex flex-col justify-between h-64"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-500/40 uppercase tracking-[0.2em]">{entry.type}</span>
                        <div className="flex items-center gap-1.5 text-white/20 text-[10px]">
                          <Calendar size={10} />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-xl font-serif text-amber-100 group-hover:text-amber-400 transition-colors line-clamp-2">{entry.title}</h3>
                      <p className="text-sm text-white/40 font-serif leading-relaxed line-clamp-3">{entry.summary}</p>
                    </div>
                    <div className="flex items-center justify-end pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-amber-500 font-serif flex items-center gap-1">查看详情 <ChevronRight size={14} /></span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Modal Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBack}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />

            <motion.div 
              key="detail"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                width: isFullScreen ? '100vw' : '90vw',
                height: isFullScreen ? '100vh' : '85vh',
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] bg-[#080510] overflow-y-auto shadow-2xl border border-white/10
                ${isFullScreen ? 'rounded-0' : 'rounded-[2.5rem] max-w-5xl'} 
                scrollbar-hide custom-scrollbar transition-all duration-500`}
            >
            <div className={`mx-auto space-y-12 p-8 md:p-16 ${isFullScreen ? 'max-w-6xl' : 'max-w-full'}`}>
              <div className="flex items-center justify-between sticky top-0 bg-[#080510]/80 backdrop-blur-md z-30 pb-6 mb-6">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-amber-500/60 hover:text-amber-500 transition-colors font-serif"
                >
                  <ArrowLeft size={18} />
                  返回记录
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleGeneratePoster(posterRef.current, `journey-${selectedEntry.id}.jpg`)}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-amber-500/60 hover:text-amber-500 transition-all"
                    title="保存海报"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-amber-500/60 hover:text-amber-500 transition-all"
                    title={isFullScreen ? "收起" : "全屏预览"}
                  >
                    {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button 
                    onClick={handleBack}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-amber-500/60 hover:text-amber-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div ref={posterRef} className="glass-panel p-8 md:p-12 rounded-[2.5rem] space-y-12 relative overflow-hidden bg-black/40">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Sparkles size={200} className="text-amber-500" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <span className="text-xs font-mono text-amber-500/60 tracking-[0.5em] uppercase">{selectedEntry.type}</span>
                      <h2 className="text-4xl md:text-5xl font-serif text-amber-100">{selectedEntry.title}</h2>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] text-white/20 uppercase font-mono tracking-widest mb-1">RECORDED ON</p>
                        <p className="text-sm text-amber-200/40 font-serif">{new Date(selectedEntry.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent" />
                </div>

                <EntryDetailRenderer entry={selectedEntry} />

                {/* Fate Echo Section */}
                {(echoText || isEchoing) ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-20 p-10 rounded-[32px] bg-amber-500/[0.03] border border-amber-500/10 space-y-6 relative"
                  >
                    <div className="absolute -top-4 left-10 px-6 py-1 bg-[#120c18] border border-amber-500/20 rounded-full text-[10px] font-serif text-amber-500 uppercase tracking-[0.4em]">
                      命运回响 · Echo
                    </div>
                    <div className="flex justify-center">
                        <p className="text-xl md:text-2xl font-serif text-amber-100/90 leading-relaxed italic text-center py-4">
                        {echoText || <BreathingLoading text="正在感应时空回响..." />}
                        </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-16 flex justify-center">
                    <button 
                      onClick={handleGenerateEcho}
                      className="group flex items-center gap-4 px-8 py-4 rounded-full bg-amber-500/5 border border-amber-500/20 text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/10 transition-all font-serif tracking-widest"
                    >
                      <Zap size={16} className="text-amber-500" />
                      <span>唤醒命运回响</span>
                    </button>
                  </div>
                )}
                
                <div className="hidden show-in-poster mt-24 pt-12 border-t border-amber-500/10 text-center opacity-30">
                  <p className="font-serif text-amber-200/60 tracking-[0.2em] text-center">Akashic Chronicle · Mystic Journey</p>
                </div>
              </div>

              {/* Deep Dive Section */}
              <div className="mt-20 pt-16 border-t border-white/5 space-y-12">
                <div className="text-center space-y-4">
                   <h4 className="text-3xl font-serif gold-gradient-text tracking-widest">深度对话 · Deep Dive</h4>
                   <p className="text-sm text-[#E8DFB8]/40 font-serif italic">阿卡夏记录是流动的，你可以继续询问这次洞见的余波...</p>
                </div>
                
                <MysticChatInterface 
                   messages={messages.slice(1)} // Skip the initial reading as it's already shown above
                   input={chatInput}
                   setInput={setChatInput}
                   onSend={(e) => {
                     e.preventDefault();
                     sendMessage(chatInput);
                     setChatInput('');
                   }}
                   isLoading={isLoading}
                   isStreaming={isStreaming}
                />
              </div>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </div>
  );
}
