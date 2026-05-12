import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';

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
  mbtiIdentity?: string;
  enneagram?: string;
  bazi?: string;
  zodiac?: string;
  currentStatus: string;
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

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab: string | null;
  setActiveSubTab: (subTab: string | null) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  isMoreMenuOpen: boolean;
  setIsMoreMenuOpen: (isOpen: boolean) => void;
  
  profile: UserProfile;
  isLoaded: boolean;
  hasAcceptedTerms: boolean;
  setHasAcceptedTerms: (accepted: boolean) => void;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  clearProfile: () => void;
  setLoaded: (loaded: boolean) => void;
  handoff: any;
  setHandoff: (handoff: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'today',
      setActiveTab: (activeTab) => set({ activeTab }),
      activeSubTab: null,
      setActiveSubTab: (activeSubTab) => set({ activeSubTab }),
      isProfileModalOpen: false,
      setIsProfileModalOpen: (isProfileModalOpen) => set({ isProfileModalOpen }),
      isMoreMenuOpen: false,
      setIsMoreMenuOpen: (isMoreMenuOpen) => set({ isMoreMenuOpen }),
      
      profile: DEFAULT_PROFILE,
      isLoaded: false,
      setLoaded: (isLoaded) => set({ isLoaded }),
      hasAcceptedTerms: false,
      setHasAcceptedTerms: (hasAcceptedTerms) => set({ hasAcceptedTerms }),
      
      updateProfile: (newProfile) => set((state) => {
        // Sanitize to prevent garbled text (basic protection)
        const sanitize = (val: any) => {
          if (typeof val === 'string' && /[\u0080-\u00ff]/.test(val) && !/[\u4e00-\u9fa5]/.test(val)) {
            return '';
          }
          return val;
        };

        const sanitized = { ...newProfile };
        if (sanitized.name) sanitized.name = sanitize(sanitized.name);
        if (sanitized.jungianArchetype) sanitized.jungianArchetype = sanitize(sanitized.jungianArchetype);
        if (sanitized.currentStatus) sanitized.currentStatus = sanitize(sanitized.currentStatus);

        return { profile: { ...state.profile, ...sanitized } };
      }),
      
      clearProfile: () => set({ profile: DEFAULT_PROFILE }),
      handoff: null,
      setHandoff: (handoff: any) => set({ handoff }),
    }),
    {
      name: 'mystic-app-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => zustandStorage) : undefined,
      partialize: (state) => ({ profile: state.profile, activeTab: state.activeTab, hasAcceptedTerms: state.hasAcceptedTerms }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          try {
            const oldProfileStr = localStorage.getItem('mystic_user_profile');
            if (oldProfileStr) {
              const oldProfile = JSON.parse(oldProfileStr);
              if (!state.profile.name && oldProfile.name) {
                state.updateProfile(oldProfile);
              }
            }
          } catch(e) {
            console.error('Failed to migrate legacy profile', e);
          }
          state.setLoaded(true);
        }
      },
    }
  )
);
