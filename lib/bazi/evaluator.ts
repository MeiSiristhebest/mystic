import { BirthContext, CanonicalEvidenceNode, DomainEvaluationResult } from '../contracts/types';
import { calculateDeterministicConfidence } from '../contracts/confidence';
import { BaziChart, BaziConvention } from './types';
import { calculateBaziCore } from './calculator';

export function evaluateBazi(
  context: BirthContext,
  conventionOptions?: Partial<BaziConvention>
): DomainEvaluationResult<BaziChart> {
  const core = calculateBaziCore(context, conventionOptions);

  const summaryTags: string[] = [
    `日主${core.dayMaster}`,
    `月透${core.tenGods.monthGan || '本气'}`,
    `年命${core.yearNaYin}`,
  ];

  const evidences: CanonicalEvidenceNode[] = [];

  // 1. Day Master Core Celestial Stem Fact (Deterministic Fact -> Dimension: Structural)
  const confDmFact = calculateDeterministicConfidence(
    {
      calculation: 1.0,
      inputCompleteness: 1.0,
      ruleMatch: 1.0,
      sourceAuthority: 0.95,
    },
    { evidenceType: 'deterministic_fact', sourceTier: 'secondary_lore' }
  );

  evidences.push({
    id: `bazi_daymaster_fact_${core.dayMaster}`,
    domain: 'bazi',
    ruleId: 'BAZI_DAY_MASTER_FACT',
    ruleName: `日元天干事实: ${core.dayMaster} (${core.dayMasterYinYang}${core.dayMasterElement})`,
    level: 'core',
    evidenceType: 'deterministic_fact',
    sourceTier: 'secondary_lore',
    dimension: 'structural',
    polarity: 'neutral',
    valence: 'neutral',
    dynamicMode: 'stable',
    confidence: confDmFact.overall,
    confidenceBreakdown: confDmFact,
    temporalScope: { scopeType: 'natal', isNatalBaseline: true },
    parameters: {
      dayMaster: core.dayMaster,
      element: core.dayMasterElement,
      yinYang: core.dayMasterYinYang,
      visibleElementDistribution: core.visibleElementDistribution,
      trueSolarTime: core.solarTimeDetails.trueSolarTime,
    },
    canonicalInterpretation: `命主日元为【${core.dayMaster}】（${core.dayMasterYinYang}${core.dayMasterElement}），为四柱八字之客观天干基准。显性干支分布：木${core.visibleElementDistribution.wood}、火${core.visibleElementDistribution.fire}、土${core.visibleElementDistribution.earth}、金${core.visibleElementDistribution.metal}、水${core.visibleElementDistribution.water}（注：仅为显性字符计数，非定局强弱）。`,
  });

  // 2. Day Master Classical Interpretation (Classical Lore -> Dimension: Personality)
  const confDmLore = calculateDeterministicConfidence(
    {
      calculation: 1.0,
      inputCompleteness: 1.0,
      ruleMatch: 0.90,
      sourceAuthority: 0.88,
    },
    { evidenceType: 'classical_interpretation', sourceTier: 'secondary_lore' }
  );

  evidences.push({
    id: `bazi_daymaster_lore_${core.dayMaster}`,
    domain: 'bazi',
    ruleId: 'BAZI_DAY_MASTER_LORE',
    ruleName: `日主性情阐释: ${core.dayMaster}`,
    level: 'support',
    evidenceType: 'classical_interpretation',
    sourceTier: 'secondary_lore',
    dimension: 'personality',
    polarity: 'neutral',
    valence: 'neutral',
    dynamicMode: 'stable',
    confidence: confDmLore.overall,
    confidenceBreakdown: confDmLore,
    temporalScope: { scopeType: 'natal', isNatalBaseline: true },
    parameters: {
      dayMaster: core.dayMaster,
    },
    classicalSource: '《滴天髓·论天干》',
    canonicalInterpretation: `《滴天髓》论【${core.dayMaster}】先天气质象意。日主代表个体认知滤镜与本能作风，吉凶由全局五行调候与格局搭配决定，本体并无吉凶偏向。`,
  });

  // 3. Month Pillar Ten God Signal (Derived Rule -> Dimension: Structural)
  const confTg = calculateDeterministicConfidence(
    {
      calculation: 1.0,
      inputCompleteness: 1.0,
      ruleMatch: 0.90,
      sourceAuthority: 0.85,
    },
    { evidenceType: 'derived_rule', sourceTier: 'secondary_lore' }
  );

  evidences.push({
    id: `bazi_month_tengod_${core.tenGods.monthGan || 'signal'}`,
    domain: 'bazi',
    ruleId: 'BAZI_TEN_GOD_SIGNAL',
    ruleName: `月令透干结构信号: ${core.tenGods.monthGan}`,
    level: 'core',
    evidenceType: 'derived_rule',
    sourceTier: 'secondary_lore',
    dimension: 'structural',
    polarity: 'neutral',
    valence: 'neutral',
    dynamicMode: 'stable',
    confidence: confTg.overall,
    confidenceBreakdown: confTg,
    temporalScope: { scopeType: 'natal', isNatalBaseline: true },
    parameters: {
      monthShiShen: core.tenGods.monthGan,
      yearShiShen: core.tenGods.yearGan,
      timeShiShen: core.tenGods.timeGan,
    },
    classicalSource: '《子平真诠·论月令》与《三命通会》',
    canonicalInterpretation: `月干透出【${core.tenGods.monthGan}】，构成八字结构信号之一。十神之用必须结合全局日干强弱、格局成败与用神喜忌综合推演，不作为单一维度的吉凶结论。`,
  });

  // 4. Na Yin Element (Heuristic Inference -> Tertiary Branch -> Optional / Capped)
  const confNy = calculateDeterministicConfidence(
    {
      calculation: 1.0,
      inputCompleteness: 1.0,
      ruleMatch: 0.80,
      sourceAuthority: 0.60,
    },
    { evidenceType: 'heuristic_inference', sourceTier: 'tertiary_branch' }
  );

  evidences.push({
    id: `bazi_nayin_${core.yearNaYin}`,
    domain: 'bazi',
    ruleId: 'BAZI_NAYIN_SIGNAL',
    ruleName: `年命纳音参考: ${core.yearNaYin}`,
    level: 'optional',
    evidenceType: 'heuristic_inference',
    sourceTier: 'tertiary_branch',
    dimension: 'health',
    polarity: 'neutral',
    valence: 'neutral',
    confidence: confNy.overall, // Hard capped <= 0.60
    confidenceBreakdown: confNy,
    temporalScope: { scopeType: 'natal', isNatalBaseline: true },
    parameters: {
      yearNaYin: core.yearNaYin,
      dayNaYin: core.dayNaYin,
    },
    classicalSource: '《五行精纪·纳音篇》',
    canonicalInterpretation: `年柱纳音为【${core.yearNaYin}】，日柱纳音为【${core.dayNaYin}】。纳音属于古代音律五行取象，仅作宏观文化隐喻与背景体感参照，绝不参与跨领域硬冲突判定。`,
  });

  const chart: BaziChart = {
    baziString: `${core.pillars.year}年 ${core.pillars.month}月 ${core.pillars.day}日 ${core.pillars.time}时`,
    lunarDateString: core.lunarDateString,
    pillars: core.pillars,
    yearGanZhi: core.pillars.year,
    monthGanZhi: core.pillars.month,
    dayGanZhi: core.pillars.day,
    timeGanZhi: core.pillars.time,
    yearNaYin: core.yearNaYin,
    monthNaYin: core.monthNaYin,
    dayNaYin: core.dayNaYin,
    timeNaYin: core.timeNaYin,
    dayMaster: core.dayMaster,
    dayMasterElement: core.dayMasterElement,
    dayMasterYinYang: core.dayMasterYinYang,
    visibleElementDistribution: core.visibleElementDistribution,
    hiddenStems: core.hiddenStems,
    tenGods: core.tenGods,
    timeContext: core.timeContext,
    solarTimeDetails: core.solarTimeDetails,
    calculationStatus: 'exact',
    calculationMethod: core.convention.useTrueSolarTime ? 'spencer_true_solar_iana' : 'civil_clock_iana',
    validation: core.validation,
    evidences,
    summaryTags,
  };

  return {
    domain: 'bazi',
    chart,
    validation: core.validation,
    evidences,
    summaryTags,
    calculatedAt: new Date().toISOString(),
  };
}
