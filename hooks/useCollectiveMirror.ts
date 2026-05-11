import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';

export function useCollectiveMirror() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { addEntry } = useJourney();
  const { stream, isLoading: isReflecting } = useAIStream({ model: MODELS.FLASH });

  const reflectCollectiveState = useCallback(async () => {
    const prompt = `
<instruction>
你是一位观察人类集体潜意识的社会心理学大师。请利用你的实时检索能力，为用户呈现当下的“集体镜像”。
</instruction>

<search_context_request>
检索过去24小时内全球社交媒体、新闻头条和重大公共事件。
</search_context_request>

<output_format>
使用Markdown排版，包含以下部分：
1. **集体情绪图谱**：当下人类社会最显性的主导情绪（焦虑、希望、愤怒、变革等）。
2. **共时性意象**：提炼一个能代表当下全球状态的象征物。
3. **潜流观测**：隐藏在新闻表象下的深层集体渴望或恐惧。
4. **【个人镜像】**：作为个体，如何在这种集体共振中保持平衡。

在文章末尾，必须单独提炼一句20字内的全球共振箴言，严格使用以下XML标签包裹：
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
  }, [addEntry, stream]);

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
