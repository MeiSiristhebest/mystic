'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Calendar, Clock, User, ChevronRight, Star, Download } from 'lucide-react';
import MysticMarkdown from './MysticMarkdown';
import BreathingLoading from './BreathingLoading';
import { AKASHA_PERSONA, MODELS } from '@/lib/ai';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { useAIStream } from '@/hooks/useAIStream';
import { getBaziData, getZiweiServerData } from '@/app/actions/aiActions';
import { useUserProfile } from "@/hooks/useUserProfile";
import { useJourney } from "@/hooks/useJourney";

const BAZI_MODES = [
  { id: 'bazi', name: '八字排盘 (四柱预测)', description: '根据出生年月日时，排出天干地支，分析一生的命运起伏、大运流年与五行喜忌。' },
  { id: 'ziwei', name: '紫微斗数 (星盘解析)', description: '以北斗星群为主，排出十二宫位，精细分析性格、事业、财运、婚姻等人生百态。' },
  { id: 'liunian', name: '流年避坑 (趋吉避凶)', description: '分析近期运势的起伏，找出可能遇到的障碍、危机与小人，并提供化解之道。' },
];

function ZiweiLoading() {
  const palaces = [
    { name: '子', pos: 'top-0 left-0' },
    { name: '丑', pos: 'top-0 left-[33.33%]' },
    { name: '寅', pos: 'top-0 left-[66.66%]' },
    { name: '卯', pos: 'top-0 right-0' },
    { name: '辰', pos: 'top-[33.33%] left-0' },
    { name: '巳', pos: 'top-[33.33%] right-0' },
    { name: '午', pos: 'top-[66.66%] left-0' },
    { name: '未', pos: 'top-[66.66%] right-0' },
    { name: '申', pos: 'bottom-0 left-0' },
    { name: '酉', pos: 'bottom-0 left-[33.33%]' },
    { name: '戌', pos: 'bottom-0 left-[66.66%]' },
    { name: '亥', pos: 'bottom-0 right-0' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative w-64 h-64 md:w-80 md:h-80 border border-amber-500/10 p-2">
        <div className="absolute top-[33.33%] left-[33.33%] w-[33.33%] h-[33.33%] flex items-center justify-center border border-amber-500/20 bg-black/40">
          <div className="text-amber-500/80 font-serif text-xl tracking-widest animate-pulse">
            紫微星盘
          </div>
        </div>
        {palaces.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute w-[33.33%] h-[33.33%] border border-amber-500/20 flex flex-col items-center justify-center ${p.pos}`}
            initial={{ opacity: 0.2, backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              backgroundColor: ['rgba(245,158,11,0)', 'rgba(245,158,11,0.1)', 'rgba(245,158,11,0)']
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          >
            <span className="text-amber-500/40 font-serif text-sm">{p.name}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-amber-200/80 font-serif italic animate-pulse">
        正在排布十二宫位与满天星宿...
      </p>
    </div>
  );
}

interface BaziAppProps {
  mode?: string;
  onReadingChange?: (reading: boolean) => void;
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function BaziApp({ 
  mode: initialMode = 'bazi', 
  onReadingChange,
  initialHandoff,
  clearHandoff
}: BaziAppProps) {
  const [mode, setMode] = useState(initialMode);
  const [question, setQuestion] = useState('');
  const { profile, getProfileContext } = useUserProfile();
  const { addEntry, updateEntry } = useJourney();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const [birthDate, setBirthDate] = useState(profile.birthDate || '');
  const [birthTime, setBirthTime] = useState(profile.birthTime || '');
  const [gender, setGender] = useState(profile.gender === '女' ? 'female' : 'male');
  const [birthPlace, setBirthPlace] = useState(profile.birthPlace || '');
  const [fullName, setFullName] = useState(profile.name || '');

  const [error, setError] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const [prevProfile, setPrevProfile] = useState(profile);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  if (profile !== prevProfile) {
    if (profile.birthDate) setBirthDate(profile.birthDate);
    if (profile.birthTime) setBirthTime(profile.birthTime);
    if (profile.gender) setGender(profile.gender === '女' ? 'female' : 'male');
    if (profile.birthPlace) setBirthPlace(profile.birthPlace);
    if (profile.name) setFullName(profile.name);
    setPrevProfile(profile);
  }

  const { stream, isLoading: isReading, error: streamError, abort } = useAIStream({ model: MODELS.PRO });

  const handleGenerate = async () => {
    if (!birthDate || !birthTime) {
      setError('请填写完整的出生日期和时间');
      return;
    }
    
    setError('');
    setMessages([]);
    setCurrentEntryId(null);
    
    try {
      const { baziString, lunarDateString } = await getBaziData(birthDate, birthTime);
      const profileContext = getProfileContext();
      const sanitizedQuestion = (question || '').replace(/[<>]/g, '').substring(0, 500);

      let prompt = '';
      const nameAnalysisPrompt = fullName ? `
          
          【附加：姓名学解析】
          用户提供了姓名：${fullName}
          请在报告的最后，增加一个专门的章节：
          ### 🔤 姓名五格数理与八字契合度分析
          （简析该姓名的繁体笔画数、五格数理吉凶，并结合上述的八字喜用神，评价该姓名对用户运势的补益或消耗作用，给出改名或化解建议）
      ` : '';

      if (mode === 'bazi') {
        prompt = `
          这是一次正式的八字命理排盘与解析。
          用户的出生信息如下（公历）：
          日期：${birthDate}
          时间：${birthTime}
          性别：${gender === 'male' ? '男 (乾造)' : '女 (坤造)'}
          出生地：${birthPlace || '未提供'}
          
          农历：${lunarDateString}
          八字（四柱）：${baziString}
          
          用户心中默念的问题或关注点是：“${sanitizedQuestion || '无具体问题，请全面解析一生运势'}”
          ${profileContext}
          
          请用中文提供一份专业、深刻、严谨的八字排盘与解读报告。
          请使用Markdown格式排版，必须包含以下结构：
          ### ☯️ 八字排盘（四柱八字）
          （直接展示系统计算出的八字：${baziString}，并标明十神与藏干）
          
          ### 🔍 五行喜忌与格局分析
          （分析日主强弱、五行生克制化、格局高低，以及喜用神与忌神）
          
          ### 🌟 大运流年与核心指引
          （结合用户的性别推算大运走向，分析近几年的流年运势，并针对用户的问题给出客观、具有启发性和建设性的最终建议）${nameAnalysisPrompt}
        `;
      } else if (mode === 'liunian') {
        prompt = `
          这是一次专门针对“流年避坑（趋吉避凶）”的八字命理深度解析。
          用户的出生信息如下（公历）：
          日期：${birthDate}
          时间：${birthTime}
          性别：${gender === 'male' ? '男 (乾造)' : '女 (坤造)'}
          出生地：${birthPlace || '未提供'}
          
          农历：${lunarDateString}
          八字（四柱）：${baziString}
          
          用户心中默念的避坑问题或关注点是：“${sanitizedQuestion || '无具体问题，请全面分析近期流年可能遇到的危机与障碍'}”
          ${profileContext}
          
          请用中文提供一份专业、深刻、严谨的流年避坑指南。
          请使用Markdown格式排版，必须包含以下结构：
          ### ⚠️ 近期流年危机预警
          （结合用户的八字与当前大运流年，明确指出今年或明年可能面临的最大挑战、潜在危机、健康隐患或小人作祟的领域）
          
          ### 🔍 危机产生的原因剖析
          （从五行生克、十神冲合的角度，深入分析为什么会在这个时间段出现这些问题，是流年冲克了用神，还是岁运并临等）
          
          ### 🛡️ 趋吉避凶与化解之道
          （给出具体、可操作的化解建议。包括但不限于：行为风水调整、心态建设、人际关系防范、适合的方位或颜色、以及在关键月份需要特别注意的事项）
          
          ### 🌟 最终的走向与展望
          （在度过这些难关后，运势将迎来怎样的转机，给予用户信心与力量）${nameAnalysisPrompt}
        `;
      } else {
        const [hourNum] = birthTime.split(':').map(Number);
        const ziweiData = await getZiweiServerData(birthDate, hourNum, gender === 'male' ? '男' : '女');
        const ziweiString = JSON.stringify(ziweiData, null, 2);

        prompt = `
          这是一次正式的紫微斗数排盘与解析。
          用户的出生信息如下（公历）：
          日期：${birthDate}
          时间：${birthTime}
          性别：${gender === 'male' ? '男' : '女'}
          出生地：${birthPlace || '未提供'}
          
          农历：${lunarDateString}
          八字（四柱）：${baziString}
          紫微斗数星盘数据：
          ${ziweiString}
          
          用户心中默念的问题或关注点是：“${sanitizedQuestion || '无具体问题，请全面解析十二宫位'}”
          ${profileContext}
          
          请用中文提供一份专业、深刻、严谨的紫微斗数排盘与解读报告。
          请使用Markdown格式排版，必须包含以下结构：
          ### ☯️ 紫微星盘格局
          （请根据出生时间，推算出命宫主星、身宫位置，以及主要的吉星与煞星分布，定出紫微星盘的基本格局）
          
          ### 🔍 十二宫位全盘深度解析
          （请务必逐一详细解析以下十二个宫位，分析其中的星曜组合与吉凶影响）
          
          ### 🌟 运势起伏与核心指引
          （分析当前的大限与流年运势，并针对用户的问题给出客观、具有启发性和建设性的最终建议）${nameAnalysisPrompt}
        `;
      }

      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);
      
      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullResponse += chunk;
        setMessages([{ role: 'model', content: fullResponse }]);
      }
      
      try {
        let titlePrefix = '命理排盘';
        if (mode === 'liunian') titlePrefix = '流年避坑';
        if (mode === 'ziwei') titlePrefix = '紫微斗数';

        const id = await addEntry({
          type: 'bazi',
          title: sanitizedQuestion ? `${titlePrefix}：${sanitizedQuestion}` : `${titlePrefix}`,
          summary: fullResponse.substring(0, 100) + '...',
          details: { 
            type: 'bazi',
            text: fullResponse, 
            mode, 
            birthDate, 
            birthTime, 
            gender, 
            birthPlace, 
            fullName, 
            messages: [{ role: 'model', content: fullResponse }] 
          }
        });
        setCurrentEntryId(id || null);
      } catch (e) {
        console.error('Failed to save journey', e);
      }
    } catch (err: unknown) {
      setError('推演命理时遇到了星象干扰，请稍后再试。');
    }
  };

  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        const q = initialHandoff.question || initialHandoff.context;
        const m = initialHandoff.modeId;
        
        if (q) setQuestion(q);
        if (m && ['bazi', 'ziwei', 'liunian'].includes(m)) {
          setMode(m);
        }
        
        // Auto-trigger if we have enough info
        if (q && q.length > 5) {
          handleGenerate();
        }
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff, handleGenerate]);

  useEffect(() => {
    if (onReadingChange) {
      onReadingChange(isReading || isAskingFollowUp);
    }
  }, [isReading, isAskingFollowUp, onReadingChange]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentEntryId) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setIsAskingFollowUp(true);

    const newMessages = [...messages, { role: 'user', content: userMsg } as const];
    setMessages([...newMessages, { role: 'model', content: "" }]);

    try {
      let fullResponse = "";
      for await (const chunk of stream(userMsg, AKASHA_PERSONA)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }

      const finalMessages = [...newMessages, { role: 'model', content: fullResponse } as const];
      const fullText = finalMessages
        .map(m => m.role === 'user' ? `**问**：${m.content}` : `**阿卡夏**：${m.content}`)
        .join('\n\n---\n\n');
      
      updateEntry(currentEntryId, { 
        details: { 
          type: 'bazi',
          text: fullText, 
          mode, 
          birthDate, 
          birthTime, 
          gender, 
          birthPlace, 
          fullName, 
          messages: finalMessages
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {messages.length === 0 && !isReading ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center"
        >
          <div className="w-full flex flex-col gap-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4 md:col-span-2 max-w-2xl mx-auto w-full">
                <label className="block text-sm font-medium text-amber-200/80 mb-1 font-serif uppercase tracking-widest">
                  1. 您的出生信息 (公历)
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-amber-500/60 mb-1">出生日期</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-3 text-amber-100 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-amber-500/60 mb-1">出生时间</label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-3 text-amber-100 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex-1">
                    <label className="block text-xs text-amber-500/60 mb-1">性别</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-3 text-amber-100 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="male">男 (乾造)</option>
                      <option value="female">女 (坤造)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-amber-500/60 mb-1">出生地 (选填)</label>
                    <input
                      type="text"
                      placeholder="例如：北京"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-3 text-amber-100 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <label className="block text-xs text-amber-500/60 mb-1">您的姓名 (选填)</label>
                    <input
                      type="text"
                      placeholder="例如：李华"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-3 text-amber-100 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col max-w-2xl mx-auto">
              <label htmlFor="question" className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest mt-4">
                2. 您的关注点（选填）
              </label>
              <textarea
                id="question"
                rows={3}
                className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all resize-none"
                placeholder="例如：我想重点看看今年的事业发展，或者我的正缘什么时候出现？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="w-full flex flex-col items-center mt-4">
              {error && <p className="text-red-400 text-sm mb-4 font-serif">{error}</p>}
              <button
                onClick={handleGenerate}
                className="group relative px-10 py-4 w-full md:w-1/2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(180,110,20,0.4)] hover:shadow-[0_0_30px_rgba(200,130,30,0.6)] transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles size={20} className="text-amber-300" />
                  开始排盘解读
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-4xl relative"
          >
            <div ref={posterRef} className="w-full glass-panel p-8 md:p-12 rounded-3xl relative pb-8">
              <div className="hidden show-in-poster w-full text-center mb-8 pt-4">
                <h2 className="text-4xl font-serif text-amber-400 mb-4 tracking-widest">阿卡夏之窗 · {mode === 'bazi' ? '八字排盘' : mode === 'ziwei' ? '紫微斗数' : '流年避坑'}</h2>
                <p className="text-amber-500/80 text-lg">
                  {birthDate} {birthTime} {gender === 'male' ? '乾造' : '坤造'} {birthPlace} {fullName ? ` | ${fullName}` : ''}
                </p>
              </div>
              {isReading ? (
                mode === 'ziwei' ? <ZiweiLoading /> : (
                  <BreathingLoading text="正在推演天干地支与星宿轨迹..." />
                )
              ) : (error || streamError) ? (
                <div className="text-center text-red-400 py-8 font-serif">{error || streamError}</div>
              ) : (
                <div className="flex flex-col space-y-8">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center'}`}>
                      <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-6 ${msg.role === 'user' ? 'bg-amber-900/40 border border-amber-500/30 text-amber-100' : 'bg-black/20 markdown-body w-full'}`}>
                        {msg.role === 'user' ? (
                          <p className="font-serif">{msg.content}</p>
                        ) : (
                          <MysticMarkdown content={msg.content} />
                        )}
                      </div>
                    </div>
                  ))}
                  {isAskingFollowUp && (
                    <div className="flex items-start hide-in-poster">
                      <div className="glass-panel bg-black/40 rounded-2xl p-6 w-full">
                        <BreathingLoading text="正在倾听星辰的回答..." />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="hidden show-in-poster w-full text-center mt-12 pt-8 border-t border-amber-500/20">
                <div className="flex items-center justify-center gap-2 text-amber-500/60 mb-2">
                  <Sparkles size={16} />
                  <span className="font-serif tracking-widest text-sm">阿卡夏之窗 AI 命理</span>
                  <Sparkles size={16} />
                </div>
                <p className="text-xs text-amber-500/40 font-mono">
                  {new Date().toLocaleDateString()} · 仅供娱乐与自我探索
                </p>
              </div>
            </div>
            {!isReading && !error && (
              <form onSubmit={handleSendMessage} className="mt-8 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="对命盘有疑问？继续向阿卡夏提问..."
                  className="w-full bg-black/40 border border-amber-500/30 rounded-full py-4 pl-6 pr-16 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-serif"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-amber-600 hover:bg-amber-500 text-amber-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
            {!isReading && (
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 hide-in-poster">
                <button
                  onClick={() => { setMessages([]); setCurrentEntryId(null); abort(); }}
                  className="px-6 py-2 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full font-serif transition-colors"
                >
                  结束排盘，合上命册
                </button>
                <button
                  onClick={() => handleGeneratePoster(posterRef.current, `akashic-${mode}.jpg`)}
                  disabled={isGeneratingPoster}
                  className="glass-button px-6 py-2 text-amber-200 rounded-full font-serif hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Download size={16} className={isGeneratingPoster ? "animate-bounce" : ""} />
                  {isGeneratingPoster ? "生成中..." : "生成分享海报"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
