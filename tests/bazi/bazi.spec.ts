import { BaziService } from "../../lib/services/baziService";
import { calculateAstronomicalTrueSolarTime } from "../../lib/bazi/solar-time";
import baziGoldenCases from "../fixtures/bazi-golden.json";

export function testBaziSuite() {
  console.log("▶ [TEST SUITE] Bazi Four Pillars & 24 Solar Terms Domain Engine (L3 Ground Truth & 12 Golden Fixtures)");

  let passed = 0;
  let failed = 0;

  // 1. True Solar Time & Equation of Time (EoT) Engine via pure UTC / IANA
  const tstBeijing = calculateAstronomicalTrueSolarTime('1990-05-15', '12:00', 'Asia/Shanghai', 116.40);
  if (tstBeijing.longitudeOffsetMinutes === -14.4 && typeof tstBeijing.eotMinutes === 'number' && tstBeijing.utcInstant === '1990-05-15T03:00:00.000Z' && tstBeijing.dstOffsetMinutes === 60) {
    console.log(`  ✓ [L3 TRUE SOLAR TIME PASS] Beijing (116.4°E) -> Meridian offset: ${tstBeijing.longitudeOffsetMinutes} min, EoT: ${tstBeijing.eotMinutes} min, DST: ${tstBeijing.dstOffsetMinutes} min, UTC: ${tstBeijing.utcInstant}`);
    passed++;
  } else {
    console.error(`  ✗ [L3 TRUE SOLAR TIME FAIL] Unexpected TST shift: ${tstBeijing.longitudeOffsetMinutes}`);
    failed++;
  }

  // 2. Iterate through 12 Golden Fixture Cases with Metadata & DST checks
  for (const gc of baziGoldenCases) {
    const baziEval = BaziService.getBaziDomainEvaluation(
      gc.birthDate,
      gc.birthTime,
      gc.longitude,
      gc.latitude,
      gc.timeZone,
      gc.convention as any
    );

    const baziRes = baziEval.chart;
    let match = true;
    if (gc.expected.yearGanZhi && baziRes.yearGanZhi !== gc.expected.yearGanZhi) match = false;
    if (gc.expected.monthGanZhi && baziRes.monthGanZhi !== gc.expected.monthGanZhi) match = false;
    if (gc.expected.dayGanZhi && baziRes.dayGanZhi !== gc.expected.dayGanZhi) match = false;
    if (gc.expected.timeGanZhi && baziRes.timeGanZhi !== gc.expected.timeGanZhi) match = false;
    if (gc.expected.dstOffsetMinutes !== undefined && baziRes.timeContext.dstOffsetMinutes !== gc.expected.dstOffsetMinutes) match = false;
    if (gc.expected.utcInstant && baziRes.timeContext.utcInstant !== gc.expected.utcInstant) match = false;

    if (match) {
      console.log(`  ✓ [L3 GOLDEN FIXTURE PASS] ${gc.name} -> ${baziRes.baziString} (DST: ${baziRes.timeContext.dstOffsetMinutes}m, Ref: ${gc.reference})`);
      passed++;
    } else {
      console.error(`  ✗ [L3 GOLDEN FIXTURE FAIL] ${gc.name} -> Got: ${baziRes.baziString} (DST: ${baziRes.timeContext.dstOffsetMinutes}m, UTC: ${baziRes.timeContext.utcInstant}), Expected: ${JSON.stringify(gc.expected)}`);
      failed++;
    }
  }

  // 3. Complete Domain Evaluation Package (DayMaster + TenGods + NaYin + Decontaminated CEG)
  const baziEval = BaziService.getBaziDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Shanghai');
  const dayMasterFactEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_DAY_MASTER_FACT');
  const dayMasterLoreEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_DAY_MASTER_LORE');
  const tenGodEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_TEN_GOD_SIGNAL');
  const nayinEv = baziEval.evidences.find(e => e.ruleId === 'BAZI_NAYIN_SIGNAL');

  if (
    baziEval.chart.dayMaster === '庚金' &&
    baziEval.chart.tenGods.monthGan === '劫财' &&
    dayMasterFactEv?.polarity === 'neutral' &&
    dayMasterFactEv?.dimension === 'structural' &&
    dayMasterFactEv?.evidenceType === 'deterministic_fact' &&
    dayMasterLoreEv?.dimension === 'personality' &&
    dayMasterLoreEv?.evidenceType === 'classical_interpretation' &&
    tenGodEv?.polarity === 'neutral' &&
    tenGodEv?.dimension === 'structural' &&
    tenGodEv?.evidenceType === 'derived_rule' &&
    nayinEv?.evidenceType === 'heuristic_inference' &&
    nayinEv && nayinEv.confidence <= 0.60 &&
    baziEval.chart.hiddenStems.length === 4 &&
    baziEval.validation.isValid
  ) {
    console.log(`  ✓ [L3 BAZI DECONTAMINATED CEG PASS] Fact/Lore decoupled, TenGod structural (neutral), NaYin (capped <= 0.60), 4 hidden stems`);
    passed++;
  } else {
    console.error(`  ✗ [L3 BAZI CEG FAIL] Expected decontaminated evidence nodes`);
    failed++;
  }

  return { passed, failed };
}
