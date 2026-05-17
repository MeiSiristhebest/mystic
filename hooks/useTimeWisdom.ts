import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getTimeWisdomPrompt } from '@/lib/prompts';

export function useTimeWisdom() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isObserving } = useAIStream({ model: MODELS.FLASH });

  const observeTimeStream = useCallback(async (question: string) => {
    const profileContext = getProfileContext();
    const prompt = getTimeWisdomPrompt({
      today: new Date(),
      moonPhase: { name: '当令盈亏', desc: '潮汐暗流，引力共振' },
      profileContext,
      globalContextInstruction: '请检索过去24-48小时内全球重大科技、天文、社会与地缘动态。',
      question
    });

    let fullResponse = "";
    setMessages([{ role: 'model', content: "" }]);

    for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
      fullResponse += chunk;
      setMessages([{ role: 'model', content: fullResponse }]);
    }

    const mottoMatch = fullResponse.match(/\[SOUL_MOTTO\]([\s\S]*?)\[\/SOUL_MOTTO\]/);
    let finalContent = fullResponse;
    if (mottoMatch && mottoMatch[1]) {
      setSoulMotto(mottoMatch[1].trim());
      finalContent = fullResponse.replace(/\[SOUL_MOTTO\][\s\S]*?\[\/SOUL_MOTTO\]/g, '').trim();
      setMessages([{ role: 'model', content: finalContent }]);
    }

    const id = await addEntry({
      type: 'time',
      title: `时间智慧：${new Date().toLocaleDateString()}`,
      summary: fullResponse.substring(0, 100) + '...',
      details: {
        type: 'time',
        text: fullResponse,
        question,
        messages: [{ role: 'model', content: fullResponse }]
      }
    });
    setCurrentEntryId(id || null);
  }, [getProfileContext, addEntry, stream]);

  const resetObservation = useCallback(() => {
    setMessages([]);
    setCurrentEntryId(null);
  }, []);

  return {
    observeTimeStream,
    isObserving,
    messages,
    soulMotto,
    resetObservation
  };
}
