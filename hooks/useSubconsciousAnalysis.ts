import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getSubconsciousPrompt } from '@/lib/prompts';

export function useSubconsciousAnalysis() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isParsing } = useAIStream({ model: MODELS.PRO });

  const analyzeSubconscious = useCallback(async (content: string) => {
    const profileContext = getProfileContext();
    const prompt = getSubconsciousPrompt({
      mode: content.includes('梦') || content.includes('dream') ? 'dream' : 'imagination',
      input: content,
      profileContext
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
      type: 'subconscious',
      title: `潜意识解析：${content.substring(0, 15)}...`,
      summary: fullResponse.substring(0, 100) + '...',
      details: {
        type: 'subconscious',
        text: fullResponse,
        content,
        messages: [{ role: 'model', content: fullResponse }]
      }
    });
    setCurrentEntryId(id || null);
  }, [getProfileContext, addEntry, stream]);

  const resetAnalysis = useCallback(() => {
    setMessages([]);
    setCurrentEntryId(null);
  }, []);

  return {
    analyzeSubconscious,
    isParsing,
    messages,
    soulMotto,
    resetAnalysis
  };
}
