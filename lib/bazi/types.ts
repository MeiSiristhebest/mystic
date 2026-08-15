import { CanonicalEvidenceNode, ValidationReport } from '../contracts/types';

export class BaziCalculationError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(`[BaziCalculationError] ${message}`);
    this.name = 'BaziCalculationError';
  }
}

export interface BaziConvention {
  useTrueSolarTime: boolean;            // 是否使用 Spencer 均时差与经度偏移进行真太阳时校正
  dayBoundary: 'midnight' | 'zi_early'; // 'zi_early': 子初(23:00)换日; 'midnight': 00:00换日
  yearBoundary: 'lichun';                // 严格以立春作为年柱分界
  monthBoundary: 'jie';                  // 严格以二十四节气交节日换月
}

export const DEFAULT_BAZI_CONVENTION: BaziConvention = {
  useTrueSolarTime: true,
  dayBoundary: 'zi_early',
  yearBoundary: 'lichun',
  monthBoundary: 'jie',
};

export interface BaziPillars {
  year: string;
  month: string;
  day: string;
  time: string;
}

export interface HiddenStem {
  branch: string;
  stems: Array<{
    stem: string;
    element: string;
    role: 'major' | 'middle' | 'minor'; // 本气, 中气, 余气
    tenGod: string;
  }>;
}

export interface VisibleElementDistribution {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface BaziTenGodInfo {
  yearGan: string;
  monthGan: string;
  timeGan: string;
}

export interface BaziTimeContext {
  civilLocalTime: string;
  utcInstant: string;
  trueSolarTime: string;
  standardOffsetMinutes: number;
  dstOffsetMinutes: number;
  totalTimezoneOffsetMinutes: number;
  eotMinutes: number;
  longitudeOffsetMinutes: number;
  convention: BaziConvention;
}

export interface BaziChart {
  baziString: string;
  lunarDateString: string;
  pillars: BaziPillars;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  yearNaYin: string;
  monthNaYin: string;
  dayNaYin: string;
  timeNaYin: string;
  dayMaster: string; // e.g. "庚金"
  dayMasterElement: string; // "金"
  dayMasterYinYang: string; // "阳"
  visibleElementDistribution: VisibleElementDistribution;
  hiddenStems: HiddenStem[];
  tenGods: BaziTenGodInfo;
  timeContext: BaziTimeContext;
  solarTimeDetails: {
    civilTime: string;
    trueSolarTime: string;
    eotMinutes: number;
    longitudeOffsetMinutes: number;
    usedTrueSolarTime: boolean;
  };
  calculationStatus: 'exact' | 'degraded';
  calculationMethod: string;
  validation: ValidationReport;
  evidences: CanonicalEvidenceNode[];
  summaryTags: string[];
}
