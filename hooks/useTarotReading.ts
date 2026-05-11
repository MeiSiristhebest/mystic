import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AKASHA_PERSONA, SOCRATIC_PERSONA, MODELS } from '@/lib/ai';
import { SPREAD_MODES, CATEGORIES } from '@/app/components/MainApp/constants';

export function useTarotReading() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [isSocraticMode, setIsSocraticMode] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry, updateEntry } = useJourney();
  const { stream, isLoading: isReading, abort } = useAIStream({ model: MODELS.PRO });

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

      const prompt = `
<instruction>
你正在进行一次正式的塔罗占卜仪式。请基于提供的牌阵和用户信息，用中文撰写一份专业、深刻的解读报告。
</instruction>

<divination_context>
  <spread_mode>${currentMode.name} (共${currentMode.cardCount}张牌)</spread_mode>
  <category>${categoryName}</category>
</divination_context>

<user_profile>
  ${profileContext}
  ${zodiacSign ? `<zodiac>${zodiacSign}</zodiac>` : ""}
</user_profile>

<user_question>
  ${question ? question : "未提供具体问题，请进行深度整体运势解读"}
</user_question>

<drawn_cards>
  ${cardsList}
</drawn_cards>

<output_format>
使用Markdown排版，必须且只能包含以下三个二级标题（##）：
## 🔮 牌阵解析
## 🌌 牌面间的能量连结
## 🌟 最终神谕与指引

在文章末尾，必须单独提炼一句20字内的灵魂箴言，严格使用以下XML标签包裹：
[SOUL_MOTTO] 你的灵魂箴言内容 [/SOUL_MOTTO]
</output_format>
      `;

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
