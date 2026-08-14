import { 
  calculateWuyunLiuqi, 
  evaluateHealthStandards, 
  HealthCheckResult,
  CLASSIC_FORMULAS,
  NIHAIXIA_CASES,
  matchDiagnosticRules,
  validateHealthAnswers,
  DiagnosticResult
} from "@/lib/nihaixia";
import { DomainEvaluationResult } from "@/lib/contracts/types";

export class TCMService {
  /**
   * Calculate Wuyun Liuqi celestial constitution by birth year.
   */
  static getWuyunLiuqiData(birthYear: number) {
    return calculateWuyunLiuqi(birthYear);
  }

  /**
   * Evaluate health and yin-yang balance based on Ni Haixia's 8 Gold Standards.
   */
  static evaluateHealthCheck(scores: Record<string, number>): HealthCheckResult {
    return evaluateHealthStandards(scores);
  }

  /**
   * Execute deterministic diagnostic rule matching and evidence chain generation.
   */
  static diagnoseWithRules(
    symptoms: string,
    healthScores?: Record<string, number>,
    wuyunLiuqi?: any
  ): DiagnosticResult {
    return matchDiagnosticRules(symptoms, healthScores, wuyunLiuqi);
  }

  /**
   * Complete Domain Evaluation Package for Ni Haixia TCM
   */
  static getFullDomainEvaluation(
    birthYear: number,
    symptoms: string,
    healthScores: Record<string, number> = {}
  ): DomainEvaluationResult {
    const wuyunLiuqi = this.getWuyunLiuqiData(birthYear);
    const healthResult = this.evaluateHealthCheck(healthScores);
    const diagnostic = this.diagnoseWithRules(symptoms, healthScores, wuyunLiuqi);
    const validation = validateHealthAnswers(healthScores);

    const summaryTags = [
      `阴阳: ${healthResult.yinYangBalance}`,
      `气血: ${healthResult.qiBloodStatus}`,
      `六经: ${diagnostic.dominantSixStage.toUpperCase()}`,
      `主方: ${diagnostic.matchedRules[0]?.primaryFormula || '小柴胡汤'}`,
    ];

    return {
      domain: 'nihaixia',
      chart: {
        wuyunLiuqi,
        healthResult,
        diagnostic,
      },
      validation,
      evidences: diagnostic.evidences,
      summaryTags,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieve classical formulas and clinical cases knowledge base.
   */
  static getKnowledgeBase() {
    return {
      formulas: CLASSIC_FORMULAS,
      cases: NIHAIXIA_CASES,
    };
  }
}
