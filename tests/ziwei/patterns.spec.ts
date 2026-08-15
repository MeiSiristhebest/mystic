import { generateChart, detectPatterns, extractZiweiEvidences, validateZiweiChart } from "../../lib/ziwei";
import { astro } from "iztro";
import goldenCases from "../fixtures/ziwei-golden.json";

export function testZiweiSuite() {
  console.log("▶ [TEST SUITE] Ziwei Doushu Astrolabe & Pattern Engine (L3 Golden & L4 Differential)");

  let passed = 0;
  let failed = 0;

  for (const gc of goldenCases) {
    const chart = generateChart({
      year: gc.input.year,
      month: gc.input.month,
      day: gc.input.day,
      hour: gc.input.hour,
      gender: gc.input.gender as 'male' | 'female',
    });

    // 1. Structural & Validation Check
    const val = validateZiweiChart(chart);
    if (val.isValid === gc.expected.isValid && chart.palaces.length === gc.expected.palacesCount) {
      console.log(`  ✓ [L2 STRUCTURAL PASS] ${gc.name}`);
      passed++;
    } else {
      console.error(`  ✗ [L2 STRUCTURAL FAIL] ${gc.name}`);
      failed++;
    }

    // 2. L3 Domain Golden Value Assertions
    const mingPalace = chart.palaces.find(p => p.branch === chart.mingGongBranch);
    const mingBranchMatch = chart.mingGongBranch === gc.expected.mingGongBranch;
    const majorStars = mingPalace?.stars.filter(s => s.type === 'major').map(s => s.name) || [];
    
    let majorStarsMatch = true;
    if (gc.expected.majorStarsInMing) {
      majorStarsMatch = gc.expected.majorStarsInMing.every(st => majorStars.includes(st));
    }

    const patterns = detectPatterns(chart);
    const patternNames = patterns.map(p => p.name);
    let patternsMatch = true;
    if (gc.expected.expectedPatterns) {
      patternsMatch = gc.expected.expectedPatterns.every(pn => patternNames.includes(pn));
    }

    if (mingBranchMatch && majorStarsMatch && patternsMatch && patterns.length > 0) {
      console.log(`  ✓ [L3 DOMAIN GOLDEN PASS] ${gc.name}`);
      console.log(`    ↳ 命宫地支: ${chart.mingGongBranch} | 主星: [${majorStars.join(', ')}] | 命中格局: [${patternNames.slice(0, 3).join(', ')}]`);
      passed++;
    } else {
      console.error(`  ✗ [L3 DOMAIN GOLDEN FAIL] ${gc.name} (mingBranch: ${chart.mingGongBranch} vs ${gc.expected.mingGongBranch}, patterns: ${patternNames})`);
      failed++;
    }

    // 3. Evidence Mapping Check
    const evidences = extractZiweiEvidences(chart, patterns);
    if (evidences.length === patterns.length && evidences.every(e => !!e.classicalSource && !!e.canonicalInterpretation)) {
      console.log(`  ✓ [EVIDENCE GRAPH PASS] Extracted ${evidences.length} CanonicalEvidenceNodes with classical sources`);
      passed++;
    } else {
      console.error(`  ✗ [EVIDENCE GRAPH FAIL] Evidence extraction incomplete`);
      failed++;
    }

    // 4. L4 Differential Test (Mystic Adapter vs Direct Raw iztro Astrolabe)
    const solarDate = `${gc.input.year}-${gc.input.month}-${gc.input.day}`;
    const rawAstrolabe = astro.bySolar(solarDate, gc.input.hour, gc.input.gender === 'male' ? '男' : '女', true, 'zh-CN');
    const directBranch = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"].indexOf(rawAstrolabe.earthlyBranchOfSoulPalace as string);

    if (chart.mingGongBranch === directBranch && chart.wuxingJuName === rawAstrolabe.fiveElementsClass) {
      console.log(`  ✓ [L4 DIFFERENTIAL MATCH] Mystic adapter produces identical astrolabe core as direct iztro`);
      passed++;
    } else {
      console.error(`  ✗ [L4 DIFFERENTIAL MISMATCH] Mystic: ${chart.mingGongBranch}, direct iztro: ${directBranch}`);
      failed++;
    }
  }

  return { passed, failed };
}
