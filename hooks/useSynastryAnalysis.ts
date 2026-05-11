import { useState, useCallback } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { MODELS, AKASHA_PERSONA } from '@/lib/ai';
import { useJourney } from '@/hooks/useJourney';
import { useUserProfile } from '@/hooks/useUserProfile';

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

  const { userProfile, getProfileContext } = useUserProfile();
  const { addEntry } = useJourney();
  const { stream, isLoading: isAnalyzing } = useAIStream({ model: MODELS.PRO });

  const runAnalysis = useCallback(async (partner: PartnerData, question: string) => {
    const selfProfile = getProfileContext();
    
    const prompt = `
<instruction>
你是一位资深的人际关系与心理占星专家。请基于以下两个个体的背景信息，进行深度的关系合盘与心理契合度分析。
</instruction>

<party_a_self>
  ${selfProfile}
</party_a_self>

<party_b_partner>
  姓名: ${partner.name}
  ${partner.birthday ? `生日: ${partner.birthday}` : ""}
  ${partner.zodiac ? `星座: ${partner.zodiac}` : ""}
  ${partner.description ? `背景描述: ${partner.description}` : ""}
</party_b_partner>

<user_question>
  ${question || "分析我们的整体契合度与潜在挑战"}
</user_question>

<output_format>
使用Markdown排版，包含以下部分：
1. **灵魂振动频率**：两人的核心吸引力所在。
2. **潜在张力区**：可能产生冲突的深层心理机制。
3. **成长共振**：这段关系能带给彼此什么样的进化。
4. **【阿卡夏指引】**：给这段关系的具体建议。

在文章末尾，必须单独提炼一句20字内的关系箴言，严格使用以下XML标签包裹：
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
      type: 'synastry',
      title: `合盘：${userProfile?.name || '我'} & ${partner.name}`,
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
  }, [userProfile, getProfileContext, addEntry, stream]);

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
