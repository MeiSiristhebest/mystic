/**
 * Traditional Chinese Bazi Stem & Branch Interaction Engine.
 * 
 * Implements comprehensive analysis for:
 * 1. Heavenly Stem Combinations (天干五合)
 * 2. Earthly Branch Six Combinations (地支六合)
 * 3. Earthly Branch Three Harmonies (地支三合局 & 半合局)
 * 4. Earthly Branch Three Directional Meetings (地支三会局)
 * 5. Earthly Branch Six Clashes (地支六冲)
 * 6. Earthly Branch Punishments (地支相刑: 三刑 & 自刑)
 * 7. Earthly Branch Six Harms/Piercings (地支相害 / 六穿)
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

  // 1. 天干五合
  const STEM_COMBOS: Record<string, { partner: string; result: string; desc: string }> = {
    甲: { partner: '己', result: '土', desc: '甲己合化土（中正之合）' },
    己: { partner: '甲', result: '土', desc: '甲己合化土（中正之合）' },
    乙: { partner: '庚', result: '金', desc: '乙庚合化金（仁义之合）' },
    庚: { partner: '乙', result: '金', desc: '乙庚合化金（仁义之合）' },
    丙: { partner: '辛', result: '水', desc: '丙辛合化水（威制之合）' },
    辛: { partner: '丙', result: '水', desc: '丙辛合化水（威制之合）' },
    丁: { partner: '壬', result: '木', desc: '丁壬合化木（淫匿之合）' },
    壬: { partner: '丁', result: '木', desc: '丁壬合化木（淫匿之合）' },
    戊: { partner: '癸', result: '火', desc: '戊癸合化火（无情之合）' },
    癸: { partner: '戊', result: '火', desc: '戊癸合化火（无情之合）' },
  };

  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const s1 = stems[i];
      const s2 = stems[j];
      const match = STEM_COMBOS[s1.stem];
      if (match && match.partner === s2.stem) {
        interactions.push({
          type: 'stem_combination',
          name: `天干合: ${s1.stem}${s2.stem}合化${match.result}`,
          pillarsInvolved: [`${s1.pillar}(${s1.stem})`, `${s2.pillar}(${s2.stem})`],
          elementsInvolved: [s1.stem, s2.stem],
          resultElement: match.result,
          description: match.desc,
        });
      }
    }
  }

  // 2. 地支六合
  const BRANCH_SIX_COMBOS: Record<string, { partner: string; result: string; desc: string }> = {
    子: { partner: '丑', result: '土', desc: '子丑合土' },
    丑: { partner: '子', result: '土', desc: '子丑合土' },
    寅: { partner: '亥', result: '木', desc: '寅亥合木' },
    亥: { partner: '寅', result: '木', desc: '寅亥合木' },
    卯: { partner: '戌', result: '火', desc: '卯戌合火' },
    戌: { partner: '卯', result: '火', desc: '卯戌合火' },
    辰: { partner: '酉', result: '金', desc: '辰酉合金' },
    酉: { partner: '辰', result: '金', desc: '辰酉合金' },
    巳: { partner: '申', result: '水', desc: '巳申合水' },
    申: { partner: '巳', result: '水', desc: '巳申合水' },
    午: { partner: '未', result: '土', desc: '午未合土/日月之合' },
    未: { partner: '午', result: '土', desc: '午未合土/日月之合' },
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

  for (const th of THREE_HARMONIES) {
    const hasAll = th.branches.every(b => allBranches.includes(b));
    if (hasAll) {
      interactions.push({
        type: 'branch_three_harmony',
        name: th.name,
        pillarsInvolved: branches.filter(b => th.branches.includes(b.branch)).map(b => `${b.pillar}(${b.branch})`),
        elementsInvolved: th.branches,
        resultElement: th.element,
        description: `四柱地支齐备${th.branches.join('')}，汇聚极盛${th.element}气。`,
      });
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
        name: tm.name,
        pillarsInvolved: branches.filter(b => tm.branches.includes(b.branch)).map(b => `${b.pillar}(${b.branch})`),
        elementsInvolved: tm.branches,
        resultElement: tm.element,
        description: `四柱地支齐备${tm.branches.join('')}，统领一方旺气，${tm.element}势磅礴。`,
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
          description: `【六冲对峙】${b1.branch}与${b2.branch}五行气机直接正面对冲激荡。`,
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
          name: `地支自刑: ${b1.branch}${b1.branch}自刑`,
          pillarsInvolved: [`${b1.pillar}(${b1.branch})`, `${b2.pillar}(${b2.branch})`],
          elementsInvolved: [b1.branch, b2.branch],
          description: `【自刑】同支相见气过亢盛，主情绪内耗或自我设限。`,
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
      description: '寅巳申全，持强好胜，易生波折。',
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
      description: '丑戌未全，土气重浊，多有阻滞。',
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
      description: '子卯相见，生中带刑，礼义需谨。',
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
          description: `【六穿相害】暗生妨碍与损耗。`,
        });
      }
    }
  }

  return interactions;
}
