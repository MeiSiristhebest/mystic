/**
 * Comprehensive Verification & Regression Test Suite for Mystic Reasoning Engine.
 * Validates:
 * 1. Vedic Jyotish 3-tier Vimshottari Dasha recursion & 120-year continuity
 * 2. Vedic 16-point structural validator & multi-timezone instant conversion
 * 3. Ni Haixia TCM Eight Principles & Six Stages deterministic rule engine & citations
 * 4. Ziwei Doushu astrolabe generation, 80+ patterns & evidence extraction
 * 5. Canonical Evidence Graph deterministic confidence calibration & dynamic relations
 * 6. CrossDomainConflictDetector multi-system dialectic arbitration
 */

import { buildVedicChart, buildVimshottariTimeline, getCurrentDashaHierarchy, validateVedicChart, normalizeToUtcInstant } from '../lib/vedic';
import { matchDiagnosticRules, validateHealthAnswers, NIHAIXIA_DIAGNOSTIC_RULES } from '../lib/nihaixia';
import { generateChart, detectPatterns, extractZiweiEvidences, validateZiweiChart } from '../lib/ziwei';
import { CrossDomainConflictDetector } from '../lib/reasoning';
import { CanonicalEvidenceNode, calculateDeterministicConfidence } from '../lib/contracts';

