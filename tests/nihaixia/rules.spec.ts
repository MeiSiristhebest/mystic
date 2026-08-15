import { matchDiagnosticRules } from "../../lib/nihaixia";
import goldenCases from "../fixtures/nihaixia-golden.json";

export function testNihaixiaSuite() {
  console.log("▶ [TEST SUITE] Ni Haixia TCM Eight Principles & Six Stages Diagnostic Engine (L3 Ground Truth)");

  let passed = 0;
  let failed = 0;

  for (const gc of goldenCases) {
    const res = matchDiagnosticRules(gc.symptoms, gc.healthScores as unknown as Record<string, number>);

    const primaryRule = res.matchedRules[0];
    const hasStageMatch = primaryRule && primaryRule.sixStage === gc.expected.stage;
    const hasRuleIdMatch = primaryRule && primaryRule.id === gc.expected.ruleId;
    const hasFormulaMatch = !gc.expected.formula || (primaryRule && primaryRule.primaryFormula.includes(gc.expected.formula));
    const hasClauseMatch = !gc.expected.classicalClause || (primaryRule && primaryRule.classicalCitation.includes(gc.expected.classicalClause));
    
    let hasHerbsMatch = true;
    if (gc.expected.mustIncludeHerbs && primaryRule) {
      hasHerbsMatch = gc.expected.mustIncludeHerbs.every(h => primaryRule.formulaComposition.includes(h));
    }

    const hasEvidence = res.evidences.length > 0;

    if (hasStageMatch && hasRuleIdMatch && hasFormulaMatch && hasClauseMatch && hasHerbsMatch && hasEvidence) {
      console.log(`  ✓ [L3 TCM GOLDEN PASS] ${gc.name} -> ${primaryRule.name}`);
      console.log(`    ↳ 经方: ${primaryRule.primaryFormula} | 组成: [${primaryRule.formulaComposition.join(', ')}] | 出处: ${gc.expected.classicalClause}`);
      passed++;
    } else {
      console.error(`  ✗ [L3 TCM GOLDEN FAIL] ${gc.name} (Rule: ${primaryRule?.id}, Stage: ${primaryRule?.sixStage}, Formula: ${primaryRule?.primaryFormula})`);
      failed++;
    }
  }

  return { passed, failed };
}
