/**
 * Deterministic Confidence Aggregation Engine for Canonical Evidence Nodes.
 * 
 * Replaces subjective ad-hoc confidence numbers with an objective, explainable mathematical formula:
 * 1. Weighted component average:
 *    - calculation: 35% (astronomical & calendar mathematical accuracy)
 *    - inputCompleteness: 25% (completeness of user/observation inputs)
 *    - ruleMatch: 25% (rigor of pattern/condition match)
 *    - sourceAuthority: 15% (authority of classical literature citation)
 * 2. Minimum-factor penalty:
 *    - The overall confidence cannot exceed the weakest core factor (calc, input, rule) by more than 0.15.
 * 3. Round to 2 decimal places.
 */

import { EvidenceConfidenceBreakdown } from './types';

export function calculateDeterministicConfidence(
  breakdown: Omit<EvidenceConfidenceBreakdown, 'overall'>
): EvidenceConfidenceBreakdown {
  const calc = Math.max(0, Math.min(1.0, breakdown.calculation));
  const input = Math.max(0, Math.min(1.0, breakdown.inputCompleteness));
  const rule = Math.max(0, Math.min(1.0, breakdown.ruleMatch));
  const source = Math.max(0, Math.min(1.0, breakdown.sourceAuthority));

  const weightedMean = 0.35 * calc + 0.25 * input + 0.25 * rule + 0.15 * source;
  const minCoreFactor = Math.min(calc, input, rule);

  // Guard against over-optimistic scoring if any core factor is weak
  const calibrated = Math.min(weightedMean, minCoreFactor + 0.15);
  const overall = Math.round(calibrated * 100) / 100;

  return {
    calculation: Math.round(calc * 100) / 100,
    inputCompleteness: Math.round(input * 100) / 100,
    ruleMatch: Math.round(rule * 100) / 100,
    sourceAuthority: Math.round(source * 100) / 100,
    overall,
  };
}
