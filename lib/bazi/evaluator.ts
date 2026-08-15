import { CanonicalEvidenceNode } from '../contracts/types';
import { BaziChart } from './types';

export function extractBaziEvidences(chart: BaziChart): CanonicalEvidenceNode[] {
  const evidences: CanonicalEvidenceNode[] = [];

  // 1. Day Master Deterministic Fact (Decontaminated Fact Node)
  evidences.push({
    id: 'bazi_daymaster_fact',
    domain: 'bazi',
    ruleId: 'BAZI_DAY_MASTER_FACT',
    ruleName: `日元天干: ${chart.dayMaster}`,
    level: 'core',
    evidenceType: 'deterministic_fact',
    sourceTier: 'primary_canon',
    dimension: 'structural',
    polarity: 'neutral',
    valence: 'neutral',
    dynamicMode: 'stable',
    confidence: 1.0,
    parameters: {
      dayMaster: chart.dayMaster,
      element: chart.dayMasterElement,
      yinYang: chart.dayMasterYinYang,
      dayGanZhi: chart.dayGanZhi,
    },
    classicalSource: '《渊海子平》论日主',
    canonicalInterpretation: `命局核心日干为【${chart.dayMaster}】（${chart.dayMasterYinYang}${chart.dayMasterElement}），为全盘气机推演基准。`,
    temporalScope: {
      scopeType: 'natal',
      isNatalBaseline: true,
      timeWindow: '终身本命基准',
    },
  });

  // 2. Day Master Classical Lore Interpretation
  evidences.push({
    id: 'bazi_daymaster_lore',
    domain: 'bazi',
    ruleId: 'BAZI_DAY_MASTER_LORE',
    ruleName: `日主性情象意: ${chart.dayMaster}`,
    level: 'support',
    evidenceType: 'classical_interpretation',
    sourceTier: 'secondary_lore',
    dimension: 'personality',
    polarity: 'favorable',
    valence: 'positive',
    dynamicMode: 'stable',
    confidence: 0.85,
    parameters: {
      dayMaster: chart.dayMaster,
    },
    classicalSource: '《滴天髓》论天干',
    canonicalInterpretation: `【${chart.dayMaster}】禀性刚健，具有本五行核心志向与禀赋特征。`,
    temporalScope: {
      scopeType: 'natal',
      isNatalBaseline: true,
      timeWindow: '终身个性基调',
    },
  });

  // 3. Day Master Seasonality & Strength Evaluation
  const strength = chart.strengthEvaluation;
  if (strength) {
    evidences.push({
      id: 'bazi_strength_eval',
      domain: 'bazi',
      ruleId: 'BAZI_STRENGTH_EVALUATION',
      ruleName: `命局气机强弱: ${strength.overallState}`,
      level: 'core',
      evidenceType: 'derived_rule',
      sourceTier: 'primary_canon',
      dimension: 'structural',
      polarity: 'neutral',
      valence: 'neutral',
      dynamicMode: 'stable',
      confidence: 0.92,
      parameters: {
        overallState: strength.overallState,
        totalScore: strength.scores.totalScore,
        deLing: strength.seasonality.deLing,
        rootCount: strength.rooting.rootCount,
        favoredElements: strength.favoredElements,
        unfavoredElements: strength.unfavoredElements,
      },
      classicalSource: '《子平真诠》论月令用神与得地得势',
      canonicalInterpretation: strength.academicRationale,
      temporalScope: {
        scopeType: 'natal',
        isNatalBaseline: true,
        timeWindow: '本命格局结构气势',
      },
    });
  }

  // 4. Ten God Month Pillar Structural Signal
  if (chart.tenGods && chart.tenGods.monthGan) {
    evidences.push({
      id: 'bazi_month_tengod_signal',
      domain: 'bazi',
      ruleId: 'BAZI_TEN_GOD_SIGNAL',
      ruleName: `月干十神: ${chart.tenGods.monthGan}`,
      level: 'support',
      evidenceType: 'derived_rule',
      sourceTier: 'primary_canon',
      dimension: 'structural',
      polarity: 'neutral',
      valence: 'neutral',
      dynamicMode: 'stable',
      confidence: 0.88,
      parameters: {
        monthGan: chart.monthGanZhi.charAt(0),
        tenGod: chart.tenGods.monthGan,
        monthZhi: chart.monthGanZhi.charAt(1),
      },
      classicalSource: '《三命通会》卷五论十神',
      canonicalInterpretation: `月干透出【${chart.tenGods.monthGan}】，主导青年期外显心性与社会互动风格。`,
      temporalScope: {
        scopeType: 'natal',
        isNatalBaseline: true,
        timeWindow: '月柱青年期与主导社会坐标',
      },
    });
  }

  // 5. Branch Interactions (合冲刑害)
  if (chart.interactions && chart.interactions.length > 0) {
    chart.interactions.slice(0, 3).forEach((inter, idx) => {
      evidences.push({
        id: `bazi_interaction_${idx + 1}`,
        domain: 'bazi',
        ruleId: 'BAZI_BRANCH_INTERACTION',
        ruleName: inter.name,
        level: 'support',
        evidenceType: 'derived_rule',
        sourceTier: 'primary_canon',
        dimension: 'structural',
        polarity: inter.type.includes('clash') || inter.type.includes('punishment') || inter.type.includes('harm') ? 'unfavorable' : 'favorable',
        valence: inter.type.includes('clash') || inter.type.includes('punishment') || inter.type.includes('harm') ? 'negative' : 'positive',
        dynamicMode: 'transformative',
        confidence: 0.90,
        parameters: {
          type: inter.type,
          pillarsInvolved: inter.pillarsInvolved,
          elementsInvolved: inter.elementsInvolved,
          resultElement: inter.resultElement,
        },
        classicalSource: '《三命通会》论支中刑冲破害',
        canonicalInterpretation: inter.description,
        temporalScope: {
          scopeType: 'natal',
          isNatalBaseline: true,
          timeWindow: '命局地支交互网络',
        },
      });
    });
  }

  // 6. Active Da Yun Dynamic Temporal Evidence
  if (chart.daYun && chart.daYun.periods.length > 0) {
    const currentYear = new Date().getFullYear();
    const activePeriod = chart.daYun.periods.find(p => currentYear >= p.startYear && currentYear <= p.endYear) || chart.daYun.periods[0];

    if (activePeriod) {
      const isFavored = strength?.favoredElements.some(e => activePeriod.ganZhi.includes(e));
      evidences.push({
        id: 'bazi_dayun_active',
        domain: 'bazi',
        ruleId: 'BAZI_DAYUN_ACTIVE',
        ruleName: `大运时域: 第${activePeriod.step}步【${activePeriod.ganZhi}】(${activePeriod.shiShen})`,
        level: 'core',
        evidenceType: 'derived_rule',
        sourceTier: 'primary_canon',
        dimension: 'career',
        polarity: isFavored ? 'favorable' : 'unfavorable',
        valence: isFavored ? 'positive' : 'negative',
        dynamicMode: 'transformative',
        confidence: 0.90,
        parameters: {
          step: activePeriod.step,
          ganZhi: activePeriod.ganZhi,
          startAge: activePeriod.startAge,
          endAge: activePeriod.endAge,
          shiShen: activePeriod.shiShen,
          naYin: activePeriod.naYin,
        },
        classicalSource: '《子平真诠》论行运得失',
        canonicalInterpretation: `当前行【${activePeriod.ganZhi}】大运（${activePeriod.startAge}~${activePeriod.endAge}岁），天干主气为【${activePeriod.shiShen}】，纳音为【${activePeriod.naYin}】。`,
        temporalScope: {
          scopeType: 'dasha',
          startDate: activePeriod.startDate,
          endDate: activePeriod.endDate,
          timeWindow: `${activePeriod.startYear}~${activePeriod.endYear} (第${activePeriod.step}步大运)`,
        },
      });
    }
  }

  // 7. NaYin Heuristic Inference (Tertiary lore capped at 0.60)
  if (chart.yearNaYin) {
    evidences.push({
      id: 'bazi_nayin_signal',
      domain: 'bazi',
      ruleId: 'BAZI_NAYIN_SIGNAL',
      ruleName: `年柱纳音: ${chart.yearNaYin}`,
      level: 'optional',
      evidenceType: 'heuristic_inference',
      sourceTier: 'tertiary_branch',
      dimension: 'health',
      polarity: 'neutral',
      valence: 'neutral',
      dynamicMode: 'stable',
      confidence: 0.55,
      parameters: {
        yearNaYin: chart.yearNaYin,
      },
      classicalSource: '《兰台妙选》卷上',
      canonicalInterpretation: `年柱本命纳音五行属【${chart.yearNaYin}】，用于音律气象参考。`,
      temporalScope: {
        scopeType: 'natal',
        isNatalBaseline: true,
        timeWindow: '纳音先天音律基底',
      },
    });
  }

  return evidences;
}

