import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AKASHA_PERSONA, SOCRATIC_PERSONA, MODELS } from '@/lib/ai';
import { SPREAD_MODES, CATEGORIES } from '@/app/components/MainApp/constants';
import { getTarotJsonPrompt } from '@/lib/prompts';

export function useTarotReading() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [isSocraticMode, setIsSocraticMode] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry, updateEntry } = useJourney();
  const { stream, isLoading: isReading, abort } = useAIStream({ 
    model: MODELS.PRO,
    config: { responseMimeType: 'application/json' }
  });

  const generateReading = useCallback(async (
    drawnCards: any[], 
    mode: string, 
    category: string, 
    question: string,
    zodiacSign: string
  ) => {
    try {
      const currentMode = SPREAD_MODES.find((m) => m.id === mode) || SPREAD_MODES[1];
      const categoryName = CATEGORIES.find((c) => c.id === category)?.name || "综合运势";
      
      const cardsList = drawnCards
        .map((card, index) => {
          const position = currentMode.positions[index] || "未知位置";
          const direction = card.isReversed ? "（逆位）" : "（正位）";
          return `${index + 1}. ${position}：${card.name} ${direction}`;
        })
        .join("\n");

      const profileContext = getProfileContext();
      const prompt = getTarotJsonPrompt({
        spreadMode: currentMode.name,
        categoryName,
        profileContext,
        zodiacSign,
        cardsList,
        question
      });

      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);

      for await (const chunk of stream(prompt, AKASHA_PERSONA)) {
        fullResponse += chunk;
      }

      const data = JSON.parse(fullResponse);
      const finalContent = data.reading;
      setSoulMotto(data.soulMotto);
      setMessages([{ role: 'model', content: finalContent }]);

      const displayTitle = question 
        ? (question.length > 25 ? `${question.substring(0, 25)}...` : question)
        : categoryName;

      const id = await addEntry({
        type: 'tarot',
        title: `塔罗：${displayTitle}`,
        summary: finalContent.substring(0, 100) + '...',
        details: { 
          type: 'tarot',
          text: finalContent, 
          cards: drawnCards, 
          mode: currentMode.name, 
          question: question,
          messages: [{ role: 'model', content: finalContent }] 
        }
      });
      setCurrentEntryId(id || null);
    } catch (err) {
      console.error("Error generating reading:", err);
    }
  }, [getProfileContext, addEntry, stream]);

  const handleFollowUp = useCallback(async (
    text: string, 
    drawnCards: any[], 
    modeName: string
  ) => {
    if (!text.trim() || isReading || !currentEntryId) return;

    const userMsg = text.trim();
    setIsAskingFollowUp(true);
    
    const newMessages: { role: 'user' | 'model'; content: string }[] = [...messages, { role: 'user', content: userMsg }];
    setMessages([...newMessages, { role: 'model', content: "" }]);

    try {
      let fullResponse = "";
      const historyContext = newMessages.slice(0, -1).map(m => `${m.role === 'user' ? '用户' : '阿卡夏'}: ${m.content}`).join('\n\n');
      const promptWithHistory = `以下是之前的对话记录：\n${historyContext}\n\n用户的新回复：${userMsg}`;
      const personaToUse = isSocraticMode ? SOCRATIC_PERSONA : AKASHA_PERSONA;

      for await (const chunk of stream(promptWithHistory, personaToUse)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }
      
      const finalMsgs: { role: 'user' | 'model'; content: string }[] = [...newMessages, { role: 'model', content: fullResponse }];
      
      updateEntry(currentEntryId, { 
        details: { 
          type: 'tarot',
          text: messages[0]?.content || "", 
          cards: drawnCards,
          mode: modeName,
          messages: finalMsgs 
        }
      });
    } catch (err) {
      console.error("Error generating follow-up:", err);
    } finally {
      setIsAskingFollowUp(false);
    }
  }, [messages, isReading, currentEntryId, stream, updateEntry, isSocraticMode]);

  return {
    messages,
    isReading,
    isAskingFollowUp,
    isSocraticMode,
    setIsSocraticMode,
    soulMotto,
    currentEntryId,
    generateReading,
    handleFollowUp,
    abort,
    setMessages,
    setCurrentEntryId
  };
}
