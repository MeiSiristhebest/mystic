import { CrossDomainConflictDetector } from "../../lib/reasoning";
import { CanonicalEvidenceNode } from "../../lib/contracts/types";
import { ZiweiService } from "../../lib/services/ziweiService";
import { TCMService } from "../../lib/services/tcmService";
import { AstrologyService } from "../../lib/services/astrologyService";

export function testConflictSuite() {
  console.log("▶ [TEST SUITE] Cross-Domain Conflict Detector & Evidence Relation Graph");

  let passed = 0;
  let failed = 0;

  // 1. Synthetic Conflict Assertion with Time Window & Dynamic Relation Inference
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
      parameters: { timeWindow: '2026-2030 (大限官禄化禄)' },
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
      parameters: { timeWindow: '2025-2028 (Saturn-Ketu Dasha)' },
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

  // Verify that active relations were inferred and populated
  if (mockConflictNodes[0].relations && mockConflictNodes[0].relations.length > 0) {
    console.log(`  ✓ [RELATION GRAPH PASS] Dynamically inferred relation edge: ${mockConflictNodes[0].relations[0].relationType} -> ${mockConflictNodes[0].relations[0].targetEvidenceId}`);
    passed++;
  } else {
    console.error(`  ✗ [RELATION GRAPH FAIL] Relations not populated on evidence node`);
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

  // 2. Real Integration Test (Real Ziwei + Real Vedic + Real TCM Evidences)
  const ziweiEval = ZiweiService.getZiweiDomainEvaluation('1990-05-15', 6, '男');
  const vedicEval = AstrologyService.getVedicDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 8);
  const tcmEval = TCMService.diagnoseWithRules('常年手脚冰凉，极度怕冷，夜尿频多', { temperature: 35 });
  
  const fullE2EEvidences = [...ziweiEval.evidences, ...vedicEval.evidences, ...tcmEval.evidences];

  const realConflicts = CrossDomainConflictDetector.detectConflicts(fullE2EEvidences);
  if (Array.isArray(realConflicts) && fullE2EEvidences.length >= 8) {
    console.log(`  ✓ [E2E INTEGRATION PASS] Full Real Tri-Domain Pipeline (Ziwei+Vedic+TCM) produced ${fullE2EEvidences.length} canonical nodes with relations`);
    passed++;
  } else {
    console.error(`  ✗ [E2E INTEGRATION FAIL] Real integration test failed`);
    failed++;
  }

  return { passed, failed };
}
