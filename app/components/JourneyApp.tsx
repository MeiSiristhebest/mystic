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
  Minimize2,
  Edit3,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Tag,
  CheckSquare,
  Square,
  Layers,
  RotateCcw
} from 'lucide-react';
import { useJourney } from '@/hooks/useJourney';
import { useAIChat } from '@/hooks/useAIChat';
import { useAIStream } from '@/hooks/useAIStream';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AKASHA_PERSONA } from '@/lib/ai';
import { JourneyEntry, JourneyStatusTag } from '@/app/types/divination';
import MysticChatInterface from './MainApp/MysticChatInterface';
import EntryDetailRenderer from './MainApp/Journey/EntryDetailRenderer';
import BreathingLoading from './BreathingLoading';
import MysticMarkdown from './MysticMarkdown';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { cleanMysticContent } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { CustomConfirmModal } from './MainApp/CustomConfirmModal';

export default function JourneyApp() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setActiveSubTab = useAppStore((state: any) => state.setActiveSubTab);
  const setHandoff = useAppStore((state: any) => state.setHandoff);

  const { 
    entries, 
    deleteEntry, 
    deleteMultipleEntries, 
    updateMultipleEntries, 
    clearJourney, 
    isLoaded, 
    updateEntry 
  } = useJourney();

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [chatInput, setChatInput] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [echoText, setEchoText] = useState("");
  const [isEchoing, setIsEchoing] = useState(false);

  // 批量操作状态 (Batch Management State)
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 定制化弹窗状态 (Custom Confirmation Modal State)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "确认操作",
    message: "",
    onConfirm: () => {},
  });

  // 笔记与自定义标题编辑状态
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const { stream } = useAIStream();
  const { profile } = useUserProfile();

  const selectedEntry = useMemo(() => 
    entries.find(e => e.id === selectedEntryId), 
  [entries, selectedEntryId]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const title = e.customTitle || e.title || '';
      const summary = e.summary || '';
      const notes = e.userNotes || '';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || e.type === filterType;
      const matchesStatus = statusFilter === 'all' || (e.statusTag || 'none') === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entries, searchQuery, filterType, statusFilter]);

  const { 
    messages, setMessages, sendMessage, isLoading, isStreaming, setCurrentEntryId 
  } = useAIChat({ type: selectedEntry?.type || 'tarot' });

  // Sync messages and echo when entry is selected
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedEntry) {
        setMessages(selectedEntry.details?.messages || [{ role: 'model', content: selectedEntry.details?.text || selectedEntry.summary }]);
        setCurrentEntryId(selectedEntry.id);
        setEchoText(selectedEntry.details?.echo || "");
        setTitleInput(selectedEntry.customTitle || selectedEntry.title);
        setNotesInput(selectedEntry.userNotes || "");
        setEditingTitle(false);
      } else {
        setMessages([]);
        setCurrentEntryId(null);
        setEchoText("");
        setIsFullScreen(false);
        setEditingTitle(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedEntry, setMessages, setCurrentEntryId]);

  const handleBack = () => {
    setSelectedEntryId(null);
    setChatInput('');
    setIsFullScreen(false);
  };

  const handleSaveTitle = async () => {
    if (!selectedEntry || !titleInput.trim()) return;
    await updateEntry(selectedEntry.id, { customTitle: titleInput.trim() });
    setEditingTitle(false);
  };

  const handleUpdateStatus = async (tag: JourneyStatusTag) => {
    if (!selectedEntry) return;
    await updateEntry(selectedEntry.id, { statusTag: tag });
  };

  const handleSaveNotes = async () => {
    if (!selectedEntry) return;
    setIsSavingNotes(true);
    await updateEntry(selectedEntry.id, { userNotes: notesInput });
    setTimeout(() => setIsSavingNotes(false), 500);
  };

  // ── 批量操作函数 ──────────────────────────────────────────────────────────
  const toggleSelectEntry = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map(e => e.id)));
    }
  };

  const triggerDeleteBatch = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setConfirmModal({
      isOpen: true,
      title: "批量抹除印记",
      message: `确定要将选中的 ${count} 段占卜记录从阿卡夏卷轴中永久抹除吗？一旦抹除，相关推演心得将彻底归于虚空。`,
      confirmText: `确认抹除 (${count})`,
      cancelText: "取消保留",
      danger: true,
      onConfirm: async () => {
        await deleteMultipleEntries(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsBatchMode(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBatchUpdateStatus = async (tag: JourneyStatusTag) => {
    if (selectedIds.size === 0) return;
    await updateMultipleEntries(Array.from(selectedIds), { statusTag: tag });
    setSelectedIds(new Set());
    setIsBatchMode(false);
  };

  const triggerDeleteSingle = (id: string, title?: string) => {
    setConfirmModal({
      isOpen: true,
      title: "抹除占卜印记",
      message: `确定要将「${title || '该条占卜印记'}」从阿卡夏卷轴中永久抹除吗？此操作不可逆。`,
      confirmText: "确认抹除",
      cancelText: "取消保留",
      danger: true,
      onConfirm: async () => {
        await deleteEntry(id);
        if (selectedEntryId === id) {
          handleBack();
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
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
  <historical_title>${selectedEntry.customTitle || selectedEntry.title}</historical_title>
  <historical_summary>${selectedEntry.summary}</historical_summary>
  ${selectedEntry.userNotes ? `<user_notes>${selectedEntry.userNotes}</user_notes>` : ''}
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
- 语言必须接地气且充满哲思，自然点缀神秘学 Emoji（如 🌌 🔮 🌿 🌙 ✨ 等）。
</constraints>

<output_format>
## ✦ 岁月回响 · 能量共振 ✦
（剖析往事在当下的余波与现实映射）

## ✦ 灵魂课题 · 破局法门 ✦
（给出当下最具操作性的心性与现实建议）

[SOUL_MOTTO]一句话命运真言[/SOUL_MOTTO]
</output_format>
`;

    try {
      let fullEcho = "";
      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullEcho += chunk;
        setEchoText(fullEcho);
      }
      if (selectedEntry) {
        updateEntry(selectedEntry.id, {
          details: {
            ...selectedEntry.details,
            echo: fullEcho
          } as any
        });
      }
    } catch (e) {
      console.error("Echo generation failed:", e);
    } finally {
      setIsEchoing(false);
    }
  };

  const renderStatusBadge = (tag?: JourneyStatusTag) => {
    if (tag === 'verified') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-serif flex items-center gap-1 font-bold">
          <CheckCircle2 size={10} /> ✦ 已应验
        </span>
      );
    }
    if (tag === 'in_progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-serif flex items-center gap-1">
          <Clock size={10} /> ⏳ 观察中
        </span>
      );
    }
    if (tag === 'cautious') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-serif flex items-center gap-1">
          <AlertCircle size={10} /> ⚠️ 警示中
        </span>
      );
    }
    return null;
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <BreathingLoading text="正在展开阿卡夏灵魂卷轴..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-12 pb-32">
      {/* ── 全局定制化确认弹窗 (Custom Obsidian Gold Confirm Modal) ── */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        danger={confirmModal.danger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <AnimatePresence mode="wait">
        {!selectedEntryId ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header & Stats & Batch Action Trigger */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <span className="text-xs font-mono text-[#C9A84C] tracking-[0.4em] uppercase font-bold">
                  阿卡夏记录 · AKASHIC CHRONICLES
                </span>
                <h1 className="text-4xl md:text-5xl font-serif text-[#FFFDF6]">
                  灵魂占卜日记
                </h1>
                <p className="text-xs md:text-sm text-[#E8DFB8]/60 font-serif">
                  记录你在岁月长河中的每一次问道、直觉洞察与现实应验
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 rounded-full obsidian-glass border border-[#C9A84C]/30 text-xs font-serif text-[#E8DFB8]">
                  已铭刻 <span className="text-[#C9A84C] font-bold font-mono">{entries.length}</span> 段命理印记
                </div>

                {entries.length > 0 && (
                  <button
                    onClick={() => {
                      setIsBatchMode(!isBatchMode);
                      setSelectedIds(new Set());
                    }}
                    className={`px-5 py-2.5 rounded-full border text-xs font-serif transition-all flex items-center gap-2 cursor-pointer ${
                      isBatchMode 
                        ? 'bg-[#C9A84C] text-[#080510] font-bold border-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.3)]' 
                        : 'obsidian-glass border-[#C9A84C]/30 text-[#E8DFB8] hover:border-[#C9A84C]/60 hover:text-white'
                    }`}
                  >
                    <CheckSquare size={14} />
                    <span>{isBatchMode ? '退出管理' : '批量管理'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C9A84C]/60" />
                <input 
                  type="text"
                  placeholder="搜索问事主题、牌面、复盘心得..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0c0617]/90 border border-[#C9A84C]/30 rounded-full pl-12 pr-6 py-3.5 text-sm font-serif text-[#FFFDF6] placeholder-[#E8DFB8]/30 focus:outline-none focus:border-[#C9A84C] transition-all"
                />
              </div>

              {/* 门类筛选 */}
              <div className="relative shrink-0">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#0c0617]/90 border border-[#C9A84C]/30 rounded-full px-6 py-3.5 text-xs font-serif text-[#E8DFB8] appearance-none pr-10 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
                >
                  <option value="all" className="bg-[#080510]">全部术数门类</option>
                  <option value="tarot" className="bg-[#080510]">神圣塔罗</option>
                  <option value="iching" className="bg-[#080510]">周易六爻</option>
                  <option value="bazi" className="bg-[#080510]">四柱八字</option>
                  <option value="astrology" className="bg-[#080510]">西方占星</option>
                  <option value="synastry" className="bg-[#080510]">双人合盘</option>
                  <option value="renji" className="bg-[#080510]">中医灵枢</option>
                  <option value="subconscious" className="bg-[#080510]">每日神谕</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C]/60 pointer-events-none" />
              </div>

              {/* 状态筛选 */}
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0c0617]/90 border border-[#C9A84C]/30 rounded-full px-6 py-3.5 text-xs font-serif text-[#E8DFB8] appearance-none pr-10 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
                >
                  <option value="all" className="bg-[#080510]">全部应验状态</option>
                  <option value="verified" className="bg-[#080510]">✦ 已应验 (Verified)</option>
                  <option value="in_progress" className="bg-[#080510]">⏳ 观察中 (In Progress)</option>
                  <option value="cautious" className="bg-[#080510]">⚠️ 警示中 (Caution)</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C]/60 pointer-events-none" />
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center opacity-40">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#C9A84C]/30 flex items-center justify-center">
                  <History size={32} />
                </div>
                <p className="font-serif italic tracking-widest text-[#E8DFB8]">暂无相关记录，开启你的第一次占卜吧</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntries.map((entry) => {
                  const isSelected = selectedIds.has(entry.id);
                  return (
                    <motion.div 
                      layoutId={entry.id}
                      key={entry.id}
                      onClick={() => {
                        if (isBatchMode) {
                          toggleSelectEntry(entry.id);
                        } else {
                          setSelectedEntryId(entry.id);
                        }
                      }}
                      className={`luxury-card p-6 cursor-pointer group transition-all flex flex-col justify-between h-72 relative overflow-hidden ${
                        isBatchMode && isSelected 
                          ? 'border-[#C9A84C] bg-[#C9A84C]/10 shadow-[0_0_30px_rgba(201,168,76,0.25)]' 
                          : 'hover:border-[#C9A84C]/60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isBatchMode && (
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-[#C9A84C] border-[#C9A84C] text-[#080510]' : 'border-white/30 bg-black/40'
                              }`}>
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                            )}
                            <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-[0.2em]">{entry.type}</span>
                            {renderStatusBadge(entry.statusTag)}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
                              <Calendar size={10} />
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                            {!isBatchMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerDeleteSingle(entry.id, entry.customTitle || entry.title);
                                }}
                                className="p-1.5 rounded-full text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="删除记录"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="text-xl font-serif text-[#FFFDF6] group-hover:text-[#F5E6AD] transition-colors line-clamp-2">
                          {entry.customTitle || cleanMysticContent(entry.title || "") || "无标题记录"}
                        </h3>

                        <p className="text-xs text-white/50 font-serif leading-relaxed line-clamp-2">
                          {(() => {
                            const cleanedSummary = cleanMysticContent(entry.summary || "");
                            if (cleanedSummary) return cleanedSummary;
                            const cleanedDetails = cleanMysticContent(entry.details?.text || "");
                            return cleanedDetails.substring(0, 120);
                          })() || "记录内容正在感应中..."}
                        </p>

                        {entry.userNotes && (
                          <div className="p-2.5 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[11px] text-[#F5E6AD]/90 font-serif line-clamp-1 italic">
                            📝 复盘：{entry.userNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-3">
                        {(() => {
                          const days = Math.floor((Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
                          if (days === 0) {
                            return <span className="text-[10px] text-[#C9A84C] font-serif flex items-center gap-1"><Clock size={10} /> ✦ 今日气数 · 正在显化</span>;
                          } else {
                            return <span className="text-[10px] text-white/40 font-serif flex items-center gap-1"><History size={10} /> 沉淀 {days} 天</span>;
                          }
                        })()}
                        {!isBatchMode && (
                          <span className="text-xs text-[#C9A84C] font-serif flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">查看详情 <ChevronRight size={14} /></span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── 底部浮动批量操作工具栏 (Floating Batch Operations Bar) ── */}
            <AnimatePresence>
              {isBatchMode && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] w-11/12 max-w-3xl bg-[#12081f]/95 border border-[#C9A84C]/50 rounded-full px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleSelectAll}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-serif text-[#E8DFB8] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare size={14} className="text-[#C9A84C]" />
                      <span>{selectedIds.size === filteredEntries.length ? "取消全选" : "全选当前"}</span>
                    </button>
                    <span className="text-xs font-serif text-[#E8DFB8]/70">
                      已选择 <span className="text-[#C9A84C] font-bold font-mono">{selectedIds.size}</span> 条
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 批量标记状态 */}
                    <button
                      disabled={selectedIds.size === 0}
                      onClick={() => handleBatchUpdateStatus('verified')}
                      className="px-3.5 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-serif hover:bg-emerald-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                      title="批量设为已应验"
                    >
                      <CheckCircle2 size={12} />
                      <span className="hidden sm:inline">已应验</span>
                    </button>

                    <button
                      disabled={selectedIds.size === 0}
                      onClick={() => handleBatchUpdateStatus('in_progress')}
                      className="px-3.5 py-2 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-serif hover:bg-purple-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                      title="批量设为观察中"
                    >
                      <Clock size={12} />
                      <span className="hidden sm:inline">观察中</span>
                    </button>

                    {/* 批量删除 */}
                    <button
                      disabled={selectedIds.size === 0}
                      onClick={triggerDeleteBatch}
                      className="px-4 py-2 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-serif hover:bg-rose-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <Trash2 size={13} />
                      <span>批量抹除</span>
                    </button>

                    {/* 退出管理 */}
                    <button
                      onClick={() => {
                        setIsBatchMode(false);
                        setSelectedIds(new Set());
                      }}
                      className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer ml-1"
                      title="完成退出"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : selectedEntry ? (
          <>
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBack}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div 
              key="detail"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                width: isFullScreen ? '100vw' : '90vw',
                height: isFullScreen ? '100vh' : '88vh',
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] bg-[#080510] overflow-y-auto shadow-2xl border border-white/10
                ${isFullScreen ? 'rounded-0' : 'rounded-[2.5rem] max-w-5xl'} 
                scrollbar-hide custom-scrollbar transition-all duration-500`}
            >

              <div className={`mx-auto space-y-10 p-6 md:p-14 ${isFullScreen ? 'max-w-6xl' : 'max-w-full'}`}>
                {/* Modal Header Controls */}
                <div className="flex items-center justify-between sticky top-0 bg-[#080510]/90 backdrop-blur-md z-30 pb-4 mb-4 border-b border-white/10">
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-[#C9A84C]/80 hover:text-[#C9A84C] transition-colors font-serif text-sm cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    返回记录卷轴
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => triggerDeleteSingle(selectedEntry.id, selectedEntry.customTitle || selectedEntry.title)}
                      className="p-3 rounded-full bg-white/5 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
                      title="删除此条记录"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleGeneratePoster(posterRef.current, `journey-${selectedEntry.id}.jpg`)}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-[#C9A84C]/80 hover:text-[#C9A84C] transition-all cursor-pointer"
                      title="保存海报"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-[#C9A84C]/80 hover:text-[#C9A84C] transition-all cursor-pointer"
                      title={isFullScreen ? "收起" : "全屏预览"}
                    >
                      {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button 
                      onClick={handleBack}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-[#C9A84C]/80 hover:text-[#C9A84C] transition-all cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div ref={posterRef} className="glass-panel p-6 md:p-12 rounded-[2.5rem] space-y-10 relative overflow-hidden bg-black/40">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Sparkles size={200} className="text-[#C9A84C]" />
                  </div>

                  {/* Title & Custom Title Editor */}
                  <div className="space-y-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#C9A84C] tracking-[0.4em] uppercase font-bold">
                            {selectedEntry.type}
                          </span>
                          {renderStatusBadge(selectedEntry.statusTag)}
                        </div>

                        {editingTitle ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={titleInput}
                              onChange={(e) => setTitleInput(e.target.value)}
                              className="bg-[#080510] border border-[#C9A84C] rounded-2xl px-5 py-2.5 text-xl md:text-3xl font-serif text-[#FFFDF6] w-full max-w-xl focus:outline-none"
                              placeholder="自定义标题..."
                              ref={(el) => el?.focus({ preventScroll: true })}
                            />
                            <button
                              type="button"
                              onClick={handleSaveTitle}
                              className="p-3 rounded-xl bg-[#C9A84C] text-[#080510] font-bold cursor-pointer hover:bg-[#E8DFB8]"
                              title="保存标题"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTitle(false)}
                              className="p-3 rounded-xl bg-white/10 text-white/60 cursor-pointer"
                              title="取消"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 group/title">
                            <h2 className="text-2xl md:text-4xl font-serif text-[#FFFDF6] leading-tight">
                              {selectedEntry.customTitle || selectedEntry.title}
                            </h2>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTitle(true);
                              }}
                              className="p-2 rounded-lg text-white/30 hover:text-[#C9A84C] hover:bg-white/5 opacity-0 group-hover/title:opacity-100 transition-opacity cursor-pointer"
                              title="重命名标题"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        )}

                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-white/30 uppercase font-mono tracking-widest mb-1">RECORDED ON</p>
                        <p className="text-sm text-[#E8DFB8]/60 font-serif">{new Date(selectedEntry.date).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Status Tag Selector */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <span className="text-xs font-serif text-[#C9A84C]/60 mr-2 flex items-center gap-1">
                        <Tag size={12} /> 状态标记：
                      </span>
                      {[
                        { id: 'none', label: '未标记' },
                        { id: 'verified', label: '✦ 已应验' },
                        { id: 'in_progress', label: '⏳ 观察中' },
                        { id: 'cautious', label: '⚠️ 警示中' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleUpdateStatus(item.id as JourneyStatusTag)}
                          className={`px-4 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                            (selectedEntry.statusTag || 'none') === item.id
                              ? "bg-[#C9A84C] text-[#080510] font-bold shadow-[0_0_15px_rgba(201,168,76,0.4)]"
                              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-[#C9A84C]/30 via-[#C9A84C]/10 to-transparent" />
                  </div>

                  {/* Complete Oracle Reading */}
                  <EntryDetailRenderer entry={selectedEntry} />

                  {/* 📝 个人现实复盘笔记 (Personal Verification & Notes) */}
                  <div className="mt-16 p-8 rounded-[2rem] bg-[#0c0617]/90 border border-[#C9A84C]/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText size={18} className="text-[#C9A84C]" />
                        <h4 className="font-serif text-lg text-[#E8DFB8] tracking-wider font-bold">
                          现实后验与复盘心得 / POST-HOC NOTES
                        </h4>
                      </div>
                      <button
                        onClick={handleSaveNotes}
                        className="px-5 py-2 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#F5E6AD] text-xs font-serif hover:bg-[#C9A84C] hover:text-[#080510] transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        <Save size={14} />
                        <span>{isSavingNotes ? "已保存" : "保存笔记"}</span>
                      </button>
                    </div>
                    <textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="在此记录现实事件的发展、应验细节或心境变化（例如：8月15日与对方沟通，结果确实如牌面所示...）"
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-serif text-[#FFFDF6] placeholder-white/20 focus:outline-none focus:border-[#C9A84C] transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Fate Echo Section */}
                  <div className="mt-20 pt-16 border-t border-amber-500/10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <Zap size={18} />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif text-amber-200 tracking-wider">命运回响 · Fate Echo</h3>
                          <p className="text-xs text-amber-200/50 font-serif italic">跨越时空的共振与生命蓝图复盘</p>
                        </div>
                      </div>
                      {echoText && !isEchoing && (
                        <button
                          onClick={handleGenerateEcho}
                          className="text-xs font-serif text-amber-400/60 hover:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 px-4 py-2 rounded-full transition-all cursor-pointer"
                        >
                          重新共鸣
                        </button>
                      )}
                    </div>

                    {(echoText || isEchoing) ? (
                      <div className="p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-[#1c0f07]/80 via-[#120804]/80 to-[#0c0502]/80 border border-amber-500/30 shadow-[0_10px_40px_rgba(217,119,6,0.15)] backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 w-full font-serif text-[#E8DFB8]">
                          {echoText ? (
                            <MysticMarkdown content={echoText} isLoading={isEchoing} />
                          ) : (
                            <div className="py-12">
                              <BreathingLoading text="正在感知岁月长河中的宿命回响..." />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 md:p-10 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 text-center space-y-6">
                        <p className="text-amber-200/70 font-serif text-sm max-w-lg mx-auto leading-relaxed">
                          每一段占卜都不是孤立的碎片。点击下方按钮，阿卡夏记录将结合你当下的时空坐标，为你揭示这段往事在此时此地所泛起的命运回响。
                        </p>
                        <button 
                          onClick={handleGenerateEcho}
                          className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-amber-100 transition-all font-serif tracking-widest shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Zap size={18} className="text-amber-300 group-hover:rotate-12 transition-transform" />
                          <span className="text-base font-medium">开启命运回响</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deep Dive Section */}
                <div className="mt-20 pt-16 border-t border-white/5 space-y-12">
                  <div className="text-center space-y-4">
                     <h4 className="text-3xl font-serif gold-gradient-text tracking-widest">深度对话 · Deep Dive</h4>
                     <p className="text-sm text-[#E8DFB8]/40 font-serif italic">阿卡夏记录是流动的，你可以继续询问这次洞见的余波...</p>
                  </div>
                  
                  <MysticChatInterface 
                     messages={messages.slice(1)}
                     input={chatInput}
                     setInput={setChatInput}
                     onSend={(e) => {
                       e.preventDefault();
                       sendMessage(chatInput);
                       setChatInput('');
                     }}
                     isLoading={isLoading}
                     isStreaming={isStreaming}
                     autoScroll={false}
                  />

                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
