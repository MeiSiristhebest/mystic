'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Coins, Clock, BookOpen, ChevronRight, Download, Map } from 'lucide-react';
import MysticMarkdown from './MysticMarkdown';
import BreathingLoading from './BreathingLoading';
import { playCoinSound } from '@/lib/audio';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { useAIStream } from '@/hooks/useAIStream';
import { AKASHA_PERSONA } from '@/lib/ai';
import { getQiMenServerData } from '@/app/actions/aiActions';

function HexagramDisplay({ lines }: { lines: number[] }) {
  if (!lines || lines.length !== 6) return null;
  
  const hasChanging = lines.some(l => l === 6 || l === 9);
  
  const renderHexagram = (hexLines: number[], title: string, showChanging: boolean) => {
    const reversedLines = [...hexLines].reverse();
    return (
      <div className="flex flex-col items-center gap-2">
        <h4 className="text-amber-500/80 font-serif text-sm mb-2">{title}</h4>
        <div className="flex flex-col gap-2 w-full max-w-[160px]">
          {reversedLines.map((val, idx) => {
            const isYang = val === 7 || val === 9;
            const isChanging = showChanging && (val === 6 || val === 9);
            const originalIndex = 5 - idx;
            return (
              <div key={idx} className="flex items-center gap-3 w-full">
                <span className="text-amber-500/40 font-serif text-[10px] w-6 text-right">
                  {originalIndex === 0 ? '初' : originalIndex === 5 ? '上' : ['二','三','四','五'][originalIndex - 1]}
                </span>
                <div className="flex-1 flex items-center justify-center gap-1.5 h-4 relative">
                  {isYang ? (
                    <div className="w-full h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                  ) : (
                    <>
                      <div className="w-[45%] h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                      <div className="w-[10%]" />
                      <div className="w-[45%] h-full bg-gradient-to-l from-amber-700 to-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                    </>
                  )}
                  {isChanging && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const changedLines = lines.map(l => {
    if (l === 6) return 7;
    if (l === 9) return 8;
    return l;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-6 mb-8 p-6 bg-black/30 rounded-2xl border border-amber-500/20 w-full"
    >
      <h3 className="text-amber-400 font-serif text-lg flex items-center gap-2">
        <Sparkles size={18} />
        卦象推演
      </h3>
      <div className="flex items-center justify-center gap-8 md:gap-16 w-full">
        {renderHexagram(lines, '本卦', true)}
        {hasChanging && (
          <>
            <div className="text-amber-500/40 animate-pulse">
              <ChevronRight size={24} />
            </div>
            {renderHexagram(changedLines, '变卦', false)}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function IChingApp({ mode = 'liuyao', onReadingChange }: { mode?: string, onReadingChange?: (reading: boolean) => void }) {
  const [question, setQuestion] = useState('');
  
  // Liu Yao state
  const [lines, setLines] = useState<number[]>([]); // 6 lines, 6=old yin, 7=young yang, 8=young yin, 9=old yang
  const [isTossing, setIsTossing] = useState(false);
  
  // Mei Hua state
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [error, setError] = useState('');

  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const posterRef = useRef<HTMLDivElement>(null);

  const { addEntry, updateEntry } = useJourney();
  const { getProfileContext } = useUserProfile();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();
  const { stream, isLoading: isStreaming, error: streamError, abort } = useAIStream();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (onReadingChange) {
      onReadingChange(isStreaming || isAskingFollowUp);
    }
  }, [isStreaming, isAskingFollowUp, onReadingChange]);

  const onGeneratePoster = useCallback(() => {
    if (!posterRef.current) return;
    handleGeneratePoster(posterRef.current, `akasha-iching-${mode}.jpg`);
  }, [handleGeneratePoster, mode]);

  const handleToss = () => {
    if (lines.length >= 6 || isTossing) return;
    setIsTossing(true);
    playCoinSound();
    
    setTimeout(() => {
      // simulate 3 coins
      const coins = [
        Math.random() > 0.5 ? 2 : 3, // 2=yin(tails), 3=yang(heads)
        Math.random() > 0.5 ? 2 : 3,
        Math.random() > 0.5 ? 2 : 3,
      ];
      const sum = coins[0] + coins[1] + coins[2]; // 6, 7, 8, 9
      setLines(prev => [...prev, sum]);
      setIsTossing(false);
    }, 800);
  };

  const handleMeihuaGenerate = () => {
    if (!num1 || !num2) {
      setError('请输入两个随机数字');
      return;
    }
    setError('');
    
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    
    const upper = n1 % 8 === 0 ? 8 : n1 % 8;
    const lower = n2 % 8 === 0 ? 8 : n2 % 8;
    const moving = (n1 + n2) % 6 === 0 ? 6 : (n1 + n2) % 6;
    
    const TRIGRAMS: Record<number, number[]> = {
      1: [7, 7, 7], // 乾
      2: [7, 7, 8], // 兑
      3: [7, 8, 7], // 离
      4: [7, 8, 8], // 震
      5: [8, 7, 7], // 巽
      6: [8, 7, 8], // 坎
      7: [8, 8, 7], // 艮
      8: [8, 8, 8], // 坤
    };
    
    const meihuaLines = [...TRIGRAMS[lower], ...TRIGRAMS[upper]];
    meihuaLines[moving - 1] = meihuaLines[moving - 1] === 7 ? 9 : 6;
    
    setLines(meihuaLines);
    
    generateReading('meihua', { num1: n1, num2: n2 });
  };

  const handleLiuyaoComplete = () => {
    if (lines.length === 6) {
      generateReading('liuyao', { lines });
    }
  };

  const generateReading = async (type: string, data: { num1?: number, num2?: number, lines?: number[] }) => {
    const profileContext = getProfileContext();
    
    // Sanitize question
    const sanitizedQuestion = question.replace(/["'{}[\]]/g, "").substring(0, 200);

    let prompt = '';
    if (type === 'qimen') {
      const qimenData = await getQiMenServerData(new Date());
      prompt = `
<instruction>
这是一次正式的奇门遁甲（时家奇门）排盘与预测。请严格基于系统提供的基础数据进行排盘与解读。
</instruction>

<divination_context>
  <time>${new Date().toLocaleString('zh-CN')}</time>
  <jie_qi>${qimenData.jieQi}</jie_qi>
  <ba_zi>${qimenData.baZi.join(' ')}</ba_zi>
  <day_night>${qimenData.isDaylight ? '昼' : '夜'}</day_night>
</divination_context>

<user_profile>
  ${profileContext}
</user_profile>

<user_question>
  ${sanitizedQuestion || '无具体问题，请测近期局势'}
</user_question>

<output_format>
请使用Markdown排版，必须且只能包含以下结构：
## ☯️ 奇门排盘局象
（请根据提供的基础数据推算阴阳遁局数，定地盘、天盘、人盘八门、神盘八神、九星，并简述当前格局，如伏吟、反吟、吉凶格等）

## 🔍 用神与多维分析
（根据用户的问题提取用神，分析日干、时干的落宫生克关系，结合八门、九星、八神分析天时、地利、人和、神助）

## 🌟 破局与行动指引
（给出具体的趋吉避凶建议，包括有利方位、时机、策略等）
</output_format>
      `;
    } else if (type === 'liuyao') {
      const lineNames = (data.lines || []).map((l: number, i: number) => {
        const names: Record<number, string> = { 6: '老阴 (动)', 7: '少阳', 8: '少阴', 9: '老阳 (动)' };
        return `第${i + 1}爻 (初爻起)：${names[l]} (${l})`;
      }).join('\n');
      
      prompt = `
<instruction>
这是一次正式的六爻金钱卦占卜。请用中文提供一份专业、深刻、严谨的易经六爻排盘与解读报告。
</instruction>

<divination_context>
  <method>六爻起卦法</method>
  <lines_drawn>
${lineNames}
  </lines_drawn>
</divination_context>

<user_profile>
  ${profileContext}
</user_profile>

<user_question>
  ${sanitizedQuestion || '无具体问题，请测近期运势'}
</user_question>

<output_format>
请使用Markdown排版，必须且只能包含以下结构：
## ☯️ 卦象解析（本卦与变卦）
（请排盘出本卦与变卦，并解析卦名、卦辞、爻辞的含义）

## 🔍 六爻动静分析
（分析世应关系、用神、动爻与变爻的作用，以及五行生克制化）

## 🌟 最终断语与指引
（结合卦象与用户的问题，给出客观、具有启发性和建设性的最终建议）
</output_format>
      `;
    } else {
      prompt = `
<instruction>
这是一次正式的梅花易数占卜。请用中文提供一份专业、深刻、严谨的梅花易数排盘与解读报告。
</instruction>

<divination_context>
  <method>梅花易数起卦法（数字起卦）</method>
  <numbers_provided>
    <num1>${data.num1}</num1>
    <num2>${data.num2}</num2>
  </numbers_provided>
</divination_context>

<user_profile>
  ${profileContext}
</user_profile>

<user_question>
  ${sanitizedQuestion || '无具体问题，请测近期运势'}
</user_question>

<output_format>
请使用Markdown排版，必须且只能包含以下结构：
## ☯️ 卦象解析（本卦、互卦、变卦）
（根据数字起卦法：第一个数除以8余数为上卦，第二个数除以8余数为下卦，两数之和加当前时辰数除以6余数为动爻。请假设当前时辰为随机，或仅用两数之和除以6取动爻。解析卦名与卦象）

## 🔍 体用生克分析
（分析体卦与用卦的五行生克关系，以及互卦、变卦的影响）

## 🌟 最终断语与指引
（结合卦象与用户的问题，给出客观、具有启发性和建设性的最终建议）
</output_format>
      `;
    }

    try {
      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);
      
      const systemInstruction = `${AKASHA_PERSONA}\n你是一位精通《易经》、六爻预测学和梅花易数的导师。你正在为用户进行一次${type === 'liuyao' ? '六爻' : type === 'meihua' ? '梅花易数' : '奇门遁甲'}分析。`;
      
      for await (const chunk of stream(prompt, systemInstruction)) {
        fullResponse += chunk;
        setMessages([{ role: 'model', content: fullResponse }]);
      }
      
      // Save to Journey
      let titlePrefix = '易经占卜';
      if (type === 'liuyao') titlePrefix = '六爻排盘';
      if (type === 'meihua') titlePrefix = '梅花易数';
      if (type === 'qimen') titlePrefix = '奇门遁甲';

      const id = await addEntry({
        type: 'iching',
        title: sanitizedQuestion ? `${titlePrefix}：${sanitizedQuestion}` : `${titlePrefix}`,
        summary: fullResponse.substring(0, 100) + '...',
        details: { 
          type: 'iching',
          text: fullResponse, 
          data: { method: type, question: sanitizedQuestion }, 
          messages: [{ role: 'model', content: fullResponse }] 
        }
      });
      setCurrentEntryId(id || null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(err);
      } else if (!(err instanceof Error)) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isStreaming || !currentEntryId) return;

    const userMsg = chatInput;
    setChatInput('');
    setIsAskingFollowUp(true);

    const newMessages = [...messages, { role: 'user', content: userMsg } as const];
    setMessages([...newMessages, { role: 'model', content: "" }]);

    try {
      let fullResponse = "";
      const systemInstruction = `${AKASHA_PERSONA}\n你是一位精通《易经》、六爻预测学和梅花易数的导师。你正在为用户进行一次${mode === 'liuyao' ? '六爻' : mode === 'meihua' ? '梅花易数' : '奇门遁甲'}分析。`;
      
      for await (const chunk of stream(userMsg, systemInstruction)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }
      
      const finalMsgs = [...newMessages, { role: 'model', content: fullResponse } as const];
      const fullText = finalMsgs.map(m => m.role === 'user' ? `**你**：${m.content}` : `**阿卡夏**：${m.content}`).join('\n\n---\n\n');
      
      updateEntry(currentEntryId, { 
        details: { 
          type: 'iching',
          text: fullText, 
          data: { method: mode, question, hexagrams: lines }, 
          messages: finalMsgs 
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const renderLine = (val: number, index: number) => {
    const isYang = val === 7 || val === 9;
    const isChanging = val === 6 || val === 9;
    return (
      <motion.div 
        key={index} 
        initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-4 my-1.5 w-full max-w-[240px]"
      >
        <span className="text-amber-500/60 font-serif text-sm w-12 text-right">第{index + 1}爻</span>
        <div className="flex-1 flex items-center justify-center gap-2 h-8 relative">
          {isYang ? (
            <motion.div 
              className="w-full h-4 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 rounded-sm relative shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
               {isChanging && (
                 <motion.div 
                   initial={{ scale: 0, rotate: -180 }}
                   animate={{ scale: 1, rotate: 0 }}
                   transition={{ type: "spring", delay: 0.5 }}
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] flex items-center justify-center"
                 >
                   <div className="w-2 h-2 rounded-full bg-amber-600" />
                 </motion.div>
               )}
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="w-[45%] h-4 bg-gradient-to-r from-amber-700 to-amber-500 rounded-sm relative shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: 'left' }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {isChanging && (
                  <motion.div 
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.5 }}
                    className="absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] flex items-center justify-center z-10"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                  </motion.div>
                )}
              </motion.div>
              <div className="w-[10%]"></div>
              <motion.div 
                className="w-[45%] h-4 bg-gradient-to-l from-amber-700 to-amber-500 rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: 'right' }}
                transition={{ duration: 0.4, delay: 0.1 }}
              ></motion.div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {messages.length === 0 && !isStreaming ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center"
        >
          <div className="w-full flex flex-col gap-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Question */}
              <div className="flex flex-col md:col-span-2 max-w-2xl mx-auto w-full">
                <label htmlFor="question" className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest mt-4">
                  1. 你的问题（选填）
                </label>
                <textarea
                  id="question"
                  rows={4}
                  className="w-full flex-1 bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all resize-none"
                  placeholder="例如：我最近的感情走向如何？或 我该如何突破事业瓶颈？"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
            </div>

            {/* Action Area */}
            <div className="w-full flex flex-col items-center mt-4">
              {mode === 'liuyao' ? (
                <div className="flex flex-col items-center w-full">
                  <div className="flex flex-col-reverse items-center mb-8 min-h-[200px] w-full bg-black/30 rounded-xl p-6 border border-amber-500/20">
                    {lines.length === 0 ? (
                      <p className="text-amber-500/50 font-serif italic my-auto">点击下方按钮开始摇卦，共需摇卦六次</p>
                    ) : (
                      lines.map((l, i) => renderLine(l, i))
                    )}
                  </div>
                  
                  {lines.length < 6 ? (
                    <button
                      onClick={handleToss}
                      disabled={isTossing}
                      className="group relative px-10 py-4 w-full md:w-1/2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(180,110,20,0.4)] hover:shadow-[0_0_30px_rgba(200,130,30,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Coins size={20} className={`text-amber-300 ${isTossing ? 'animate-spin' : ''}`} />
                        {isTossing ? '摇卦中...' : `第 ${lines.length + 1} 次摇卦`}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handleLiuyaoComplete}
                      className="group relative px-10 py-4 w-full md:w-1/2 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 text-emerald-100 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Sparkles size={20} className="text-emerald-300" />
                        解卦
                      </span>
                    </button>
                  )}
                </div>
              ) : mode === 'meihua' ? (
                <div className="flex flex-col items-center w-full max-w-md">
                  <div className="flex gap-4 w-full mb-8">
                    <input
                      type="number"
                      placeholder="第一个数字"
                      value={num1}
                      onChange={(e) => setNum1(e.target.value)}
                      className="w-1/2 bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-center text-xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      placeholder="第二个数字"
                      value={num2}
                      onChange={(e) => setNum2(e.target.value)}
                      className="w-1/2 bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-center text-xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm mb-4 font-serif">{error}</p>
                  )}
                  <button
                    onClick={handleMeihuaGenerate}
                    className="group relative px-10 py-4 w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(180,110,20,0.4)] hover:shadow-[0_0_30px_rgba(200,130,30,0.6)] transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles size={20} className="text-amber-300" />
                      起卦并解析
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="flex flex-col items-center justify-center mb-8 min-h-[200px] w-full bg-black/30 rounded-xl p-6 border border-amber-500/20">
                    <Map className="w-16 h-16 text-amber-500/30 mb-4" />
                    <p className="text-amber-200/80 font-serif text-center max-w-md">
                      奇门遁甲以当前时辰为基准排盘，无需额外起卦操作。<br/>
                      请在上方输入您的问题，然后点击下方按钮开始推演。
                    </p>
                  </div>
                  
                  <button
                    onClick={() => generateReading('qimen', {})}
                    className="group relative px-10 py-4 w-full md:w-1/2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(180,110,20,0.4)] hover:shadow-[0_0_30px_rgba(200,130,30,0.6)] transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles size={20} className="text-amber-300" />
                      开始奇门推演
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                  </button>
                </div>
              )}
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
            <div
              ref={posterRef}
              data-poster-container
              className="w-full glass-panel p-8 md:p-12 rounded-3xl relative pb-8"
            >
              {/* Poster Header */}
              <div className="hidden show-in-poster w-full text-center mb-8 pt-4">
                <h2 className="text-4xl font-serif text-amber-400 mb-4 tracking-widest">
                  阿卡夏之眼 · {mode === 'liuyao' ? '六爻排盘' : '梅花易数'}
                </h2>
                {question && (
                  <p className="text-amber-500/80 text-lg italic">
                    &quot;{question}&quot;
                  </p>
                )}
              </div>


              
              {isStreaming && messages.length === 0 ? (
                <BreathingLoading text="正在推演先天八卦与后天八卦的玄妙变化..." />
              ) : streamError ? (
                <div className="text-center text-red-400 py-8 font-serif">{streamError}</div>
              ) : (
                <div className="flex flex-col space-y-8 w-full">
                  {lines.length === 6 && <HexagramDisplay lines={lines} />}
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
                  
                  {isStreaming && messages.length > 0 && (
                    <div className="flex items-start hide-in-poster">
                      <div className="glass-panel bg-black/40 rounded-2xl p-6 w-full">
                        <BreathingLoading text="正在倾听星辰的回应..." />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Poster Footer */}
              <div className="hidden show-in-poster w-full text-center mt-12 pt-8 border-t border-amber-500/20">
                <div className="flex items-center justify-center gap-2 text-amber-500/60 mb-2">
                  <Sparkles size={16} />
                  <span className="font-serif tracking-widest text-sm">阿卡夏之眼 AI 命理</span>
                  <Sparkles size={16} />
                </div>
                <p className="text-xs text-amber-500/40 font-mono">
                  {new Date().toLocaleDateString()} · 仅供娱乐与自我探索
                </p>
              </div>
            </div>

            {(!isStreaming && !isAskingFollowUp) && !streamError && messages.length > 0 && (
              <form onSubmit={handleSendMessage} className="mt-8 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="对卦象有疑问？继续向阿卡夏提问..."
                  className="w-full bg-black/40 border border-amber-500/30 rounded-full py-4 pl-6 pr-16 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-serif"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-amber-600 hover:bg-amber-500 text-amber-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
            
            {!isStreaming && !isAskingFollowUp && messages.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 hide-in-poster">
                  <button
                    onClick={() => { setMessages([]); setLines([]); setNum1(''); setNum2(''); setCurrentEntryId(null); abort(); }}
                    className="px-6 py-2 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full font-serif transition-colors"
                  >
                    结束问卦，收起蓍草
                  </button>
                  <button
                    onClick={onGeneratePoster}
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
