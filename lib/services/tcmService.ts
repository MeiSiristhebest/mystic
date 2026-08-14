import { 
  calculateWuyunLiuqi, 
  evaluateHealthStandards, 
  HealthCheckResult,
  CLASSIC_FORMULAS,
  NIHAIXIA_CASES
} from "@/lib/nihaixia";

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
   * Retrieve classical formulas and clinical cases knowledge base.
   */
  static getKnowledgeBase() {
    return {
      formulas: CLASSIC_FORMULAS,
      cases: NIHAIXIA_CASES,
    };
  }
}
