import { 
  buildVimshottariTimeline, 
  getCurrentDashaHierarchy, 
  validateVedicChart, 
  getNakshatraByDegree,
  getNavamsaSignIndex,
  getDasamsaSignIndex,
  VEDIC_SIGNS
} from "../../lib/vedic";
import goldenCases from "../fixtures/vedic-golden.json";

export function testVedicSuite() {
  console.log("▶ [TEST SUITE] Vedic Jyotish & 3-Tier Vimshottari Dasha (L3 Ground Truth Reference)");

  let passed = 0;
  let failed = 0;

  for (const gc of goldenCases) {
    const nakInfo = getNakshatraByDegree(gc.moonSiderealDegree);
    
    // 1. Nakshatra Ground Truth
    if (nakInfo.nakshatra.index === gc.expected.nakshatraIndex && nakInfo.nakshatra.name === gc.expected.nakshatraName) {
      console.log(`  ✓ [L3 NAKSHATRA PASS] ${gc.name} -> Index ${nakInfo.nakshatra.index} (${nakInfo.nakshatra.name}) ruled by ${nakInfo.nakshatra.ruler}`);
      passed++;
    } else {
      console.error(`  ✗ [L3 NAKSHATRA FAIL] Got ${nakInfo.nakshatra.name}, expected ${gc.expected.nakshatraName}`);
      failed++;
    }

    // 2. Timeline and Sequence Ground Truth
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

    // 3. Divisional Varga Ground Truth (D9 Navamsa & D10 Dasamsa)
    const navSignIdx = getNavamsaSignIndex(gc.moonSiderealDegree);
    const dasSignIdx = getDasamsaSignIndex(gc.moonSiderealDegree);
    const actualNavSign = VEDIC_SIGNS[navSignIdx].name;
    const actualDasSign = VEDIC_SIGNS[dasSignIdx].name;

    if (actualNavSign === gc.expected.d9NavamsaSign && actualDasSign === gc.expected.d10DasamsaSign) {
      console.log(`  ✓ [L3 DIVISIONAL PASS] Moon D9 Navamsa: ${actualNavSign}, D10 Dasamsa: ${actualDasSign}`);
      passed++;
    } else {
      console.error(`  ✗ [L3 DIVISIONAL FAIL] Got D9: ${actualNavSign}, D10: ${actualDasSign} (expected ${gc.expected.d9NavamsaSign}/${gc.expected.d10DasamsaSign})`);
      failed++;
    }

    // 4. Target Dasha Resolution
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
