import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';

export function useShadowWork() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [soulMotto, setSoulMotto] = useState("");

  const { getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isExploring } = useAIStream({ model: MODELS.PRO });

  const startShadowExploration = useCallback(async (issue: string) => {
    const profileContext = getProfileContext();
    
    const prompt = `
<instruction>
你是一位荣格心理学导向的深度阴影工作引导者。你的任务是引导用户面对那些被压抑、被否认的潜意识部分（阴影）。
请不要直接给出答案，而是通过深邃、温和且具有穿透力的文字，引导用户进行自我探索。
</instruction>

<user_profile>
  ${profileContext}
</user_profile>

<user_shadow_issue>
  ${issue}
</user_shadow_issue>

<output_format>
使用Markdown排版，包含以下部分：
1. **阴影的回响**：描述这种情绪或困境背后的潜意识动力。
2. **镜面投射**：引导用户思考这种阴影在现实生活中的投射。
3. **整合路径**：提供一个具体的“拥抱阴影”的练习或冥想建议。
4. **【深层追问】**：给出一个让用户无法回避的核心问题。

在文章末尾，必须单独提炼一句20字内的整合箴言，严格使用以下XML标签包裹：
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
