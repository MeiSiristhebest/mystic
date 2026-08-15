import { VedicChart, VedicSynastryMatrix } from './types';
import { getNakshatraByDegree, NAKSHATRAS } from './nakshatras';

/**
 * 完整 36 分 Ashtakoota 吠陀合盘系统
 * 
 * 8 大维度 (Kutas):
 * 1. Varna (1分) - 性情与精神志向
 * 2. Vashya (2分) - 相互吸引与互控
 * 3. Tara (3分) - 命运顺遂度 (Dina Kuta)
 * 4. Yoni (4分) - 肉体契合与本能共鸣
 * 5. Graha Maitri (5分) - 月亮守护星星座友善度
 * 6. Gana (6分) - 性格气质 (神/人/魔)
 * 7. Bhakoot (7分) - 情感深层流动与福泽
 * 8. Nadi (8分) - 神经生理与子嗣健康
 */

export interface AshtakootaResult {
  totalScore: number; // 0 ~ 36
  maxScore: 36;
  isAcceptable: boolean; // >= 18 分
  kutas: {
    varna: { score: number; maxScore: 1; description: string };
    vashya: { score: number; maxScore: 2; description: string };
    tara: { score: number; maxScore: 3; description: string };
    yoni: { score: number; maxScore: 4; description: string };
    grahaMaitri: { score: number; maxScore: 5; description: string };
    gana: { score: number; maxScore: 6; description: string };
    bhakoot: { score: number; maxScore: 7; description: string; hasDosha: boolean };
    nadi: { score: number; maxScore: 8; description: string; hasDosha: boolean };
  };
  doshaCancellations: string[];
}

// ── 1. Varna (1分) ──
const SIGN_VARNA: Record<number, number> = {
  3: 4, 7: 4, 11: 4, // 巨蟹、天蝎、双鱼 (Brahmin = 4)
  0: 3, 4: 3, 8: 3,  // 白羊、狮子、射手 (Kshatriya = 3)
  1: 2, 5: 2, 9: 2,  // 金牛、处女、摩羯 (Vaishya = 2)
  2: 1, 6: 1, 10: 1, // 双子、天秤、水瓶 (Shudra = 1)
};

function calculateVarna(signA: number, signB: number): { score: number; description: string } {
  const vA = SIGN_VARNA[signA] || 1;
  const vB = SIGN_VARNA[signB] || 1;
  if (vA >= vB) {
    return { score: 1, description: '男方精神领悟或社会志向与女方高度和谐，互助相长（得 1 分）' };
  }
  return { score: 0, description: '双方精神重心略有差异，需在价值观念上多求同存异（得 0 分）' };
}

// ── 2. Vashya (2分) ──
function calculateVashya(signA: number, signB: number): { score: number; description: string } {
  const diff = Math.abs(signA - signB);
  if (diff === 0) return { score: 2, description: '同星座相吸相融，默契极佳（得 2 分）' };
  if ([4, 8, 2, 10].includes(diff)) return { score: 1.5, description: '三合或六合星座，相互吸引力自然适度（得 1.5 分）' };
  if (diff === 6) return { score: 1, description: '对宫互补互引，有神秘吸引力但也需调适（得 1 分）' };
  return { score: 0.5, description: '支配与被支配关系平淡，相处重在理性协议（得 0.5 分）' };
}

// ── 3. Tara (3分) ──
function calculateTara(nakIdxA: number, nakIdxB: number): { score: number; description: string } {
  const countFromA = ((nakIdxB - nakIdxA + 27) % 27) + 1;
  const countFromB = ((nakIdxA - nakIdxB + 27) % 27) + 1;
  const remA = countFromA % 9;
  const remB = countFromB % 9;
  const auspicious = [1, 2, 4, 6, 8, 0]; // Janma, Sampat, Kshema, Sadhaka, Mitra, Param Mitra

  const aGood = auspicious.includes(remA);
  const bGood = auspicious.includes(remB);

  if (aGood && bGood) return { score: 3, description: '双方星宿互为吉祥星宿 (Tara)，运势互旺，彼此带来福泽（得 3 分）' };
  if (aGood || bGood) return { score: 1.5, description: '单向吉利星宿，单方对另一方赋能较多（得 1.5 分）' };
  return { score: 0, description: '星宿跨度处于考验位，重要节点需共同协商防范波动（得 0 分）' };
}

// ── 4. Yoni (4分) ──
const NAKSHATRA_YONI_ANIMALS = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog', 'Cat', 'Sheep', 'Cat',
  'Rat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',
  'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse', 'Lion', 'Cow', 'Elephant'
];

