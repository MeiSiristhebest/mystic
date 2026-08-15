import { generateChart, detectPatterns, ZiweiChart, extractZiweiEvidences, validateZiweiChart, Pattern } from "@/lib/ziwei";
import { BirthContext, DomainEvaluationResult } from "@/lib/contracts/types";

export class ZiweiService {
  /**
   * Helper to normalize arguments into unified BirthContext
   */
  static toBirthContext(
    birthDateOrContext: string | BirthContext,
    hour: number = 12,
    gender: '男' | '女' = '男'
  ): { birthDate: string; hour: number; gender: '男' | '女' } {
    if (typeof birthDateOrContext === 'object') {
      const h = parseInt((birthDateOrContext.birthTime || '12:00').split(':')[0], 10) || 12;
      return {
        birthDate: birthDateOrContext.birthDate,
        hour: h,
        gender: birthDateOrContext.gender === 'female' ? '女' : '男',
      };
    }
    return {
      birthDate: birthDateOrContext,
      hour,
      gender,
    };
  }

  /**
   * Calculate Ziwei chart and detect 80+ classical patterns based on Ni Haixia's Tianji system.
   */
  static getZiwei(
    birthDateOrContext: string | BirthContext, 
    hour = 12, 
    gender: '男' | '女' = '男'
  ): {
    chart: ZiweiChart;
    patterns: Pattern[];
    detectedPatterns: Pattern[];
  } {
    const ctx = this.toBirthContext(birthDateOrContext, hour, gender);
    const [year, month, day] = ctx.birthDate.split('-').map(Number);

    const chart = generateChart({
      year,
      month,
      day,
      hour: ctx.hour,
      gender: ctx.gender === '女' ? 'female' : 'male',
    });
    
    const patterns = chart.patterns || detectPatterns(chart);

    return {
      chart,
      patterns,
      detectedPatterns: patterns,
    };
  }

  /**
   * Complete Domain Evaluation Package for Ziwei Doushu.
   */
  static getZiweiDomainEvaluation(
    birthDateOrContext: string | BirthContext,
    hour = 12,
    gender: '男' | '女' = '男'
  ): DomainEvaluationResult<ZiweiChart> {
    const ctx = this.toBirthContext(birthDateOrContext, hour, gender);
    const [year, month, day] = ctx.birthDate.split('-').map(Number);

    const chart = generateChart({
      year,
      month,
      day,
      hour: ctx.hour,
      gender: ctx.gender === '女' ? 'female' : 'male',
    });

    const patterns = chart.patterns || detectPatterns(chart);
    const evidences = chart.evidences || extractZiweiEvidences(chart, patterns);
    const validation = chart.validation || validateZiweiChart(chart);

    const summaryTags = [
      `命宫: ${chart.palaces[chart.mingGongBranch]?.name || ''} (${chart.palaces[chart.mingGongBranch]?.stars.filter(s => s.type === 'major').map(s => s.name).join('·') || '空宫'})`,
      `身宫: ${chart.palaces[chart.shenGongBranch]?.name || ''}`,
      `五行局: ${chart.wuxingJuName}`,
      `核心格局: ${patterns.slice(0, 2).map(p => p.name).join('、') || '常规格局'}`,
    ];

    return {
      domain: 'ziwei',
      chart,
      validation,
      evidences,
      summaryTags,
      calculatedAt: new Date().toISOString(),
    };
  }
}
