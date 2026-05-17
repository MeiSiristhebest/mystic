'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Coins, Map, Download } from 'lucide-react';

// Components & Layout
import RitualLayout from './MainApp/RitualLayout';
import MysticChatInterface from './MainApp/MysticChatInterface';
import BreathingLoading from './BreathingLoading';
import { HexagramDisplay } from './MainApp/IChing/HexagramDisplay';

// Hooks & Lib
import { useIChingEngine } from '@/hooks/useIChingEngine';
import { useAIChat } from '@/hooks/useAIChat';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { getIChingPrompt } from '@/lib/prompts';
import { getQiMenServerData } from '@/app/actions/aiActions';
import { playMysticChime, triggerHapticVibration } from '@/lib/audio';

interface IChingAppProps {
  mode?: string;
  onReadingChange?: (reading: boolean) => void;
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export default function IChingApp({ 
  mode: initialMode = 'liuyao', 
  onReadingChange,
  initialHandoff,
  clearHandoff
}: IChingAppProps) {
  const [mode, setMode] = useState(initialMode);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialMode) setMode(initialMode);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialMode]);

  const { 
    lines, setLines, isTossing, handleToss, calculateMeihua, 
    num1, setNum1, num2, setNum2, resetEngine 
  } = useIChingEngine();

  const { 
    messages, sendMessage, isLoading, isStreaming, resetChat, currentEntryId, abort 
  } = useAIChat({ type: 'iching' });

  const { getProfileContext } = useUserProfile();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();

  // Sync reading state to parent
  useEffect(() => {
    onReadingChange?.(isLoading);
  }, [isLoading, onReadingChange]);

  const handleGenerate = useCallback(async (type: 'liuyao' | 'meihua' | 'qimen', customLines?: number[], overrideNum1?: string, overrideNum2?: string) => {
    playMysticChime();
    triggerHapticVibration();

    const profileContext = getProfileContext();
    let promptData: any = { method: type };

    if (type === 'meihua') {
      const activeNum1 = overrideNum1 || num1;
      const activeNum2 = overrideNum2 || num2;
      if (!activeNum1 || !activeNum2) { setError('请输入两个随机数字'); return; }
      const { lines: mhLines, n1, n2 } = calculateMeihua(activeNum1, activeNum2);
      setLines(mhLines);
      promptData = { ...promptData, lines: mhLines, num1: n1, num2: n2 };
    } else if (type === 'liuyao') {
      const activeLines = customLines || lines;
      if (activeLines.length !== 6) return;
      promptData = { ...promptData, lines: activeLines };
    } else if (type === 'qimen') {
      const qimenData = await getQiMenServerData(new Date());
      promptData = { ...promptData, ...qimenData };
    }

    const prompt = getIChingPrompt({
      type,
      question,
      profileContext,
      data: promptData
    });

    await sendMessage(prompt, {
      title: question ? `易经占卜：${question}` : '易经占卜',
      details: { data: { method: type, question, hexagrams: lines } }
    }, undefined, question || `开启${type === 'meihua' ? '梅花易数' : type === 'qimen' ? '奇门遁甲' : '六爻占卜'}推演`);
  }, [getProfileContext, question, calculateMeihua, num1, num2, setLines, sendMessage, lines]);

  // Handoff Logic
  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        const q = initialHandoff.prefillQuestion || initialHandoff.question || initialHandoff.context;
        const m = initialHandoff.modeId;
        if (q) setQuestion(q);
        if (m && ['liuyao', 'meihua', 'qimen'].includes(m)) setMode(m);
        
        // Auto-trigger for simple modes (Meihua, Qimen) if requested
        if (initialHandoff.autoTrigger && q && q.length > 2) {
          if (m === 'meihua') {
            const n1 = initialHandoff.num1 || '8';
            const n2 = initialHandoff.num2 || '8';
            setNum1(n1); setNum2(n2);
            handleGenerate('meihua', undefined, n1, n2);
          } else if (m === 'qimen') {
            handleGenerate('qimen');
          }
        }
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff, handleGenerate, setNum1, setNum2]);

  const handleReset = () => {
    resetEngine();
    resetChat();
    setQuestion('');
    setChatInput('');
  };

  const renderRitualInput = () => {
    if (mode === 'liuyao') {
      return (
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col-reverse items-center mb-8 min-h-[200px] w-full bg-black/30 rounded-xl p-6 border border-amber-500/20">
            {lines.length === 0 ? (
              <p className="text-amber-500/50 font-serif italic my-auto">点击下方按钮开始摇卦，共需摇卦六次</p>
            ) : (
              lines.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 my-1.5 w-full max-w-[240px]">
                   <span className="text-amber-500/60 font-serif text-sm w-12 text-right">第{i + 1}爻</span>
                   <div className="flex-1 flex items-center justify-center gap-2 h-4 bg-amber-500/10 rounded-sm relative overflow-hidden">
                      {l === 7 || l === 9 ? (
                        <div className="w-full h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      ) : (
                        <>
                          <div className="w-[45%] h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          <div className="w-[10%]" />
                          <div className="w-[45%] h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        </>
                      )}
                      {(l === 6 || l === 9) && <div className="absolute inset-0 bg-red-500/20 animate-pulse" />}
                   </div>
                </motion.div>
              ))
            )}
          </div>
          <button
            onClick={lines.length < 6 ? handleToss : () => handleGenerate('liuyao')}
            disabled={isTossing}
            className={`group relative px-10 py-4 w-full md:w-1/2 rounded-full font-serif text-lg transition-all duration-300 ${
              lines.length < 6 ? 'bg-amber-700 hover:bg-amber-600' : 'bg-emerald-700 hover:bg-emerald-600'
            }`}
          >
            {lines.length < 6 ? (isTossing ? '摇卦中...' : `第 ${lines.length + 1} 次摇卦`) : '解卦'}
          </button>
        </div>
      );
    }
    if (mode === 'meihua') {
      return (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex gap-4 w-full mb-8">
            <input type="number" placeholder="第一个数字" value={num1} onChange={(e) => setNum1(e.target.value)} className="w-1/2 bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-center text-xl" />
            <input type="number" placeholder="第二个数字" value={num2} onChange={(e) => setNum2(e.target.value)} className="w-1/2 bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-center text-xl" />
          </div>
          {error && <p className="text-red-400 text-sm mb-4 font-serif">{error}</p>}
          <button id="meihua-trigger" onClick={() => handleGenerate('meihua')} className="px-10 py-4 w-full bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-full font-serif text-lg shadow-lg">
            起卦并解读
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center justify-center mb-8 min-h-[200px] w-full bg-black/30 rounded-xl p-6 border border-amber-500/20">
          <Map className="w-16 h-16 text-amber-500/30 mb-4" />
          <p className="text-amber-200/80 font-serif text-center max-w-md">奇门遁甲以当前时辰为基准排盘。<br/>输入问题后开始推演。</p>
        </div>
        <button id="qimen-trigger" onClick={() => handleGenerate('qimen')} className="px-10 py-4 w-full md:w-1/2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-full font-serif text-lg">
          开始推演
        </button>
      </div>
    );
  };

  return (
    <RitualLayout
      title={mode === 'liuyao' ? '六爻排盘' : mode === 'meihua' ? '梅花易数' : '奇门遁甲'}
      subtitle={question}
      onReset={handleReset}
      onShare={() => handleGeneratePoster(posterRef.current!, `iching-${mode}.jpg`)}
      isGeneratingPoster={isGeneratingPoster}
      isResultsVisible={messages.length > 0 || isLoading}
      posterRef={posterRef}
      resetLabel="收起蓍草"
    >
      {!messages.length && !isLoading ? (
        <div className="w-full max-w-5xl glass-panel p-8 rounded-2xl flex flex-col items-center">
          <div className="w-full flex flex-col gap-8">
            <div className="max-w-2xl mx-auto w-full">
              <label className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest">1. 你的问题</label>
              <textarea
                rows={4}
                className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 focus:ring-2 focus:ring-amber-500/50 resize-none"
                placeholder="例如：我最近的感情走向如何？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            {renderRitualInput()}
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-8 w-full">
          {isLoading && !messages.length ? (
             <BreathingLoading text="正在推演先天八卦与后天八卦的玄妙变化..." />
          ) : (
            <>
              {lines.length === 6 && <HexagramDisplay lines={lines} />}
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
            </>
          )}
        </div>
      )}
    </RitualLayout>
  );
}
