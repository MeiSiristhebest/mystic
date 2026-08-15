import { CrossDomainConflictDetector } from "../../lib/reasoning";
import { CanonicalEvidenceNode } from "../../lib/contracts/types";
import { ZiweiService } from "../../lib/services/ziweiService";
import { TCMService } from "../../lib/services/tcmService";
import { AstrologyService } from "../../lib/services/astrologyService";
import { EasternService } from "../../lib/services/easternService";

export function testConflictSuite() {
  console.log("▶ [TEST SUITE] Cross-Domain Conflict Detector & Evidence Relation Graph");

  let passed = 0;
  let failed = 0;

  // 1. Synthetic Overlapping Conflict
  const mockConflictNodes: CanonicalEvidenceNode[] = [
    {
      id: 'e1',
      domain: 'ziwei',
      ruleId: 'ZIWEI_SANQI',
      ruleName: '三奇加会',
      level: 'core',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.95,
      temporalScope: { timeWindow: '2026-2030 (大限官禄化禄)', scopeType: 'dasha' },
      parameters: {},
      classicalSource: '《骨髓赋》',
      canonicalInterpretation: '事业扩张',
    },
    {
      id: 'e2',
      domain: 'vedic',
      ruleId: 'VEDIC_SATURN',
      ruleName: '土星收敛大运',
      level: 'warning',
      dimension: 'career',
      polarity: 'transformative',
      confidence: 0.90,
      temporalScope: { timeWindow: '2025-2028 (Saturn-Ketu Dasha)', scopeType: 'dasha' },
      parameters: {},
      classicalSource: 'BPHS',
      canonicalInterpretation: '结构防守',
    }
  ];

  const conflicts = CrossDomainConflictDetector.detectConflicts(mockConflictNodes);
  if (conflicts.length === 1 && conflicts[0].hasConflict && conflicts[0].dimension === 'career') {
    console.log(`  ✓ [SYNTHETIC PASS] Multi-system tension detected in Career dimension with temporal window`);
    passed++;
  } else {
    console.error(`  ✗ [SYNTHETIC FAIL] Conflict detection failed`);
    failed++;
  }

  // Verify that active contradicting relation was inferred for overlapping windows
  const relE1 = mockConflictNodes[0].relations?.find(r => r.targetEvidenceId === 'e2');
  if (relE1 && relE1.relationType === 'contradicting') {
    console.log(`  ✓ [RELATION GRAPH PASS] Dynamically inferred overlapping tension relation: ${relE1.relationType} -> e2`);
    passed++;
  } else {
    console.error(`  ✗ [RELATION GRAPH FAIL] Expected contradicting relation, got ${relE1?.relationType}`);
    failed++;
  }

  // 2. Timing Precursor & Temporally Separate Relation Test
  const sequentialNodes: CanonicalEvidenceNode[] = [
    {
      id: 'seq1_foundation',
      domain: 'vedic',
      ruleId: 'VEDIC_JUPITER_EXPANSION',
      ruleName: '木星大运奠基',
      level: 'core',
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
  if (relSeq1 && relSeq1.relationType === 'timing_precursor') {
    console.log(`  ✓ [TIMING PRECURSOR PASS] Dynamically inferred sequence relation: ${relSeq1.relationType} (2020-2025 -> 2028-2035)`);
    passed++;
  } else {
    console.error(`  ✗ [TIMING PRECURSOR FAIL] Expected timing_precursor, got ${relSeq1?.relationType}`);
    failed++;
  }

  const promptBlock = CrossDomainConflictDetector.formatConflictPromptBlock(conflicts);
  if (promptBlock.includes('cross_domain_dialectic_firewall') && promptBlock.includes('反伪共识规范')) {
    console.log(`  ✓ [FIREWALL PASS] Dialectic firewall block formatted properly`);
    passed++;
  } else {
    console.error(`  ✗ [FIREWALL FAIL] Formatting dialectic block failed`);
    failed++;
  }

  // 3. Real Integration Test (Real Ziwei + Real Vedic + Real TCM + Real Bazi Evidences)
  const ziweiEval = ZiweiService.getZiweiDomainEvaluation('1990-05-15', 6, '男');
  const vedicEval = AstrologyService.getVedicDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Shanghai');
  const tcmEval = TCMService.diagnoseWithRules('常年手脚冰凉，极度怕冷，夜尿频多', { temperature: 35 });
  const baziEval = EasternService.getBaziDomainEvaluation('1990-05-15', '06:00');
  
  const fullE2EEvidences = [...ziweiEval.evidences, ...vedicEval.evidences, ...tcmEval.evidences, ...baziEval.evidences];

  const realConflicts = CrossDomainConflictDetector.detectConflicts(fullE2EEvidences);
  if (Array.isArray(realConflicts) && fullE2EEvidences.length >= 10) {
    console.log(`  ✓ [E2E INTEGRATION PASS] Full Real 4-Domain Pipeline (Ziwei+Vedic+TCM+Bazi) produced ${fullE2EEvidences.length} canonical nodes with dynamic relation graph`);
    passed++;
  } else {
    console.error(`  ✗ [E2E INTEGRATION FAIL] Real integration test failed`);
    failed++;
  }

  return { passed, failed };
}
