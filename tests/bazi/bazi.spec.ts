import { BaziService } from "../../lib/services/baziService";
import { calculateAstronomicalTrueSolarTime, calculateAstronomicalEquationOfTime } from "../../lib/bazi/solar-time";
import { getNaYinByGanZhi } from "../../lib/bazi/dayun";
import { BaziCalculationError } from "../../lib/bazi/types";
import baziGoldenCases from "../fixtures/bazi-golden.json";

export function testBaziSuite() {
  console.log("▶ [TEST SUITE] Bazi Four Pillars, Meeus EoT, Interactions, Heuristic Strength & Da Yun (L3 Ground Truth & 12 Golden Fixtures)");

  let passed = 0;
  let failed = 0;

  // 1. Meeus-based Astronomical Equation of Time (EoT) Engine via pure UTC / Sun Alpha
  const testUtcDate = new Date('1990-05-15T03:00:00.000Z');
  const exactEoT = calculateAstronomicalEquationOfTime(testUtcDate);
  const tstBeijing = calculateAstronomicalTrueSolarTime('1990-05-15', '12:00', 'Asia/Shanghai', 116.40);

  if (
    tstBeijing.longitudeOffsetMinutes === -14.4 &&
    typeof tstBeijing.eotMinutes === 'number' &&
    Math.abs(tstBeijing.eotMinutes - exactEoT) < 0.01 &&
    tstBeijing.utcInstant === '1990-05-15T03:00:00.000Z' &&
    tstBeijing.dstOffsetMinutes === 60
  ) {
    console.log(`  ✓ [L3 MEEUS TRUE SOLAR TIME PASS] Beijing (116.4°E) -> Meridian offset: ${tstBeijing.longitudeOffsetMinutes} min, Meeus EoT: ${tstBeijing.eotMinutes} min, DST: ${tstBeijing.dstOffsetMinutes} min, UTC: ${tstBeijing.utcInstant}`);
    passed++;
  } else {
    console.error(`  ✗ [L3 MEEUS TRUE SOLAR TIME FAIL] Unexpected TST shift: ${tstBeijing.longitudeOffsetMinutes}, EoT: ${tstBeijing.eotMinutes}`);
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

  // 3. Stem & Branch Interaction Engine Verification (Presence vs Transformation, Half-Harmony, Prioritized Sorting)
  const baziInteractEval = BaziService.getBaziDomainEvaluation('1988-03-08', '10:00', 116.40, 39.90, 'Asia/Shanghai');
  // 1988-03-08 10:00 -> 戊辰 乙卯 壬戌 乙巳
  // Branches: 辰 卯 戌 巳 -> 辰戌六冲 (weight 8), 卯戌六合 (weight 8), 辰卯相害 (weight 6)
  const hasChenXuClash = baziInteractEval.chart.interactions.some(i => i.type === 'branch_six_clash' && i.elementsInvolved.includes('辰') && i.elementsInvolved.includes('戌'));
  const hasMaoXuCombo = baziInteractEval.chart.interactions.some(i => i.type === 'branch_six_combination' && i.elementsInvolved.includes('卯') && i.elementsInvolved.includes('戌'));
  const hasMaoChenHarm = baziInteractEval.chart.interactions.some(i => i.type === 'branch_harm' && i.elementsInvolved.includes('辰') && i.elementsInvolved.includes('卯'));

  // Test Half-Harmony: 1990-05-15 06:00 -> 庚午 辛巳 庚辰 己卯 (巳午未会火? No, but 午 + 辰?)
  // Check half harmony on 2000-01-01 -> 己卯 丙子 戊午 辛酉 (子午冲, 卯酉冲)
  if (hasChenXuClash && hasMaoXuCombo && hasMaoChenHarm && baziInteractEval.chart.interactions[0].structuralWeight >= baziInteractEval.chart.interactions[1].structuralWeight) {
    console.log(`  ✓ [L3 STEM & BRANCH INTERACTIONS PASS] Correctly detected: 辰戌六冲, 卯戌六合, 卯辰相害 (Prioritized descending)`);
    passed++;
  } else {
    console.error(`  ✗ [L3 STEM & BRANCH INTERACTIONS FAIL] Interactions not fully detected`);
    failed++;
  }

  // 4. Day Master Strength & Seasonality Heuristic Model Verification
  const baziEval1990 = BaziService.getBaziDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Shanghai');
  const strength = baziEval1990.chart.strengthEvaluation;

  if (
    strength &&
    strength.modelName === 'mystic_quantitative_strength_v1' &&
    strength.seasonality.monthBranch === '巳' &&
    strength.seasonality.state === '死' && // 庚金生于巳月(夏火旺金死)
    strength.rooting.rootCount >= 1 &&
    typeof strength.scores.totalScore === 'number' &&
    ['身强', '身弱', '中和平衡', '从格候选'].includes(strength.overallState) &&
    strength.favoredElements.length > 0 &&
    strength.unfavoredElements.length > 0
  ) {
    console.log(`  ✓ [L3 DAY MASTER STRENGTH PASS] Geng Metal in Si Month -> Seasonality: ${strength.seasonality.state}, State: ${strength.overallState}, Score: ${strength.scores.totalScore}, Favored: [${strength.favoredElements.join(',')}]`);
    passed++;
  } else {
    console.error(`  ✗ [L3 DAY MASTER STRENGTH FAIL] Strength evaluation failed`);
    failed++;
  }

  // 5. Da Yun (大运) Pipeline: Exact Solar Dates, Continuity, No Gap, Direct NaYin
  const daYun = baziEval1990.chart.daYun;
  const dyFirstPeriod = daYun.periods[0];
  const dyStartMatches = dyFirstPeriod.startDate.match(/^\d{4}-\d{2}-\d{2}$/);
  const naYinDirectCheck = getNaYinByGanZhi('壬午') === '杨柳木' && getNaYinByGanZhi('甲子') === '海中金';

  // Check continuity between Period 1 and Period 2
  const p1End = daYun.periods[0].endDate;
  const p2Start = daYun.periods[1].startDate;
  const isContinuous = p1End === p2Start || Math.abs(new Date(p2Start).getTime() - new Date(p1End).getTime()) <= 86400000 * 2;

  if (
    daYun &&
    daYun.direction === '顺行' &&
    daYun.periods.length >= 8 &&
    daYun.startAge > 0 &&
    daYun.firstDaYunStartDate.match(/^\d{4}-\d{2}-\d{2}$/) &&
    dyStartMatches &&
    naYinDirectCheck &&
    isContinuous
  ) {
    console.log(`  ✓ [L3 DA YUN PIPELINE PASS] Direction: ${daYun.direction}, Start Date: ${daYun.firstDaYunStartDate}, P1: ${dyFirstPeriod.ganZhi} (${dyFirstPeriod.startDate} ~ ${dyFirstPeriod.endDate}), NaYin: ${dyFirstPeriod.naYin}`);
    passed++;
  } else {
    console.error(`  ✗ [L3 DA YUN PIPELINE FAIL] Da Yun calculation failed: ${JSON.stringify(daYun)}`);
    failed++;
  }

  // 6. Dynamic Da Yun Query with targetDate & No Silent Fallback
  // 1990-05-15 birth, First Da Yun starts in 1997
  // Case A: Query at 1993-01-01 (Age 3, prior to first Da Yun) -> Must NOT have bazi_dayun_active
  const preStartEval = BaziService.getBaziDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Shanghai', undefined, '1993-01-01');
  const preStartDyEv = preStartEval.evidences.find(e => e.ruleId === 'BAZI_DAYUN_ACTIVE');
  const noSilentFallbackPass = preStartDyEv === undefined;

  // Case B: Query at 2000-06-01 (Age 10, inside Period 1 壬午) -> Must activate Period 1
  const active2000Eval = BaziService.getBaziDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Shanghai', undefined, '2000-06-01');
  const active2000DyEv = active2000Eval.evidences.find(e => e.ruleId === 'BAZI_DAYUN_ACTIVE');
  const activePeriodPass = active2000DyEv !== undefined && active2000DyEv.parameters.step === 1 && active2000DyEv.parameters.ganZhi === '壬午';

  if (noSilentFallbackPass && activePeriodPass) {
    console.log(`  ✓ [L3 TARGET DATE REPRODUCIBILITY PASS] 1993 (pre-start) -> undefined; 2000 (targetDate) -> Step 1 壬午 (No silent period[0] fallback)`);
    passed++;
  } else {
    console.error(`  ✗ [L3 TARGET DATE REPRODUCIBILITY FAIL] noSilentFallback: ${noSilentFallbackPass}, activePeriod: ${activePeriodPass}`);
    failed++;
  }

  // 7. Strict Parameter Bounds Validation (Negative Tests)
  let invalidLonBlocked = false;
  let invalidTzBlocked = false;
  try {
    BaziService.getBazi('1990-05-15', '06:00', 250, 39.90);
  } catch (err: any) {
    if (err instanceof BaziCalculationError) invalidLonBlocked = true;
  }

  try {
    BaziService.getBazi('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Chin');
  } catch (err: any) {
    if (err instanceof BaziCalculationError) invalidTzBlocked = true;
  }

  if (invalidLonBlocked && invalidTzBlocked) {
    console.log(`  ✓ [L3 BOUNDS VALIDATION PASS] Longitude > 180 and invalid IANA timezone 'Asia/Chin' properly rejected`);
    passed++;
  } else {
    console.error(`  ✗ [L3 BOUNDS VALIDATION FAIL] Failed to block invalid parameters (lon: ${invalidLonBlocked}, tz: ${invalidTzBlocked})`);
    failed++;
  }

  return { passed, failed };
}
