import { generateChart, detectPatterns, extractZiweiEvidences, validateZiweiChart } from "../../lib/ziwei";
import goldenCases from "../fixtures/ziwei-golden.json";

export function testZiweiSuite() {
  console.log("▶ [TEST SUITE] Ziwei Doushu Astrolabe & Pattern Engine");

  let passed = 0;
  let failed = 0;

  for (const gc of goldenCases) {
    const chart = generateChart({
      year: gc.input.year,
      month: gc.input.month,
      day: gc.input.day,
      hour: gc.input.hour,
      gender: gc.input.gender as 'male' | 'female',
    });

    const val = validateZiweiChart(chart);
    if (val.isValid === gc.expected.isValid && chart.palaces.length === gc.expected.palacesCount) {
      console.log(`  ✓ [GOLDEN PASS] ${gc.name}`);
      passed++;
    } else {
      console.error(`  ✗ [GOLDEN FAIL] ${gc.name} (validation: ${val.isValid}, palaces: ${chart.palaces.length})`);
      failed++;
    }

    const patterns = detectPatterns(chart);
    const evidences = extractZiweiEvidences(chart, patterns);
    if (evidences.length === patterns.length) {
      console.log(`    ↳ Matched ${patterns.length} patterns -> ${evidences.length} CanonicalEvidenceNodes`);
      passed++;
    } else {
      console.error(`    ✗ Evidence extraction mismatch`);
      failed++;
    }
  }

  return { passed, failed };
}
