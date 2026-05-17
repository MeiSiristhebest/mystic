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
import MysticMarkdown from './MysticMarkdown';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { cleanMysticContent } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export default function JourneyApp() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setActiveSubTab = useAppStore((state) => state.setActiveSubTab);
  const setHandoff = useAppStore((state) => state.setHandoff);

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
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
你是阿卡夏记录的守护者。请对用户过去的这段占卜记录进行“命运回响”复盘分析。
请结合用户当前的灵魂档案，剖析这段往事在当下时空的深层共振与现实意义，并给出一个跨越时空的破局建议。
</instruction>

<divination_context>
  <method>阿卡夏时空命运回响断算法</method>
  <historical_type>${selectedEntry.type}</historical_type>
  <historical_title>${selectedEntry.title}</historical_title>
  <historical_summary>${selectedEntry.summary}</historical_summary>
</divination_context>

<user_profile>
${JSON.stringify(profile)}
</user_profile>

<chain_of_thought>
在给出正式回答前，请先在内部 <thinking> 标签内进行严密推导：
1. 审视过往事件与当下时间节点的星象/五行运转逻辑。
2. 挖掘事件背后未完成的灵魂课题。
3. 挑选最契合的下一步探索工具（如塔罗、八字、面相、星盘等）作为仪轨流转指引。
</chain_of_thought>

<constraints>
- 【严禁暴露或生硬提及】任何人格或命理标签名称（如“因为你是 INTJ”、“作为 2号人”等），必须将其内化为深邃无形的性格特质观察。
- 语言必须充满古典神谕感与诗意，自然点缀神秘学 Emoji（如 🌌 🔮 🌿 🌙 ✨ 等）。
</constraints>

<output_format>
请使用高质感 Markdown 排版，严格且只包含以下三个二级标题：
## 🪐 时空共振与灵脉折射
（约 200 字，分析往日占卜在当下所泛起的涟漪与深层因果）

## 🗝️ 当下时空的现实觉察
（约 250 字，指出这段往事正在如何影响或指引目前的决策）

## 🌿 跨越维度的灵性箴言
（约 200 字，给出超然物外的行动或心态转念指引）

