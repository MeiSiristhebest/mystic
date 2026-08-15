import { BirthContext, DomainEvaluationResult } from "../contracts/types";
import { BaziChart, calculateBaziCore, evaluateBazi, BaziCalculationError, BaziConvention } from "../bazi";

export type { BaziChart, BaziConvention };
export { BaziCalculationError };

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
  trueSolarTime?: string;
}

export class BaziService {
  /**
   * Helper to normalize arguments into unified BirthContext
   */
  static toBirthContext(
    birthDateOrContext: string | BirthContext,
    birthTime = "12:00",
    lon = 116.40,
    lat = 39.90,
    timeZone = "Asia/Shanghai"
  ): BirthContext {
    if (typeof birthDateOrContext === 'object') {
      return birthDateOrContext;
    }
    return {
      birthDate: birthDateOrContext,
      birthTime,
      longitude: lon,
      latitude: lat,
      timeZone,
    };
  }

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
   * Calculate Bazi four pillars with 24 Solar Terms, IANA timezones, and BaziConvention.
   */
  static getBazi(
    birthDateOrContext: string | BirthContext,
    birthTime = "12:00",
    lon = 116.40,
    lat = 39.90,
    timeZone = "Asia/Shanghai",
    conventionOptions?: Partial<BaziConvention> | boolean
  ): BaziCalculationResult {
    const context = this.toBirthContext(birthDateOrContext, birthTime, lon, lat, timeZone);
    const convention: Partial<BaziConvention> = typeof conventionOptions === 'boolean' 
      ? { useTrueSolarTime: conventionOptions } 
      : (conventionOptions || {});

    const core = calculateBaziCore(context, convention);

    return {
      baziString: `${core.pillars.year}年 ${core.pillars.month}月 ${core.pillars.day}日 ${core.pillars.time}时`,
      lunarDateString: core.lunarDateString,
      yearGanZhi: core.pillars.year,
      monthGanZhi: core.pillars.month,
      dayGanZhi: core.pillars.day,
      timeGanZhi: core.pillars.time,
      yearNaYin: core.yearNaYin,
      monthNaYin: core.monthNaYin,
      dayNaYin: core.dayNaYin,
      timeNaYin: core.timeNaYin,
      trueSolarTime: core.solarTimeDetails.trueSolarTime,
    };
  }

  /**
   * Complete Domain Evaluation Package for Bazi Four Pillars with CEG Evidence Extraction.
   */
  static getBaziDomainEvaluation(
    birthDateOrContext: string | BirthContext,
    birthTime = "12:00",
    lon = 116.40,
    lat = 39.90,
    timeZone = "Asia/Shanghai",
    conventionOptions?: Partial<BaziConvention>
  ): DomainEvaluationResult<BaziChart> {
    const context = this.toBirthContext(birthDateOrContext, birthTime, lon, lat, timeZone);
    return evaluateBazi(context, conventionOptions);
  }
}
