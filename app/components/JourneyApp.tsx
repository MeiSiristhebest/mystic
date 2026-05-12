'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  History, 
  Sparkles, 
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useJourney } from '@/hooks/useJourney';
import { useAIChat } from '@/hooks/useAIChat';
import { useUserProfile } from '@/hooks/useUserProfile';
import { JourneyEntry } from '@/app/types/divination';
import MysticChatInterface from './MainApp/MysticChatInterface';
import EntryDetailRenderer from './MainApp/Journey/EntryDetailRenderer';
import BreathingLoading from './BreathingLoading';

export default function JourneyApp() {
  const { entries, deleteEntry, clearJourney, isLoaded, updateEntry } = useJourney();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [chatInput, setChatInput] = useState('');

  const selectedEntry = useMemo(() => 
    entries.find(e => e.id === selectedEntryId), 
  [entries, selectedEntryId]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || e.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [entries, searchQuery, filterType]);

  const { 
    messages, setMessages, sendMessage, isLoading, isStreaming, setCurrentEntryId 
  } = useAIChat({ type: selectedEntry?.type || 'tarot' });

  // Sync messages when entry is selected
  useEffect(() => {
    if (selectedEntry) {
      setMessages(selectedEntry.details?.messages || [{ role: 'model', content: selectedEntry.details?.text || selectedEntry.summary }]);
      setCurrentEntryId(selectedEntry.id);
    } else {
      setMessages([]);
      setCurrentEntryId(null);
    }
  }, [selectedEntry, setMessages, setCurrentEntryId]);

  if (!isLoaded) return <BreathingLoading text="正在打开阿卡夏记录..." />;

  const handleBack = () => {
    setSelectedEntryId(null);
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[80vh]">
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
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-2xl px-4 py-2">
                <Filter size={16} className="text-amber-500/40" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-amber-200/60 font-serif text-sm focus:outline-none"
                >
                  <option value="all">所有类别</option>
                  <option value="tarot">塔罗占卜</option>
                  <option value="bazi">命理八字</option>
                  <option value="iching">周易占卜</option>
                  <option value="astrology">星象解析</option>
                  <option value="shadow_work">阴影工作</option>
                </select>
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
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-amber-500/60 hover:text-amber-500 transition-colors font-serif mb-8"
            >
              <ArrowLeft size={18} />
              返回旅程
            </button>

            <div className="glass-panel p-8 md:p-12 rounded-3xl space-y-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Sparkles size={120} />
               </div>

               <div className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="space-y-2">
                     <span className="text-xs font-mono text-amber-500/60 tracking-[0.5em] uppercase">{selectedEntry.type}</span>
                     <h2 className="text-4xl font-serif text-amber-100">{selectedEntry.title}</h2>
                   </div>
                   <div className="flex items-center gap-6">
                     <div className="text-right">
                       <p className="text-[10px] text-white/20 uppercase font-mono tracking-widest mb-1">RECORDED ON</p>
                       <p className="text-sm text-amber-200/40 font-serif">{new Date(selectedEntry.date).toLocaleString()}</p>
                     </div>
                     <button 
                        onClick={(e) => { e.stopPropagation(); deleteEntry(selectedEntry.id); handleBack(); }}
                        className="p-3 rounded-full hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                 </div>
                 <div className="h-[1px] w-full bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent" />
               </div>

               <EntryDetailRenderer entry={selectedEntry} />

               {/* Deep Dive Section */}
               <div className="mt-20 pt-16 border-t border-white/5 space-y-12">
                 <div className="text-center space-y-4">
                    <h4 className="text-2xl font-serif gold-gradient-text tracking-widest">深度回响 · Deep Dive</h4>
                    <p className="text-sm text-white/30 font-serif italic">基于这次占卜，你还可以继续向阿卡夏寻求更深层的洞见...</p>
                 </div>
                 
                 <MysticChatInterface 
                    messages={messages}
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
        )}
      </AnimatePresence>
    </div>
  );
}
