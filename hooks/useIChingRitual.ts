import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cryptoCoinToss } from '@/lib/random';

export type CoinResult = 'heads' | 'tails'; // heads=3, tails=2
export type LineResult = 6 | 7 | 8 | 9; // 6:老阴, 7:少阳, 8:少阴, 9:老阳

export function useIChingRitual() {
  const [lines, setLines] = useState<LineResult[]>([]);
  const [isTossing, setIsTossing] = useState(false);
  const [currentToss, setCurrentToss] = useState<CoinResult[]>([]);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isReading } = useAIStream({ model: MODELS.PRO });

  const tossCoins = useCallback(() => {
    if (lines.length >= 6 || isTossing) return;
    
    setIsTossing(true);
    // Simulate coin toss with true CSPRNG
    const newToss: CoinResult[] = Array.from({ length: 3 }, () => cryptoCoinToss());
    setCurrentToss(newToss);

    setTimeout(() => {
      const sum = newToss.reduce((acc, curr) => acc + (curr === 'heads' ? 3 : 2), 0) as unknown as LineResult;
      setLines(prev => [...prev, sum]);
      setIsTossing(false);
      setCurrentToss([]);
    }, 1200);
  }, [lines, isTossing]);

  const generateIChingReading = useCallback(async (question: string) => {
    if (lines.length < 6) return;

    const profileContext = getProfileContext();
    const prompt = `
<instruction>
你是一位精通周易的易经大师。请基于用户投掷出的卦象（从下往上六爻）进行深度解读。
</instruction>

<divination_context>
  <hexagram_lines>${lines.join(',')}</hexagram_lines>
</divination_context>

<user_profile>
  ${profileContext}
</user_profile>

<user_question>
  ${question || "求测当下运势"}
</user_question>

<output_format>
使用Markdown排版，包含以下部分：
1. **卦象名与卦辞**：说明本卦及其象征意义。
2. **爻辞解析**：重点解析动爻（6和9）。
3. **断曰**：针对用户问题的直接指引。
4. **【易经智慧】**：一段简短的哲学启示。

在文章末尾，必须单独提炼一句20字内的周易箴言，严格使用以下XML标签包裹：
[SOUL_MOTTO] 你的箴言内容 [/SOUL_MOTTO]
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

    const id = await addEntry({
      type: 'iching',
      title: `周易：${question || "六爻占卜"}`,
      summary: fullResponse.substring(0, 100) + '...',
      details: {
        type: 'iching',
        text: fullResponse,
        data: {
          method: 'coins',
          question: question,
          hexagrams: lines
        },
        messages: [{ role: 'model', content: fullResponse }]
      }
    });
    setCurrentEntryId(id || null);
  }, [lines, getProfileContext, addEntry, stream]);

  const resetRitual = useCallback(() => {
    setLines([]);
    setMessages([]);
    setCurrentEntryId(null);
  }, []);

  return {
    lines,
    isTossing,
    currentToss,
    tossCoins,
    generateIChingReading,
    isReading,
    messages,
    soulMotto,
    resetRitual
  };
}
