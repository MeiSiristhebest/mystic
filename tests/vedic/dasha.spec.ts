import { 
  buildVimshottariTimeline, 
  getCurrentDashaHierarchy, 
  validateVedicChart, 
  getNakshatraByDegree,
  getNavamsaSignIndex,
  getDasamsaSignIndex,
  getVargaSignIndex,
  calculateHighPrecisionGrahas,
  calculateLahiriAyanamsa,
  calculateJulianDay,
  extractVedicEvidences,
  VEDIC_SIGNS
} from "../../lib/vedic";
import goldenCases from "../fixtures/vedic-golden.json";

export function testVedicSuite() {
  console.log("▶ [TEST SUITE] Vedic Jyotish & Astronomical Ephemeris Engine (L3 Ground Truth & Varga)");

  let passed = 0;
  let failed = 0;

  // 1. Astronomical Ephemeris & Ayanamsa Accuracy Test
  const testDate = new Date(1995, 5, 15, 6, 0); // 1995-06-15 06:00
  const jd = calculateJulianDay(testDate, 8);
  const ayanamsa = calculateLahiriAyanamsa(jd);
  // Expected Lahiri Ayanamsa for mid-1995 is ~23.79°
  if (ayanamsa > 23.70 && ayanamsa < 23.95) {
    console.log(`  ✓ [L3 ASTRONOMICAL AYANAMSA PASS] J2000 JD ${jd.toFixed(2)} -> Lahiri Ayanamsa: ${ayanamsa.toFixed(4)}°`);
    passed++;
  } else {
    console.error(`  ✗ [L3 ASTRONOMICAL AYANAMSA FAIL] Unexpected Ayanamsa: ${ayanamsa}`);
    failed++;
  }

  const grahas = calculateHighPrecisionGrahas(testDate);
  if (grahas.planets.length === 9 && grahas.ascendant.sidereal >= 0 && grahas.ascendant.sidereal < 360) {
    console.log(`  ✓ [L3 EPHEMERIS 9 GRAHAS PASS] Computed 9 planetary sidereal positions (Ascendant: ${grahas.ascendant.signName} ${grahas.ascendant.sidereal.toFixed(2)}°)`);
    passed++;
  } else {
    console.error(`  ✗ [L3 EPHEMERIS GRAHAS FAIL] Ephemeris failed to produce 9 planets`);
    failed++;
  }

  // 2. Extended Varga Divisional Charts (D1, D7, D9, D10, D12, D60)
  const d7Sign = getVargaSignIndex(145.5, 7);
  const d9Sign = getVargaSignIndex(145.5, 9);
  const d10Sign = getVargaSignIndex(145.5, 10);
  const d12Sign = getVargaSignIndex(145.5, 12);
  const d60Sign = getVargaSignIndex(145.5, 60);

  if (d9Sign === 7 && d10Sign === 0 && d7Sign >= 0 && d12Sign >= 0 && d60Sign >= 0) {
    console.log(`  ✓ [L3 EXTENDED VARGA PASS] 145.5° D1~D60 Mapping (D7: ${VEDIC_SIGNS[d7Sign].name}, D9: Scorpio, D10: Aries, D12: ${VEDIC_SIGNS[d12Sign].name}, D60: ${VEDIC_SIGNS[d60Sign].name})`);
    passed++;
  } else {
    console.error(`  ✗ [L3 EXTENDED VARGA FAIL] D9: ${d9Sign}, D10: ${d10Sign}`);
    failed++;
  }

  // 3. Golden Cases & Recursive Dasha Tests
  for (const gc of goldenCases) {
    const nakInfo = getNakshatraByDegree(gc.moonSiderealDegree);
    
    // Nakshatra Ground Truth
    if (nakInfo.nakshatra.index === gc.expected.nakshatraIndex && nakInfo.nakshatra.name === gc.expected.nakshatraName) {
      console.log(`  ✓ [L3 NAKSHATRA PASS] ${gc.name} -> Index ${nakInfo.nakshatra.index} (${nakInfo.nakshatra.name}) ruled by ${nakInfo.nakshatra.ruler}`);
      passed++;
    } else {
      console.error(`  ✗ [L3 NAKSHATRA FAIL] Got ${nakInfo.nakshatra.name}, expected ${gc.expected.nakshatraName}`);
      failed++;
    }

    // Timeline and Sequence Ground Truth
    const timeline = buildVimshottariTimeline(gc.birthDate, gc.moonSiderealDegree);

    let totalAd = 0;
    let totalPd = 0;
    for (const md of timeline) {
      const ads = md.subPeriods || [];
      totalAd += ads.length;
      for (const ad of ads) {
        totalPd += (ad.subPeriods || []).length;
      }
    }

    const actualMahaOrder = timeline.map(t => t.planet);
    const orderMatch = gc.expected.mahadashaOrder ? gc.expected.mahadashaOrder.every((p, idx) => actualMahaOrder[idx] === p) : true;

    if (
      timeline.length === gc.expected.totalMahaDashas &&
      totalAd === gc.expected.totalAntarDashas &&
      totalPd === gc.expected.totalPratyantarDashas &&
      orderMatch
    ) {
      console.log(`  ✓ [L3 DASHA RECURSION PASS] ${gc.name} (9 MD -> 81 AD -> 729 PD)`);
      console.log(`    ↳ Order: [${actualMahaOrder.join(' -> ')}]`);
      passed++;
    } else {
      console.error(`  ✗ [L3 DASHA FAIL] ${gc.name} (MD: ${timeline.length}, AD: ${totalAd}, PD: ${totalPd})`);
      failed++;
    }

    // Target Dasha Resolution
    if (gc.expected.target2026MahaLord) {
      const cur = getCurrentDashaHierarchy(timeline, new Date('2026-08-15'));
      if (cur.mahaDasha.planet === gc.expected.target2026MahaLord && (!gc.expected.target2026AntarLord || cur.antarDasha.planet === gc.expected.target2026AntarLord)) {
        console.log(`  ✓ [L3 TARGET DASHA PASS] Active 2026 Dasha: ${cur.formattedDisplay}`);
        passed++;
      } else {
        console.error(`  ✗ [L3 TARGET DASHA FAIL] Active 2026 Dasha lord mismatch: ${cur.formattedDisplay}`);
        failed++;
      }
    }
  }

  return { passed, failed };
}
