'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useBaziEngine } from '@/hooks/useBaziEngine';
import { useAIChat } from '@/hooks/useAIChat';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { getBaziPrompt } from '@/lib/prompts';
import { playMysticChime, triggerHapticVibration } from '@/lib/audio';

export interface UseBaziPresenterProps {
  mode?: 'bazi' | 'ziwei' | 'liunian';
  initialMode?: 'bazi' | 'ziwei' | 'liunian';
  onReadingChange?: (reading: boolean) => void;
  initialHandoff?: any;
  clearHandoff?: () => void;
}

export function useBaziPresenter(props: UseBaziPresenterProps = {}) {
  const initialMode = props.mode || props.initialMode || 'bazi';
  const { onReadingChange, initialHandoff, clearHandoff } = props;

  const [mode, setMode] = useState<'bazi' | 'ziwei' | 'liunian'>(initialMode);
  const [question, setQuestion] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialMode) setMode(initialMode);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialMode]);

  const {
    birthDate, setBirthDate, birthTime, setBirthTime, gender, setGender,
    fullName, setFullName, birthPlace, setBirthPlace, baziData, ziweiChart, detectedPatterns,
    calculateBazi, resetEngine
  } = useBaziEngine();

  const {
    messages, sendMessage, isLoading, isStreaming, resetChat
  } = useAIChat({ type: 'bazi' });

  const { profile, getProfileContext, updateProfile } = useUserProfile();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();

  // Sync profile data on init
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile.birthDate) setBirthDate(profile.birthDate);
      if (profile.birthTime) setBirthTime(profile.birthTime);
      if (profile.gender) setGender(profile.gender);
      if (profile.name) setFullName(profile.name);
      if (profile.birthPlace) setBirthPlace(profile.birthPlace);
    }, 0);
    return () => clearTimeout(timer);
  }, [profile, setBirthDate, setBirthTime, setGender, setFullName, setBirthPlace]);

  // Sync reading state
  useEffect(() => {
    onReadingChange?.(isLoading);
  }, [isLoading, onReadingChange]);

  const handleGenerate = useCallback(async () => {
    if (!birthDate || !birthTime) return;

    playMysticChime();
    triggerHapticVibration();

    updateProfile({ birthDate, birthTime, gender, name: fullName, birthPlace });

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
      ziweiData: data.ziwei,
      enabledModules: profile.enabledModules,
    });

    await sendMessage(prompt, {
      title: `${mode === 'ziwei' ? '紫微' : mode === 'liunian' ? '流年' : '八字'}推演：${fullName || '命主'}`,
      details: {
        type: 'bazi',
        mode,
        baziString: data.baziString,
        question,
      },
    });
  }, [
    birthDate, birthTime, gender, fullName, birthPlace, calculateBazi,
    mode, question, getProfileContext, profile, sendMessage, updateProfile
  ]);

  // Handle handoff
  useEffect(() => {
    if (initialHandoff) {
      const timer = setTimeout(() => {
        if (initialHandoff.question) setQuestion(initialHandoff.question);
        if (initialHandoff.mode) setMode(initialHandoff.mode);
        clearHandoff?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialHandoff, clearHandoff]);

  const handleReset = useCallback(() => {
    resetChat();
    resetEngine();
    setQuestion('');
  }, [resetChat, resetEngine]);

  return {
    state: {
      mode,
      question,
      chatInput,
      selectedPattern,
      birthDate,
      birthTime,
      gender,
      fullName,
      birthPlace,
      baziData,
      ziweiChart,
      detectedPatterns,
      messages,
      isLoading,
      isStreaming,
      isGeneratingPoster,
      posterRef,
    },
    actions: {
      setMode,
      setQuestion,
      setChatInput,
      setSelectedPattern,
      setBirthDate,
      setBirthTime,
      setGender,
      setFullName,
      setBirthPlace,
      handleGenerate,
      handleReset,
      sendMessage,
      handleGeneratePoster: () => {
        if (posterRef.current) {
          handleGeneratePoster(posterRef.current, `bazi-${mode}.jpg`);
        }
      },
    }
  };
}
