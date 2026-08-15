import { Solar } from "lunar-javascript";
import { BirthContext, ValidationReport } from "../contracts/types";
import { BaziCalculationError, BaziPillars, HiddenStem, VisibleElementDistribution, BaziTenGodInfo, BaziConvention, DEFAULT_BAZI_CONVENTION, BaziTimeContext, BranchInteraction, DayMasterStrengthEvaluation, DaYunTimeline } from "./types";
import { calculateAstronomicalTrueSolarTime } from "./solar-time";
import { analyzeInteractions } from "./interactions";
import { evaluateDayMasterStrength } from "./strength";
import { calculateDaYunTimeline } from "./dayun";

export const STEM_ELEMENT_MAP: Record<string, { element: '木' | '火' | '土' | '金' | '水'; yinYang: '阳' | '阴' }> = {
  甲: { element: '木', yinYang: '阳' },
  乙: { element: '木', yinYang: '阴' },
  丙: { element: '火', yinYang: '阳' },
  丁: { element: '火', yinYang: '阴' },
  戊: { element: '土', yinYang: '阳' },
  己: { element: '土', yinYang: '阴' },
  庚: { element: '金', yinYang: '阳' },
  辛: { element: '金', yinYang: '阴' },
  壬: { element: '水', yinYang: '阳' },
  癸: { element: '水', yinYang: '阴' },
};

export const BRANCH_ELEMENT_MAP: Record<string, '木' | '火' | '土' | '金' | '水'> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
};

// 权威传统地支藏干表（本气、中气、余气）
export const BRANCH_HIDDEN_STEMS: Record<string, Array<{ stem: string; role: 'major' | 'middle' | 'minor' }>> = {
  子: [{ stem: '癸', role: 'major' }],
  丑: [{ stem: '己', role: 'major' }, { stem: '癸', role: 'middle' }, { stem: '辛', role: 'minor' }],
  寅: [{ stem: '甲', role: 'major' }, { stem: '丙', role: 'middle' }, { stem: '戊', role: 'minor' }],
  卯: [{ stem: '乙', role: 'major' }],
  辰: [{ stem: '戊', role: 'major' }, { stem: '乙', role: 'middle' }, { stem: '癸', role: 'minor' }],
  巳: [{ stem: '丙', role: 'major' }, { stem: '戊', role: 'middle' }, { stem: '庚', role: 'minor' }],
  午: [{ stem: '丁', role: 'major' }, { stem: '己', role: 'middle' }],
  未: [{ stem: '己', role: 'major' }, { stem: '丁', role: 'middle' }, { stem: '乙', role: 'minor' }],
  申: [{ stem: '庚', role: 'major' }, { stem: '壬', role: 'middle' }, { stem: '戊', role: 'minor' }],
  酉: [{ stem: '辛', role: 'major' }],
  戌: [{ stem: '戊', role: 'major' }, { stem: '辛', role: 'middle' }, { stem: '丁', role: 'minor' }],
  亥: [{ stem: '壬', role: 'major' }, { stem: '甲', role: 'middle' }],
};

export const VALID_STEMS = Object.keys(STEM_ELEMENT_MAP);
export const VALID_BRANCHES = Object.keys(BRANCH_ELEMENT_MAP);

/**
 * Calculate Ten God name between Day Master and Target Stem
 */
export function calculateTenGod(dayGan: string, targetGan: string): string {
  const dm = STEM_ELEMENT_MAP[dayGan];
  const target = STEM_ELEMENT_MAP[targetGan];
  if (!dm || !target) return '未知';

  const sameYinYang = dm.yinYang === target.yinYang;

  // 同我者 (比肩/劫财)
  if (dm.element === target.element) {
    return sameYinYang ? '比肩' : '劫财';
  }

  // 生我者 (正印/偏印/枭神)
  const isParent = (dm.element === '木' && target.element === '水') ||
                   (dm.element === '火' && target.element === '木') ||
                   (dm.element === '土' && target.element === '火') ||
                   (dm.element === '金' && target.element === '土') ||
                   (dm.element === '水' && target.element === '金');
  if (isParent) {
    return sameYinYang ? '偏印' : '正印';
  }

  // 我生者 (食神/伤官)
  const isChild = (dm.element === '木' && target.element === '火') ||
                  (dm.element === '火' && target.element === '土') ||
                  (dm.element === '土' && target.element === '金') ||
                  (dm.element === '金' && target.element === '水') ||
                  (dm.element === '水' && target.element === '木');
  if (isChild) {
    return sameYinYang ? '食神' : '伤官';
  }

  // 克我者 (正官/七杀)
  const isOfficer = (dm.element === '木' && target.element === '金') ||
                    (dm.element === '火' && target.element === '水') ||
                    (dm.element === '土' && target.element === '木') ||
                    (dm.element === '金' && target.element === '火') ||
                    (dm.element === '水' && target.element === '土');
  if (isOfficer) {
    return sameYinYang ? '七杀' : '正官';
  }

  // 我克者 (正财/偏财)
  const isWealth = (dm.element === '木' && target.element === '土') ||
                   (dm.element === '火' && target.element === '金') ||
                   (dm.element === '土' && target.element === '水') ||
                   (dm.element === '金' && target.element === '木') ||
                   (dm.element === '水' && target.element === '火');
  if (isWealth) {
    return sameYinYang ? '偏财' : '正财';
  }

  return '未知';
}

