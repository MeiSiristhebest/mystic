import { CrossDomainConflictDetector } from "../../lib/reasoning";
import { CanonicalEvidenceNode } from "../../lib/contracts/types";
import { ZiweiService } from "../../lib/services/ziweiService";
import { TCMService } from "../../lib/services/tcmService";

export function testConflictSuite() {
  console.log("▶ [TEST SUITE] Cross-Domain Conflict Detector & Dialectic Firewall");

  let passed = 0;
  let failed = 0;

  // 1. Synthetic Conflict Assertion with Time Window
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

  const promptBlock = CrossDomainConflictDetector.formatConflictPromptBlock(conflicts);
  if (promptBlock.includes('cross_domain_dialectic_firewall') && promptBlock.includes('反伪共识规范')) {
    console.log(`  ✓ [FIREWALL PASS] Dialectic firewall block formatted properly`);
    passed++;
  } else {
    console.error(`  ✗ [FIREWALL FAIL] Formatting dialectic block failed`);
    failed++;
  }

  // 2. Real Integration Test (Real Ziwei Evidences + Real TCM Evidences)
  const ziweiEval = ZiweiService.getZiweiDomainEvaluation('1990-05-15', 6, '男');
  const tcmEval = TCMService.diagnoseWithRules('常年手脚冰凉，极度怕冷，夜尿频多', { temperature: 35 });
  const combinedEvidences = [...ziweiEval.evidences, ...tcmEval.evidences];

  const realConflicts = CrossDomainConflictDetector.detectConflicts(combinedEvidences);
  if (Array.isArray(realConflicts)) {
    console.log(`  ✓ [INTEGRATION PASS] Real multi-domain evidence pipeline produced ${combinedEvidences.length} nodes and evaluated ${realConflicts.length} dimensional perspectives`);
    passed++;
  } else {
    console.error(`  ✗ [INTEGRATION FAIL] Real integration test failed`);
    failed++;
  }

  return { passed, failed };
}
