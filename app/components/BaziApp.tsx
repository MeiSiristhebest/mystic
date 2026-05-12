'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Clock, MapPin, User, Compass } from 'lucide-react';

// Components & Layout
import RitualLayout from './MainApp/RitualLayout';
import MysticChatInterface from './MainApp/MysticChatInterface';
import BreathingLoading from './BreathingLoading';
import { BaziChart } from './MainApp/Bazi/BaziChart';

// Hooks & Lib
import { useBaziEngine } from '@/hooks/useBaziEngine';
import { useAIChat } from '@/hooks/useAIChat';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { getBaziPrompt } from '@/lib/prompts';
import { useAppStore } from '@/lib/store';

interface BaziAppProps {
  mode?: 'bazi' | 'ziwei' | 'liunian';
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
  const [chatInput, setChatInput] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);

  const { 
    birthDate, setBirthDate, birthTime, setBirthTime, gender, setGender,
    fullName, setFullName, birthPlace, setBirthPlace, baziData, calculateBazi, resetEngine 
  } = useBaziEngine();

  const { 
    messages, sendMessage, isLoading, isStreaming, resetChat, abort 
  } = useAIChat({ type: 'bazi' });

  const { profile, getProfileContext, updateProfile } = useUserProfile();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();

  // Sync profile data on init
  useEffect(() => {
    if (profile.birthDate) setBirthDate(profile.birthDate);
    if (profile.birthTime) setBirthTime(profile.birthTime);
    if (profile.gender) setGender(profile.gender);
    if (profile.name) setFullName(profile.name);
    if (profile.birthPlace) setBirthPlace(profile.birthPlace);
  }, [profile]);

  // Sync reading state
  useEffect(() => {
    onReadingChange?.(isLoading);
  }, [isLoading, onReadingChange]);

  // Handoff Logic
  useEffect(() => {
    if (initialHandoff) {
      const q = initialHandoff.question || initialHandoff.context;
      const m = initialHandoff.modeId as any;
      if (q) setQuestion(q);
      if (m && ['bazi', 'ziwei', 'liunian'].includes(m)) setMode(m);
      
      // Auto-trigger if requested and profile is ready
      if (initialHandoff.autoTrigger && q && profile.birthDate) {
        handleGenerate();
      }
      clearHandoff?.();
    }
  }, [initialHandoff, clearHandoff, profile.birthDate]);

  const handleGenerate = useCallback(async () => {
    if (!birthDate || !birthTime) return;

    // Update profile store if needed
    if (!profile.birthDate || profile.birthDate !== birthDate) {
      updateProfile({ birthDate, birthTime, gender, name: fullName, birthPlace });
    }

    const data = await calculateBazi();
    if (!data) return;

    const prompt = getBaziPrompt({
      mode,
      birthDate,
      birthTime,
      gender,
      birthPlace,
      fullName,
      baziString: data.baziString,
      lunarDateString: data.lunarDateString,
      question,
      profileContext: getProfileContext(),
      ziweiData: (data as any).ziwei
    });

    await sendMessage(prompt, {
      title: mode === 'bazi' ? '八字深度解析' : mode === 'ziwei' ? '紫微斗数解析' : '流年运势避坑',
      details: { 
        type: 'bazi',
        mode,
        birthDate,
        birthTime,
        gender,
        fullName,
        birthPlace
      }
    });
  }, [birthDate, birthTime, profile, updateProfile, gender, fullName, birthPlace, calculateBazi, mode, question, getProfileContext, sendMessage]);

  const handleReset = () => {
    resetEngine();
    resetChat();
    setQuestion('');
    setChatInput('');
  };

  return (
    <RitualLayout
      title={mode === 'bazi' ? '八字命理' : mode === 'ziwei' ? '紫微斗数' : '流年运势'}
      subtitle={question}
      onReset={handleReset}
      onShare={() => handleGeneratePoster(posterRef.current!, `bazi-${mode}.jpg`)}
      isGeneratingPoster={isGeneratingPoster}
      isResultsVisible={messages.length > 0 || isLoading}
      posterRef={posterRef}
      resetLabel="重新排盘"
    >
      {!messages.length && !isLoading ? (
        <div className="w-full max-w-4xl glass-panel p-8 md:p-12 rounded-3xl flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-[0.4em] text-amber-500/60 uppercase">1. 出生信息</label>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40 w-5 h-5" />
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-black/40 border border-amber-500/20 rounded-xl py-3 pl-12 pr-4 text-amber-100" />
                </div>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40 w-5 h-5" />
                  <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="w-full bg-black/40 border border-amber-500/20 rounded-xl py-3 pl-12 pr-4 text-amber-100" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-serif tracking-[0.4em] text-amber-500/60 uppercase">2. 基础档案</label>
              <div className="grid grid-cols-2 gap-4">
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="bg-black/40 border border-amber-500/20 rounded-xl py-3 px-4 text-amber-100">
                  <option value="">性别</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
                <input type="text" placeholder="姓名" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-black/40 border border-amber-500/20 rounded-xl py-3 px-4 text-amber-100" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40 w-4 h-4" />
                <input type="text" placeholder="出生地点 (可选)" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="w-full bg-black/40 border border-amber-500/20 rounded-xl py-3 pl-10 pr-4 text-amber-100 text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-serif tracking-[0.4em] text-amber-500/60 uppercase">3. 你的困惑</label>
            <textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="描述你当前面临的问题或想了解的运势方向..." className="w-full bg-black/40 border border-amber-500/20 rounded-xl p-4 text-amber-100 focus:ring-1 focus:ring-amber-500/40" />
          </div>

          <button id="bazi-trigger" onClick={handleGenerate} disabled={!birthDate || !birthTime} className="w-full py-4 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-amber-50 rounded-full font-serif text-lg tracking-[0.4em] shadow-xl transition-all">
            开启命运之门
          </button>
        </div>
      ) : (
        <div className="w-full space-y-10">
          {isLoading && !messages.length ? (
            <BreathingLoading text="正在通过阿卡夏记录调取你的生命蓝图..." />
          ) : (
            <>
              {baziData && <BaziChart baziString={baziData.bazi} />}
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
