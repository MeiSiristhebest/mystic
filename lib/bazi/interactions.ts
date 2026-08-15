/**
 * Traditional Chinese Bazi Stem & Branch Interaction Engine.
 * 
 * Implements structural pattern detection for:
 * 1. Heavenly Stem Combinations (天干五合关系)
 * 2. Earthly Branch Six Combinations (地支六合关系)
 * 3. Earthly Branch Three Harmonies (地支三合局) & Half Harmonies (地支半合局)
 * 4. Earthly Branch Three Directional Meetings (地支三会局)
 * 5. Earthly Branch Six Clashes (地支六冲)
 * 6. Earthly Branch Punishments (地支相刑: 三刑 & 自刑)
 * 7. Earthly Branch Six Harms/Piercings (地支相害 / 六穿)
 * 
 * Distinguishes relationship presence from actual transformation, and assigns structural weights for prioritization.
 */

import { BaziPillars, BranchInteraction } from './types';

export function analyzeInteractions(pillars: BaziPillars): BranchInteraction[] {
  const interactions: BranchInteraction[] = [];

  const stems = [
    { pillar: '年柱', stem: pillars.year.charAt(0) },
    { pillar: '月柱', stem: pillars.month.charAt(0) },
    { pillar: '日柱', stem: pillars.day.charAt(0) },
    { pillar: '时柱', stem: pillars.time.charAt(0) },
  ];

  const branches = [
    { pillar: '年柱', branch: pillars.year.charAt(1) },
    { pillar: '月柱', branch: pillars.month.charAt(1) },
    { pillar: '日柱', branch: pillars.day.charAt(1) },
    { pillar: '时柱', branch: pillars.time.charAt(1) },
  ];

  // 1. 天干五合关系 (天干合关系存在，合化需观月令引化)
  const STEM_COMBOS: Record<string, { partner: string; result: string; desc: string }> = {
    甲: { partner: '己', result: '土', desc: '甲己相合（中正之合，合化土需月令土气引化）' },
    己: { partner: '甲', result: '土', desc: '甲己相合（中正之合，合化土需月令土气引化）' },
    乙: { partner: '庚', result: '金', desc: '乙庚相合（仁义之合，合化金需月令金气引化）' },
    庚: { partner: '乙', result: '金', desc: '乙庚相合（仁义之合，合化金需月令金气引化）' },
    丙: { partner: '辛', result: '水', desc: '丙辛相合（威制之合，合化水需月令水气引化）' },
    辛: { partner: '丙', result: '水', desc: '丙辛相合（威制之合，合化水需月令水气引化）' },
    丁: { partner: '壬', result: '木', desc: '丁壬相合（淫匿之合，合化木需月令木气引化）' },
    壬: { partner: '丁', result: '木', desc: '丁壬相合（淫匿之合，合化木需月令木气引化）' },
    戊: { partner: '癸', result: '火', desc: '戊癸相合（无情之合，合化火需月令火气引化）' },
    癸: { partner: '戊', result: '火', desc: '戊癸相合（无情之合，合化火需月令火气引化）' },
  };

  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const s1 = stems[i];
      const s2 = stems[j];
      const match = STEM_COMBOS[s1.stem];
      if (match && match.partner === s2.stem) {
        interactions.push({
          type: 'stem_combination',
          name: `天干合: ${s1.stem}${s2.stem}相合`,
          pillarsInvolved: [`${s1.pillar}(${s1.stem})`, `${s2.pillar}(${s2.stem})`],
          elementsInvolved: [s1.stem, s2.stem],
          resultElement: match.result,
          transformationEstablished: false,
          structuralWeight: 5,
          description: match.desc,
        });
      }
    }
  }

  // 2. 地支六合关系
  const BRANCH_SIX_COMBOS: Record<string, { partner: string; result: string; desc: string }> = {
    子: { partner: '丑', result: '土', desc: '子丑六合' },
    丑: { partner: '子', result: '土', desc: '子丑六合' },
    寅: { partner: '亥', result: '木', desc: '寅亥六合' },
    亥: { partner: '寅', result: '木', desc: '寅亥六合' },
    卯: { partner: '戌', result: '火', desc: '卯戌六合' },
    戌: { partner: '卯', result: '火', desc: '卯戌六合' },
    辰: { partner: '酉', result: '金', desc: '辰酉六合' },
    酉: { partner: '辰', result: '金', desc: '辰酉六合' },
    巳: { partner: '申', result: '水', desc: '巳申六合' },
    申: { partner: '巳', result: '水', desc: '巳申六合' },
    午: { partner: '未', result: '土', desc: '午未六合' },
    未: { partner: '午', result: '土', desc: '午未六合' },
  };

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      const match = BRANCH_SIX_COMBOS[b1.branch];
      if (match && match.partner === b2.branch) {
        interactions.push({
          type: 'branch_six_combination',
          name: `地支六合: ${b1.branch}${b2.branch}合${match.result}`,
          pillarsInvolved: [`${b1.pillar}(${b1.branch})`, `${b2.pillar}(${b2.branch})`],
          elementsInvolved: [b1.branch, b2.branch],
          resultElement: match.result,
          transformationEstablished: false,
          structuralWeight: 8,
          description: match.desc,
        });
      }
    }
  }

  // 3. 地支三合局与三会局
  const allBranches = branches.map(b => b.branch);
  const THREE_HARMONIES = [
    { branches: ['申', '子', '辰'], element: '水', name: '申子辰三合水局' },
    { branches: ['寅', '午', '戌'], element: '火', name: '寅午戌三合火局' },
    { branches: ['巳', '酉', '丑'], element: '金', name: '巳酉丑三合金局' },
    { branches: ['亥', '卯', '未'], element: '木', name: '亥卯未三合木局' },
  ];

  const matchedFullHarmonies: string[][] = [];

  for (const th of THREE_HARMONIES) {
    const hasAll = th.branches.every(b => allBranches.includes(b));
    if (hasAll) {
      matchedFullHarmonies.push(th.branches);
      interactions.push({
        type: 'branch_three_harmony',
        // Name uses 关系(候选) when not established — avoids implying 合化 already occurred
        name: `地支三合关系: ${th.branches.join('')}（${th.element}局候选）`,
        pillarsInvolved: branches.filter(b => th.branches.includes(b.branch)).map(b => `${b.pillar}(${b.branch})`),
        elementsInvolved: th.branches,
        resultElement: th.element,
        transformationEstablished: false,
        structuralWeight: 9,
        description: `四柱地支齐备${th.branches.join('')}三合关系，具备${th.element}局合化条件（候选），是否化局尚需月令引化验证。`,
      });
    }
  }

  // 地支半合局 (前生半合 / 后墓半合)
  const HALF_HARMONIES = [
    { b1: '申', b2: '子', element: '水', name: '申子半合水局 (生地半合)' },
    { b1: '子', b2: '辰', element: '水', name: '子辰半合水局 (墓地半合)' },
    { b1: '寅', b2: '午', element: '火', name: '寅午半合火局 (生地半合)' },
    { b1: '午', b2: '戌', element: '火', name: '午戌半合火局 (墓地半合)' },
    { b1: '巳', b2: '酉', element: '金', name: '巳酉半合金局 (生地半合)' },
    { b1: '酉', b2: '丑', element: '金', name: '酉丑半合金局 (墓地半合)' },
    { b1: '亥', b2: '卯', element: '木', name: '亥卯半合木局 (生地半合)' },
    { b1: '卯', b2: '未', element: '木', name: '卯未半合木局 (墓地半合)' },
  ];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      const half = HALF_HARMONIES.find(h => (h.b1 === b1.branch && h.b2 === b2.branch) || (h.b1 === b2.branch && h.b2 === b1.branch));
      if (half) {
        // 如果已经构成了对应的全三合局，则不再重复报告半合
        const coveredInFull = matchedFullHarmonies.some(fb => fb.includes(b1.branch) && fb.includes(b2.branch));
        if (!coveredInFull) {
          interactions.push({
            type: 'branch_half_harmony',
            name: half.name,
            pillarsInvolved: [`${b1.pillar}(${b1.branch})`, `${b2.pillar}(${b2.branch})`],
            elementsInvolved: [b1.branch, b2.branch],
            resultElement: half.element,
            transformationEstablished: false,
            structuralWeight: 4,
            description: `${b1.branch}与${b2.branch}构成${half.name}。`,
          });
        }
      }
    }
  }

  const THREE_MEETINGS = [
    { branches: ['寅', '卯', '辰'], element: '木', name: '寅卯辰东方三会木局' },
    { branches: ['巳', '午', '未'], element: '火', name: '巳午未南方三会火局' },
    { branches: ['申', '酉', '戌'], element: '金', name: '申酉戌西方三会金局' },
    { branches: ['亥', '子', '丑'], element: '水', name: '亥子丑北方三会水局' },
  ];

  for (const tm of THREE_MEETINGS) {
    const hasAll = tm.branches.every(b => allBranches.includes(b));
    if (hasAll) {
      interactions.push({
        type: 'branch_three_meeting',
        // Name uses 关系(候选) when not established
        name: `地支三会关系: ${tm.branches.join('')}（${tm.element}局候选）`,
        pillarsInvolved: branches.filter(b => tm.branches.includes(b.branch)).map(b => `${b.pillar}(${b.branch})`),
        elementsInvolved: tm.branches,
        resultElement: tm.element,
        transformationEstablished: false,
        structuralWeight: 10,
        description: `四柱地支齐备${tm.branches.join('')}三会方局关系，具备${tm.element}局合化条件（候选），方位完整但是否化局仍需月令引化验证。`,
      });
    }
  }

  // 4. 地支六冲
  const CLASH_MAP: Record<string, string> = {
    子: '午', 午: '子',
    丑: '未', 未: '丑',
    寅: '申', 申: '寅',
    卯: '酉', 酉: '卯',
    辰: '戌', 戌: '辰',
    巳: '亥', 亥: '巳',
  };

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      if (CLASH_MAP[b1.branch] === b2.branch) {
        interactions.push({
          type: 'branch_six_clash',
          name: `地支六冲: ${b1.branch}${b2.branch}相冲`,
          pillarsInvolved: [`${b1.pillar}(${b1.branch})`, `${b2.pillar}(${b2.branch})`],
          elementsInvolved: [b1.branch, b2.branch],
          transformationEstablished: false,
          structuralWeight: 8,
          description: `【六冲】${b1.branch}与${b2.branch}地支五行正面对冲激荡，代表动态变化与冲动气机。`,
        });
      }
    }
  }

  // 5. 地支相刑 (三刑 & 自刑)
  const SELF_PUNISHMENTS = ['辰', '午', '酉', '亥'];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      if (b1.branch === b2.branch && SELF_PUNISHMENTS.includes(b1.branch)) {
        interactions.push({
          type: 'branch_punishment',
          // Explicitly 候选: same branch appearing twice is a necessary but not sufficient condition
          name: `地支自刑候选: ${b1.branch}${b1.branch}同支（自刑待验证）`,
          pillarsInvolved: [`${b1.pillar}(${b1.branch})`, `${b2.pillar}(${b2.branch})`],
          elementsInvolved: [b1.branch, b2.branch],
          transformationEstablished: false,
          structuralWeight: 7,
          description: `同一地支${b1.branch}出现两次，具备自刑条件（候选）。自刑成立尚需命局环境与组合条件确认。`,
        });
      }
    }
  }

  // 三刑组合判定
  const hasYin = allBranches.includes('寅');
  const hasSi = allBranches.includes('巳');
  const hasShen = allBranches.includes('申');
  if (hasYin && hasSi && hasShen) {
    interactions.push({
      type: 'branch_punishment',
      name: '寅巳申三刑 (无恩之刑)',
      pillarsInvolved: branches.filter(b => ['寅', '巳', '申'].includes(b.branch)).map(b => `${b.pillar}(${b.branch})`),
      elementsInvolved: ['寅', '巳', '申'],
      transformationEstablished: false,
      structuralWeight: 7,
      description: '寅巳申三刑齐备，金木火气机交战。',
    });
  }

  const hasChou = allBranches.includes('丑');
  const hasXu = allBranches.includes('戌');
  const hasWei = allBranches.includes('未');
  if (hasChou && hasXu && hasWei) {
    interactions.push({
      type: 'branch_punishment',
      name: '丑戌未三刑 (恃势之刑)',
      pillarsInvolved: branches.filter(b => ['丑', '戌', '未'].includes(b.branch)).map(b => `${b.pillar}(${b.branch})`),
      elementsInvolved: ['丑', '戌', '未'],
      transformationEstablished: false,
      structuralWeight: 7,
      description: '丑戌未三刑齐备，土气厚重交结。',
    });
  }

  const hasZi = allBranches.includes('子');
  const hasMao = allBranches.includes('卯');
  if (hasZi && hasMao) {
    interactions.push({
      type: 'branch_punishment',
      name: '子卯相刑 (无礼之刑)',
      pillarsInvolved: branches.filter(b => ['子', '卯'].includes(b.branch)).map(b => `${b.pillar}(${b.branch})`),
      elementsInvolved: ['子', '卯'],
      transformationEstablished: false,
      structuralWeight: 7,
      description: '子卯相见，水木相刑。',
    });
  }

  // 6. 地支六害 (六穿)
  const HARM_MAP: Record<string, string> = {
    子: '未', 未: '子',
    丑: '午', 午: '丑',
    寅: '巳', 巳: '寅',
    卯: '辰', 辰: '卯',
    申: '亥', 亥: '申',
    酉: '戌', 戌: '酉',
  };

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      if (HARM_MAP[b1.branch] === b2.branch) {
        interactions.push({
          type: 'branch_harm',
          name: `地支相害: ${b1.branch}${b2.branch}相害`,
          pillarsInvolved: [`${b1.pillar}(${b1.branch})`, `${b2.pillar}(${b2.branch})`],
          elementsInvolved: [b1.branch, b2.branch],
          transformationEstablished: false,
          structuralWeight: 6,
          description: `【六穿相害】地支暗带妨碍阻滞。`,
        });
      }
    }
  }

  // 按照结构重要性降序排序
  interactions.sort((a, b) => b.structuralWeight - a.structuralWeight);

  return interactions;
}
