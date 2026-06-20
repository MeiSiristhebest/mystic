import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getShadowWorkPrompt } from '@/lib/prompts';

export function useShadowWork() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isExploring } = useAIStream();

  const startShadowExploration = useCallback(async (issue: string) => {
    const profileContext = getProfileContext();
    const prompt = getShadowWorkPrompt(issue, profileContext);

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
      type: 'shadow_work',
      title: `阴影工作：${issue.substring(0, 15)}...`,
      summary: fullResponse.substring(0, 100) + '...',
      details: {
        type: 'shadow_work',
        text: fullResponse,
        issue,
        messages: [{ role: 'model', content: fullResponse }]
      }
    });
    setCurrentEntryId(id || null);
  }, [getProfileContext, addEntry, stream]);

  const resetExploration = useCallback(() => {
    setMessages([]);
    setCurrentEntryId(null);
  }, []);

  return {
    startShadowExploration,
    isExploring,
    messages,
    soulMotto,
    resetExploration
  };
}
