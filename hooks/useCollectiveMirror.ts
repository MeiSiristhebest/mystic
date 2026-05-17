import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getCollectiveMirrorPrompt } from '@/lib/prompts';

export function useCollectiveMirror() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isReflecting } = useAIStream({ model: MODELS.FLASH });

  const reflectCollectiveState = useCallback(async () => {
    const profileContext = getProfileContext();
    const prompt = getCollectiveMirrorPrompt(profileContext);

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
      type: 'mirror',
      title: `集体镜像：${new Date().toLocaleTimeString()}`,
      summary: fullResponse.substring(0, 100) + '...',
      details: {
        type: 'mirror',
        text: fullResponse,
        messages: [{ role: 'model', content: fullResponse }]
      }
    });
    setCurrentEntryId(id || null);
  }, [getProfileContext, addEntry, stream]);

  const resetReflection = useCallback(() => {
    setMessages([]);
    setCurrentEntryId(null);
  }, []);

  return {
    reflectCollectiveState,
    isReflecting,
    messages,
    soulMotto,
    resetReflection
  };
}
