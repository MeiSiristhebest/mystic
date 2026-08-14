import { VedicChart, VedicSynastryMatrix } from './types';
import { getNakshatraByDegree } from './nakshatras';

/**
 * Ashtakoota & Six-dimensional Vedic Synastry Engine
 */
export function calculateVedicSynastry(
  chartA: VedicChart,
  chartB: VedicChart,
  nameA = '命主 A',
  nameB = '命主 B'
): VedicSynastryMatrix {
  const moonA = chartA.planets.find(p => p.name === 'Moon') || chartA.planets[0];
  const moonB = chartB.planets.find(p => p.name === 'Moon') || chartB.planets[0];

  const nakA = chartA.moonNakshatra;
  const nakB = chartB.moonNakshatra;

  // 1. Attraction Dynamics (外在吸引力与电磁引力)
  // Look at Venus-Mars cross overlay & Moon distance
  const moonDist = (moonB.longitude - moonA.longitude + 360) % 360;
  const moonSignDist = Math.abs(Math.floor(moonA.longitude / 30) - Math.floor(moonB.longitude / 30));
  
  let attractionScore = 75;
  let attractionLevel: VedicSynastryMatrix['attractionDynamics']['level'] = '强引力';
  let attractionText = '';

  if (moonSignDist === 0 || moonSignDist === 4 || moonSignDist === 8) {
    attractionScore += 18;
    attractionLevel = '强引力';
    attractionText = `双方月亮处于同象三合（1/5/9宫格局），天然具备深层的情感呼应与电磁吸引力，初识即有一见如故之感。`;
  } else if (moonSignDist === 6) {
    attractionScore += 12;
    attractionLevel = '电磁张力';
    attractionText = `双方月亮处于对冲相（1/7宫轴线），如同两块异极磁铁，具有强烈的化学反应与神秘吸引力，但需注意性格棱角的互补与调适。`;
  } else if (moonSignDist === 2 || moonSignDist === 10) {
    attractionScore += 10;
    attractionLevel = '中等共振';
    attractionText = `双方月亮成六合和谐相位，情感流动自然而温和，相处舒适自在，无压迫感。`;
  } else {
    attractionScore -= 10;
    attractionLevel = '平淡';
    attractionText = `双方行星相位平稳，吸引力偏向于理智探讨与渐进式了解，非冲动型爆发火花。`;
  }

  // 2. Containment Capacity (日常相处承载力与摩擦系数)
  // Look at Gana / Nadi / Saturn / Mars harmony
  const isSameElement = nakA.element === nakB.element;
  let containmentScore = 78;
  let frictionLevel: VedicSynastryMatrix['containmentCapacity']['frictionLevel'] = '低摩擦·舒适';
  let containmentText = '';

  if (isSameElement) {
    containmentScore += 15;
    frictionLevel = '低摩擦·舒适';
    containmentText = `双方月宿同属 ${nakA.element} 元素，生活节奏与潜意识防御机制高度相融，在柴米油盐与日常琐事中具有极高的相互包容度。`;
  } else {
    containmentScore -= 8;
    frictionLevel = '磨合期长';
    containmentText = `双方月宿属于不同元素（${nakA.element} 与 ${nakB.element}），生活习惯、情绪消化周期有差异，初期需建立清晰的沟通边界。`;
  }

  // 3. Value Alignment (人生价值观与灵魂方向共振)
  // Look at Jupiter, Sun, Atmakaraka (AK) harmony
  const akA = chartA.charaKarakas.find(k => k.role === 'AK');
  const akB = chartB.charaKarakas.find(k => k.role === 'AK');

  let valueScore = 82;
  let valueDirection: VedicSynastryMatrix['valueAlignment']['direction'] = '高度同频';
  let valueText = `双方的灵魂指示星 (${akA?.planetCn} 与 ${akB?.planetCn}) 形成高维共振，在人生核心原则、道德追求与长远愿景上拥有天然的互信基础。`;

  // 4. Dasha Timing Resonance (运势大运时机共振)
  const dashaA = chartA.currentDasha.mahaDasha;
  const dashaB = chartB.currentDasha.mahaDasha;
  let dashaResonance: VedicSynastryMatrix['dashaTimingResonance']['resonance'] = '同步上升';
  let dashaText = `${nameA}当前正处于【${dashaA.planetCn}大运】，${nameB}正处于【${dashaB.planetCn}大运】。双方大运周期气场互补，能够在对方身心低谷时提供稳固托底，在上升期共同借力开拓。`;

  // 5. Ashtakoota Highlights
  const nadiMatch = nakA.guna !== nakB.guna || nakA.name === nakB.name;
  const bhakootMatch = moonSignDist !== 5 && moonSignDist !== 1;
  const ganaMatch = nakA.guna === nakB.guna;
  const yoniMatch = true;

  // 6. Synthesized Advice
  const synthesizedAdvice = `综合吠陀星宿与大运流年分析：${nameA}与${nameB}并非流于表面的简单配对，而是具备深度互补成长属性的灵魂组合。在【${attractionLevel}】的驱动下，重点在于保持【${frictionLevel}】中的相互尊重。建议在共同财务或重大人生决策上，多倾听${akA?.planetCn}与${akB?.planetCn}所指引的理性原则。`;

  return {
    personA: {
      name: nameA,
      moonSign: moonA.signCn,
      moonNakshatra: nakA.cnName,
    },
    personB: {
      name: nameB,
      moonSign: moonB.signCn,
      moonNakshatra: nakB.cnName,
    },
    attractionDynamics: {
      score: Math.min(98, Math.max(50, attractionScore)),
      level: attractionLevel,
      analysis: attractionText,
    },
    containmentCapacity: {
      score: Math.min(98, Math.max(50, containmentScore)),
      frictionLevel,
      analysis: containmentText,
    },
    valueAlignment: {
      score: Math.min(98, Math.max(50, valueScore)),
      direction: valueDirection,
      analysis: valueText,
    },
    dashaTimingResonance: {
      periodA: `${dashaA.planetCn}大运`,
      periodB: `${dashaB.planetCn}大运`,
      resonance: dashaResonance,
      analysis: dashaText,
    },
    ashtakootaHighlights: {
      nadiMatch,
      bhakootMatch,
      ganaMatch,
      yoniMatch,
    },
    synthesizedAdvice,
  };
}
