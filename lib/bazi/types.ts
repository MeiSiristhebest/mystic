import { CanonicalEvidenceNode, ValidationReport } from '../contracts/types';

export class BaziCalculationError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(`[BaziCalculationError] ${message}`);
    this.name = 'BaziCalculationError';
  }
}

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
  solarTimeDetails: {
    civilTime: string;
    trueSolarTime: string;
    eotMinutes: number;
    longitudeOffsetMinutes: number;
    usedTrueSolarTime: boolean;
  };
  calculationStatus: 'exact' | 'degraded';
  calculationMethod: 'lunar_24_solar_terms_true_solar' | 'lunar_civil_standard';
  validation: ValidationReport;
  evidences: CanonicalEvidenceNode[];
  summaryTags: string[];
}
