/**
 * Traditional Chinese Bazi Heuristic Strength Scoring Engine (`mystic_quantitative_strength_v1`).
 * 
 * Note on Methodology:
 * This module implements a quantitative heuristic scoring model (0~100 pts) based on classical
 * principles of 得令 (Seasonality), 得地 (Rooting), and 得势 (Stem support).
 * It is designated as a derived heuristic ranking model rather than an absolute canon consensus.
 */

import { BaziPillars, DayMasterStrengthEvaluation, HiddenStem, StrengthModelConfig, DEFAULT_STRENGTH_MODEL_CONFIG } from './types';
import { STEM_ELEMENT_MAP } from './calculator';

export function evaluateDayMasterStrength(
  pillars: BaziPillars,
  dayMaster: string,
  dayMasterElement: '木' | '火' | '土' | '金' | '水',
  hiddenStems: HiddenStem[],
  config: StrengthModelConfig = DEFAULT_STRENGTH_MODEL_CONFIG
): DayMasterStrengthEvaluation {
  const monthBranch = pillars.month.charAt(1);

  // 1. 月令五行旺相休囚死
  const SEASONAL_STATE_MAP: Record<string, Record<'木' | '火' | '土' | '金' | '水', { state: '旺' | '相' | '休' | '囚' | '死'; scoreRatio: number }>> = {
    // 春 (寅卯月)
    寅: { 木: { state: '旺', scoreRatio: 1.0 }, 火: { state: '相', scoreRatio: 0.75 }, 水: { state: '休', scoreRatio: 0.375 }, 金: { state: '囚', scoreRatio: 0.125 }, 土: { state: '死', scoreRatio: 0.0 } },
    卯: { 木: { state: '旺', scoreRatio: 1.0 }, 火: { state: '相', scoreRatio: 0.75 }, 水: { state: '休', scoreRatio: 0.375 }, 金: { state: '囚', scoreRatio: 0.125 }, 土: { state: '死', scoreRatio: 0.0 } },
    // 夏 (巳午月)
    巳: { 火: { state: '旺', scoreRatio: 1.0 }, 土: { state: '相', scoreRatio: 0.75 }, 木: { state: '休', scoreRatio: 0.375 }, 水: { state: '囚', scoreRatio: 0.125 }, 金: { state: '死', scoreRatio: 0.0 } },
    午: { 火: { state: '旺', scoreRatio: 1.0 }, 土: { state: '相', scoreRatio: 0.75 }, 木: { state: '休', scoreRatio: 0.375 }, 水: { state: '囚', scoreRatio: 0.125 }, 金: { state: '死', scoreRatio: 0.0 } },
    // 秋 (申酉月)
    申: { 金: { state: '旺', scoreRatio: 1.0 }, 水: { state: '相', scoreRatio: 0.75 }, 土: { state: '休', scoreRatio: 0.375 }, 木: { state: '囚', scoreRatio: 0.125 }, 火: { state: '死', scoreRatio: 0.0 } },
    酉: { 金: { state: '旺', scoreRatio: 1.0 }, 水: { state: '相', scoreRatio: 0.75 }, 土: { state: '休', scoreRatio: 0.375 }, 木: { state: '囚', scoreRatio: 0.125 }, 火: { state: '死', scoreRatio: 0.0 } },
    // 冬 (亥子月)
    亥: { 水: { state: '旺', scoreRatio: 1.0 }, 木: { state: '相', scoreRatio: 0.75 }, 金: { state: '休', scoreRatio: 0.375 }, 火: { state: '囚', scoreRatio: 0.125 }, 土: { state: '死', scoreRatio: 0.0 } },
    子: { 水: { state: '旺', scoreRatio: 1.0 }, 木: { state: '相', scoreRatio: 0.75 }, 金: { state: '休', scoreRatio: 0.375 }, 火: { state: '囚', scoreRatio: 0.125 }, 土: { state: '死', scoreRatio: 0.0 } },
    // 四季土月 (辰戌丑未)
    辰: { 土: { state: '旺', scoreRatio: 1.0 }, 金: { state: '相', scoreRatio: 0.75 }, 火: { state: '休', scoreRatio: 0.375 }, 木: { state: '囚', scoreRatio: 0.125 }, 水: { state: '死', scoreRatio: 0.0 } },
    戌: { 土: { state: '旺', scoreRatio: 1.0 }, 金: { state: '相', scoreRatio: 0.75 }, 火: { state: '休', scoreRatio: 0.375 }, 木: { state: '囚', scoreRatio: 0.125 }, 水: { state: '死', scoreRatio: 0.0 } },
    丑: { 土: { state: '旺', scoreRatio: 1.0 }, 金: { state: '相', scoreRatio: 0.75 }, 火: { state: '休', scoreRatio: 0.375 }, 木: { state: '囚', scoreRatio: 0.125 }, 水: { state: '死', scoreRatio: 0.0 } },
    未: { 土: { state: '旺', scoreRatio: 1.0 }, 金: { state: '相', scoreRatio: 0.75 }, 火: { state: '休', scoreRatio: 0.375 }, 木: { state: '囚', scoreRatio: 0.125 }, 水: { state: '死', scoreRatio: 0.0 } },
  };

  const seasonEntry = (SEASONAL_STATE_MAP[monthBranch] || SEASONAL_STATE_MAP['寅'])[dayMasterElement];
  const deLing = seasonEntry.state === '旺' || seasonEntry.state === '相';
  const deLingScore = Math.round(config.deLingMax * seasonEntry.scoreRatio);

  // 2. 得地 (地支通根)
  const roots: DayMasterStrengthEvaluation['rooting']['roots'] = [];
  let rawDeDiScore = 0;

  for (const hs of hiddenStems) {
    for (const stemInfo of hs.stems) {
      if (stemInfo.element === dayMasterElement) {
        let rootScore = 4;
        if (stemInfo.role === 'major') rootScore = 14;
        else if (stemInfo.role === 'middle') rootScore = 7;

        roots.push({
          branch: hs.branch,
          stem: stemInfo.stem,
          role: stemInfo.role,
          element: stemInfo.element,
          score: rootScore,
        });
        rawDeDiScore += rootScore;
      }
    }
  }
  const deDiScore = Math.min(config.deDiMax, rawDeDiScore);
  const deDi = roots.length > 0;

  // 3. 得势 (天干生扶)
  let rawDeShiScore = 0;
  const otherStems = [
    { stem: pillars.year.charAt(0), weight: 0.8 },
    { stem: pillars.month.charAt(0), weight: 1.2 },
    { stem: pillars.time.charAt(0), weight: 1.0 },
  ];

  const isParentOf = (parentEl: string, childEl: string) => {
    return (parentEl === '木' && childEl === '火') ||
           (parentEl === '火' && childEl === '土') ||
           (parentEl === '土' && childEl === '金') ||
           (parentEl === '金' && childEl === '水') ||
           (parentEl === '水' && childEl === '木');
  };

  for (const s of otherStems) {
    const el = STEM_ELEMENT_MAP[s.stem]?.element;
    if (el === dayMasterElement) {
      rawDeShiScore += Math.round(8 * s.weight); // 比劫同气
    } else if (isParentOf(el, dayMasterElement)) {
      rawDeShiScore += Math.round(9 * s.weight); // 印星生身
    }
  }
  const deShiScore = Math.min(config.deShiMax, rawDeShiScore);

  const totalScore = deLingScore + deDiScore + deShiScore;

  // 4. 身强身弱与喜忌五行推导 (基于配置阈值)
  let overallState: DayMasterStrengthEvaluation['overallState'] = '中和平衡';
  const favoredElements: Array<'木' | '火' | '土' | '金' | '水'> = [];
  const unfavoredElements: Array<'木' | '火' | '土' | '金' | '水'> = [];

  const ALL_ELEMENTS: Array<'木' | '火' | '土' | '金' | '水'> = ['木', '火', '土', '金', '水'];
  
  const parentElement = ALL_ELEMENTS.find(e => isParentOf(e, dayMasterElement)) || '水';
  const peerElement = dayMasterElement;
  const childElement = ALL_ELEMENTS.find(e => isParentOf(dayMasterElement, e)) || '水';
  const officerElement = ALL_ELEMENTS.find(e => isParentOf(e, parentElement)) || '金';
  const wealthElement = ALL_ELEMENTS.find(e => isParentOf(childElement, e)) || '土';

  if (totalScore >= config.strongThreshold) {
    overallState = '身强';
    favoredElements.push(wealthElement, officerElement, childElement);
    unfavoredElements.push(parentElement, peerElement);
  } else if (totalScore <= config.weakThreshold) {
    if (totalScore <= config.followingCandidateThreshold && roots.length === 0) {
      overallState = '从格候选';
      favoredElements.push(wealthElement, officerElement, childElement);
      unfavoredElements.push(parentElement, peerElement);
    } else {
      overallState = '身弱';
      favoredElements.push(parentElement, peerElement);
      unfavoredElements.push(wealthElement, officerElement, childElement);
    }
  } else {
    overallState = '中和平衡';
    favoredElements.push(wealthElement, childElement);
    unfavoredElements.push(officerElement);
  }

  const academicRationale = `【${overallState}】（得分${totalScore}分，模型: mystic_quantitative_strength_v1）：月令处于【${seasonEntry.state}】位（得令${deLingScore}分）；通根${roots.length}处（得地${deDiScore}分）；天干印比生助（得势${deShiScore}分）。喜用参考：${favoredElements.join('、')}；忌仇参考：${unfavoredElements.join('、')}。`;

  return {
    modelName: 'mystic_quantitative_strength_v1',
    seasonality: {
      monthBranch,
      monthElement: STEM_ELEMENT_MAP[pillars.month.charAt(0)]?.element || '土',
      state: seasonEntry.state,
      deLing,
      description: `生于${monthBranch}月，五行处于${seasonEntry.state}位。`,
    },
    rooting: {
      rootCount: roots.length,
      roots,
      deDi,
    },
    scores: {
      deLingScore,
      deDiScore,
      deShiScore,
      totalScore,
    },
    overallState,
    favoredElements,
    unfavoredElements,
    academicRationale,
  };
}