在文章最后，必须输出一个契合的关联推荐：
<mystic_association>{"target": "模块名", "reason": "一段充满仪式感的推荐语，指引其开启新的仪轨", "system": "系统名", "modeId": "模式ID"}</mystic_association>
- 可选模块/系统名：塔罗占卜(tarot)、八字排盘(eastern)、星盘探索(astrology)、流年避坑(eastern/liunian)、周易占卜(eastern/iching)、阴影工作(shadow_work)、灵魂频率(subconscious)。
</output_format>
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

  const handleReopenRitual = (subTab: string, modeId?: string, soulLabTab?: 'shadow' | 'subconscious') => {
    if (!selectedEntry) return;
    const questionToForward = selectedEntry.title?.replace(/^(塔罗|时间智慧|八字|易经|星象)[：:]\s*/, '') || selectedEntry.title || "";
    
    setHandoff({
      system: subTab,
      modeId: modeId,
      prefillQuestion: questionToForward,
      soulLabTab: soulLabTab,
      autoTrigger: false
    });
    
    setActiveTab('explore');
    setActiveSubTab(subTab);
    setSelectedEntryId(null);
    setIsFullScreen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <div className="flex items-center gap-2 bg-black/60 border border-white/20 rounded-2xl px-4 py-2 relative group hover:border-amber-500/40 transition-all">
                <Filter size={16} className="text-amber-500/60" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-amber-100 font-serif text-sm focus:outline-none appearance-none cursor-pointer pr-10 pl-2 py-2 transition-colors min-w-[140px]"
                >
                  <option value="all" className="bg-[#0f0a18] text-amber-100">所有类别</option>
                  <option value="tarot" className="bg-[#0f0a18] text-amber-100">塔罗占卜</option>
                  <option value="bazi" className="bg-[#0f0a18] text-amber-100">命理八字</option>
                  <option value="iching" className="bg-[#0f0a18] text-amber-100">周易占卜</option>
                  <option value="astrology" className="bg-[#0f0a18] text-amber-100">星象解析</option>
                  <option value="face_reading" className="bg-[#0f0a18] text-amber-100">面相骨相</option>
                  <option value="palm_reading" className="bg-[#0f0a18] text-amber-100">手相掌纹</option>
                  <option value="shadow_work" className="bg-[#0f0a18] text-amber-100">阴影工作</option>
                  <option value="subconscious" className="bg-[#0f0a18] text-amber-100">灵魂频率</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/60 pointer-events-none group-hover:text-amber-500 transition-colors" />
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
                      <h3 className="text-xl font-serif text-amber-100 group-hover:text-amber-400 transition-colors line-clamp-2">{cleanMysticContent(entry.title || "") || "无标题记录"}</h3>
                      <p className="text-sm text-white/40 font-serif leading-relaxed line-clamp-3">
                        {(() => {
                          const cleanedSummary = cleanMysticContent(entry.summary || "");
                          if (cleanedSummary) return cleanedSummary;
                          const cleanedDetails = cleanMysticContent(entry.details?.text || "");
                          return cleanedDetails.substring(0, 150);
                        })() || "记录内容正在感应中..."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                      {(() => {
                        const days = Math.floor((Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
                        if (days === 0) {
                          return <span className="text-[10px] text-amber-500/80 font-serif flex items-center gap-1"><Clock size={10} /> ✦ 当下气数 · 正在显化</span>;
                        } else if (days <= 7) {
                          return <span className="text-[10px] text-purple-400/80 font-serif flex items-center gap-1"><Clock size={10} /> ⏳ 沉淀 {days} 天 · 命运齿轮转动中</span>;
                        } else if (days <= 30) {
                          return <span className="text-[10px] text-amber-400 font-serif flex items-center gap-1"><Sparkles size={10} /> 🔮 已过 {days} 天 · 适宜深度回响</span>;
                        } else {
                          return <span className="text-[10px] text-white/40 font-serif flex items-center gap-1"><History size={10} /> 🌌 往昔印记 · 沉淀 {days} 天</span>;
                        }
                      })()}
                      <span className="text-xs text-amber-500 font-serif flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">查看详情 <ChevronRight size={14} /></span>
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
                    className="mt-20 p-8 md:p-12 rounded-[32px] bg-[#0c0617]/40 border border-amber-500/20 space-y-6 relative overflow-visible shadow-[0_15px_50px_rgba(0,0,0,0.5)]"
                  >
                    <div className="absolute -top-4 left-10 px-6 py-1.5 bg-[#120c18] border border-amber-500/40 rounded-full text-[10px] font-serif text-amber-500 uppercase tracking-[0.4em] shadow-[0_0_15px_rgba(217,119,6,0.3)] z-20">
                      命运回响 · Echo
                    </div>
                    <div className="w-full pt-6">
                      {echoText ? (
                        <MysticMarkdown content={echoText} isLoading={isEchoing} />
                      ) : (
                        <BreathingLoading text="正在倾听过往时空的共鸣..." />
                      )}
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

              {/* 命运大阵：以此为问，续启仪轨 */}
              <div className="mt-20 pt-16 border-t border-amber-500/10 space-y-8">
                <div className="text-center space-y-3">
                  <h4 className="text-2xl font-serif gold-gradient-text tracking-widest flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    以此为问 · 续启仪轨
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </h4>
                  <p className="text-xs text-[#E8DFB8]/40 font-serif italic">将往昔之惑或回响箴言铭刻为锚，转动命运齿轮，于不同维度寻求全新开示</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <button
                    onClick={() => handleReopenRitual('tarot', undefined)}
                    className="group p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all text-center space-y-2 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      🔮
                    </div>
                    <span className="font-serif text-sm text-amber-100 group-hover:text-amber-300">西方塔罗</span>
                    <span className="text-[10px] text-white/30 font-serif block">倾听潜意识卡牌镜像</span>
                  </button>

                  <button
                    onClick={() => handleReopenRitual('eastern', 'bazi')}
                    className="group p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all text-center space-y-2 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      ☯️
                    </div>
                    <span className="font-serif text-sm text-amber-100 group-hover:text-amber-300">八字推演</span>
                    <span className="text-[10px] text-white/30 font-serif block">参透先天干支气数</span>
                  </button>

                  <button
                    onClick={() => handleReopenRitual('astrology', 'zodiac')}
                    className="group p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all text-center space-y-2 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      🌌
                    </div>
                    <span className="font-serif text-sm text-amber-100 group-hover:text-amber-300">星盘探索</span>
                    <span className="text-[10px] text-white/30 font-serif block">观照天体引力波长</span>
                  </button>

                  <button
                    onClick={() => handleReopenRitual('soul', undefined, 'shadow')}
                    className="group p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all text-center space-y-2 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      🪞
                    </div>
                    <span className="font-serif text-sm text-amber-100 group-hover:text-amber-300">阴影工作</span>
                    <span className="text-[10px] text-white/30 font-serif block">疗愈底层核心创伤</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </div>
  );
}
