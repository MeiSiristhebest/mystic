import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getRelationshipSynastryPrompt } from '@/lib/prompts';

export interface PartnerData {
  name: string;
  birthday?: string;
  zodiac?: string;
  description?: string;
}

export function useSynastryAnalysis() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { profile, getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isAnalyzing } = useAIStream();

  const runAnalysis = useCallback(async (partner: PartnerData, question: string) => {
    const profileContext = getProfileContext();
    const prompt = getRelationshipSynastryPrompt({ partner, question, profileContext });

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
      type: 'synastry',
      title: `合盘：${profile?.name || '我'} & ${partner.name}`,
      summary: fullResponse.substring(0, 100) + '...',
      details: {
        type: 'synastry',
        text: fullResponse,
        partner,
        question,
        messages: [{ role: 'model', content: fullResponse }]
      }
    });
    setCurrentEntryId(id || null);
  }, [profile, getProfileContext, addEntry, stream]);

  const resetAnalysis = useCallback(() => {
    setMessages([]);
    setCurrentEntryId(null);
  }, []);

  return {
    runAnalysis,
    isAnalyzing,
    messages,
    soulMotto,
    resetAnalysis
  };
}
