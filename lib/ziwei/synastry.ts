import { ZiweiChart, Star, SiHua } from './types';

export interface ZiweiSynastryAspect {
  aspectType: 'ming_gong_harmony' | 'fuqi_resonance' | 'sihua_crossover' | 'star_complementarity';
  title: string;
  score: number; // 0 ~ 100
  level: 'highly_harmonious' | 'complementary' | 'challenging' | 'neutral';
  description: string;
}

export interface ZiweiSynastryResult {
  personA: {
    name: string;
    mingGongBranch: string;
    mingGongMajorStars: string[];
    fuqiMajorStars: string[];
  };
  personB: {
    name: string;
    mingGongBranch: string;
    mingGongMajorStars: string[];
    fuqiMajorStars: string[];
  };
  overallCompatibilityScore: number; // 0 ~ 100
  compatibilityLevel: '天作之合' | '良缘默契' | '互补磨合' | '需多包容';
  aspects: ZiweiSynastryAspect[];
  sihuaFlyoverDetails: string[];
  synthesisAdvice: string;
}

const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 主星五行属性映射
const STAR_ELEMENTS: Record<string, '木' | '火' | '土' | '金' | '水'> = {
  紫微: '土', 天机: '木', 太阳: '火', 武曲: '金', 天同: '水', 廉贞: '火',
  天府: '土', 太阴: '水', 贪狼: '木', 巨门: '水', 天相: '水', 天梁: '土',
  七杀: '金', 破军: '水',
};

const ELEMENT_RELATIONS: Record<string, Record<string, number>> = {
  木: { 木: 85, 火: 95, 土: 70, 金: 60, 水: 90 },
  火: { 木: 95, 火: 80, 土: 90, 金: 65, 水: 55 },
  土: { 木: 65, 火: 90, 土: 85, 金: 95, 水: 70 },
  金: { 木: 60, 火: 65, 土: 95, 金: 80, 水: 95 },
  水: { 木: 90, 火: 55, 土: 70, 金: 95, 水: 85 },
};

/**
 * 确定性紫微双人合盘引擎
 */
export function calculateZiweiSynastry(
  chartA: ZiweiChart,
  chartB: ZiweiChart,
  nameA = '命主 A',
  nameB = '命主 B'
): ZiweiSynastryResult {
  const mingA = chartA.palaces.find(p => p.branch === chartA.mingGongBranch);
  const mingB = chartB.palaces.find(p => p.branch === chartB.mingGongBranch);
  const fuqiA = chartA.palaces.find(p => p.name === '夫妻');
  const fuqiB = chartB.palaces.find(p => p.name === '夫妻');

  const starsA = mingA?.stars.filter(s => s.type === 'major').map(s => s.name) || ['空宫'];
  const starsB = mingB?.stars.filter(s => s.type === 'major').map(s => s.name) || ['空宫'];
  const fuqiStarsA = fuqiA?.stars.filter(s => s.type === 'major').map(s => s.name) || ['空宫'];
  const fuqiStarsB = fuqiB?.stars.filter(s => s.type === 'major').map(s => s.name) || ['空宫'];

  const aspects: ZiweiSynastryAspect[] = [];
  const sihuaFlyovers: string[] = [];

  // 1. 命宫主星五行生克与气质共鸣
  const elemA = STAR_ELEMENTS[starsA[0]] || '土';
  const elemB = STAR_ELEMENTS[starsB[0]] || '土';
  const mingScore = ELEMENT_RELATIONS[elemA]?.[elemB] ?? 80;

  aspects.push({
    aspectType: 'ming_gong_harmony',
    title: '命宫主星气质共鸣',
    score: mingScore,
    level: mingScore >= 85 ? 'highly_harmonious' : mingScore >= 70 ? 'complementary' : 'challenging',
    description: `${nameA}命宫主星【${starsA.join('、')}】（五行属${elemA}），${nameB}命宫主星【${starsB.join('、')}】（五行属${elemB}）。两星五行互动呈现${elemA === elemB ? '同气相求、默契天然' : '生化有情、互补助益'}特质。`,
  });

  // 2. 夫妻宫与对方命宫星曜投射 (投射相符度)
  const aWantsB = fuqiStarsA.some(s => starsB.includes(s)) || (fuqiStarsA.length === 0);
  const bWantsA = fuqiStarsB.some(s => starsA.includes(s)) || (fuqiStarsB.length === 0);
  let fuqiScore = 75;
  if (aWantsB && bWantsA) fuqiScore = 95;
  else if (aWantsB || bWantsA) fuqiScore = 85;

  aspects.push({
    aspectType: 'fuqi_resonance',
    title: '夫妻宫投射与择偶画像契合度',
    score: fuqiScore,
    level: fuqiScore >= 85 ? 'highly_harmonious' : 'complementary',
    description: `双方夫妻宫期待特质与对方命宫主星展现出${fuqiScore >= 85 ? '高度镜像投射（符合彼此潜意识择偶理想）' : '良好互补性'}。`,
  });

  // 3. 生年四化跨盘互涉 (Flyover Sihua)
  // A's Sihua into B's chart & B's Sihua into A's chart
  const stemNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const stemA = stemNames[chartA.lunarInfo.yearStem];
  const stemB = stemNames[chartB.lunarInfo.yearStem];

  sihuaFlyovers.push(`${nameA}生年天干【${stemA}】，四化星飞入${nameB}命盘，为其带来思维与运势催化。`);
  sihuaFlyovers.push(`${nameB}生年天干【${stemB}】，四化星飞入${nameA}命盘，形成动态交互引力。`);

  aspects.push({
    aspectType: 'sihua_crossover',
    title: '生年四化跨盘能量互涉',
    score: 82,
    level: 'complementary',
    description: `双方天干（${stemA} 与 ${stemB}）引动的生年禄权科忌在对方命盘中形成良好的能量流动与成就动力。`,
  });

  const rawScore = (mingScore * 0.4) + (fuqiScore * 0.35) + (82 * 0.25);
  const overallScore = Math.round(rawScore);
  const compatibilityLevel = overallScore >= 88 ? '天作之合' : overallScore >= 78 ? '良缘默契' : overallScore >= 68 ? '互补磨合' : '需多包容';

  const synthesisAdvice = `综合紫微合盘分析：${nameA}与${nameB}综合契合指数为【${overallScore}分 / 100分】（判定：${compatibilityLevel}）。双方在性格互动与理想共建上拥有稳固基础，建议在日常中多发挥彼此主星优势，实现事业与家庭的双向滋养。`;

  return {
    personA: {
      name: nameA,
      mingGongBranch: BRANCH_NAMES[chartA.mingGongBranch],
      mingGongMajorStars: starsA,
      fuqiMajorStars: fuqiStarsA,
    },
    personB: {
      name: nameB,
      mingGongBranch: BRANCH_NAMES[chartB.mingGongBranch],
      mingGongMajorStars: starsB,
      fuqiMajorStars: fuqiStarsB,
    },
    overallCompatibilityScore: overallScore,
    compatibilityLevel,
    aspects,
    sihuaFlyoverDetails: sihuaFlyovers,
    synthesisAdvice,
  };
}
