import { CanonicalEvidenceNode, BirthContext, DomainEvaluationResult } from '../contracts/types';
import { BaziChart, BaziConvention } from './types';
import { STEM_ELEMENT_MAP, BRANCH_ELEMENT_MAP } from './calculator';

export function extractBaziEvidences(
  chart: BaziChart,
  targetDate?: string
): CanonicalEvidenceNode[] {
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

  // 2. Day Master Classical Lore Interpretation (Neutral Personality Archetype)
  evidences.push({
    id: 'bazi_daymaster_lore',
    domain: 'bazi',
    ruleId: 'BAZI_DAY_MASTER_LORE',
    ruleName: `日主性情象意: ${chart.dayMaster}`,
    level: 'support',
    evidenceType: 'classical_interpretation',
    sourceTier: 'secondary_lore',
    dimension: 'personality',
    polarity: 'neutral',
    valence: 'neutral',
    dynamicMode: 'stable',
    confidence: 0.80,
    parameters: {
      dayMaster: chart.dayMaster,
    },
    classicalSource: '《滴天髓》论天干',
    canonicalInterpretation: `【${chart.dayMaster}】在传统子平象意中代表本五行先天禀赋心性特征。`,
    temporalScope: {
      scopeType: 'natal',
      isNatalBaseline: true,
      timeWindow: '终身个性基调',
    },
  });

  // 3. Day Master Heuristic Strength Evaluation (derived_model, not primary_canon)
  const strength = chart.strengthEvaluation;
  if (strength) {
    evidences.push({
      id: 'bazi_strength_eval',
      domain: 'bazi',
      ruleId: 'BAZI_STRENGTH_EVALUATION',
      ruleName: `命局气机强弱: ${strength.overallState}`,
      level: 'core',
      evidenceType: 'heuristic_inference',
      sourceTier: 'derived_model',
      dimension: 'structural',
      polarity: 'neutral',
      valence: 'neutral',
      dynamicMode: 'stable',
      // Confidence capped at 0.75: this is heuristic scoring (得令+得地+得势),
      // NOT the same as a full yongShen determination. Ignores 调候/格局/从格/病药.
      confidence: 0.75,
      parameters: {
        modelName: strength.modelName,
        overallState: strength.overallState,
        totalScore: strength.scores.totalScore,
        deLing: strength.seasonality.deLing,
        rootCount: strength.rooting.rootCount,
        // NOTE: favoredElements/unfavoredElements are heuristic baseline only.
        // They do NOT represent final 喜用神 conclusion. Adjustments for 调候/格局/从格 are not included.
        heuristicFavoredElements: strength.favoredElements,
        heuristicUnfavoredElements: strength.unfavoredElements,
        limitations: [
          '未考虑调候用神（寒暖燥湿）',
          '未考虑格局取用',
          '从格候选仍需进一步验证命局制化',
          '未纳入五行合化对旺衰的影响',
        ],
      },
      classicalSource: '《子平真诠》论月令得令，启发式量化模型 mystic_quantitative_strength_v1',
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
      evidenceType: 'classical_interpretation',
      sourceTier: 'secondary_lore',
      dimension: 'structural',
      polarity: 'neutral',
      valence: 'neutral',
      dynamicMode: 'stable',
      confidence: 0.82,
      parameters: {
        monthGan: chart.monthGanZhi.charAt(0),
        tenGod: chart.tenGods.monthGan,
        monthZhi: chart.monthGanZhi.charAt(1),
      },
      classicalSource: '《三命通会》卷五论十神',
      canonicalInterpretation: `月干透出【${chart.tenGods.monthGan}】，代表原局月柱青年期显露心性与社会互动风格。`,
      temporalScope: {
        scopeType: 'natal',
        isNatalBaseline: true,
        timeWindow: '月柱青年期与主导社会坐标',
      },
    });
  }

  // 5. Prioritized Branch Interactions (secondary_lore for the rule existence; derived_model for the weight)
  // Interaction ID uses stable key = type + normalized participants (not index-based).
  if (chart.interactions && chart.interactions.length > 0) {
    const significantInteractions = chart.interactions.filter(i => i.structuralWeight >= 5);
    const toInclude = significantInteractions.length > 0 ? significantInteractions : chart.interactions.slice(0, 4);

    toInclude.forEach((inter) => {
      // Stable ID: type + sorted participants (immune to re-ordering)
      const participantKey = [...inter.elementsInvolved].sort().join('_');
      const stableId = `bazi_interaction_${inter.type}_${participantKey}`;

      evidences.push({
        id: stableId,
        domain: 'bazi',
        ruleId: 'BAZI_BRANCH_INTERACTION',
        ruleName: inter.name,
        level: 'support',
        evidenceType: 'derived_rule',
        // The relation pattern itself is classical; the weight assignment is derived heuristic.
        sourceTier: 'secondary_lore',
        dimension: 'structural',
        polarity: 'neutral',
        valence: 'neutral',
        dynamicMode: 'transformative',
        // Confidence 0.82 for detected relationship presence; lower if transformation unestablished.
        confidence: inter.transformationEstablished ? 0.82 : 0.70,
        parameters: {
          type: inter.type,
          pillarsInvolved: inter.pillarsInvolved,
          elementsInvolved: inter.elementsInvolved,
          resultElement: inter.resultElement,
          transformationEstablished: inter.transformationEstablished,
          structuralWeight: inter.structuralWeight,
          // Explicit semantic layers
          presenceDetected: true,
          transformationCandidate: !!inter.resultElement && !inter.transformationEstablished,
        },
        classicalSource: '《三命通会》论支中刑冲会合',
        canonicalInterpretation: inter.description,
        temporalScope: {
          scopeType: 'natal',
          isNatalBaseline: true,
          timeWindow: '命局干支交互网络',
        },
      });
    });
  }

  // 6a. Active Da Yun — Deterministic Period Fact (what period we are in: exact calendar fact)
  // 6b. Active Da Yun — Heuristic Suitability (favorable/unfavorable: derived model)
  // queryDate comes ONLY from the explicit targetDate argument — never from any fallback string parsing.
  // If targetDate is absent, we do not generate suitability evidence (no silent fallback).
  if (chart.daYun && chart.daYun.periods.length > 0 && targetDate) {
    const activePeriod = chart.daYun.periods.find(
      p => targetDate >= p.startDate && targetDate < p.endDate
    );

    if (activePeriod) {
      // 6a: Deterministic fact — what Da Yun step we are in
      evidences.push({
        id: 'bazi_dayun_period_fact',
        domain: 'bazi',
        ruleId: 'BAZI_DAYUN_PERIOD_FACT',
        ruleName: `大运时域事实: 第${activePeriod.step}步【${activePeriod.ganZhi}】`,
        level: 'core',
        evidenceType: 'deterministic_fact',
        sourceTier: 'secondary_lore',   // 大运制度本身源自传统子平，计算为确定性算法
        dimension: 'timing',
        polarity: 'neutral',
        valence: 'neutral',
        dynamicMode: 'transformative',
        confidence: 0.95,  // High: calendar-based, deterministic once birth data is fixed
        parameters: {
          step: activePeriod.step,
          ganZhi: activePeriod.ganZhi,
          startDate: activePeriod.startDate,
          endDate: activePeriod.endDate,
          startAge: activePeriod.startAge,
          endAge: activePeriod.endAge,
          shiShen: activePeriod.shiShen,
          naYin: activePeriod.naYin,
          targetDate,
          provenanceNote: 'lunar_javascript_solar_arithmetic (leap-year safe)',
        },
        classicalSource: '《子平真诠》大运流年体系',
        canonicalInterpretation: `查询日期【${targetDate}】正值第${activePeriod.step}步大运【${activePeriod.ganZhi}】（${activePeriod.startDate} ~ ${activePeriod.endDate}，${activePeriod.startAge}~${activePeriod.endAge}岁），纳音为【${activePeriod.naYin}】。`,
        temporalScope: {
          scopeType: 'dasha',
          startDate: activePeriod.startDate,
          endDate: activePeriod.endDate,
          timeWindow: `${activePeriod.startDate} ~ ${activePeriod.endDate} (第${activePeriod.step}步大运)`,
        },
      });

      // 6b: Heuristic suitability — favorable/unfavorable assessment (derived model, low confidence)
      const dyGan = activePeriod.ganZhi.charAt(0);
      const dyZhi = activePeriod.ganZhi.charAt(1);
      const dyGanElement = STEM_ELEMENT_MAP[dyGan]?.element;
      const dyZhiElement = BRANCH_ELEMENT_MAP[dyZhi];
      const dyElements = [dyGanElement, dyZhiElement].filter(Boolean) as Array<'木' | '火' | '土' | '金' | '水'>;

      const hasFavored = dyElements.some(e => strength?.favoredElements.includes(e));
      const hasUnfavored = dyElements.some(e => strength?.unfavoredElements.includes(e));

      let dyPolarity: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
      let dyValence: 'positive' | 'negative' | 'neutral' = 'neutral';

      if (hasFavored && !hasUnfavored) {
        dyPolarity = 'favorable';
        dyValence = 'positive';
      } else if (hasUnfavored && !hasFavored) {
        dyPolarity = 'unfavorable';
        dyValence = 'negative';
      }

      evidences.push({
        id: 'bazi_dayun_suitability_heuristic',
        domain: 'bazi',
        ruleId: 'BAZI_DAYUN_SUITABILITY',
        ruleName: `大运喜忌启发式判断: 【${activePeriod.ganZhi}】对本命`,
        level: 'support',
        evidenceType: 'heuristic_inference',
        sourceTier: 'derived_model',
        dimension: 'career',
        polarity: dyPolarity,
        valence: dyValence,
        dynamicMode: 'transformative',
        // Confidence capped at 0.65: only stem+branch main qi evaluated; hidden stems not included.
        confidence: 0.65,
        parameters: {
          step: activePeriod.step,
          ganZhi: activePeriod.ganZhi,
          stemElement: dyGanElement,
          branchMainQiElement: dyZhiElement,
          // hiddenStemContribution: NOT evaluated in this model version
          hasFavored,
          hasUnfavored,
          limitations: [
            '仅评估天干五行与地支本气，未纳入地支藏干',
            '未考虑大运干支与命局的合冲交互',
            '当天干为喜、地支为忌时取中性（五五开）',
            '喜忌来源于 mystic_heuristic_v1 旺衰模型，非最终用神结论',
          ],
        },
        classicalSource: '《子平真诠》论行运得失，启发式五行吉凶模型',
        canonicalInterpretation: `大运【${activePeriod.ganZhi}】天干${dyGan}属${dyGanElement}，地支${dyZhi}本气属${dyZhiElement}。基于旺衰模型喜忌参考，综合效价为【${dyPolarity}】。注：此为启发式基线判断，未考虑地支藏干与大运命局交互。`,
        temporalScope: {
          scopeType: 'dasha',
          startDate: activePeriod.startDate,
          endDate: activePeriod.endDate,
          timeWindow: `${activePeriod.startDate} ~ ${activePeriod.endDate} (第${activePeriod.step}步大运)`,
        },
      });
    }
    // If targetDate is outside all Da Yun ranges (pre-start or post-end), no evidence is generated.
    // This is intentional — no silent fallback to period[0].
  }

  // 7. NaYin Heuristic Inference (Tertiary lore capped at 0.55)
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
  context: BirthContext,
  conventionOptions?: Partial<BaziConvention>,
  targetDate?: string  // Sole canonical source for query date; NOT read from BirthContext
): DomainEvaluationResult<BaziChart> {
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
    calculationProvenance: core.calculationProvenance,
    validation: core.validation,
    evidences: [],
    summaryTags: [
      `日主${core.dayMaster}`,
      `月令${core.strengthEvaluation.seasonality.monthBranch}(${core.strengthEvaluation.seasonality.state})`,
      core.strengthEvaluation.overallState,
      `大运${core.daYun.direction}`,
    ],
  };

  // targetDate comes solely from the function argument — BirthContext has no query date.
  const evidences = extractBaziEvidences(baziChart, targetDate);
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