/**
 * Core Bazi Calculation with Fail-Fast Validation, IANA Timezone, Interactions, Strength, and Da Yun
 */
export function calculateBaziCore(
  context: BirthContext,
  conventionOptions?: Partial<BaziConvention>
): {
  pillars: BaziPillars;
  lunarDateString: string;
  yearNaYin: string;
  monthNaYin: string;
  dayNaYin: string;
  timeNaYin: string;
  dayMaster: string;
  dayMasterElement: '木' | '火' | '土' | '金' | '水';
  dayMasterYinYang: '阳' | '阴';
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
  convention: BaziConvention;
  validation: ValidationReport;
} {
  const convention: BaziConvention = {
    ...DEFAULT_BAZI_CONVENTION,
    ...conventionOptions,
  };

  const { birthDate, birthTime = '12:00', timeZone = 'Asia/Shanghai', longitude = 116.40, gender = 'male' } = context;

  if (!birthDate || !birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new BaziCalculationError(`Invalid birthDate format '${birthDate}'. Expected 'YYYY-MM-DD'.`);
  }

  const [y, m, d] = birthDate.split('-').map(Number);
  const [h, min] = (birthTime || '12:00').split(':').map(Number);

  if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new BaziCalculationError(`Invalid calendar date: ${birthDate}`);
  }

  // Calculate Astronomical True Solar Time via IANA / Ephemeris EoT
  const solarTimeResult = calculateAstronomicalTrueSolarTime(birthDate, birthTime, timeZone, longitude);

  // Target coordinates for Lunar calculation
  let targetYear = y;
  let targetMonth = m;
  let targetDay = d;
  let targetHour = h;
  let targetMinute = min;
  let targetSecond = 0;

  if (convention.useTrueSolarTime) {
    targetYear = solarTimeResult.trueSolarComponents.year;
    targetMonth = solarTimeResult.trueSolarComponents.month;
    targetDay = solarTimeResult.trueSolarComponents.day;
    targetHour = solarTimeResult.trueSolarComponents.hour;
    targetMinute = solarTimeResult.trueSolarComponents.minute;
    targetSecond = solarTimeResult.trueSolarComponents.second;
  }

  let solar: any;
  try {
    solar = Solar.fromYmdHms(
      targetYear,
      targetMonth,
      targetDay,
      targetHour,
      targetMinute,
      targetSecond
    );
  } catch (err) {
    throw new BaziCalculationError(`lunar-javascript Solar conversion failed for target ${targetYear}-${targetMonth}-${targetDay} ${targetHour}:${targetMinute}`, err);
  }

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearGanZhi = eightChar.getYear();
  const monthGanZhi = eightChar.getMonth();
  const dayGanZhi = eightChar.getDay();
  const timeGanZhi = eightChar.getTime();

  // Validate GanZhi characters
  const issues: ValidationReport['issues'] = [];
  const validatePillar = (name: string, gz: string) => {
    if (gz.length !== 2) {
      issues.push({ field: name, severity: 'error', message: `Pillar ${name} length is not 2: '${gz}'`, code: 'INVALID_PILLAR_LENGTH' });
      return;
    }
    const stem = gz.charAt(0);
    const branch = gz.charAt(1);
    if (!VALID_STEMS.includes(stem)) {
      issues.push({ field: name, severity: 'error', message: `Invalid Heavenly Stem '${stem}' in ${name}`, code: 'INVALID_STEM' });
    }
    if (!VALID_BRANCHES.includes(branch)) {
      issues.push({ field: name, severity: 'error', message: `Invalid Earthly Branch '${branch}' in ${name}`, code: 'INVALID_BRANCH' });
    }
  };

  validatePillar('year', yearGanZhi);
  validatePillar('month', monthGanZhi);
  validatePillar('day', dayGanZhi);
  validatePillar('time', timeGanZhi);

  if (issues.some(i => i.severity === 'error')) {
    throw new BaziCalculationError(`Bazi validation failed: ${issues.map(i => i.message).join('; ')}`);
  }

  const dayGan = dayGanZhi.charAt(0);
  const dmInfo = STEM_ELEMENT_MAP[dayGan];
  const dayMaster = `${dayGan}${dmInfo.element}`;

  // Visible Element Distribution across 8 characters
  const chars = [
    yearGanZhi.charAt(0), yearGanZhi.charAt(1),
    monthGanZhi.charAt(0), monthGanZhi.charAt(1),
    dayGanZhi.charAt(0), dayGanZhi.charAt(1),
    timeGanZhi.charAt(0), timeGanZhi.charAt(1),
  ];

  const visibleElementDistribution: VisibleElementDistribution = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  chars.forEach((c, idx) => {
    const el = idx % 2 === 0 ? STEM_ELEMENT_MAP[c]?.element : BRANCH_ELEMENT_MAP[c];
    if (el === '木') visibleElementDistribution.wood++;
    else if (el === '火') visibleElementDistribution.fire++;
    else if (el === '土') visibleElementDistribution.earth++;
    else if (el === '金') visibleElementDistribution.metal++;
    else if (el === '水') visibleElementDistribution.water++;
  });

  // Extract Earthly Branch Hidden Stems (地支藏干)
  const branches = [yearGanZhi.charAt(1), monthGanZhi.charAt(1), dayGanZhi.charAt(1), timeGanZhi.charAt(1)];
  const hiddenStems: HiddenStem[] = branches.map(b => {
    const stems = (BRANCH_HIDDEN_STEMS[b] || []).map(h => ({
      stem: h.stem,
      element: STEM_ELEMENT_MAP[h.stem]?.element || '土',
      role: h.role,
      tenGod: calculateTenGod(dayGan, h.stem),
    }));
    return { branch: b, stems };
  });

  const tenGods: BaziTenGodInfo = {
    yearGan: eightChar.getYearShiShenGan(),
    monthGan: eightChar.getMonthShiShenGan(),
    timeGan: eightChar.getTimeShiShenGan(),
  };

  const pillars: BaziPillars = {
    year: yearGanZhi,
    month: monthGanZhi,
    day: dayGanZhi,
    time: timeGanZhi,
  };

  // 1. Analyze Stem/Branch Interactions
  const interactions = analyzeInteractions(pillars);

  // 2. Evaluate Day Master Seasonality & Root Strength
  const strengthEvaluation = evaluateDayMasterStrength(pillars, dayMaster, dmInfo.element, hiddenStems);

  // 3. Compute Da Yun Timeline
  const daYun = calculateDaYunTimeline(solar, gender, dayGan);

  const validation: ValidationReport = {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };

  const timeContext: BaziTimeContext = {
    civilLocalTime: solarTimeResult.civilLocalTime,
    utcInstant: solarTimeResult.utcInstant,
    trueSolarTime: solarTimeResult.trueSolarTime,
    standardOffsetMinutes: solarTimeResult.standardOffsetMinutes,
    dstOffsetMinutes: solarTimeResult.dstOffsetMinutes,
    totalTimezoneOffsetMinutes: solarTimeResult.totalTimezoneOffsetMinutes,
    eotMinutes: solarTimeResult.eotMinutes,
    longitudeOffsetMinutes: solarTimeResult.longitudeOffsetMinutes,
    convention,
  };

  return {
    pillars,
    lunarDateString: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
    yearNaYin: eightChar.getYearNaYin(),
    monthNaYin: eightChar.getMonthNaYin(),
    dayNaYin: eightChar.getDayNaYin(),
    timeNaYin: eightChar.getTimeNaYin(),
    dayMaster,
    dayMasterElement: dmInfo.element,
    dayMasterYinYang: dmInfo.yinYang,
    visibleElementDistribution,
    hiddenStems,
    tenGods,
    interactions,
    strengthEvaluation,
    daYun,
    timeContext,
    solarTimeDetails: {
      civilTime: solarTimeResult.civilLocalTime,
      trueSolarTime: solarTimeResult.trueSolarTime,
      eotMinutes: solarTimeResult.eotMinutes,
      longitudeOffsetMinutes: solarTimeResult.longitudeOffsetMinutes,
      usedTrueSolarTime: convention.useTrueSolarTime,
    },
    convention,
    validation,
  };
}
