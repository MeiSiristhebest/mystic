import { Solar } from "lunar-javascript";
import { CanonicalEvidenceNode, DomainEvaluationResult, ValidationReport, calculateDeterministicConfidence } from "@/lib/contracts";

export interface BaziCalculationResult {
  baziString: string;
  lunarDateString: string;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  yearNaYin?: string;
  monthNaYin?: string;
  dayNaYin?: string;
  timeNaYin?: string;
}

export interface BaziChart extends BaziCalculationResult {
  dayMaster: string;
  dayMasterElement: string;
  dayMasterYinYang: string;
  fiveElementsCount: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  tenGods: {
    yearGan: string;
    monthGan: string;
    timeGan: string;
  };
  validation: ValidationReport;
  evidences: CanonicalEvidenceNode[];
  summaryTags: string[];
}

const STEM_ELEMENT_MAP: Record<string, { element: string; yinYang: string }> = {
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

const BRANCH_ELEMENT_MAP: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
};

export class BaziService {
  /**
   * Get Chinese Zodiac animal from birth year.
   */
  static getZodiac(year: number): string {
    if (!year) return "";
    const shengXiao = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
    const index = (year - 4) % 12;
    return shengXiao[index < 0 ? index + 12 : index];
  }

  /**
   * Calculate Bazi four pillars with 24 Solar Terms (Jieqi) precision.
   */
  static getBazi(birthDate: string, birthTime: string): BaziCalculationResult {
    if (!birthDate) {
      return {
        baziString: "",
        lunarDateString: "",
        yearGanZhi: "",
        monthGanZhi: "",
        dayGanZhi: "",
        timeGanZhi: "",
      };
    }

    try {
      const [year, month, day] = birthDate.split('-').map(Number);
      const [hour, minute] = (birthTime || '12:00').split(':').map(Number);

      const solar = Solar.fromYmdHms(year, month, day, hour, minute || 0, 0);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      // Authoritative 24 Solar Terms precision for Bazi Four Pillars
      const yearGanZhi = eightChar.getYear();
      const monthGanZhi = eightChar.getMonth();
      const dayGanZhi = eightChar.getDay();
      const timeGanZhi = eightChar.getTime();

      return {
        baziString: `${yearGanZhi}年 ${monthGanZhi}月 ${dayGanZhi}日 ${timeGanZhi}时`,
        lunarDateString: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
        yearGanZhi,
        monthGanZhi,
        dayGanZhi,
        timeGanZhi,
        yearNaYin: eightChar.getYearNaYin(),
        monthNaYin: eightChar.getMonthNaYin(),
        dayNaYin: eightChar.getDayNaYin(),
        timeNaYin: eightChar.getTimeNaYin(),
      };
    } catch (e) {
      return {
        baziString: "",
        lunarDateString: "",
        yearGanZhi: "",
        monthGanZhi: "",
        dayGanZhi: "",
        timeGanZhi: "",
      };
    }
  }

