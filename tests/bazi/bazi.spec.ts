import { BaziService } from "../../lib/services/baziService";

export function testBaziSuite() {
  console.log("▶ [TEST SUITE] Bazi Four Pillars & 24 Solar Terms Domain Engine (L3 Ground Truth)");

  let passed = 0;
  let failed = 0;

  // Case 1: Standard Four Pillars with Lichun and Solar Term boundary
  const baziRes1 = BaziService.getBazi('1990-05-15', '06:00');
  if (baziRes1.yearGanZhi === '庚午' && baziRes1.monthGanZhi === '辛巳' && baziRes1.dayGanZhi === '庚辰' && baziRes1.timeGanZhi === '己卯') {
    console.log(`  ✓ [L3 BAZI 4-PILLARS PASS] 1990-05-15 06:00 -> ${baziRes1.baziString}`);
    passed++;
  } else {
    console.error(`  ✗ [L3 BAZI 4-PILLARS FAIL] Got ${baziRes1.baziString}`);
    failed++;
  }

  // Case 2: Pre-Lichun Birth Year & Month Boundary Check (e.g. 1995-01-15, before Lichun 1995 -> 1994 甲戌年)
  const baziPreLichun = BaziService.getBazi('1995-01-15', '12:00');
  if (baziPreLichun.yearGanZhi === '甲戌') {
    console.log(`  ✓ [L3 BAZI LICHUN BOUNDARY PASS] 1995-01-15 (Pre-Lichun) correctly assigned to 甲戌年 (1994)`);
    passed++;
  } else {
    console.error(`  ✗ [L3 BAZI LICHUN BOUNDARY FAIL] Expected 甲戌, got ${baziPreLichun.yearGanZhi}`);
    failed++;
  }

  // Case 3: Complete Domain Evaluation Package (DayMaster + TenGods + NaYin + Canonical Evidences)
  const baziEval = BaziService.getBaziDomainEvaluation('1990-05-15', '06:00');
  if (
    baziEval.chart.dayMaster === '庚金' &&
    baziEval.chart.tenGods.yearGan === '比肩' &&
    baziEval.evidences.length >= 3 &&
    baziEval.validation.isValid
  ) {
    console.log(`  ✓ [L3 BAZI DOMAIN EVALUATION PASS] Extracted ${baziEval.evidences.length} CanonicalEvidenceNodes (DayMaster: ${baziEval.chart.dayMaster}, Month: ${baziEval.chart.tenGods.monthGan})`);
    passed++;
  } else {
    console.error(`  ✗ [L3 BAZI DOMAIN EVALUATION FAIL] Bazi evaluation structure incomplete`);
    failed++;
  }

  return { passed, failed };
}
