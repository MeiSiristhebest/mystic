/**
 * Canonical Data Contracts for Mystic Multi-Domain Reasoning Engine.
 * 
 * Enforces strict 4-tier separation:
 * - Tier A: Deterministic Facts (Astronomical Ephemeris, Calendar, Physiological inputs)
 * - Tier B: Rule & Pattern Matching (Deterministic Boolean/Score Algorithms)
 * - Tier C: Domain Knowledge & Evidence Graph (Classical citations, multi-factor confidence, temporal scope)
 * - Tier D: LLM Synthesis & Cross-Domain Arbitration (Semantic dialectics, prompt firewalls)
 */

export interface BirthContext {
  birthDate: string;        // YYYY-MM-DD
  birthTime: string;        // HH:mm (Civil wall clock time)
  timeZone: string;         // IANA Timezone Identifier, e.g. "Asia/Shanghai", "America/New_York"
  longitude: number;        // Geocentric Longitude (-180 ~ +180), default: 116.40
  latitude: number;         // Geocentric Latitude (-90 ~ +90), default: 39.90
  altitude?: number;        // Optional meters above sea level
  gender?: 'male' | 'female';
}

export interface CaseInput {
  subjectName?: string;
  birthContext: BirthContext;
  observedSymptoms?: string;
  healthScores?: Record<string, number>;
  query?: string;
  targetDate?: string;      // ISO String or YYYY-MM-DD for dynamic dasha/transit evaluation
}

export type DomainType = 'ziwei' | 'vedic' | 'nihaixia' | 'bazi' | 'astrology' | 'iching' | 'tarot';

export type EvidenceLevel = 'core' | 'support' | 'warning' | 'contraindication' | 'optional';

export type EvidenceType = 
  | 'deterministic_fact'         // Astronomically/mathematically exact (e.g. Solar Longitude 83.38°, Day Master '庚')
  | 'derived_rule'               // Algorithmic rule/pattern match (e.g. Ziwei Sanqi, Nakshatra Pada)
  | 'classical_interpretation'   // Direct canonical classical literature lore (e.g. 《骨髓赋》, BPHS)
  | 'school_specific_claim'      // Specific lineage/school perspective (e.g. Nihaixia Tianji notes)
  | 'heuristic_inference';       // Statistical or musical analogy (e.g. NaYin element correlation)

export type SourceTier = 
  | 'primary_canon'    // 一级原典 (《黄帝内经》《伤寒论》BPHS) -> 权威权重 0.95 ~ 1.0
  | 'secondary_lore'   // 二级专著 (《三命通会》《渊海子平》《骨髓赋》《滴天髓》) -> 权威权重 0.80 ~ 0.90
  | 'tertiary_branch'  // 三级分支/经验典籍 (《五行精纪》《神峰通考》) -> 权威权重 0.60 ~ 0.70 (置信度硬顶 0.65)
  | 'school_notes';    // 现代讲义与心得考证 -> 权威权重 0.50 ~ 0.65

export interface EvidenceConfidenceBreakdown {
  calculation: number;       // 确定性数学/天文星历计算精确度 (0.0 ~ 1.0)
  inputCompleteness: number; // 用户输入与四诊要素完整度 (0.0 ~ 1.0)
  ruleMatch: number;         // 规则条件严密吻合度 (0.0 ~ 1.0)
  sourceAuthority: number;   // 典籍文献依据权威度 (0.0 ~ 1.0)
  overall: number;           // 综合加权校准分 (0.0 ~ 1.0)
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
  evidenceType?: EvidenceType;
  sourceTier?: SourceTier;
  dimension: 'personality' | 'career' | 'relationship' | 'health' | 'wealth' | 'spiritual' | 'timing';
  polarity: 'favorable' | 'unfavorable' | 'transformative' | 'neutral';
  confidence: number; // Deterministic Evidence Calibration Score (0.0 ~ 1.0)
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
