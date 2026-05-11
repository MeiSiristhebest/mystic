import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';

export function useSubconsciousAnalysis() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isParsing } = useAIStream({ model: MODELS.PRO });

  const analyzeSubconscious = useCallback(async (content: string) => {
    const profileContext = getProfileContext();
    
    const prompt = `
<instruction>
你是一位潜意识分析专家与符号学大师。请基于用户提供的梦境、自由联想碎片或直觉感悟，进行深度符号化解析。
请挖掘其中隐藏的渴望、恐惧或来自高我的提示。
</instruction>

<user_profile>
  ${profileContext}
</user_profile>

<subconscious_fragments>
  ${content}
</subconscious_fragments>

<output_format>
使用Markdown排版，包含以下部分：
1. **符号解码**：提取并解释关键意象。
2. **情感色调**：分析潜意识流动的核心情绪。
3. **原型映射**：这些意象在集体潜意识中对应的原型。
4. **【梦境启示】**：给出一个具体的行动建议或思考方向。

在文章末尾，必须单独提炼一句20字内的潜意识箴言，严格使用以下XML标签包裹：
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
