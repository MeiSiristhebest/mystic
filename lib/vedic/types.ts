import { CanonicalEvidenceNode, ValidationReport } from '../contracts/types';

export type VedicPlanetName = 
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu' | 'Ascendant';

export type VedicSignName = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' 
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface VedicPlanetPosition {
  name: VedicPlanetName;
  cnName: string;
  longitude: number;      // 0 - 360 Sidereal degree
  sign: VedicSignName;
  signCn: string;
  degreeInSign: number;
  house: number;          // 1 - 12
  nakshatra: string;
  nakshatraCn: string;
  pada: number;           // 1 - 4
  isRetrograde?: boolean;
  dignity?: string;       // 庙/旺/陷/敌/友
}

export interface NakshatraInfo {
  index: number;          // 1 - 27
  name: string;
  cnName: string;
  ruler: string;
  rulerCn: string;
  deity: string;
  deityCn: string;
  symbol: string;
  symbolCn: string;
  guna: string;
  element: string;
  keywords: string[];
  summary: string;
}

export interface SubDashaPeriod {
  planet: VedicPlanetName;
  planetCn: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  subPeriods?: SubDashaPeriod[]; // PD list under AD
}

export interface DashaPeriod {
  planet: VedicPlanetName;
  planetCn: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  subPeriods?: SubDashaPeriod[]; // 9 Antar Dashas
}

export interface CurrentDashaHierarchy {
  mahaDasha: DashaPeriod;
  antarDasha: SubDashaPeriod;
  pratyantarDasha: SubDashaPeriod;
  formattedDisplay: string; // e.g. "Saturn-Mercury-Venus (土星大运-水星中运-金星小运)"
}

export interface CharaKaraka {
  role: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  roleName: string;
  roleDescription: string;
  planet: VedicPlanetName;
  planetCn: string;
  degree: number;
}

export interface VedicChart {
  birthDate: string;
  birthTime: string;
  ayanamsa: number;       // Lahiri Ayanamsa value
  ascendant: VedicPlanetPosition;
  planets: VedicPlanetPosition[];
  d1Chart: Record<number, VedicPlanetPosition[]>;  // House 1-12
  d9Chart: Record<number, { name: string; cnName: string; sign: string; signCn: string }[]>; // Navamsa
  d10Chart: Record<number, { name: string; cnName: string; sign: string; signCn: string }[]>; // Dasamsa
  moonNakshatra: NakshatraInfo;
  charaKarakas: CharaKaraka[];
  currentDasha: CurrentDashaHierarchy;
  dashaTimeline: DashaPeriod[]; // Full 120-year 9 MD -> 81 AD timeline
  evidences: CanonicalEvidenceNode[];
  validation: ValidationReport;
  summaryTags: string[];
}

export interface VedicSynastryMatrix {
  personA: { name: string; moonSign: string; moonNakshatra: string };
  personB: { name: string; moonSign: string; moonNakshatra: string };
  attractionDynamics: {
    score: number; // 0 - 100
    level: '强引力' | '中等共振' | '平淡' | '电磁张力';
    analysis: string;
  };
  containmentCapacity: {
    score: number;
    frictionLevel: '低摩擦·舒适' | '磨合期长' | '易起内耗';
    analysis: string;
  };
  valueAlignment: {
    score: number;
    direction: '高度同频' | '互补型' | '根本分歧';
    analysis: string;
  };
  dashaTimingResonance: {
    periodA: string;
    periodB: string;
    resonance: '同步上升' | '一方托底' | '逆风磨砺';
    analysis: string;
  };
  ashtakootaHighlights: {
    nadiMatch: boolean;      // 身心基因共鸣 (8分)
    bhakootMatch: boolean;    // 情感福祉流动 (7分)
    ganaMatch: boolean;       // 性格气质分类 (6分)
    yoniMatch: boolean;       // 生理与本能吸引 (4分)
  };
  synthesizedAdvice: string;
}
