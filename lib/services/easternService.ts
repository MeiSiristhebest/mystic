/**
 * EasternService - Facade aggregating BaziService, ZiweiService, and QiMenService.
 * Maintains backward compatibility while delegating to specialized domain services.
 */

import { BaziService, BaziCalculationResult, BaziChart } from "./baziService";
import { ZiweiService } from "./ziweiService";
import { QiMenService, QiMenResult } from "./qimenService";
import { ZiweiChart, Pattern } from "@/lib/ziwei";
import { BirthContext, DomainEvaluationResult } from "@/lib/contracts/types";

export class EasternService {
  static getZodiac(year: number): string {
    return BaziService.getZodiac(year);
  }

  static getBazi(
    birthDateOrContext: string | BirthContext, 
    birthTime = "12:00",
    lon = 116.40,
    lat = 39.90,
    timeZone = "Asia/Shanghai"
  ): BaziCalculationResult {
    return BaziService.getBazi(birthDateOrContext, birthTime, lon, lat, timeZone);
  }

  static getBaziDomainEvaluation(
    birthDateOrContext: string | BirthContext, 
    birthTime = "12:00",
    lon = 116.40,
    lat = 39.90,
    timeZone = "Asia/Shanghai"
  ): DomainEvaluationResult<BaziChart> {
    return BaziService.getBaziDomainEvaluation(birthDateOrContext, birthTime, lon, lat, timeZone);
  }

  static getZiwei(
    birthDateOrContext: string | BirthContext, 
    hour = 12, 
    gender: '男' | '女' = '男'
  ): {
    chart: ZiweiChart;
    patterns: Pattern[];
    detectedPatterns: Pattern[];
  } {
    return ZiweiService.getZiwei(birthDateOrContext, hour, gender);
  }

  static getZiweiDomainEvaluation(
    birthDateOrContext: string | BirthContext,
    hour = 12,
    gender: '男' | '女' = '男'
  ): DomainEvaluationResult<ZiweiChart> {
    return ZiweiService.getZiweiDomainEvaluation(birthDateOrContext, hour, gender);
  }

  static getQiMen(date: Date): QiMenResult {
    return QiMenService.getQiMen(date);
  }
}
