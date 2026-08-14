'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIChat } from "@/hooks/useAIChat";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { TCMService } from "@/lib/services/tcmService";
import { HEALTH_STANDARDS } from "@/lib/nihaixia";
import { getNihaixiaDiagnosticPrompt, NIHAIXIA_PERSONA } from "@/lib/prompts";
import { playMysticChime, triggerHapticVibration } from "@/lib/audio";

export function useRenjiPresenter() {
  const { profile, getProfileContext } = useUserProfile();
  const [tab, setTab] = useState<'standards' | 'diagnosis' | 'wuyun'>('standards');
  
  // 八大标准问卷打分
  const [answers, setAnswers] = useState<Record<string, number>>({
    sleep: 75,
    appetite: 80,
    thirst: 80,
    bowel: 75,
    urine: 75,
    temperature: 60,
    sweat: 75,
    vitality: 70,
  });

  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // 症状推演
  const [symptoms, setSymptoms] = useState("");
  const [question, setQuestion] = useState("");

  // 出生年五运六气
  const [birthYear, setBirthYear] = useState<number>(() => {
    if (profile.birthDate) {
      const y = parseInt(profile.birthDate.split('-')[0], 10);
      if (!isNaN(y)) return y;
    }
    return 1995;
  });
  const [wuyunResult, setWuyunResult] = useState<any>(null);

  const { messages, sendMessage, isLoading, isStreaming, resetChat } = useAIChat({ 
    type: 'renji',
    systemInstruction: NIHAIXIA_PERSONA 
  });
  const [chatInput, setChatInput] = useState("");

  const { handleGeneratePoster, isGeneratingPoster } = usePosterGenerator();
  const posterRef = useRef<HTMLDivElement>(null);

  // 初始化与动态响应健康评估
  useEffect(() => {
    const res = TCMService.evaluateHealthCheck(answers);
    setEvaluationResult(res);
  }, [answers]);

  // 初始化与响应五运六气
  useEffect(() => {
    const res = TCMService.getWuyunLiuqiData(birthYear);
    setWuyunResult(res);
  }, [birthYear]);

  const handleRunDiagnosis = useCallback(async () => {
    if (!symptoms.trim()) return;

    playMysticChime();
    triggerHapticVibration();
    resetChat();

    const healthRes = TCMService.evaluateHealthCheck(answers);
    const wuyunRes = TCMService.getWuyunLiuqiData(birthYear);

    const prompt = getNihaixiaDiagnosticPrompt({
      healthScores: healthRes,
      wuyunLiuqiData: wuyunRes,
      symptoms,
      question,
      profileContext: getProfileContext(),
      enableSynergy: profile.enableCrossSystemSynergy ?? false,
      enabledModules: profile.enabledModules as any,
    });

    await sendMessage(prompt, {
      title: `经方辨证：${symptoms.substring(0, 15)}...`,
      details: {
        type: 'renji',
        symptoms,
        healthScores: healthRes,
      },
    });
  }, [symptoms, question, answers, birthYear, getProfileContext, profile, sendMessage, resetChat]);

  const handleScoreChange = useCallback((id: string, val: number) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }, []);

  return {
    state: {
      tab,
      answers,
      evaluationResult,
      symptoms,
      question,
      birthYear,
      wuyunResult,
      messages,
      isLoading,
      isStreaming,
      chatInput,
      isGeneratingPoster,
      posterRef,
    },
    actions: {
      setTab,
      setAnswers,
      setSymptoms,
      setQuestion,
      setBirthYear,
      setChatInput,
      handleScoreChange,
      handleRunDiagnosis,
      resetChat,
      sendMessage,
      handleGeneratePoster: () => {
        if (posterRef.current) {
          handleGeneratePoster(posterRef.current, 'renji-diagnosis.jpg');
        }
      },
    },
    constants: {
      HEALTH_STANDARDS,
    }
  };
}
