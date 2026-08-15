import { CanonicalEvidenceNode, ValidationReport } from '../contracts/types';

export class BaziCalculationError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(`[BaziCalculationError] ${message}`);
    this.name = 'BaziCalculationError';
  }
}

export interface StrengthModelConfig {
  deLingMax: number;                   // 得令满分，默认 40
  deDiMax: number;                     // 得地满分，默认 35
  deShiMax: number;                    // 得势满分，默认 25
  strongThreshold: number;             // 身强判定阈值，默认 52
  weakThreshold: number;               // 身弱判定阈值，默认 40
  followingCandidateThreshold: number; // 弱极从格候选阈值，默认 15
}

export const DEFAULT_STRENGTH_MODEL_CONFIG: StrengthModelConfig = {
  deLingMax: 40,
  deDiMax: 35,
  deShiMax: 25,
  strongThreshold: 52,
  weakThreshold: 40,
  followingCandidateThreshold: 15,
};

export interface BaziConvention {
  useTrueSolarTime: boolean;            // 是否使用星历真太阳时校正
  /**
   * 日界线规则 (Day Boundary Convention)
   *
   * IMPLEMENTATION NOTE: Currently only 'zi_early' (子初换日, 23:00~00:59 belong to next day)
   * is actually enforced by pre-processing the birth hour before passing to lunar-javascript.
   * 'midnight' is NOT separately enforced at the library level — lunar-javascript uses its
   * own internal day boundary logic which aligns with the 'zi_early' convention by default.
   *
   * If your use case strictly requires 'midnight' (午夜换日), treat this as a known limitation
   * and do NOT rely on this field alone to guarantee correctness.
   */
  dayBoundary: 'midnight' | 'zi_early';
  yearBoundary: 'lichun';                // 严格以立春作为年柱分界
  monthBoundary: 'jie';                  // 严格以二十四节气交节日换月
  strengthModelConfig: StrengthModelConfig; // 启发式强弱打分参数
}


export const DEFAULT_BAZI_CONVENTION: BaziConvention = {
  useTrueSolarTime: true,
  dayBoundary: 'zi_early',
  yearBoundary: 'lichun',
  monthBoundary: 'jie',
  strengthModelConfig: DEFAULT_STRENGTH_MODEL_CONFIG,
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
  | 'stem_combination'         // 天干五合关系存在 (如甲己)
  | 'branch_six_combination'  // 地支六合关系存在 (如子丑)
  | 'branch_three_harmony'     // 地支三合局关系存在 (如申子辰)
  | 'branch_half_harmony'      // 地支半合局关系存在 (如申子 / 子辰)
  | 'branch_three_meeting'     // 地支三会局关系存在 (如寅卯辰)
  | 'branch_six_clash'         // 地支六冲关系存在 (如子午)
  | 'branch_punishment'        // 地支相刑关系存在 (三刑/自刑)
  | 'branch_harm';             // 地支相害/六穿关系存在 (如子未)

export interface BranchInteraction {
  type: InteractionType;
  name: string;
  pillarsInvolved: string[]; // e.g. ["年柱(庚午)", "日柱(庚辰)"]
  elementsInvolved: string[]; // e.g. ["午", "子"]
  resultElement?: string;
  transformationEstablished: boolean; // 是否满足月令引化条件合化成功
  structuralWeight: number; // 结构重要性权重 (三会:10, 三合:9, 六合:8, 六冲:8, 刑:7, 害:6, 五合:5, 半合:4)
  description: string;
}

export interface DayMasterStrengthEvaluation {
  modelName: 'mystic_quantitative_strength_v1';
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
    deLingScore: number;   // 得令得分
    deDiScore: number;     // 得地得分
    deShiScore: number;    // 得势得分
    totalScore: number;    // 总得分 (0~100)
  };
  overallState: '身强' | '身弱' | '中和平衡' | '从格候选';
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
  startDate: string;          // 起运精确公历日期 (YYYY-MM-DD)
  endDate: string;            // 止运精确公历日期 (YYYY-MM-DD)
  shiShen: string;            // 大运天干对于日主之十神
  naYin: string;              // 大运纳音
}

export interface DaYunTimeline {
  direction: '顺行' | '逆行';
  startAge: number;           // 精确起运岁数 (整岁)
  startMonthsRemainder: number; // 起运月数余数
  startDaysRemainder: number;   // 起运天数余数
  firstDaYunStartDate: string;  // 首步大运起运精确公历日期 (YYYY-MM-DD)
  periods: DaYunPeriod[];
}

export interface BaziCalculationProvenance {
  calendar: string;        // e.g. 'lunar_javascript_deterministic'
  solarTime: string;       // e.g. 'meeus_eot_approximation'
  strength: string;        // e.g. 'mystic_heuristic_v1'
  interactions: string;    // e.g. 'structural_pattern_detector_v1'
  daYunDates: string;      // e.g. 'lunar_javascript_solar_arithmetic'
}

export interface BaziTimeContext {
  civilLocalDate: string;  // YYYY-MM-DD (civil local date, separate from time)
  civilLocalTime: string;  // HH:mm
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
  calculationProvenance: BaziCalculationProvenance;
  validation: ValidationReport;
  evidences: CanonicalEvidenceNode[];
  summaryTags: string[];
}
