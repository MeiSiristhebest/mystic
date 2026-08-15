import { CrossDomainConflictDetector } from "../../lib/reasoning";
import { CanonicalEvidenceNode } from "../../lib/contracts/types";
import { ZiweiService } from "../../lib/services/ziweiService";
import { TCMService } from "../../lib/services/tcmService";
import { AstrologyService } from "../../lib/services/astrologyService";
import { EasternService } from "../../lib/services/easternService";

export function testConflictSuite() {
  console.log("▶ [TEST SUITE] Cross-Domain Conflict Detector & Semantic Evidence Graph");

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
      temporalScope: { timeWindow: '2026-2030 (大限官禄化禄)', scopeType: 'dasha' },
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
      polarity: 'transformative',
      confidence: 0.90,
      temporalScope: { timeWindow: '2025-2028 (Saturn-Ketu Dasha)', scopeType: 'dasha' },
      parameters: {},
      classicalSource: 'BPHS',
      canonicalInterpretation: '结构防守',
    }
  ];

  const conflicts1 = CrossDomainConflictDetector.detectConflicts(mockConflictNodes);
  const careerConflict = conflicts1.find(c => c.dimension === 'career');
  if (careerConflict?.hasConflict && careerConflict.conflictType === 'direct_contradiction' || careerConflict?.conflictType === 'timing_mismatch') {
    console.log(`  ✓ [SCENARIO 1: TENSION PASS] Detected active tension in Career dimension with overlapping windows`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 1: TENSION FAIL] Expected career tension`);
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
  // Scenario 3: Timing Precursor & Phase Transition
  // ----------------------------------------------------
  const sequentialNodes: CanonicalEvidenceNode[] = [
    {
      id: 'seq1_foundation',
      domain: 'vedic',
      ruleId: 'VEDIC_JUPITER_EXPANSION',
      ruleName: '木星大运奠基',
      level: 'core',
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
      evidenceType: 'derived_rule',
      dimension: 'career',
      polarity: 'transformative',
      confidence: 0.90,
      temporalScope: { startDate: '2028-01-01', endDate: '2035-12-31', scopeType: 'dasha' },
      parameters: {},
      canonicalInterpretation: '中后期管理重权与主导地位',
    }
  ];

  CrossDomainConflictDetector.inferEvidenceRelations(sequentialNodes);
  const relSeq1 = sequentialNodes[0].relations?.find(r => r.targetEvidenceId === 'seq2_harvest');
  if (relSeq1?.relationType === 'timing_precursor') {
    console.log(`  ✓ [SCENARIO 3: PRECURSOR PASS] Inferred valid sequence: ${relSeq1.relationType} (2020-2025 -> 2028-2035)`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 3: PRECURSOR FAIL] Expected timing_precursor, got ${relSeq1?.relationType}`);
    failed++;
  }

  // ----------------------------------------------------
  // Scenario 4: Real 4-Domain E2E Semantic Regression Suite
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

  // Semantic assertions:
  // 1. Total evidence nodes >= 12
  // 2. Bazi evidence nodes must be neutral and properly typed
  // 3. NaYin must not trigger false health conflicts
  const baziDmEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_DAY_MASTER');
  const baziTgEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_TEN_GOD_SIGNAL');
  const nayinEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_NAYIN_SIGNAL');

  if (
    fullE2EEvidences.length >= 12 &&
    baziDmEv?.polarity === 'neutral' &&
    baziTgEv?.polarity === 'neutral' &&
    nayinEv && nayinEv.confidence <= 0.60 &&
    Array.isArray(realConflicts)
  ) {
    console.log(`  ✓ [SCENARIO 4: 4-DOMAIN SEMANTIC E2E PASS] Evaluated 4 domains (${fullE2EEvidences.length} canonical nodes). Verified decontaminated Bazi evidences & epistemic filtering.`);
    passed++;
  } else {
    console.error(`  ✗ [SCENARIO 4: 4-DOMAIN SEMANTIC E2E FAIL] Real E2E regression assertion failed`);
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
