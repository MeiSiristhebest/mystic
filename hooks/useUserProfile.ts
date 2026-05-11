import { useCallback } from 'react';
import { useAppStore, UserProfile, LifeEvent, EmotionalState } from '@/lib/store';

export type { UserProfile, LifeEvent, EmotionalState };

export function useUserProfile() {
  const profile = useAppStore(state => state.profile);
  const updateProfile = useAppStore(state => state.updateProfile);
  const clearProfile = useAppStore(state => state.clearProfile);
  const isLoaded = useAppStore(state => state.isLoaded);

  const getProfileContext = useCallback(() => {
    if (!isLoaded) return '';
    
    let context = '';
    if (profile.name) context += `姓名: ${profile.name}\n`;
    if (profile.gender) context += `性别: ${profile.gender}\n`;
    if (profile.birthDate) context += `出生日期: ${profile.birthDate}\n`;
    if (profile.birthTime) context += `出生时间: ${profile.birthTime}\n`;
    if (profile.bazi) context += `八字: ${profile.bazi}\n`;
    if (profile.zodiac) context += `生肖: ${profile.zodiac}\n`;
    if (profile.mbti) context += `MBTI: ${profile.mbti}${profile.mbtiIdentity || ''}\n`;
    if (profile.enneagram) context += `九型人格: ${profile.enneagram}\n`;
    if (profile.jungianArchetype) context += `荣格原型: ${profile.jungianArchetype}\n`;
    if (profile.coreIssues && profile.coreIssues.length > 0) context += `核心人生议题: ${profile.coreIssues.join(', ')}\n`;
    if (profile.lifeEvents && profile.lifeEvents.length > 0) {
      context += `重大人生节点:\n${profile.lifeEvents.map(e => `- ${e.date}: ${e.description} (${e.impact})`).join('\n')}\n`;
    }
    if (profile.emotionalBaseline && profile.emotionalBaseline.length > 0) {
      const recentEmotions = profile.emotionalBaseline.slice(-3);
      context += `近期情绪基线:\n${recentEmotions.map(e => `- ${e.date}: ${e.words.join(', ')}`).join('\n')}\n`;
    }
    if (profile.currentStatus) context += `当前状态/困惑: ${profile.currentStatus}\n`;

    if (context) {
      return `\n【内部参考：用户灵魂档案】\n${context}\n⚠️ 核心指令（最高优先级）：以上档案信息仅供你作为分析的底层框架。**除非用户明确询问或当前占卜模式就是针对该标签（如专门的MBTI解析）**，否则**绝对不要**在回复中直接提及“MBTI”、“INTJ”、“九型人格”、“八字”、“荣格原型”等具体标签名称，也**绝对不要**使用“因为你是XXX”或“作为XXX”这种句式。你需要将这些特质化作无形的洞察，像水一样融入你的解读中，让用户感觉到被深深理解，而不是被贴标签。\n`;
    }
    return '';
  }, [profile, isLoaded]);

  return { profile, updateProfile, clearProfile, getProfileContext, isLoaded };
}

