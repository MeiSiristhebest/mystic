import { useState, useEffect, useCallback, useMemo } from 'react';

export interface LifeEvent {
  id: string;
  date: string;
  description: string;
  impact: 'positive' | 'negative' | 'transformative';
}

export interface EmotionalState {
  date: string;
  words: string[];
}

export interface UserProfile {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
  mbti: string;
  mbtiIdentity?: string; // e.g., "-A" or "-T"
  enneagram?: string; // e.g., "4w5" or "Type 4"
  bazi?: string;
  zodiac?: string;
  currentStatus: string;
  // Deep Soul Profile additions
  jungianArchetype?: string;
  coreIssues?: string[];
  lifeEvents?: LifeEvent[];
  emotionalBaseline?: EmotionalState[];
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  gender: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
  mbti: '',
  mbtiIdentity: '',
  enneagram: '',
  bazi: '',
  zodiac: '',
  currentStatus: '',
  jungianArchetype: '',
  coreIssues: [],
  lifeEvents: [],
  emotionalBaseline: [],
};

export const PROFILE_UPDATE_EVENT = 'mystic_profile_updated';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem('mystic_user_profile');
        if (stored) {
          // Only parse if it looks like a valid JSON object
          if (stored.startsWith('{')) {
            let parsed = JSON.parse(stored);
            // Basic validation to ensure it's not garbled or old format
            if (parsed && typeof parsed === 'object') {
              // Check for garbled text in key fields
              const isGarbled = (str: any) => typeof str === 'string' && /[\u0080-\u00ff]/.test(str) && !/[\u4e00-\u9fa5]/.test(str);
              
              if (isGarbled(parsed.jungianArchetype)) parsed.jungianArchetype = '';
              if (isGarbled(parsed.name)) parsed.name = '';
              if (isGarbled(parsed.currentStatus)) parsed.currentStatus = '';
              
              setProfile({ ...DEFAULT_PROFILE, ...parsed });
            }
          } else {
            // If it's not JSON, it might be old garbled data, clear it
            localStorage.removeItem('mystic_user_profile');
          }
        }
      } catch (e) {
        console.error('Failed to load user profile', e);
      }
      setIsLoaded(true);
    };

    loadProfile();
    window.addEventListener(PROFILE_UPDATE_EVENT, loadProfile);
    return () => window.removeEventListener(PROFILE_UPDATE_EVENT, loadProfile);
  }, []);

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    // Sanitize newProfile to prevent garbled text
    const sanitize = (val: any) => {
      if (typeof val === 'string' && /[\u0080-\u00ff]/.test(val) && !/[\u4e00-\u9fa5]/.test(val)) {
        return '';
      }
      return val;
    };

    const sanitizedNewProfile = { ...newProfile };
    if (sanitizedNewProfile.name) sanitizedNewProfile.name = sanitize(sanitizedNewProfile.name);
    if (sanitizedNewProfile.jungianArchetype) sanitizedNewProfile.jungianArchetype = sanitize(sanitizedNewProfile.jungianArchetype);
    if (sanitizedNewProfile.currentStatus) sanitizedNewProfile.currentStatus = sanitize(sanitizedNewProfile.currentStatus);

    setProfile(prev => {
      const updated = { ...prev, ...sanitizedNewProfile };
      try {
        localStorage.setItem('mystic_user_profile', JSON.stringify(updated));
        window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
      } catch (e) {
        console.error('Failed to save user profile', e);
      }
      return updated;
    });
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('mystic_user_profile');
    window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
  }, []);

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
