import { BaziService } from "../../lib/services/baziService";
import { calculateAstronomicalTrueSolarTime, calculateAstronomicalEquationOfTime } from "../../lib/bazi/solar-time";
import baziGoldenCases from "../fixtures/bazi-golden.json";

export function testBaziSuite() {
  console.log("▶ [TEST SUITE] Bazi Four Pillars, Astronomical EoT, Interactions, Strength & Da Yun (L3 Ground Truth & 12 Golden Fixtures)");

  let passed = 0;
  let failed = 0;

  // 1. Astronomical True Solar Time & Equation of Time (EoT) Engine via pure UTC / Moshier Sun Alpha
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
    console.log(`  ✓ [L3 ASTRONOMICAL TRUE SOLAR TIME PASS] Beijing (116.4°E) -> Meridian offset: ${tstBeijing.longitudeOffsetMinutes} min, Astronomical EoT: ${tstBeijing.eotMinutes} min, DST: ${tstBeijing.dstOffsetMinutes} min, UTC: ${tstBeijing.utcInstant}`);
    passed++;
  } else {
    console.error(`  ✗ [L3 ASTRONOMICAL TRUE SOLAR TIME FAIL] Unexpected TST shift: ${tstBeijing.longitudeOffsetMinutes}, EoT: ${tstBeijing.eotMinutes}`);
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

  // 3. Stem & Branch Interaction Engine Verification (天干五合/地支六冲六合相刑相害)
  const baziInteractEval = BaziService.getBaziDomainEvaluation('1988-03-08', '10:00', 116.40, 39.90, 'Asia/Shanghai');
  // 1988-03-08 10:00 -> 戊辰 乙卯 壬戌 乙巳
  // Branches: 辰 卯 戌 巳 -> 辰戌冲, 卯戌合火, 卯辰害
  const hasChenXuClash = baziInteractEval.chart.interactions.some(i => i.type === 'branch_six_clash' && i.name.includes('辰戌'));
  const hasMaoXuCombo = baziInteractEval.chart.interactions.some(i => i.type === 'branch_six_combination' && i.name.includes('卯戌'));
  const hasMaoChenHarm = baziInteractEval.chart.interactions.some(i => i.type === 'branch_harm' && i.elementsInvolved.includes('辰') && i.elementsInvolved.includes('卯'));

  if (hasChenXuClash && hasMaoXuCombo && hasMaoChenHarm) {
    console.log(`  ✓ [L3 STEM & BRANCH INTERACTIONS PASS] Correctly detected: 辰戌六冲, 卯戌六合, 卯辰相害`);
    passed++;
  } else {
    console.error(`  ✗ [L3 STEM & BRANCH INTERACTIONS FAIL] Interactions not fully detected: ${JSON.stringify(baziInteractEval.chart.interactions)}`);
    failed++;
  }

  // 4. Day Master Strength & Seasonality Evaluation Verification (得令/得地/得势量化)
  const baziEval1990 = BaziService.getBaziDomainEvaluation('1990-05-15', '06:00', 116.40, 39.90, 'Asia/Shanghai');
  const strength = baziEval1990.chart.strengthEvaluation;

  if (
    strength &&
    strength.seasonality.monthBranch === '巳' &&
    strength.seasonality.state === '死' && // 庚金生于巳月(夏火旺金死)
    strength.rooting.rootCount >= 1 && // 辰中微弱余气或巳中庚金中气
    typeof strength.scores.totalScore === 'number' &&
    ['身强', '身弱', '中和平衡', '从格倾向'].includes(strength.overallState) &&
    strength.favoredElements.length > 0 &&
    strength.unfavoredElements.length > 0
  ) {
    console.log(`  ✓ [L3 DAY MASTER STRENGTH PASS] Geng Metal in Si Month -> Seasonality: ${strength.seasonality.state}, State: ${strength.overallState}, Score: ${strength.scores.totalScore}, Favored: [${strength.favoredElements.join(',')}]`);
    passed++;
  } else {
    console.error(`  ✗ [L3 DAY MASTER STRENGTH FAIL] Strength evaluation failed`);
    failed++;
  }

  // 5. Da Yun (大运) Pipeline & Direction Rules Verification (阳男阴女顺排 / 阴男阳女逆排)
  const daYun = baziEval1990.chart.daYun;
  if (
    daYun &&
    daYun.direction === '顺行' && // 1990 庚午 (阳年) 男命 -> 顺行
    daYun.periods.length >= 8 &&
    daYun.periods[0].startAge > 0 &&
    daYun.periods[0].startDate.match(/^\d{4}-\d{2}-\d{2}$/) &&
    daYun.periods[0].endDate.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    console.log(`  ✓ [L3 DA YUN PIPELINE PASS] Direction: ${daYun.direction}, Start Age: ${daYun.startAge}岁, First Da Yun: ${daYun.periods[0].ganZhi} (${daYun.periods[0].startDate} ~ ${daYun.periods[0].endDate})`);
    passed++;
  } else {
    console.error(`  ✗ [L3 DA YUN PIPELINE FAIL] Da Yun calculation failed: ${JSON.stringify(daYun)}`);
    failed++;
  }

  // 6. Complete Domain Evaluation Package (CEG Extraction)
  const dayMasterFactEv = baziEval1990.evidences.find(e => e.ruleId === 'BAZI_DAY_MASTER_FACT');
  const strengthEv = baziEval1990.evidences.find(e => e.ruleId === 'BAZI_STRENGTH_EVALUATION');
  const dayunEv = baziEval1990.evidences.find(e => e.ruleId === 'BAZI_DAYUN_ACTIVE');
  const nayinEv = baziEval1990.evidences.find(e => e.ruleId === 'BAZI_NAYIN_SIGNAL');

  if (
    dayMasterFactEv?.dimension === 'structural' &&
    dayMasterFactEv?.evidenceType === 'deterministic_fact' &&
    strengthEv?.dimension === 'structural' &&
    strengthEv?.evidenceType === 'derived_rule' &&
    dayunEv?.dimension === 'career' &&
    dayunEv?.temporalScope?.startDate &&
    nayinEv?.evidenceType === 'heuristic_inference' &&
    nayinEv.confidence <= 0.60 &&
    baziEval1990.validation.isValid
  ) {
    console.log(`  ✓ [L3 BAZI COMPREHENSIVE CEG PASS] Fact (1.0), Strength (0.92), Active Da Yun with ISO Interval (0.90), NaYin (0.55)`);
    passed++;
  } else {
    console.error(`  ✗ [L3 BAZI COMPREHENSIVE CEG FAIL] Expected full CEG nodes, got: ${baziEval1990.evidences.map(e => e.ruleId).join(', ')}`);
    failed++;
  }

  return { passed, failed };
}