const YONI_ENEMIES: Record<string, string> = {
  Horse: 'Buffalo', Buffalo: 'Horse',
  Elephant: 'Lion', Lion: 'Elephant',
  Sheep: 'Monkey', Monkey: 'Sheep',
  Serpent: 'Mongoose', Mongoose: 'Serpent',
  Dog: 'Deer', Deer: 'Dog',
  Cat: 'Rat', Rat: 'Cat',
  Cow: 'Tiger', Tiger: 'Cow',
};

function calculateYoni(nakIdxA: number, nakIdxB: number): { score: number; description: string } {
  const yA = NAKSHATRA_YONI_ANIMALS[nakIdxA] || 'Deer';
  const yB = NAKSHATRA_YONI_ANIMALS[nakIdxB] || 'Deer';

  if (yA === yB) return { score: 4, description: `双方同属【${yA}】本能图腾，天生身心默契，性灵共振极高（得 4 分）` };
  if (YONI_ENEMIES[yA] === yB) return { score: 0, description: `双方本能图腾属相克（${yA} vs ${yB}），日常相处偶有本能防御机制触发（得 0 分）` };
  return { score: 2.5, description: `图腾属中性和谐（${yA} 与 ${yB}），日常生活契合度良好（得 2.5 分）` };
}

// ── 5. Graha Maitri (5分) ──
const SIGN_LORDS: Record<number, string> = {
  0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun', 5: 'Mercury',
  6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
};

const PLANET_FRIENDSHIP: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] },
};

function calculateGrahaMaitri(signA: number, signB: number): { score: number; description: string } {
  const lA = SIGN_LORDS[signA];
  const lB = SIGN_LORDS[signB];
  if (lA === lB) return { score: 5, description: `月亮守护星同为【${lA}】，心智性格如出一辙，心灵沟通毫无障碍（得 5 分）` };

  const aFriends = PLANET_FRIENDSHIP[lA]?.friends || [];
  const aEnemies = PLANET_FRIENDSHIP[lA]?.enemies || [];
  const bFriends = PLANET_FRIENDSHIP[lB]?.friends || [];
  const bEnemies = PLANET_FRIENDSHIP[lB]?.enemies || [];

  const aLikesB = aFriends.includes(lB);
  const bLikesA = bFriends.includes(lA);
  const aHatesB = aEnemies.includes(lB);
  const bHatesA = bEnemies.includes(lA);

  if (aLikesB && bLikesA) return { score: 5, description: `守护星【${lA}】与【${lB}】为挚友星，双方心意相通、互相欣赏（得 5 分）` };
  if (!aHatesB && !bHatesA) return { score: 3.5, description: `守护星关系中性友善，心智理解良好（得 3.5 分）` };
  if (aHatesB && bHatesA) return { score: 0.5, description: `守护星性格有对立面，处理分歧需讲求方法（得 0.5 分）` };
  return { score: 2, description: `守护星一边示好一边保留，需保持耐心磨合（得 2 分）` };
}

// ── 6. Gana (6分) ──
const NAKSHATRA_GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2,
  2, 1, 1, 0, 2, 0, 2, 0, 2,
  2, 1, 1, 0, 2, 1, 0, 1, 0
];

function calculateGana(nakIdxA: number, nakIdxB: number): { score: number; description: string } {
  const gA = NAKSHATRA_GANA[nakIdxA] ?? 1;
  const gB = NAKSHATRA_GANA[nakIdxB] ?? 1;
  const ganaNames = ['神性 (Deva)', '人性 (Manushya)', '灵动性 (Rakshasa)'];

  if (gA === gB) return { score: 6, description: `双方同属【${ganaNames[gA]}】气质，性格频率完全同步（得 6 分）` };
  if ((gA === 0 && gB === 1) || (gA === 1 && gB === 0)) return { score: 5, description: `神性与人性结合，彼此包容性好（得 5 分）` };
  if ((gA === 1 && gB === 2) || (gA === 2 && gB === 1)) return { score: 1, description: `性格节奏有差异，一人务实一人敏感，需多沟通（得 1 分）` };
  return { score: 0, description: `气质两极化，遇事态度需寻找中间缓冲地带（得 0 分）` };
}

