import { generateChart, detectPatterns, ZiweiChart, extractZiweiEvidences, validateZiweiChart, Pattern } from "@/lib/ziwei";
import { DomainEvaluationResult } from "@/lib/contracts/types";

export class ZiweiService {
  /**
   * Calculate Ziwei chart and detect 80+ classical patterns based on Ni Haixia's Tianji system.
   */
  static getZiwei(birthDate: string, hour: number, gender: '男' | '女'): {
    chart: ZiweiChart;
    patterns: Pattern[];
    detectedPatterns: Pattern[];
  } {
    const [year, month, day] = birthDate.split('-').map(Number);

    const chart = generateChart({
      year,
      month,
      day,
      hour,
      gender: gender === '女' ? 'female' : 'male',
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
    birthDate: string,
    hour: number,
    gender: '男' | '女'
  ): DomainEvaluationResult<ZiweiChart> {
    const [year, month, day] = birthDate.split('-').map(Number);
    const chart = generateChart({
      year,
      month,
      day,
      hour,
      gender: gender === '女' ? 'female' : 'male',
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