  /**
   * Complete Domain Evaluation Package for Bazi Four Pillars.
   */
  static getBaziDomainEvaluation(birthDate: string, birthTime: string): DomainEvaluationResult<BaziChart> {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = (birthTime || '12:00').split(':').map(Number);

    const solar = Solar.fromYmdHms(year, month, day, hour, minute || 0, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    const yearGanZhi = eightChar.getYear();
    const monthGanZhi = eightChar.getMonth();
    const dayGanZhi = eightChar.getDay();
    const timeGanZhi = eightChar.getTime();

    const dayGan = dayGanZhi.charAt(0);
    const dmInfo = STEM_ELEMENT_MAP[dayGan] || { element: '金', yinYang: '阳' };
    const dayMaster = `${dayGan}${dmInfo.element}`;

    // Five Elements Distribution across 8 characters
    const chars = [
      yearGanZhi.charAt(0), yearGanZhi.charAt(1),
      monthGanZhi.charAt(0), monthGanZhi.charAt(1),
      dayGanZhi.charAt(0), dayGanZhi.charAt(1),
      timeGanZhi.charAt(0), timeGanZhi.charAt(1),
    ];

    const fiveElementsCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    chars.forEach((c, idx) => {
      const el = idx % 2 === 0 ? STEM_ELEMENT_MAP[c]?.element : BRANCH_ELEMENT_MAP[c];
      if (el === '木') fiveElementsCount.wood++;
      else if (el === '火') fiveElementsCount.fire++;
      else if (el === '土') fiveElementsCount.earth++;
      else if (el === '金') fiveElementsCount.metal++;
      else if (el === '水') fiveElementsCount.water++;
    });

    const tenGods = {
      yearGan: eightChar.getYearShiShenGan(),
      monthGan: eightChar.getMonthShiShenGan(),
      timeGan: eightChar.getTimeShiShenGan(),
    };

    const summaryTags: string[] = [
      `日主${dayMaster}`,
      `月令${tenGods.monthGan || '正官'}格`,
      `年命${eightChar.getYearNaYin()}`,
    ];

    // Validation Report
    const validation: ValidationReport = {
      isValid: yearGanZhi.length === 2 && monthGanZhi.length === 2 && dayGanZhi.length === 2 && timeGanZhi.length === 2,
      issues: [],
    };

    // Extract Canonical Evidence Nodes
    const evidences: CanonicalEvidenceNode[] = [];

    // Evidence 1: Day Master Constitution
    const confDm = calculateDeterministicConfidence({
      calculation: 1.0,
      inputCompleteness: 1.0,
      ruleMatch: 0.95,
      sourceAuthority: 0.95,
    });

    evidences.push({
      id: `bazi_daymaster_${dayGan}`,
      domain: 'bazi',
      ruleId: 'BAZI_DAY_MASTER',
      ruleName: `日主元神: ${dayMaster} (${dmInfo.yinYang}${dmInfo.element})`,
      level: 'core',
      dimension: 'personality',
      polarity: 'favorable',
      confidence: confDm.overall,
      confidenceBreakdown: confDm,
      temporalScope: { scopeType: 'natal' },
      parameters: {
        dayMaster,
        element: dmInfo.element,
        yinYang: dmInfo.yinYang,
        fiveElementsCount,
      },
      classicalSource: '《滴天髓》“五阳皆阳丙为最，五阴皆阴癸为至”',
      canonicalInterpretation: `命主日元为【${dayMaster}】，代表本命核心元神禀赋。五行分布：木${fiveElementsCount.wood}、火${fiveElementsCount.fire}、土${fiveElementsCount.earth}、金${fiveElementsCount.metal}、水${fiveElementsCount.water}。`,
    });

    // Evidence 2: Ten God Pattern Structure
    const confTg = calculateDeterministicConfidence({
      calculation: 1.0,
      inputCompleteness: 1.0,
      ruleMatch: 0.92,
      sourceAuthority: 0.92,
    });

    evidences.push({
      id: `bazi_tengod_month_${tenGods.monthGan || 'structure'}`,
      domain: 'bazi',
      ruleId: 'BAZI_TEN_GOD_STRUCTURE',
      ruleName: `格局主轴: 月透【${tenGods.monthGan}】`,
      level: 'core',
      dimension: 'career',
      polarity: tenGods.monthGan.includes('杀') || tenGods.monthGan.includes('伤') ? 'transformative' : 'favorable',
      confidence: confTg.overall,
      confidenceBreakdown: confTg,
      temporalScope: { scopeType: 'natal' },
      parameters: {
        monthShiShen: tenGods.monthGan,
        yearShiShen: tenGods.yearGan,
        timeShiShen: tenGods.timeGan,
      },
      classicalSource: '《三命通会·论格局》与《渊海子平》',
      canonicalInterpretation: `八字以月令为纲，月干透出【${tenGods.monthGan}】，年透【${tenGods.yearGan}】，时透【${tenGods.timeGan}】，构成本命中枢社会功能与行事风格。`,
    });

    // Evidence 3: Na Yin Element
    evidences.push({
      id: `bazi_nayin_year_${eightChar.getYearNaYin()}`,
      domain: 'bazi',
      ruleId: 'BAZI_NAYIN_CONSTITUTION',
      ruleName: `年命纳音: ${eightChar.getYearNaYin()}`,
      level: 'support',
      dimension: 'health',
      polarity: 'neutral',
      confidence: 0.90,
      temporalScope: { scopeType: 'natal' },
      parameters: {
        yearNaYin: eightChar.getYearNaYin(),
        dayNaYin: eightChar.getDayNaYin(),
      },
      classicalSource: '《五行精纪·纳音取象》',
      canonicalInterpretation: `年柱纳音为【${eightChar.getYearNaYin()}】，日柱纳音为【${eightChar.getDayNaYin()}】，提供深层先天气质与体质音律之五行共鸣。`,
    });

    const chart: BaziChart = {
      baziString: `${yearGanZhi}年 ${monthGanZhi}月 ${dayGanZhi}日 ${timeGanZhi}时`,
      lunarDateString: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      timeGanZhi,
      yearNaYin: eightChar.getYearNaYin(),
      monthNaYin: eightChar.getMonthNaYin(),
      dayNaYin: eightChar.getDayNaYin(),
      timeNaYin: eightChar.getTimeNaYin(),
      dayMaster,
      dayMasterElement: dmInfo.element,
      dayMasterYinYang: dmInfo.yinYang,
      fiveElementsCount,
      tenGods,
      validation,
      evidences,
      summaryTags,
    };

    return {
      domain: 'bazi',
      chart,
      validation,
      evidences,
      summaryTags,
      calculatedAt: new Date().toISOString(),
    };
  }
}
