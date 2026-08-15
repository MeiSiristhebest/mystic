import { BirthContext, CanonicalEvidenceNode, DomainEvaluationResult } from '../contracts/types';
import { calculateDeterministicConfidence } from '../contracts/confidence';
import { BaziChart } from './types';
import { calculateBaziCore } from './calculator';

export function evaluateBazi(
  context: BirthContext,
  useTrueSolarTime: boolean = true
): DomainEvaluationResult<BaziChart> {
  const core = calculateBaziCore(context, useTrueSolarTime);

  const summaryTags: string[] = [
    `日主${core.dayMaster}`,
    `月透${core.tenGods.monthGan || '本气'}`,
    `年命${core.yearNaYin}`,
  ];

  const evidences: CanonicalEvidenceNode[] = [];

  // 1. Day Master Core Celestial Stem Fact (Deterministic Fact, Neutral Polarity)
  const confDm = calculateDeterministicConfidence(
    {
      calculation: 1.0,
      inputCompleteness: 1.0,
      ruleMatch: 0.95,
      sourceAuthority: 0.88,
    },
    { evidenceType: 'deterministic_fact', sourceTier: 'secondary_lore' }
  );

  evidences.push({
    id: `bazi_daymaster_${core.dayMaster}`,
    domain: 'bazi',
    ruleId: 'BAZI_DAY_MASTER',
    ruleName: `日主元神: ${core.dayMaster} (${core.dayMasterYinYang}${core.dayMasterElement})`,
    level: 'core',
    evidenceType: 'deterministic_fact',
    sourceTier: 'secondary_lore',
    dimension: 'personality',
    polarity: 'neutral', // Fact itself is not inherently favorable/unfavorable
    confidence: confDm.overall,
    confidenceBreakdown: confDm,
    temporalScope: { scopeType: 'natal' },
    parameters: {
      dayMaster: core.dayMaster,
      element: core.dayMasterElement,
      yinYang: core.dayMasterYinYang,
      visibleElementDistribution: core.visibleElementDistribution,
      trueSolarTime: core.solarTimeDetails.trueSolarTime,
    },
    classicalSource: '《滴天髓·论天干》',
    canonicalInterpretation: `命主日元为【${core.dayMaster}】（${core.dayMasterYinYang}${core.dayMasterElement}），为八字本命元神支柱。显性干支分布：木${core.visibleElementDistribution.wood}、火${core.visibleElementDistribution.fire}、土${core.visibleElementDistribution.earth}、金${core.visibleElementDistribution.metal}、水${core.visibleElementDistribution.water}（注：仅为显性字符计数，非定局强弱）。`,
  });

  // 2. Month Pillar Ten God Signal (Derived Rule, Neutral Polarity)
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
    ruleName: `月令透干信号: ${core.tenGods.monthGan}`,
    level: 'core',
    evidenceType: 'derived_rule',
    sourceTier: 'secondary_lore',
    dimension: 'career',
    polarity: 'neutral', // Ten gods cannot be labeled favorable/unfavorable without full pattern balance
    confidence: confTg.overall,
    confidenceBreakdown: confTg,
    temporalScope: { scopeType: 'natal' },
    parameters: {
      monthShiShen: core.tenGods.monthGan,
      yearShiShen: core.tenGods.yearGan,
      timeShiShen: core.tenGods.timeGan,
    },
    classicalSource: '《子平真诠·论月令》与《三命通会》',
    canonicalInterpretation: `月干透出【${core.tenGods.monthGan}】，反映命主外显社会功能与行为倾向。十神吉凶必须结合日主强弱、格局配合与喜忌制化综合判定，不可单凭名称预设立场。`,
  });

  // 3. Na Yin Element (Heuristic Inference, Tertiary Branch, Capped Confidence)
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
    ruleName: `年命纳音: ${core.yearNaYin}`,
    level: 'optional', // Tertiary branch evidence
    evidenceType: 'heuristic_inference',
    sourceTier: 'tertiary_branch',
    dimension: 'health',
    polarity: 'neutral',
    confidence: confNy.overall, // Hard capped <= 0.60
    confidenceBreakdown: confNy,
    temporalScope: { scopeType: 'natal' },
    parameters: {
      yearNaYin: core.yearNaYin,
      dayNaYin: core.dayNaYin,
    },
    classicalSource: '《五行精纪·纳音篇》',
    canonicalInterpretation: `年柱纳音为【${core.yearNaYin}】，日柱纳音为【${core.dayNaYin}】。纳音属于传统音律五行取象分支，作为气质体感之文化参照，不参与硬性跨领域矛盾判定。`,
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
    solarTimeDetails: core.solarTimeDetails,
    calculationStatus: 'exact',
    calculationMethod: useTrueSolarTime ? 'lunar_24_solar_terms_true_solar' : 'lunar_civil_standard',
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
