/**
 * EasternService - Facade aggregating BaziService, ZiweiService, and QiMenService.
 * Maintains backward compatibility while delegating to specialized domain services.
 */

import { BaziService, BaziCalculationResult } from "./baziService";
import { ZiweiService } from "./ziweiService";
import { QiMenService, QiMenResult } from "./qimenService";
import { ZiweiChart, Pattern } from "@/lib/ziwei";
import { DomainEvaluationResult } from "@/lib/contracts/types";

export class EasternService {
  static getZodiac(year: number): string {
    return BaziService.getZodiac(year);
  }

  static getBazi(birthDate: string, birthTime: string): BaziCalculationResult {
    return BaziService.getBazi(birthDate, birthTime);
  }

  static getZiwei(birthDate: string, hour: number, gender: '男' | '女'): {
    chart: ZiweiChart;
    patterns: Pattern[];
    detectedPatterns: Pattern[];
  } {
    return ZiweiService.getZiwei(birthDate, hour, gender);
  }

  static getZiweiDomainEvaluation(
    birthDate: string,
    hour: number,
    gender: '男' | '女'
  ): DomainEvaluationResult<ZiweiChart> {
    return ZiweiService.getZiweiDomainEvaluation(birthDate, hour, gender);
  }

  static getQiMen(date: Date): QiMenResult {
    return QiMenService.getQiMen(date);
  }
}
