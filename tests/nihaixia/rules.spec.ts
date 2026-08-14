import { matchDiagnosticRules } from "../../lib/nihaixia";
import goldenCases from "../fixtures/nihaixia-golden.json";

export function testNihaixiaSuite() {
  console.log("▶ [TEST SUITE] Ni Haixia TCM Eight Principles & Six Stages Diagnostic Engine");

  let passed = 0;
  let failed = 0;

  for (const gc of goldenCases) {
    const res = matchDiagnosticRules(gc.symptoms, gc.healthScores as Record<string, number>);

    const primaryRule = res.matchedRules[0];
    const hasStageMatch = primaryRule && primaryRule.sixStage === gc.expected.stage;
    const hasFormulaMatch = !gc.expected.formula || (primaryRule && primaryRule.primaryFormula.includes(gc.expected.formula));
    const hasEvidence = res.evidences.length > 0;

    if (hasStageMatch && hasFormulaMatch && hasEvidence) {
      console.log(`  ✓ [GOLDEN PASS] ${gc.name} -> ${primaryRule.name} (${primaryRule.primaryFormula})`);
      passed++;
    } else {
      console.error(`  ✗ [GOLDEN FAIL] ${gc.name} (Matched: ${primaryRule?.name}, Expected Stage: ${gc.expected.stage})`);
      failed++;
    }
  }

  return { passed, failed };
}
