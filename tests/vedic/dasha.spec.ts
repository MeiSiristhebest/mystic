import { buildVimshottariTimeline, getCurrentDashaHierarchy, validateVedicChart, buildVedicChart } from "../../lib/vedic";
import goldenCases from "../fixtures/vedic-golden.json";

export function testVedicSuite() {
  console.log("▶ [TEST SUITE] Vedic Jyotish & 3-Tier Vimshottari Dasha Engine");

  let passed = 0;
  let failed = 0;

  for (const gc of goldenCases) {
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

    if (
      timeline.length === gc.expected.totalMahaDashas &&
      totalAd === gc.expected.totalAntarDashas &&
      totalPd === gc.expected.totalPratyantarDashas
    ) {
      console.log(`  ✓ [GOLDEN PASS] ${gc.name} (9 MD -> 81 AD -> 729 PD verified)`);
      passed++;
    } else {
      console.error(`  ✗ [GOLDEN FAIL] ${gc.name} (MD: ${timeline.length}, AD: ${totalAd}, PD: ${totalPd})`);
      failed++;
    }

    if (gc.expected.target2026MahaLord) {
      const cur = getCurrentDashaHierarchy(timeline, new Date('2026-08-15'));
      if (cur.mahaDasha.planet === gc.expected.target2026MahaLord) {
        console.log(`    ↳ Active 2026 Dasha verified: ${cur.formattedDisplay}`);
        passed++;
      } else {
        console.error(`    ✗ Active 2026 Dasha lord mismatch: got ${cur.mahaDasha.planet}, expected ${gc.expected.target2026MahaLord}`);
        failed++;
      }
    }
  }

  return { passed, failed };
}