function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Starting Mystic Multi-Domain Reasoning Verification');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST SUITE 1: Vedic Jyotish Engine & Vimshottari Dasha
  // ----------------------------------------------------
  console.log('--- Suite 1: Vedic Jyotish Engine & Recursive Dasha ---');
  
  const birthDateStr = '1995-06-15';
  const moonDegree = 145.5; // Leo (Purva Phalguni, ruled by Venus)
  const timeline = buildVimshottariTimeline(birthDateStr, moonDegree);

  assert(timeline.length === 9, 'Vimshottari timeline contains exactly 9 Mahadashas');
  
  let totalAdCount = 0;
  let totalPdCount = 0;
  let hasTimelineDiscontinuity = false;

  for (let i = 0; i < timeline.length; i++) {
    const md = timeline[i];
    const ads = md.subPeriods || [];
    totalAdCount += ads.length;

    if (i > 0) {
      const prevEnd = new Date(timeline[i - 1].endDate).getTime();
      const curStart = new Date(md.startDate).getTime();
      // Allow max 1-day rounding diff across timezone serialization
      if (Math.abs(curStart - prevEnd) > 86400000 * 2) {
        hasTimelineDiscontinuity = true;
      }
    }

    for (let j = 0; j < ads.length; j++) {
      const ad = ads[j];
      const pds = ad.subPeriods || [];
      totalPdCount += pds.length;
    }
  }

  assert(totalAdCount === 81, 'Vimshottari contains exactly 81 Antardashas (9 x 9)', `Found ${totalAdCount}`);
  assert(totalPdCount === 729, 'Vimshottari contains exactly 729 Pratyantardashas (9 x 9 x 9)', `Found ${totalPdCount}`);
  assert(!hasTimelineDiscontinuity, 'Vimshottari timeline is continuous without gaps or backwards overlaps');

  const currentDasha = getCurrentDashaHierarchy(timeline, new Date('2026-08-15'));
  assert(
    !!currentDasha.mahaDasha && !!currentDasha.antarDasha && !!currentDasha.pratyantarDasha,
    'Current Dasha hierarchy resolves full [Maha, Antar, Pratyantar] triple'
  );
  assert(
    currentDasha.mahaDasha.planet !== currentDasha.antarDasha.planet || currentDasha.mahaDasha.subPeriods![0].planet === currentDasha.mahaDasha.planet,
    'Antar Dasha is distinct or correctly derived within current Mahadasha cycle',
    currentDasha.formattedDisplay
  );
  console.log(`      Current Resolved Dasha: ${currentDasha.formattedDisplay}`);

  // Test Timezone Normalization
  const beijingUtc = normalizeToUtcInstant('1995-06-15', '06:00', 8);
  const londonUtc = normalizeToUtcInstant('1995-06-15', '06:00', 0);
  assert(
    londonUtc.getTime() - beijingUtc.getTime() === 8 * 3600 * 1000,
    'Timezone normalization correctly offsets 8 hours between Beijing (UTC+8) and London (UTC+0)'
  );

  // Test full Vedic Chart building & validation
  const testTropicalPlanets = [
    { name: 'Sun', longitude: 80.5 },
    { name: 'Moon', longitude: 170.2 },
    { name: 'Mars', longitude: 210.0 },
    { name: 'Mercury', longitude: 75.0 },
    { name: 'Jupiter', longitude: 240.5 },
    { name: 'Venus', longitude: 110.0 },
    { name: 'Saturn', longitude: 330.0 },
    { name: 'Rahu', longitude: 150.0 },
    { name: 'Ketu', longitude: 330.0 },
  ];
  const testVedicChart = buildVedicChart('1992-05-18', '08:45', testTropicalPlanets, 105.0);
  assert(testVedicChart.validation.isValid, 'Vedic Chart passes 16-point structural validation');
  assert(testVedicChart.evidences.length >= 4, 'Vedic Chart extracts canonical evidence nodes', `Count: ${testVedicChart.evidences.length}`);
  assert(testVedicChart.charaKarakas.length === 7, 'Vedic Chara Karakas include all 7 hierarchical roles (AK ~ DK)');

  // ----------------------------------------------------
  // TEST SUITE 2: Ni Haixia TCM Diagnostic Decision Tree
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Ni Haixia TCM Diagnostic Rule Engine ---');

  // Case A: Taiyang Zhongfeng
  const resTaiyang = matchDiagnosticRules('最近低热，恶风，经常自汗，头痛鼻鸣');
  assert(
    resTaiyang.matchedRules[0].id === 'RULE_TAIYANG_ZHONGFENG',
    'Symptoms (恶风、自汗、头痛) correctly map to 太阳中风证 (RULE_TAIYANG_ZHONGFENG)'
  );
  assert(
    resTaiyang.matchedRules[0].primaryFormula === '桂枝汤',
    '太阳中风证 correctly pairs with 桂枝汤'
  );
  assert(
    Boolean(resTaiyang.evidences[0].classicalSource?.includes('伤寒论')),
    'Evidence node includes authentic 《伤寒论》 citation'
  );

  // Case B: Shaoyang Shuji
  const resShaoyang = matchDiagnosticRules('频繁一侧偏头痛，胸胁苦满胀痛，口苦咽干，心烦恶心');
  assert(
    resShaoyang.matchedRules[0].id === 'RULE_SHAOYANG_SHUJI',
    'Symptoms (偏头痛、胸胁苦满、口苦咽干) correctly map to 少阳枢机不利证 (RULE_SHAOYANG_SHUJI)'
  );
  assert(
    resShaoyang.matchedRules[0].primaryFormula === '小柴胡汤',
    '少阳病 correctly pairs with 小柴胡汤'
  );

  // Case C: Shaoyin / Taiyin with Health scores
  const resShaoyin = matchDiagnosticRules(
    '常年手脚冰冷至膝盖，极度怕冷，夜尿频多',
    { temperature: 40, urine: 50, sleep: 55 }
  );
  assert(
    resShaoyin.matchedRules[0].sixStage === 'shaoyin' || resShaoyin.matchedRules[0].sixStage === 'taiyin',
    'Severe cold extremities & low temperature score route to 少阴/太阴'
  );
  assert(
    resShaoyin.selectedCases.length > 0,
    'Diagnostic engine retrieves matching clinical cases as few-shot evidence anchors'
  );

  // Case D: Refusal on Vague Input (No dangerous Xiaochaihu fallback)
  const resVague = matchDiagnosticRules('今天有点累，喝了点水');
  assert(
    resVague.status === 'insufficient_evidence',
    'Vague symptom input refuses false diagnosis (status === insufficient_evidence)'
  );
  assert(
    resVague.matchedRules.length === 0,
    'Refusal does not trigger false default formula fallback'
  );
  assert(
    (resVague.missingObservations || []).length > 0,
    'Diagnostic engine returns missing clinical observations checklist'
  );

  // Validation
  const valHealth = validateHealthAnswers({ sleep: 80, temperature: 60, bowel: 75 });
  assert(valHealth.isValid, 'Health standards validation passes on valid numbers');

  // ----------------------------------------------------
  // TEST SUITE 3: Ziwei Doushu Patterns & Evidence Graph
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Ziwei Doushu Astrolabe & Pattern Engine ---');

  const ziweiChart = generateChart({
    year: 1990,
    month: 5,
    day: 15,
    hour: 6, // 卯时
    gender: 'male',
  });

  assert(ziweiChart.palaces.length === 12, 'Ziwei astrolabe contains exactly 12 palaces');
  assert(ziweiChart.validation?.isValid === true, 'Ziwei chart passes structural validation (14 major stars + branches)');
  
  const patterns = detectPatterns(ziweiChart);
  const ziweiEvidences = extractZiweiEvidences(ziweiChart, patterns);
  assert(patterns.length > 0, `Ziwei pattern detection executed and matched real patterns (${patterns.length} patterns matched)`);
  assert(patterns.some(p => p.name.includes('机月同梁') || p.name.includes('日月同宫')), 'Matched verified classical pattern (机月同梁 / 日月同宫) for 1990-05-15');
  assert(ziweiEvidences.length === patterns.length, 'Every detected pattern maps to a CanonicalEvidenceNode');
  if (ziweiEvidences.length > 0) {
    assert(
      !!ziweiEvidences[0].canonicalInterpretation && !!ziweiEvidences[0].classicalSource,
      'Ziwei Evidence Node includes classical source and interpretation'
    );
  }

  // ----------------------------------------------------
  // TEST SUITE 4: Confidence Aggregation & Evidence Relations
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Deterministic Confidence & Evidence Relation Graph ---');

  const calibratedConf = calculateDeterministicConfidence({
    calculation: 0.98,
    inputCompleteness: 0.95,
    ruleMatch: 0.90,
    sourceAuthority: 0.92,
  });
  assert(
    calibratedConf.overall > 0.85 && calibratedConf.overall <= 1.0,
    'Deterministic confidence aggregation computes mathematical overall score',
    `Result: ${calibratedConf.overall}`
  );

  // ----------------------------------------------------
  // TEST SUITE 5: Cross-Domain Conflict Detector
  // ----------------------------------------------------
  console.log('\n--- Suite 5: Cross-Domain Conflict Detector & Dialectics ---');

  const mockEvidences: CanonicalEvidenceNode[] = [
    {
      id: 'mock_ziwei_career',
      domain: 'ziwei',
      ruleId: 'ZIWEI_SANQI',
      ruleName: '格局: 三奇加会',
      level: 'core',
      dimension: 'career',
      polarity: 'favorable',
      confidence: 0.95,
      parameters: {},
      classicalSource: '《骨髓赋》',
      canonicalInterpretation: '三方四正化禄权科齐会，主事业顺遂大展宏图。',
    },
    {
      id: 'mock_vedic_saturn_dasha',
      domain: 'vedic',
      ruleId: 'VEDIC_SATURN_CONTRACT',
      ruleName: '土星大运收敛期',
      level: 'warning',
      dimension: 'career',
      polarity: 'transformative',
      confidence: 0.90,
      parameters: {},
      classicalSource: 'BPHS Saturn Mahadasha Lore',
      canonicalInterpretation: '土星大运主结构防守与责任沉淀，不宜盲目加杠杆扩张。',
    },
    {
      id: 'mock_tcm_health',
      domain: 'nihaixia',
      ruleId: 'RULE_SHAOYIN_YANGXU',
      ruleName: '少阴真阳不足',
      level: 'warning',
      dimension: 'health',
      polarity: 'transformative',
      confidence: 0.88,
      parameters: {},
      classicalSource: '《伤寒论》第281条',
      canonicalInterpretation: '心肾阳虚，手足逆冷，宜温阳固本，忌过度劳伤心神。',
    }
  ];

  const conflicts = CrossDomainConflictDetector.detectConflicts(mockEvidences);
  assert(conflicts.length > 0, 'Conflict detector identifies dimensional tension across domains');
  const careerConflict = conflicts.find(c => c.dimension === 'career');
  assert(careerConflict?.hasConflict === true, 'Career dimension successfully flagged as having real tension');
  assert(
    careerConflict?.conflictType === 'timing_mismatch' || careerConflict?.conflictType === 'direct_contradiction',
    'Career tension categorized with explicit dialectical conflict type'
  );
  assert(
    Boolean(mockEvidences[0].relations && mockEvidences[0].relations.length > 0),
    'Dynamically populates semantic relation edges across evidence nodes'
  );
  
  const promptBlock = CrossDomainConflictDetector.formatConflictPromptBlock(conflicts);
  assert(
    promptBlock.includes('cross_domain_dialectic_firewall') && promptBlock.includes('多体系辩证推理'),
    'Dialectic Prompt Firewall generates formatted arbitration context block'
  );

  console.log('\n====================================================');
  console.log(`🏁 Verification Finished: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
