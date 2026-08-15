/**
 * Canonical Data Contracts for Mystic Multi-Domain Reasoning Engine.
 * 
 * Enforces strict 4-tier separation:
 * - Tier A: Deterministic Facts (Astronomical Ephemeris, Calendar, Physiological inputs)
 * - Tier B: Rule & Pattern Matching (Deterministic Boolean/Score Algorithms)
 * - Tier C: Domain Knowledge & Evidence Graph (Classical citations, multi-factor confidence, temporal scope)
 * - Tier D: LLM Synthesis & Cross-Domain Arbitration (Semantic dialectics, prompt firewalls)
 */

export type DomainType = 'ziwei' | 'vedic' | 'nihaixia' | 'bazi' | 'astrology' | 'iching' | 'tarot';

export type EvidenceLevel = 'core' | 'support' | 'warning' | 'contraindication';

export interface EvidenceConfidenceBreakdown {
  calculation: number;       // 确定性数学/天文星历计算精确度 (0.0 ~ 1.0)
  inputCompleteness: number; // 用户输入与四诊要素完整度 (0.0 ~ 1.0)
  ruleMatch: number;         // 规则条件严密吻合度 (0.0 ~ 1.0)
  sourceAuthority: number;   // 典籍文献依据权威度 (0.0 ~ 1.0)
  overall: number;           // 综合加权置信度 (0.0 ~ 1.0)
}

export interface EvidenceTemporalScope {
  timeWindow?: string;       // e.g. "2026-2030 (大限官禄)" or "2025-2028 (Saturn-Ketu Dasha)"
  startDate?: string;
  endDate?: string;
  scopeType: 'natal' | 'dasha' | 'transit' | 'acute' | 'chronic';
}

export interface EvidenceRelation {
  targetEvidenceId: string;
  relationType: 'corroborating' | 'contradicting' | 'timing_precursor' | 'surface_vs_root' | 'complementary' | 'temporally_separate';
  description: string;
}

export interface CanonicalEvidenceNode {
  id: string;
  domain: DomainType;
  ruleId: string;
  ruleName: string;
  level: EvidenceLevel;
  dimension: 'personality' | 'career' | 'relationship' | 'health' | 'wealth' | 'spiritual' | 'timing';
  polarity: 'favorable' | 'unfavorable' | 'transformative' | 'neutral';
  confidence: number; // Overall scalar confidence (0.0 ~ 1.0)
  confidenceBreakdown?: EvidenceConfidenceBreakdown;
  temporalScope?: EvidenceTemporalScope;
  relations?: EvidenceRelation[];
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
  temporalScope?: EvidenceTemporalScope;
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