export function evaluateBazi(
  context: import('../contracts/types').BirthContext,
  conventionOptions?: Partial<import('./types').BaziConvention>
): import('../contracts/types').DomainEvaluationResult<BaziChart> {
  const { calculateBaziCore } = require('./calculator');
  const core = calculateBaziCore(context, conventionOptions);

  const baziChart: BaziChart = {
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
    interactions: core.interactions,
    strengthEvaluation: core.strengthEvaluation,
    daYun: core.daYun,
    timeContext: core.timeContext,
    solarTimeDetails: core.solarTimeDetails,
    calculationStatus: 'exact',
    calculationMethod: 'lunar_javascript_astronomical_eot',
    validation: core.validation,
    evidences: [],
    summaryTags: [
      `日主${core.dayMaster}`,
      `月令${core.strengthEvaluation.seasonality.monthBranch}(${core.strengthEvaluation.seasonality.state})`,
      core.strengthEvaluation.overallState,
      `大运${core.daYun.direction}`,
    ],
  };

  const evidences = extractBaziEvidences(baziChart);
  baziChart.evidences = evidences;

  return {
    domain: 'bazi',
    chart: baziChart,
    evidences,
    validation: core.validation,
    summaryTags: baziChart.summaryTags,
    calculatedAt: new Date().toISOString(),
  };
}

