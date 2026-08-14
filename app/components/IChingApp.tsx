'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Coins, Map, Download } from 'lucide-react';

// Components & Layout
import RitualLayout from './MainApp/RitualLayout';
import MysticChatInterface from './MainApp/MysticChatInterface';
import BreathingLoading from './BreathingLoading';
import { HexagramDisplay } from './MainApp/IChing/HexagramDisplay';
import IChingRitualManager from './MainApp/IChingRitualManager';

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
    lines, setLines, isTossing, handleToss, handleQuickCast, currentCoins, calculateMeihua, 
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
        <div className="w-full flex justify-center">
          <IChingRitualManager
            lines={lines}
            isTossing={isTossing}
            currentCoins={currentCoins}
            onToss={handleToss}
            onQuickCast={handleQuickCast}
            onComplete={() => handleGenerate('liuyao')}
          />
        </div>

      );
    }
    if (mode === 'meihua') {
      return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <div className="flex gap-4 w-full mb-8">
            <input 
              type="number" 
              placeholder="第一个数字" 
              value={num1} 
              onChange={(e) => setNum1(e.target.value)} 
              className="w-1/2 bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-center text-xl focus:border-amber-400 focus:outline-none transition-colors" 
            />
            <input 
              type="number" 
              placeholder="第二个数字" 
              value={num2} 
              onChange={(e) => setNum2(e.target.value)} 
              className="w-1/2 bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-center text-xl focus:border-amber-400 focus:outline-none transition-colors" 
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4 font-serif">{error}</p>}
          <button 
            id="meihua-trigger" 
            onClick={() => handleGenerate('meihua')} 
            className="px-10 py-4 w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 rounded-full font-serif text-lg shadow-lg cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
          >
            起卦并解读
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center mb-8 min-h-[200px] w-full bg-black/30 rounded-2xl p-6 border border-amber-500/20">
          <Map className="w-16 h-16 text-amber-500/40 mb-4 animate-pulse" />
          <p className="text-amber-200/80 font-serif text-center max-w-md leading-relaxed">
            奇门遁甲以当前时辰为基准排盘。<br/>输入心中所求后开启天地人神推演。
          </p>
        </div>
        <button 
          id="qimen-trigger" 
          onClick={() => handleGenerate('qimen')} 
          className="px-10 py-4 w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 rounded-full font-serif text-lg cursor-pointer shadow-lg transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
        >
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
        <div className="w-full max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center shadow-2xl">
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
            <div className="w-full">
              <label className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest text-center sm:text-left">
                1. 你的问题
              </label>
              <textarea
                rows={4}
                className="w-full bg-black/40 border border-amber-500/30 rounded-2xl p-5 text-amber-100 placeholder-amber-500/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none font-serif text-base transition-all"
                placeholder="例如：我最近的感情走向如何？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            {renderRitualInput()}
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-8 w-full max-w-4xl mx-auto">
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