// ── 7. Bhakoot (7分) ──
function calculateBhakoot(signA: number, signB: number): { score: number; description: string; hasDosha: boolean } {
  const diff = ((signB - signA + 12) % 12) + 1;
  const is2_12 = diff === 2 || diff === 12;
  const is6_8 = diff === 6 || diff === 8;
  const is9_5 = diff === 5 || diff === 9;

  if (is2_12 || is6_8 || is9_5) {
    return {
      score: 0,
      description: `月亮星座处于【${diff}/${(14-diff)%12 || 12} 宫位轴线】，构成 Bhakoot 考验（需注意情绪与财务共振）（得 0 分）`,
      hasDosha: true,
    };
  }
  return {
    score: 7,
    description: `月亮星座位置吉祥（1/7、3/11、4/10 轴线），福泽深厚，情感流动顺畅（得 7 分）`,
    hasDosha: false,
  };
}

// ── 8. Nadi (8分) ──
const NAKSHATRA_NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2,
  2, 1, 0, 0, 1, 2, 2, 1, 0,
  0, 1, 2, 2, 1, 0, 0, 1, 2
];

function calculateNadi(nakIdxA: number, nakIdxB: number): { score: number; description: string; hasDosha: boolean } {
  const nA = NAKSHATRA_NADI[nakIdxA] ?? 0;
  const nB = NAKSHATRA_NADI[nakIdxB] ?? 0;
  const nadiNames = ['初脉 (Vata)', '中脉 (Pitta)', '终脉 (Kapha)'];

  if (nA !== nB) {
    return {
      score: 8,
      description: `双方属于不同脉相（${nadiNames[nA]} 与 ${nadiNames[nB]}），气场互补平衡，生理能量循环顺畅（得 8 分）`,
      hasDosha: false,
    };
  }
  return {
    score: 0,
    description: `双方同属【${nadiNames[nA]}】，构成 Nadi Dosha 考验，宜注重养生与情绪互补（得 0 分）`,
    hasDosha: true,
  };
}

/**
 * 完整 Ashtakoota 36分计算
 */
export function calculateAshtakoota(chartA: VedicChart, chartB: VedicChart): AshtakootaResult {
  const moonA = chartA.planets.find(p => p.name === 'Moon') || chartA.planets[0];
  const moonB = chartB.planets.find(p => p.name === 'Moon') || chartB.planets[0];

  const signA = Math.floor(moonA.longitude / 30) % 12;
  const signB = Math.floor(moonB.longitude / 30) % 12;

  const nakInfoA = getNakshatraByDegree(moonA.longitude);
  const nakInfoB = getNakshatraByDegree(moonB.longitude);

  const nakIdxA = nakInfoA.nakshatra.index - 1;
  const nakIdxB = nakInfoB.nakshatra.index - 1;

  const varna = calculateVarna(signA, signB);
  const vashya = calculateVashya(signA, signB);
  const tara = calculateTara(nakIdxA, nakIdxB);
  const yoni = calculateYoni(nakIdxA, nakIdxB);
  const grahaMaitri = calculateGrahaMaitri(signA, signB);
  const gana = calculateGana(nakIdxA, nakIdxB);
  const bhakoot = calculateBhakoot(signA, signB);
  const nadi = calculateNadi(nakIdxA, nakIdxB);

  const doshaCancellations: string[] = [];

  // Nadi Dosha Exception check:
  if (nadi.hasDosha) {
    if (nakIdxA === nakIdxB && nakInfoA.pada !== nakInfoB.pada) {
      doshaCancellations.push('【Nadi Dosha 化解】双方同宿不同 Pada，脉相冲击自然消解。');
    } else if (SIGN_LORDS[signA] === SIGN_LORDS[signB]) {
      doshaCancellations.push('【Nadi Dosha 化解】双方月亮星座守护星相同，主星吉力化解 Nadi 限制。');
    }
  }

  // Bhakoot Dosha Exception check:
  if (bhakoot.hasDosha) {
    if (SIGN_LORDS[signA] === SIGN_LORDS[signB] || grahaMaitri.score >= 4) {
      doshaCancellations.push('【Bhakoot Dosha 化解】月亮守护星互为挚友星，心智相投消除宫位摩擦。');
    }
  }

  const rawTotal = varna.score + vashya.score + tara.score + yoni.score + grahaMaitri.score + gana.score + bhakoot.score + nadi.score;
  const totalScore = Math.round(rawTotal * 10) / 10;

  return {
    totalScore,
    maxScore: 36,
    isAcceptable: totalScore >= 18,
    kutas: {
      varna: { ...varna, maxScore: 1 },
      vashya: { ...vashya, maxScore: 2 },
      tara: { ...tara, maxScore: 3 },
      yoni: { ...yoni, maxScore: 4 },
      grahaMaitri: { ...grahaMaitri, maxScore: 5 },
      gana: { ...gana, maxScore: 6 },
      bhakoot: { ...bhakoot, maxScore: 7 },
      nadi: { ...nadi, maxScore: 8 },
    },
    doshaCancellations,
  };
}

