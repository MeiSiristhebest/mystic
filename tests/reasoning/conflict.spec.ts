import { CrossDomainConflictDetector } from "../../lib/reasoning";
import { CanonicalEvidenceNode } from "../../lib/contracts/types";
import { ZiweiService } from "../../lib/services/ziweiService";
import { TCMService } from "../../lib/services/tcmService";
import { AstrologyService } from "../../lib/services/astrologyService";
import { EasternService } from "../../lib/services/easternService";

export function testConflictSuite() {
  console.log("▶ [TEST SUITE] Cross-Domain Conflict Detector & Anti-False-Positive Regression Suite");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------
  // Scenario 1: Direct Overlapping Multi-System Tension
  // ----------------------------------------------------
  const mockConflictNodes: CanonicalEvidenceNode[] = [
    {
      id: 'e1_ziwei_career',
      domain: 'ziwei',
      ruleId: 'ZIWEI_SANQI',
      ruleName: '三奇加会',
      level: 'core',
      evidenceType: 'derived_rule',
      sourceTier: 'secondary_lore',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.95,
      temporalScope: { startDate: '2026-01-01', endDate: '2030-12-31', scopeType: 'dasha' },
      parameters: {},
      classicalSource: '《骨髓赋》',
      canonicalInterpretation: '事业扩张',
    },
    {
      id: 'e2_vedic_saturn',
      domain: 'vedic',
      ruleId: 'VEDIC_SATURN',
      ruleName: '土星收敛大运',
      level: 'warning',
      evidenceType: 'derived_rule',
      sourceTier: 'primary_canon',
      dimension: 'career',
      polarity: 'unfavorable',
      confidence: 0.90,
      temporalScope: { startDate: '2025-01-01', endDate: '2028-12-31', scopeType: 'dasha' },
      parameters: {},
      classicalSource: 'BPHS',
      canonicalInterpretation: '结构收缩阻力',
    }
  ];

  const conflicts1 = CrossDomainConflictDetector.detectConflicts(mockConflictNodes);
  const careerConflict = conflicts1.find(c => c.dimension === 'career');
  if (careerConflict?.hasConflict && careerConflict.conflictType === 'direct_contradiction') {
    console.log(`  ✓ [SCENARIO 1: TENSION PASS] Detected direct contradiction in Career dimension with overlapping windows`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 1: TENSION FAIL] Expected career direct contradiction`);
    failed++;
  }

  // Verify contradicting relation
  const relE1 = mockConflictNodes[0].relations?.find(r => r.targetEvidenceId === 'e2_vedic_saturn');
  if (relE1?.relationType === 'contradicting') {
    console.log(`  ✓ [SEMANTIC EDGE PASS] Dynamically inferred relation: ${relE1.relationType} -> e2_vedic_saturn`);
    passed++;
  } else {
    console.error(`  ✗ [SEMANTIC EDGE FAIL] Expected contradicting, got ${relE1?.relationType}`);
    failed++;
  }

  // ----------------------------------------------------
  // Scenario 2: Neutral / Harmonious Case (No Forced Tension)
  // ----------------------------------------------------
  const harmoniousNodes: CanonicalEvidenceNode[] = [
    {
      id: 'h1_ziwei_ming',
      domain: 'ziwei',
      ruleId: 'ZIWEI_JUN_CHEN',
      ruleName: '君臣庆会',
      level: 'core',
      sourceTier: 'secondary_lore',
      evidenceType: 'derived_rule',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.95,
      parameters: {},
      canonicalInterpretation: '领导统御顺遂',
    },
    {
      id: 'h2_vedic_jupiter',
      domain: 'vedic',
      ruleId: 'VEDIC_JUPITER_EXPANSION',
      ruleName: '木星大吉运',
      level: 'core',
      sourceTier: 'primary_canon',
      evidenceType: 'derived_rule',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.92,
      parameters: {},
      canonicalInterpretation: '贵人提携顺畅',
    }
  ];

  const conflicts2 = CrossDomainConflictDetector.detectConflicts(harmoniousNodes);
  const harmCareer = conflicts2.find(c => c.dimension === 'career');
  if (harmCareer && !harmCareer.hasConflict && harmCareer.conflictType === 'complementary_tension') {
    console.log(`  ✓ [SCENARIO 2: HARMONY PASS] Verified zero false conflicts for concordant systems (conflictType: ${harmCareer.conflictType})`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 2: HARMONY FAIL] Erroneously triggered conflict`);
    failed++;
  }

  // ----------------------------------------------------
  // Scenario 3: Temporal Precedence (Non-overlapping)
  // ----------------------------------------------------
  const sequentialNodes: CanonicalEvidenceNode[] = [
    {
      id: 'seq1_foundation',
      domain: 'vedic',
      ruleId: 'VEDIC_JUPITER_EXPANSION',
      ruleName: '木星大运奠基',
      level: 'core',
      sourceTier: 'primary_canon',
      evidenceType: 'derived_rule',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.92,
      temporalScope: { startDate: '2020-01-01', endDate: '2025-12-31', scopeType: 'dasha' },
      parameters: {},
      canonicalInterpretation: '前期知识与人脉奠基积累',
    },
    {
      id: 'seq2_harvest',
      domain: 'ziwei',
      ruleId: 'ZIWEI_HUAGUAN',
      ruleName: '化权入官禄',
      level: 'core',
      sourceTier: 'secondary_lore',
      evidenceType: 'derived_rule',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.90,
      temporalScope: { startDate: '2028-01-01', endDate: '2035-12-31', scopeType: 'dasha' },
      parameters: {},
      canonicalInterpretation: '中后期管理重权与主导地位',
    }
  ];

  CrossDomainConflictDetector.inferEvidenceRelations(sequentialNodes);
  const relSeq1 = sequentialNodes[0].relations?.find(r => r.targetEvidenceId === 'seq2_harvest');
  if (relSeq1?.relationType === 'temporal_precedence') {
    console.log(`  ✓ [SCENARIO 3: PRECEDENCE PASS] Inferred valid sequence: ${relSeq1.relationType} (2020-2025 -> 2028-2035)`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 3: PRECEDENCE FAIL] Expected temporal_precedence, got ${relSeq1?.relationType}`);
    failed++;
  }

  // ----------------------------------------------------
  // Scenario 4: Negative Regression & Anti-False-Positive Suite
  // ----------------------------------------------------
  // Negative 1: Natal Positive + Transient Dynamic Negative -> Must NOT generate contradicting relation
  const natalVsTransitNodes: CanonicalEvidenceNode[] = [
    {
      id: 'neg_natal_favorable',
      domain: 'ziwei',
      ruleId: 'ZIWEI_NATAL_FATE',
      ruleName: '本命格局贵格',
      level: 'core',
      sourceTier: 'secondary_lore',
      evidenceType: 'deterministic_fact',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.95,
      temporalScope: { scopeType: 'natal', isNatalBaseline: true },
      parameters: {},
      canonicalInterpretation: '命局格局底色优良',
    },
    {
      id: 'neg_transit_unfavorable',
      domain: 'vedic',
      ruleId: 'VEDIC_TRANSIT_SATURN',
      ruleName: '流年土星考验',
      level: 'core',
      sourceTier: 'primary_canon',
      evidenceType: 'derived_rule',
      dimension: 'career',
      polarity: 'unfavorable',
      confidence: 0.88,
      temporalScope: { startDate: '2026-06-01', endDate: '2026-12-31', scopeType: 'transit' },
      parameters: {},
      canonicalInterpretation: '短期运律承压',
    }
  ];
  CrossDomainConflictDetector.inferEvidenceRelations(natalVsTransitNodes);
  const relNatal = natalVsTransitNodes[0].relations?.find(r => r.targetEvidenceId === 'neg_transit_unfavorable');
  const neg1Pass = relNatal?.relationType !== 'contradicting';

  // Negative 2: Same year but non-overlapping months (Jan vs Nov) -> Must NOT overlap
  const timingJanNov = CrossDomainConflictDetector.checkTemporalOverlap(
    { startDate: '2026-01-01', endDate: '2026-02-28', scopeType: 'transit' },
    { startDate: '2026-11-01', endDate: '2026-12-31', scopeType: 'transit' }
  );
  const neg2Pass = timingJanNov.hasOverlap === false && timingJanNov.aPrecedesB === true;

  // Negative 3: Tertiary branch / heuristic inference -> Must NOT be eligible for structural relation
  const tertiaryNode: CanonicalEvidenceNode = {
    id: 'tert_1',
    domain: 'bazi',
    ruleId: 'BAZI_NAYIN',
    ruleName: '纳音路旁土',
    level: 'optional',
    sourceTier: 'tertiary_branch',
    evidenceType: 'heuristic_inference',
    dimension: 'health',
    polarity: 'neutral',
    confidence: 0.55,
    parameters: {},
    canonicalInterpretation: '音律五行取象',
  };
  const neg3Pass = CrossDomainConflictDetector.isStructurallyEligible(tertiaryNode) === false;

  if (neg1Pass && neg2Pass && neg3Pass) {
    console.log(`  ✓ [SCENARIO 4: NEGATIVE ANTI-REGRESSION PASS] Natal/transit decoupled, intra-year date precision verified, tertiary filtered`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 4: NEGATIVE ANTI-REGRESSION FAIL] False positive check failed (neg1:${neg1Pass}, neg2:${neg2Pass}, neg3:${neg3Pass})`);
    failed++;
  }

  // ----------------------------------------------------
  // Scenario 5: Real 4-Domain E2E Semantic Regression Suite
  // ----------------------------------------------------
  const birthCtx = {
    birthDate: '1990-05-15',
    birthTime: '06:00',
    longitude: 116.40,
    latitude: 39.90,
    timeZone: 'Asia/Shanghai',
    gender: 'male' as const,
  };

  const ziweiEval = ZiweiService.getZiweiDomainEvaluation(birthCtx);
  const vedicEval = AstrologyService.getVedicDomainEvaluation(birthCtx);
  const tcmEval = TCMService.diagnoseWithRules('常年手脚冰凉，极度怕冷，夜尿频多', { temperature: 35 });
  const baziEval = EasternService.getBaziDomainEvaluation(birthCtx);
  
  const fullE2EEvidences = [...ziweiEval.evidences, ...vedicEval.evidences, ...tcmEval.evidences, ...baziEval.evidences];
  const realConflicts = CrossDomainConflictDetector.detectConflicts(fullE2EEvidences);

  const baziDmFact = baziEval.evidences.find(e => e.ruleId === 'BAZI_DAY_MASTER_FACT');
  const baziTgEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_TEN_GOD_SIGNAL');
  const nayinEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_NAYIN_SIGNAL');

  if (
    fullE2EEvidences.length >= 12 &&
    baziDmFact?.polarity === 'neutral' &&
    baziDmFact?.dimension === 'structural' &&
    baziTgEv?.polarity === 'neutral' &&
    baziTgEv?.dimension === 'structural' &&
    nayinEv && nayinEv.confidence <= 0.60 &&
    Array.isArray(realConflicts)
  ) {
    console.log(`  ✓ [SCENARIO 5: 4-DOMAIN SEMANTIC E2E PASS] Evaluated 4 domains (${fullE2EEvidences.length} canonical nodes). Verified decontaminated Bazi structural nodes.`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 5: 4-DOMAIN SEMANTIC E2E FAIL] Real E2E regression assertion failed`);
    failed++;
  }

  // Firewall formatting
  const promptBlock = CrossDomainConflictDetector.formatConflictPromptBlock(realConflicts);
  if (promptBlock.includes('cross_domain_dialectic_firewall') && promptBlock.includes('反伪共识规范')) {
    console.log(`  ✓ [FIREWALL BLOCK PASS] Dialectic firewall block correctly formatted`);
    passed++;
  } else {
    console.error(`  ✗ [FIREWALL BLOCK FAIL] Formatting dialectic block failed`);
    failed++;
  }

  return { passed, failed };
}
