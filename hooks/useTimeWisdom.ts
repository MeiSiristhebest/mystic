import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';

export function useTimeWisdom() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { addEntry } = useJourney();
  const { stream, isLoading: isObserving } = useAIStream({ model: MODELS.FLASH });

  const observeTimeStream = useCallback(async (question: string) => {
    const prompt = `
<instruction>
你是一位能够洞察时间洪流的时间智者。请利用你获取全球实时动态（通过Google Search Grounding）的能力，结合神秘学视角，分析当前的时间节点。
</instruction>

<global_context_request>
请重点检索过去24-48小时内全球发生的重大天文、社会、地缘或技术事件。
</global_context_request>

<user_question>
  ${question || "当前的时间点对个人发展有何启示？"}
</user_question>

<output_format>
使用Markdown排版，包含以下部分：
1. **时空涟漪**：最近发生的、影响最深远的3个全球事件。
2. **共时性洞察**：这些事件在集体潜意识中产生的共振。
3. **今日能量阈值**：当前时间节点的“易”与“难”。
4. **【时间刻度】**：给出一个针对当下的行动时机建议。

在文章末尾，必须单独提炼一句20字内的时间箴言，严格使用以下XML标签包裹：
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
  }, [addEntry, stream]);

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
