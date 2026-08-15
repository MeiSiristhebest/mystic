import { Solar } from "lunar-javascript";
import { BirthContext, ValidationReport } from "../contracts/types";
import { BaziCalculationError, BaziChart, BaziPillars, HiddenStem, VisibleElementDistribution, BaziTenGodInfo } from "./types";
import { calculateTrueSolarTime } from "./solar-time";

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
 * Core Bazi Calculation with Fail-Fast Validation and True Solar Time
 */
export function calculateBaziCore(
  context: BirthContext,
  useTrueSolarTime: boolean = true
): {
  pillars: BaziPillars;
  lunarDateString: string;
  yearNaYin: string;
  monthNaYin: string;
  dayNaYin: string;
  timeNaYin: string;
  dayMaster: string;
  dayMasterElement: string;
  dayMasterYinYang: string;
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
  validation: ValidationReport;
} {
  const { birthDate, birthTime, timeZone = 'Asia/Shanghai', longitude = 116.40 } = context;

  if (!birthDate || !birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new BaziCalculationError(`Invalid birthDate format '${birthDate}'. Expected 'YYYY-MM-DD'.`);
  }

  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = (birthTime || '12:00').split(':').map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new BaziCalculationError(`Invalid calendar date: ${birthDate}`);
  }

  // Construct civil local Date
  const civilLocal = new Date(year, month - 1, day, hour || 0, minute || 0, 0);

  // Compute True Solar Time
  const solarTimeResult = calculateTrueSolarTime(civilLocal, longitude, timeZone);
  const targetDate = useTrueSolarTime ? solarTimeResult.trueSolarDate : civilLocal;

  let solar: any;
  try {
    solar = Solar.fromYmdHms(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      targetDate.getDate(),
      targetDate.getHours(),
      targetDate.getMinutes(),
      targetDate.getSeconds()
    );
  } catch (err) {
    throw new BaziCalculationError(`lunar-javascript Solar conversion failed for target date ${targetDate.toISOString()}`, err);
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

  // Visible Element Distribution across 8 characters (Note: explicit count only, NOT weighted strength)
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

  const validation: ValidationReport = {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };

  return {
    pillars: {
      year: yearGanZhi,
      month: monthGanZhi,
      day: dayGanZhi,
      time: timeGanZhi,
    },
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
    solarTimeDetails: {
      civilTime: solarTimeResult.formattedCivilTime,
      trueSolarTime: solarTimeResult.formattedTrueSolarTime,
      eotMinutes: solarTimeResult.eotMinutes,
      longitudeOffsetMinutes: solarTimeResult.longitudeOffsetMinutes,
      usedTrueSolarTime: useTrueSolarTime,
    },
    validation,
  };
}
