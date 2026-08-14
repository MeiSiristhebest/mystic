/**
 * Canonical Data Contracts for Mystic Multi-Domain Reasoning Engine.
 * 
 * Enforces strict 4-tier separation:
 * - Tier A: Deterministic Facts (Astronomical, Calendar, Physiological inputs)
 * - Tier B: Rule & Pattern Matching (Deterministic Boolean/Score Algorithms)
 * - Tier C: Domain Knowledge & Evidence Graph (Classical citations, historical texts)
 * - Tier D: LLM Synthesis & Cross-Domain Arbitration (Generative contextualization)
 */

export type DomainType = 'ziwei' | 'vedic' | 'nihaixia' | 'bazi' | 'astrology' | 'iching' | 'tarot';

export type EvidenceLevel = 'core' | 'support' | 'warning' | 'contraindication';

export interface CanonicalEvidenceNode {
  id: string;
  domain: DomainType;
  ruleId: string;
  ruleName: string;
  level: EvidenceLevel;
  dimension: 'personality' | 'career' | 'relationship' | 'health' | 'wealth' | 'spiritual' | 'timing';
  polarity: 'favorable' | 'unfavorable' | 'transformative' | 'neutral';
  confidence: number; // 0.0 ~ 1.0
  parameters: Record<string, any>;
  classicalSource?: string; // e.g. 《伤寒论》第12条, 《骨髓赋》, Brihat Parashara Hora Shastra
  canonicalInterpretation: string; // Direct domain meaning without LLM hallucination
}

export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  code: string;
}

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface DomainEvaluationResult<TChart = any> {
  domain: DomainType;
  chart: TChart;
  validation: ValidationReport;
  evidences: CanonicalEvidenceNode[];
  summaryTags: string[];
  calculatedAt: string;
}

export interface CrossDomainPerspective {
  domain: DomainType;
  dimension: 'career' | 'health' | 'wealth' | 'relationship' | 'timing';
  stance: 'favorable' | 'unfavorable' | 'transformative' | 'neutral';
  keyClaim: string;
  evidenceIds: string[];
}

export interface CrossDomainConflict {
  dimension: 'career' | 'health' | 'wealth' | 'relationship' | 'timing';
  hasConflict: boolean;
  conflictType?: 'direct_contradiction' | 'timing_mismatch' | 'surface_vs_root' | 'complementary_tension';
  perspectives: CrossDomainPerspective[];
  tensionDescription: string;
  synthesisStrategy: string;
}

export interface MultiDomainSynthesisPayload {
  domainResults: Record<DomainType, DomainEvaluationResult>;
  evidences: CanonicalEvidenceNode[];
  conflicts: CrossDomainConflict[];
  globalSummary: string[];
}
