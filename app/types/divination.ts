/**
 * Global Divination Types
 */

export type MessageRole = 'user' | 'model' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

export type DivinationType = 
  | 'tarot' 
  | 'iching' 
  | 'bazi' 
  | 'daily' 
  | 'astrology' 
  | 'face_reading' 
  | 'shadow_work' 
  | 'synastry' 
  | 'subconscious' 
  | 'time' 
  | 'mirror' 
  | 'collective_mirror' 
  | 'unified';

// --- Specific Detail Schemas ---

export interface TarotCard {
  id: string;
  name: string;
  englishName: string;
  image: string;
  rank: string;
  arcana: 'Major' | 'Minor';
  suit?: string;
  isReversed: boolean;
  keywords: { upright: string[]; reversed: string[] };
  coreTheme: string;
}

export interface TarotDetails {
  type: 'tarot';
  text: string;
  cards: TarotCard[];
  mode?: string;
  spread?: string;
  question?: string;
  messages: Message[];
}

export interface BaziDetails {
  type: 'bazi';
  text: string;
  mode?: 'bazi' | 'ziwei' | 'liunian';
  birthDate?: string;
  birthTime?: string;
  gender?: string;
  fullName?: string;
  birthPlace?: string;
  messages: Message[];
}

export interface IChingDetails {
  type: 'iching';
  text: string;
  data?: {
    method: 'liuyao' | 'meihua' | 'qimen';
    question?: string;
    hexagrams?: number[];
    num1?: number;
    num2?: number;
  };
  messages: Message[];
}

export interface DailyDetails {
  type: 'daily';
  text: string;
  sign: string;
  messages: Message[];
}

export interface AstrologyDetails {
  type: 'astrology';
  text: string;
  zodiac?: string;
  mode?: string;
  messages: Message[];
}

// ... Additional schemas can be added here ...

export interface GenericDetails {
  type: string;
  text: string;
  messages: Message[];
  [key: string]: any;
}

export type JourneyDetails = 
  | TarotDetails 
  | BaziDetails 
  | IChingDetails 
  | DailyDetails 
  | AstrologyDetails
  | { type: 'face_reading'; text: string; imageType?: string; question?: string; messages: Message[] }
  | { type: 'shadow_work'; text: string; issue?: string; messages: Message[] }
  | { type: 'synastry'; text: string; partner?: any; question?: string; messages: Message[] }
  | { type: 'subconscious'; text: string; content?: string; messages: Message[] }
  | { type: 'time'; text: string; question?: string; messages: Message[] }
  | { type: 'mirror'; text: string; messages: Message[] }
  | { type: 'collective_mirror'; text: string; question?: string; messages: Message[] }
  | { type: 'unified'; text: string; bazi?: any; astrology?: any; tarot?: any; messages: Message[] }
  | GenericDetails;

export interface JourneyEntry {
  id: string;
  date: string;
  type: DivinationType;
  title: string;
  summary: string;
  details?: JourneyDetails;
}

// --- App Navigation & Store Types ---

export interface DivinationHandoff {
  system?: string;
  modeId?: string;
  question?: string;
  context?: string;
  autoTrigger?: boolean;
}
