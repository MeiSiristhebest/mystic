import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  isMoreMenuOpen: boolean;
  setIsMoreMenuOpen: (isOpen: boolean) => void;
  
  profile: UserProfile;
  isLoaded: boolean;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  clearProfile: () => void;
  setLoaded: (loaded: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'today',
      setActiveTab: (activeTab) => set({ activeTab }),
      isProfileModalOpen: false,
      setIsProfileModalOpen: (isProfileModalOpen) => set({ isProfileModalOpen }),
      isMoreMenuOpen: false,
      setIsMoreMenuOpen: (isMoreMenuOpen) => set({ isMoreMenuOpen }),
      
      profile: DEFAULT_PROFILE,
      isLoaded: false,
      setLoaded: (isLoaded) => set({ isLoaded }),
      
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
    }),
    {
      name: 'mystic-app-storage',
      partialize: (state) => ({ profile: state.profile, activeTab: state.activeTab }),
      onRehydrateStorage: () => (state) => {
        state?.setLoaded(true);
      },
    }
  )
);
