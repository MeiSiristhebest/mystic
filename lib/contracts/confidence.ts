/**
 * Deterministic Evidence Calibration Engine for Canonical Evidence Nodes.
 * 
 * Replaces subjective ad-hoc confidence numbers with an explainable deterministic calibration formula:
 * 1. Weighted component average:
 *    - calculation: 35% (astronomical & calendar mathematical accuracy)
 *    - inputCompleteness: 25% (completeness of user/observation inputs)
 *    - ruleMatch: 25% (rigor of pattern/condition match)
 *    - sourceAuthority: 15% (authority of classical literature citation calibrated by SourceTier)
 * 2. Minimum-factor penalty:
 *    - The overall score cannot exceed the weakest core factor (calc, input, rule) by more than 0.15.
 * 3. EvidenceType & SourceTier Epistemic Caps:
 *    - heuristic_inference: hard cap <= 0.60
 *    - tertiary_branch / school_notes: hard cap <= 0.65
 */

import { EvidenceConfidenceBreakdown, EvidenceType, SourceTier } from './types';

export function calculateDeterministicConfidence(
  breakdown: Omit<EvidenceConfidenceBreakdown, 'overall'>,
  meta?: {
    evidenceType?: EvidenceType;
    sourceTier?: SourceTier;
  }
): EvidenceConfidenceBreakdown {
  const calc = Math.max(0, Math.min(1.0, breakdown.calculation));
  const input = Math.max(0, Math.min(1.0, breakdown.inputCompleteness));
  const rule = Math.max(0, Math.min(1.0, breakdown.ruleMatch));
  
  let source = Math.max(0, Math.min(1.0, breakdown.sourceAuthority));
  if (meta?.sourceTier === 'primary_canon') source = Math.max(source, 0.95);
  else if (meta?.sourceTier === 'secondary_lore') source = Math.min(source, 0.90);
  else if (meta?.sourceTier === 'tertiary_branch') source = Math.min(source, 0.65);
  else if (meta?.sourceTier === 'school_notes') source = Math.min(source, 0.60);

  const weightedMean = 0.35 * calc + 0.25 * input + 0.25 * rule + 0.15 * source;
  const minCoreFactor = Math.min(calc, input, rule);

  // Guard against over-optimistic scoring if any core factor is weak
  let calibrated = Math.min(weightedMean, minCoreFactor + 0.15);

  // Apply Epistemic Caps
  if (meta?.evidenceType === 'heuristic_inference') {
    calibrated = Math.min(calibrated, 0.60);
  } else if (meta?.sourceTier === 'tertiary_branch' || meta?.sourceTier === 'school_notes') {
    calibrated = Math.min(calibrated, 0.65);
  }

  const overall = Math.round(calibrated * 100) / 100;

  return {
    calculation: Math.round(calc * 100) / 100,
    inputCompleteness: Math.round(input * 100) / 100,
    ruleMatch: Math.round(rule * 100) / 100,
    sourceAuthority: Math.round(source * 100) / 100,
    overall,
  };
}
