import { generateChart } from '../../lib/ziwei';
import { calculateAnnualTransit } from '../../lib/ziwei/transits';
import { calculateZiweiSynastry } from '../../lib/ziwei/synastry';

export function testZiweiAdvancedSuite() {
  console.log("▶ [TEST SUITE] Ziwei Advanced Engine Suite (Annual Transits Overlays & Synastry)");

  let passed = 0;
  let failed = 0;

  const chartA = generateChart({ year: 1990, month: 5, day: 15, hour: 3, gender: 'male' });
  const chartB = generateChart({ year: 1992, month: 8, day: 20, hour: 7, gender: 'female' });

  // 1. Annual Transit & 3-Tier Overlay
  const transit2026 = calculateAnnualTransit(chartA, 2026);
  if (transit2026.targetYear === 2026 && transit2026.annualGanZhi.includes('丙午') && transit2026.overlays.length === 12) {
    console.log(`  ✓ [ANNUAL TRANSIT OVERLAY PASS] 2026 丙午年叠盘: 流年命宫坐【${transit2026.overlays[transit2026.annualMingBranch].branchName}宫】`);
    console.log(`    ↳ 流年四化: 禄[${transit2026.annualSiHua.luStar}] 权[${transit2026.annualSiHua.quanStar}] 科[${transit2026.annualSiHua.keStar}] 忌[${transit2026.annualSiHua.jiStar}]`);
    passed++;
  } else {
    console.error(`  ✗ [ANNUAL TRANSIT OVERLAY FAIL]`);
    failed++;
  }

  // 2. Ziwei Synastry Compatibility
  const synastry = calculateZiweiSynastry(chartA, chartB, '男主', '女主');
  if (synastry.overallCompatibilityScore > 0 && synastry.aspects.length >= 3) {
    console.log(`  ✓ [ZIWEI SYNASTRY PASS] 综合契合得分: ${synastry.overallCompatibilityScore}分 (${synastry.compatibilityLevel})`);
    passed++;
  } else {
    console.error(`  ✗ [ZIWEI SYNASTRY FAIL]`);
    failed++;
  }

  return { passed, failed };
}
