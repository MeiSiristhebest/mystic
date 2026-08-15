import { CanonicalEvidenceNode, ValidationReport } from '../contracts/types';

export class BaziCalculationError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(`[BaziCalculationError] ${message}`);
    this.name = 'BaziCalculationError';
  }
}

export interface BaziConvention {
  useTrueSolarTime: boolean;            // 是否使用星历真太阳时校正
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

export type InteractionType =
  | 'stem_combination'         // 天干五合 (如甲己合土)
  | 'branch_six_combination'  // 地支六合 (如子丑合土)
  | 'branch_three_harmony'     // 地支三合局 (如申子辰合水)
  | 'branch_three_meeting'     // 地支三会局 (如寅卯辰会木)
  | 'branch_six_clash'         // 地支六冲 (如子午相冲)
  | 'branch_punishment'        // 地支相刑 (三刑/自刑)
  | 'branch_harm';             // 地支相害 (六穿)

export interface BranchInteraction {
  type: InteractionType;
  name: string;
  pillarsInvolved: string[]; // e.g. ["年柱(庚午)", "日柱(庚辰)"]
  elementsInvolved: string[]; // e.g. ["午", "子"]
  resultElement?: string;
  description: string;
}

export interface DayMasterStrengthEvaluation {
  seasonality: {
    monthBranch: string;
    monthElement: string;
    state: '旺' | '相' | '休' | '囚' | '死';
    deLing: boolean;
    description: string;
  };
  rooting: {
    rootCount: number;
    roots: Array<{
      branch: string;
      stem: string;
      role: 'major' | 'middle' | 'minor';
      element: string;
      score: number;
    }>;
    deDi: boolean;
  };
  scores: {
    deLingScore: number;   // 得令得分 (0~40)
    deDiScore: number;     // 得地得分 (0~35)
    deShiScore: number;    // 得势得分 (0~25)
    totalScore: number;    // 总得分 (0~100)
  };
  overallState: '身强' | '身弱' | '中和平衡' | '从格倾向';
  favoredElements: Array<'木' | '火' | '土' | '金' | '水'>;   // 喜用五行
  unfavoredElements: Array<'木' | '火' | '土' | '金' | '水'>; // 忌仇五行
  academicRationale: string;
}

export interface DaYunPeriod {
  step: number;               // 第几步大运 (1~10)
  ganZhi: string;             // 大运干支 (如 壬午)
  startAge: number;           // 起运虚岁
  endAge: number;             // 止运虚岁
  startYear: number;          // 起运公历年份
  endYear: number;            // 止运公历年份
  startDate: string;          // 起运日期 (YYYY-MM-DD)
  endDate: string;            // 止运日期 (YYYY-MM-DD)
  shiShen: string;            // 大运天干对于日主之十神
  naYin: string;              // 大运纳音
}

export interface DaYunTimeline {
  direction: '顺行' | '逆行';
  startAge: number;           // 精确起运岁数 (整岁)
  startMonthsRemainder: number; // 起运月数余数
  startDaysRemainder: number;   // 起运天数余数
  exactFirstDaYunDate: string;  // 首步大运起运精确公历日期
  periods: DaYunPeriod[];
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
  interactions: BranchInteraction[];
  strengthEvaluation: DayMasterStrengthEvaluation;
  daYun: DaYunTimeline;
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
