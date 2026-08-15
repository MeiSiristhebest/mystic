/**
 * Traditional Chinese Bazi Five-Element Seasonality & Day Master Strength Engine.
 * 
 * Implements rigorous 3-dimensional quantitative evaluation:
 * 1. 得令 (Seasonality / Monthly Command): 旺 / 相 / 休 / 囚 / 死 (0 ~ 40 pts)
 * 2. 得地 (Rooting / Earthly Support): Major / Middle / Minor roots in 4 branches (0 ~ 35 pts)
 * 3. 得势 (Protrusion & Heavenly Support): Stems peer and parent assistance (0 ~ 25 pts)
 * 
 * Determines authentic Day Master strength state (身强 / 身弱 / 中和平衡 / 从格倾向)
 * and outputs authoritative favorable (喜用) and unfavorable (忌仇) elements.
 */

import { BaziPillars, DayMasterStrengthEvaluation, HiddenStem } from './types';
import { STEM_ELEMENT_MAP } from './calculator';

export function evaluateDayMasterStrength(
  pillars: BaziPillars,
  dayMaster: string,
  dayMasterElement: '木' | '火' | '土' | '金' | '水',
  hiddenStems: HiddenStem[]
): DayMasterStrengthEvaluation {
  const monthBranch = pillars.month.charAt(1);

  // 1. 月令五行旺相休囚死
  const SEASONAL_STATE_MAP: Record<string, Record<'木' | '火' | '土' | '金' | '水', { state: '旺' | '相' | '休' | '囚' | '死'; score: number }>> = {
    // 春 (寅卯月)
    寅: { 木: { state: '旺', score: 40 }, 火: { state: '相', score: 30 }, 水: { state: '休', score: 15 }, 金: { state: '囚', score: 5 }, 土: { state: '死', score: 0 } },
    卯: { 木: { state: '旺', score: 40 }, 火: { state: '相', score: 30 }, 水: { state: '休', score: 15 }, 金: { state: '囚', score: 5 }, 土: { state: '死', score: 0 } },
    // 夏 (巳午月)
    巳: { 火: { state: '旺', score: 40 }, 土: { state: '相', score: 30 }, 木: { state: '休', score: 15 }, 水: { state: '囚', score: 5 }, 金: { state: '死', score: 0 } },
    午: { 火: { state: '旺', score: 40 }, 土: { state: '相', score: 30 }, 木: { state: '休', score: 15 }, 水: { state: '囚', score: 5 }, 金: { state: '死', score: 0 } },
    // 秋 (申酉月)
    申: { 金: { state: '旺', score: 40 }, 水: { state: '相', score: 30 }, 土: { state: '休', score: 15 }, 木: { state: '囚', score: 5 }, 火: { state: '死', score: 0 } },
    酉: { 金: { state: '旺', score: 40 }, 水: { state: '相', score: 30 }, 土: { state: '休', score: 15 }, 木: { state: '囚', score: 5 }, 火: { state: '死', score: 0 } },
    // 冬 (亥子月)
    亥: { 水: { state: '旺', score: 40 }, 木: { state: '相', score: 30 }, 金: { state: '休', score: 15 }, 火: { state: '囚', score: 5 }, 土: { state: '死', score: 0 } },
    子: { 水: { state: '旺', score: 40 }, 木: { state: '相', score: 30 }, 金: { state: '休', score: 15 }, 火: { state: '囚', score: 5 }, 土: { state: '死', score: 0 } },
    // 四季土月 (辰戌丑未)
    辰: { 土: { state: '旺', score: 40 }, 金: { state: '相', score: 30 }, 火: { state: '休', score: 15 }, 木: { state: '囚', score: 5 }, 水: { state: '死', score: 0 } },
    戌: { 土: { state: '旺', score: 40 }, 金: { state: '相', score: 30 }, 火: { state: '休', score: 15 }, 木: { state: '囚', score: 5 }, 水: { state: '死', score: 0 } },
    丑: { 土: { state: '旺', score: 40 }, 金: { state: '相', score: 30 }, 火: { state: '休', score: 15 }, 木: { state: '囚', score: 5 }, 水: { state: '死', score: 0 } },
    未: { 土: { state: '旺', score: 40 }, 金: { state: '相', score: 30 }, 火: { state: '休', score: 15 }, 木: { state: '囚', score: 5 }, 水: { state: '死', score: 0 } },
  };

  const seasonEntry = (SEASONAL_STATE_MAP[monthBranch] || SEASONAL_STATE_MAP['寅'])[dayMasterElement];
  const deLing = seasonEntry.state === '旺' || seasonEntry.state === '相';
  const deLingScore = seasonEntry.score;

  // 2. 得地 (地支通根)
  const roots: DayMasterStrengthEvaluation['rooting']['roots'] = [];
  let deDiScore = 0;

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
        deDiScore += rootScore;
      }
    }
  }
  deDiScore = Math.min(35, deDiScore);
  const deDi = roots.length > 0;

  // 3. 得势 (天干生扶)
  let deShiScore = 0;
  const otherStems = [pillars.year.charAt(0), pillars.month.charAt(0), pillars.time.charAt(0)];

  // Helper: Element parent check
  const isParentOf = (parentEl: string, childEl: string) => {
    return (parentEl === '木' && childEl === '火') ||
           (parentEl === '火' && childEl === '土') ||
           (parentEl === '土' && childEl === '金') ||
           (parentEl === '金' && childEl === '水') ||
           (parentEl === '水' && childEl === '木');
  };

  for (const s of otherStems) {
    const el = STEM_ELEMENT_MAP[s]?.element;
    if (el === dayMasterElement) {
      deShiScore += 8; // 比劫同气生扶
    } else if (isParentOf(el, dayMasterElement)) {
      deShiScore += 9; // 正印偏印生我
    }
  }
  deShiScore = Math.min(25, deShiScore);

  const totalScore = deLingScore + deDiScore + deShiScore;

  // 4. 身强身弱与喜忌五行推导
  let overallState: DayMasterStrengthEvaluation['overallState'] = '中和平衡';
  const favoredElements: Array<'木' | '火' | '土' | '金' | '水'> = [];
  const unfavoredElements: Array<'木' | '火' | '土' | '金' | '水'> = [];

  const ALL_ELEMENTS: Array<'木' | '火' | '土' | '金' | '水'> = ['木', '火', '土', '金', '水'];
  
  // 生日主的五行 (印) 与 同日主的五行 (比)
  const parentElement = ALL_ELEMENTS.find(e => isParentOf(e, dayMasterElement)) || '水';
  const peerElement = dayMasterElement;
  
  // 日主克的五行 (财), 克日主的五行 (官杀), 日主生的五行 (食伤)
  const childElement = ALL_ELEMENTS.find(e => isParentOf(dayMasterElement, e)) || '水';
  const officerElement = ALL_ELEMENTS.find(e => isParentOf(e, parentElement)) || '金'; // 克我
  const wealthElement = ALL_ELEMENTS.find(e => isParentOf(childElement, e)) || '土'; // 我克

  if (totalScore >= 52) {
    overallState = '身强';
    // 身强喜克泄耗 (财、官、食伤)
    favoredElements.push(wealthElement, officerElement, childElement);
    unfavoredElements.push(parentElement, peerElement);
  } else if (totalScore <= 40) {
    if (totalScore <= 15 && roots.length === 0) {
      overallState = '从格倾向';
      favoredElements.push(wealthElement, officerElement, childElement);
      unfavoredElements.push(parentElement, peerElement);
    } else {
      overallState = '身弱';
      // 身弱喜生扶 (印、比)
      favoredElements.push(parentElement, peerElement);
      unfavoredElements.push(wealthElement, officerElement, childElement);
    }
  } else {
    overallState = '中和平衡';
    favoredElements.push(wealthElement, childElement);
    unfavoredElements.push(officerElement);
  }

  const academicRationale = `日元【${dayMaster}】生于【${monthBranch}月】，月令司令处于【${seasonEntry.state}】位（得令${deLingScore}分）；四柱地支通根${roots.length}处（得地${deDiScore}分）；天干印比生助（得势${deShiScore}分）。总气机得分${totalScore}分，定局为【${overallState}】。喜用五行：${favoredElements.join('、')}；忌仇五行：${unfavoredElements.join('、')}。`;

  return {
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
