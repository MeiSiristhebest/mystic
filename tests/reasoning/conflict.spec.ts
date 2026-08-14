import { CrossDomainConflictDetector } from "../../lib/reasoning";
import { CanonicalEvidenceNode } from "../../lib/contracts/types";

export function testConflictSuite() {
  console.log("▶ [TEST SUITE] Cross-Domain Conflict Detector & Dialectic Firewall");

  let passed = 0;
  let failed = 0;

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
      parameters: {},
      classicalSource: 'BPHS',
      canonicalInterpretation: '结构防守',
    }
  ];

  const conflicts = CrossDomainConflictDetector.detectConflicts(mockConflictNodes);
  if (conflicts.length === 1 && conflicts[0].hasConflict && conflicts[0].dimension === 'career') {
    console.log(`  ✓ [PASS] Multi-system tension detected in Career dimension`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] Conflict detection failed`);
    failed++;
  }

  const promptBlock = CrossDomainConflictDetector.formatConflictPromptBlock(conflicts);
  if (promptBlock.includes('cross_domain_dialectic_firewall')) {
    console.log(`  ✓ [PASS] Dialectic firewall block formatted properly`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] Formatting dialectic block failed`);
    failed++;
  }

  return { passed, failed };
}
