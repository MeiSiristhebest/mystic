import { useState, useCallback } from 'react';
import { BirthContext, CaseInput } from '@/lib/contracts/types';

export type JourneyStep = 
  | 'input_context'      // 基础生辰与背景输入
  | 'symptom_triage'     // 四诊与身心体感采集
  | 'deterministic_calc' // 确定性多领域事实与证据提取
  | 'arbitration_review' // 跨体系时空张力展示
  | 'synthesis_result';  // AI 流式辩证综合

export interface JourneyWorkflowState {
  currentStep: JourneyStep;
  caseInput: CaseInput;
  isCalculating: boolean;
  isStreaming: boolean;
  activeDomainKeys: string[];
  error: string | null;
}

const INITIAL_BIRTH_CONTEXT: BirthContext = {
  birthDate: '1995-06-15',
  birthTime: '12:00',
  timeZone: 'Asia/Shanghai',
  longitude: 116.4,
  latitude: 39.9,
  gender: 'female',
};

/**
 * 推演全流程状态机 Hook (State Machine & Workflow Coordinator)
 */
export function useJourneyWorkflow() {
  const [state, setState] = useState<JourneyWorkflowState>({
    currentStep: 'input_context',
    caseInput: {
      birthContext: INITIAL_BIRTH_CONTEXT,
    },
    isCalculating: false,
    isStreaming: false,
    activeDomainKeys: ['bazi', 'vedic', 'ziwei', 'nihaixia'],
    error: null,
  });

  const updateBirthContext = useCallback((patch: Partial<BirthContext>) => {
    setState(prev => ({
      ...prev,
      caseInput: {
        ...prev.caseInput,
        birthContext: {
          ...prev.caseInput.birthContext,
          ...patch,
        },
      },
    }));
  }, []);

  const updateSymptoms = useCallback((symptoms: string, healthScores?: Record<string, number>) => {
    setState(prev => ({
      ...prev,
      caseInput: {
        ...prev.caseInput,
        observedSymptoms: symptoms,
        healthScores,
      },
    }));
  }, []);

  const goToStep = useCallback((step: JourneyStep) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const setCalculating = useCallback((isCalculating: boolean) => {
    setState(prev => ({ ...prev, isCalculating }));
  }, []);

  const setStreaming = useCallback((isStreaming: boolean) => {
    setState(prev => ({ ...prev, isStreaming }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    state,
    updateBirthContext,
    updateSymptoms,
    goToStep,
    setCalculating,
    setStreaming,
    setError,
  };
}