/**
 * Ashtakoota & Six-dimensional Vedic Synastry Engine
 */
export function calculateVedicSynastry(
  chartA: VedicChart,
  chartB: VedicChart,
  nameA = '命主 A',
  nameB = '命主 B'
): VedicSynastryMatrix {
  const ashtakoota = calculateAshtakoota(chartA, chartB);
  const moonA = chartA.planets.find(p => p.name === 'Moon') || chartA.planets[0];
  const moonB = chartB.planets.find(p => p.name === 'Moon') || chartB.planets[0];

  const nakA = chartA.moonNakshatra;
  const nakB = chartB.moonNakshatra;

  const moonSignDist = Math.abs(Math.floor(moonA.longitude / 30) - Math.floor(moonB.longitude / 30));
  
  let attractionScore = Math.round(50 + (ashtakoota.kutas.yoni.score / 4) * 25 + (ashtakoota.kutas.vashya.score / 2) * 25);
  let attractionLevel: VedicSynastryMatrix['attractionDynamics']['level'] = '强引力';
  if (attractionScore >= 80) attractionLevel = '强引力';
  else if (moonSignDist === 6) attractionLevel = '电磁张力';
  else if (attractionScore >= 65) attractionLevel = '中等共振';
  else attractionLevel = '平淡';

  const attractionText = `${ashtakoota.kutas.yoni.description} ${ashtakoota.kutas.vashya.description}`;

  let containmentScore = Math.round(40 + (ashtakoota.kutas.gana.score / 6) * 30 + (ashtakoota.kutas.nadi.score / 8) * 30);
  let frictionLevel: VedicSynastryMatrix['containmentCapacity']['frictionLevel'] = containmentScore >= 75 ? '低摩擦·舒适' : '磨合期长';
  const containmentText = `${ashtakoota.kutas.gana.description} ${ashtakoota.kutas.nadi.description}`;

  const akA = chartA.charaKarakas.find(k => k.role === 'AK');
  const akB = chartB.charaKarakas.find(k => k.role === 'AK');
  const valueScore = Math.round(50 + (ashtakoota.kutas.grahaMaitri.score / 5) * 30 + (ashtakoota.kutas.varna.score / 1) * 20);
  const valueText = `${ashtakoota.kutas.grahaMaitri.description} 双方灵魂指示星 (${akA?.planetCn} 与 ${akB?.planetCn}) 形成深度共振。`;

  const dashaA = chartA.currentDasha.mahaDasha;
  const dashaB = chartB.currentDasha.mahaDasha;
  const dashaText = `${nameA}当前正处于【${dashaA.planetCn}大运】，${nameB}正处于【${dashaB.planetCn}大运】。双方大运周期气场互补。`;

  const synthesizedAdvice = `【吠陀 Ashtakoota 36分综合评分：${ashtakoota.totalScore}/36 分 (${ashtakoota.isAcceptable ? '契合度达标' : '需重点磨合'})】${ashtakoota.doshaCancellations.join(' ')} 建议在日常相处中注重性格沟通与情绪共鸣。`;

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
      score: Math.min(98, Math.max(40, attractionScore)),
      level: attractionLevel,
      analysis: attractionText,
    },
    containmentCapacity: {
      score: Math.min(98, Math.max(40, containmentScore)),
      frictionLevel,
      analysis: containmentText,
    },
    valueAlignment: {
      score: Math.min(98, Math.max(40, valueScore)),
      direction: valueScore >= 75 ? '高度同频' : '互补型',
      analysis: valueText,
    },
    dashaTimingResonance: {
      periodA: `${dashaA.planetCn}大运`,
      periodB: `${dashaB.planetCn}大运`,
      resonance: '同步上升',
      analysis: dashaText,
    },
    ashtakootaHighlights: {
      nadiMatch: !ashtakoota.kutas.nadi.hasDosha,
      bhakootMatch: !ashtakoota.kutas.bhakoot.hasDosha,
      ganaMatch: ashtakoota.kutas.gana.score >= 5,
      yoniMatch: ashtakoota.kutas.yoni.score >= 2.5,
    },
    synthesizedAdvice,
  };
}
