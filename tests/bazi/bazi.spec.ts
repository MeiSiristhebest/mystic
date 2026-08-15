import { BaziService } from "../../lib/services/baziService";
import { calculateTrueSolarTime } from "../../lib/bazi";
import baziGoldenCases from "../fixtures/bazi-golden.json";

export function testBaziSuite() {
  console.log("▶ [TEST SUITE] Bazi Four Pillars & 24 Solar Terms Domain Engine (L3 Ground Truth & 12 Golden Fixtures)");

  let passed = 0;
  let failed = 0;

  // 1. True Solar Time & Equation of Time (EoT) Engine
  const beijingCivil = new Date('1990-05-15T12:00:00');
  const tstBeijing = calculateTrueSolarTime(beijingCivil, 116.40, 'Asia/Shanghai');
  if (tstBeijing.longitudeOffsetMinutes === -14.4 && typeof tstBeijing.eotMinutes === 'number') {
    console.log(`  ✓ [L3 TRUE SOLAR TIME PASS] Beijing (116.4°E) -> Meridian offset: ${tstBeijing.longitudeOffsetMinutes} min, EoT: ${tstBeijing.eotMinutes} min`);
    passed++;
  } else {
    console.error(`  ✗ [L3 TRUE SOLAR TIME FAIL] Unexpected TST shift: ${tstBeijing.longitudeOffsetMinutes}`);
    failed++;
  }

  // 2. Iterate through 12 Golden Fixture Cases
  for (const gc of baziGoldenCases) {
    const baziRes = BaziService.getBazi(
      gc.birthDate,
      gc.birthTime,
      gc.longitude,
      gc.latitude,
      gc.timeZone,
      false // Test standard solar term alignment for discrete fixture assertions
    );

    let match = true;
    if (gc.expected.yearGanZhi && baziRes.yearGanZhi !== gc.expected.yearGanZhi) match = false;
    if (gc.expected.monthGanZhi && baziRes.monthGanZhi !== gc.expected.monthGanZhi) match = false;
    if (gc.expected.dayGanZhi && baziRes.dayGanZhi !== gc.expected.dayGanZhi) match = false;
    if (gc.expected.timeGanZhi && baziRes.timeGanZhi !== gc.expected.timeGanZhi) match = false;

    if (match) {
      console.log(`  ✓ [L3 GOLDEN FIXTURE PASS] ${gc.name} -> ${baziRes.baziString}`);
      passed++;
    } else {
      console.error(`  ✗ [L3 GOLDEN FIXTURE FAIL] ${gc.name} -> Got: ${baziRes.baziString}, Expected: ${JSON.stringify(gc.expected)}`);
      failed++;
    }
  }

  // 3. Complete Domain Evaluation Package (DayMaster + TenGods + NaYin + Decontaminated CEG)
  const baziEval = BaziService.getBaziDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Shanghai');
  const dayMasterEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_DAY_MASTER');
  const tenGodEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_TEN_GOD_SIGNAL');
  const nayinEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_NAYIN_SIGNAL');

  if (
    baziEval.chart.dayMaster === '庚金' &&
    baziEval.chart.tenGods.monthGan === '劫财' &&
    dayMasterEv?.polarity === 'neutral' &&
    dayMasterEv?.evidenceType === 'deterministic_fact' &&
    tenGodEv?.polarity === 'neutral' &&
    tenGodEv?.evidenceType === 'derived_rule' &&
    nayinEv?.evidenceType === 'heuristic_inference' &&
    nayinEv?.confidence <= 0.60 &&
    baziEval.chart.hiddenStems.length === 4 &&
    baziEval.validation.isValid
  ) {
    console.log(`  ✓ [L3 BAZI DECONTAMINATED CEG PASS] DayMaster (neutral fact), TenGod (neutral signal), NaYin (capped <= 0.60, heuristic inference), 4 hidden stems`);
    passed++;
  } else {
    console.error(`  ✗ [L3 BAZI CEG FAIL] Expected decontaminated evidence nodes`);
    failed++;
  }

  return { passed, failed };
}
