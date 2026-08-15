import { rectifyBirthTime, evaluatePrashna, calculateAshtakoota, buildVedicChart, calculateHighPrecisionGrahas, parseCivilTimeToUtc } from '../../lib/vedic';

export function testVedicAdvancedSuite() {
  console.log("▶ [TEST SUITE] Vedic Advanced Engine Suite (Rectifier, Prashna & Ashtakoota 36-Point)");

  let passed = 0;
  let failed = 0;

  // 1. Test Ashtakoota 36-Point System
  const { utcDate: utcA } = parseCivilTimeToUtc('1990-05-15', '06:00', 'Asia/Shanghai');
  const grahasA = calculateHighPrecisionGrahas(utcA, { latitude: 39.9, longitude: 116.4, timeZone: 'Asia/Shanghai' });
  const chartA = buildVedicChart('1990-05-15', '06:00', grahasA.planets.map(p => ({ name: p.name, longitude: p.tropicalLongitude })), grahasA.ascendant.tropical);

  const { utcDate: utcB } = parseCivilTimeToUtc('1992-08-20', '14:30', 'Asia/Shanghai');
  const grahasB = calculateHighPrecisionGrahas(utcB, { latitude: 39.9, longitude: 116.4, timeZone: 'Asia/Shanghai' });
  const chartB = buildVedicChart('1992-08-20', '14:30', grahasB.planets.map(p => ({ name: p.name, longitude: p.tropicalLongitude })), grahasB.ascendant.tropical);

  const koota = calculateAshtakoota(chartA, chartB);
  if (koota.totalScore >= 0 && koota.totalScore <= 36 && koota.kutas.nadi.maxScore === 8) {
    console.log(`  ✓ [ASHTAKOOTA 36-POINT PASS] Score: ${koota.totalScore}/36 (Acceptable: ${koota.isAcceptable})`);
    passed++;
  } else {
    console.error(`  ✗ [ASHTAKOOTA 36-POINT FAIL] Invalid score: ${koota.totalScore}`);
    failed++;
  }

  // 2. Test Birth Time Rectification
  const rectResult = rectifyBirthTime('1990-05-15', '06:00', [
    { eventName: '结婚成家', eventType: 'marriage', eventYear: 2018 },
    { eventName: '职业重大晋升', eventType: 'career_promotion', eventYear: 2021 },
  ], { scanWindowMinutes: 20, stepMinutes: 5 });

  if (rectResult.candidates.length > 0 && rectResult.recommendedTime) {
    console.log(`  ✓ [RECTIFIER PASS] Original: ${rectResult.originalTime} -> Recommended: ${rectResult.recommendedTime} (Score: ${rectResult.confidenceScore})`);
    passed++;
  } else {
    console.error(`  ✗ [RECTIFIER FAIL] No rectification candidates produced`);
    failed++;
  }

  // 3. Test Prashna Horary Engine
  const prashnaResult = evaluatePrashna({
    questionText: '今年能否顺利换工作拿到心仪 Offer？',
    category: 'career_job',
    queryDateTime: '2026-08-16T10:00:00Z',
  });

  if (prashnaResult.karyaBhava === 10 && prashnaResult.verdict) {
    console.log(`  ✓ [PRASHNA PASS] Category: Career (10宫) | Verdict: ${prashnaResult.verdictTitle}`);
    passed++;
  } else {
    console.error(`  ✗ [PRASHNA FAIL] Unexpected karya bhava: ${prashnaResult.karyaBhava}`);
    failed++;
  }

  return { passed, failed };
}
