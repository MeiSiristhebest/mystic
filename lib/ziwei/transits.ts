import { ZiweiChart, SiHua } from './types';

export interface AnnualTransitStars {
  liuLu: string;       // 流年禄存落入地支
  liuYang: string;     // 流年擎羊落入地支
  liuTuo: string;      // 流年陀罗落入地支
  liuKui: string;      // 流年天魁落入地支
  liuYue: string;      // 流年天钺落入地支
  liuChang: string;    // 流年文昌落入地支
  liuQu: string;       // 流年文曲落入地支
  liuLuan: string;     // 流年红鸾落入地支
  liuXi: string;       // 流年天喜落入地支
}

export interface AnnualSiHua {
  yearStem: string;
  yearBranch: string;
  luStar: string;
  quanStar: string;
  keStar: string;
  jiStar: string;
}

export interface AnnualPalaceOverlay {
  branchIndex: number;
  branchName: string;
  natalPalaceName: string; // 本命盘宫位 (如：命宫、财帛宫)
  daXianPalaceName?: string; // 大限盘宫位 (如：大限夫妻)
  annualPalaceName: string; // 流年盘宫位 (如：流年官禄)
  annualStars: string[]; // 流曜
  annualSiHua?: Array<{ star: string; siHua: SiHua }>;
  resonanceTheme: string; // 叠盘共振主题
}

export interface AnnualTransitAnalysis {
  targetYear: number;
  annualGanZhi: string;
  annualMingBranch: number; // 流年命宫地支索引 (即流年太岁地支)
  annualSiHua: AnnualSiHua;
  annualTransitStars: AnnualTransitStars;
  overlays: AnnualPalaceOverlay[];
  keyDynamicObservations: string[];
}

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '奴仆', '官禄', '田宅', '福德', '父母'];

// 十天干流年四化表
const ANNUAL_SIHUA_TABLE: Record<string, [string, string, string, string]> = {
  甲: ['廉贞', '破军', '武曲', '太阳'],
  乙: ['天机', '天梁', '紫微', '太阴'],
  丙: ['天同', '天机', '文昌', '廉贞'],
  丁: ['太阴', '天同', '天机', '巨门'],
  戊: ['贪狼', '太阴', '右弼', '天机'],
  己: ['武曲', '贪狼', '天梁', '文曲'],
  庚: ['太阳', '武曲', '太阴', '天同'],
  辛: ['巨门', '太阳', '文曲', '文昌'],
  壬: ['天梁', '紫微', '左辅', '武曲'],
  癸: ['破军', '巨门', '太阴', '贪狼'],
};

// 流年禄存地支 (0=子 ... 11=亥)
const LIU_LU_BRANCH: Record<string, number> = {
  甲: 2, 乙: 3, 丙: 5, 丁: 6, 戊: 5, 己: 6, 庚: 8, 辛: 9, 壬: 11, 癸: 0
};

// 流年天魁天钺地支
const LIU_KUI_YUE: Record<string, [number, number]> = {
  甲: [1, 7], 乙: [0, 8], 丙: [11, 9], 丁: [11, 9], 戊: [1, 7],
  己: [0, 8], 庚: [1, 7], 辛: [6, 2], 壬: [3, 5], 癸: [3, 5]
};

/**
 * 确定性紫微流年叠盘与流曜推演引擎
 */
export function calculateAnnualTransit(
  chart: ZiweiChart,
  targetYear: number
): AnnualTransitAnalysis {
  // Calculate Target Year GanZhi (e.g. 2026 -> 丙午)
  const stemIdx = ((targetYear - 4) % 10 + 10) % 10;
  const branchIdx = ((targetYear - 4) % 12 + 12) % 12;
  const yearStem = STEMS[stemIdx];
  const yearBranch = BRANCHES[branchIdx];
  const annualGanZhi = `${yearStem}${yearBranch}年`;

  // 流年四化
  const [luStar, quanStar, keStar, jiStar] = ANNUAL_SIHUA_TABLE[yearStem] || ['天同', '天机', '文昌', '廉贞'];
  const annualSiHua: AnnualSiHua = { yearStem, yearBranch, luStar, quanStar, keStar, jiStar };

  // 流曜计算
  const luPos = LIU_LU_BRANCH[yearStem] ?? 5;
  const yangPos = (luPos + 1) % 12;
  const tuoPos = (luPos - 1 + 12) % 12;
  const [kuiPos, yuePos] = LIU_KUI_YUE[yearStem] || [1, 7];

  // 流年文昌文曲 (丙年昌在申，曲在子等)
  const changPos = (11 - branchIdx + 12) % 12;
  const quPos = (4 + branchIdx) % 12;

  // 流年红鸾天喜 (卯起子逆数至流年地支)
  const luanPos = (15 - branchIdx) % 12;
  const xiPos = (luanPos + 6) % 12;

  const annualTransitStars: AnnualTransitStars = {
    liuLu: BRANCHES[luPos],
    liuYang: BRANCHES[yangPos],
    liuTuo: BRANCHES[tuoPos],
    liuKui: BRANCHES[kuiPos],
    liuYue: BRANCHES[yuePos],
    liuChang: BRANCHES[changPos],
    liuQu: BRANCHES[quPos],
    liuLuan: BRANCHES[luanPos],
    liuXi: BRANCHES[xiPos],
  };

  // 流年命宫 = 流年地支所在宫位
  const annualMingBranch = branchIdx;

  // 找到当前大限
  const currentAge = targetYear - chart.birthInfo.year + 1;
  const currentDaXian = (chart.daXians || []).find(d => currentAge >= d.startAge && currentAge <= d.endAge);
  const daXianMingBranch = currentDaXian?.palaceBranch ?? chart.mingGongBranch;

  const overlays: AnnualPalaceOverlay[] = [];
  const keyObservations: string[] = [];

  for (let b = 0; b < 12; b++) {
    const branchName = BRANCHES[b];
    // 本命宫位名称
    const natalPalace = chart.palaces.find(p => p.branch === b);
    const natalName = natalPalace?.name || '本命宫';

    // 大限宫位名称 (以大限命宫为基准按逆时针或顺时针排)
    const daXianPalaceIdx = (b - daXianMingBranch + 12) % 12;
    const daXianName = `大限${PALACE_NAMES[daXianPalaceIdx] || '宫'}`;

    // 流年宫位名称 (以流年地支为流年命宫)
    const annualPalaceIdx = (b - annualMingBranch + 12) % 12;
    const annualPalaceName = `流年${PALACE_NAMES[annualPalaceIdx] || '宫'}`;

    // 收集该地支宫位落入的流曜
    const curStars: string[] = [];
    if (b === luPos) curStars.push('流年禄存');
    if (b === yangPos) curStars.push('流年擎羊');
    if (b === tuoPos) curStars.push('流年陀罗');
    if (b === kuiPos) curStars.push('流年天魁');
    if (b === yuePos) curStars.push('流年天钺');
    if (b === changPos) curStars.push('流年文昌');
    if (b === quPos) curStars.push('流年文曲');
    if (b === luanPos) curStars.push('流年红鸾');
    if (b === xiPos) curStars.push('流年天喜');

    // 检查是否有流年四化星曜
    const curSiHua: Array<{ star: string; siHua: SiHua }> = [];
    if (natalPalace?.stars.some(s => s.name === luStar)) curSiHua.push({ star: luStar, siHua: '禄' });
    if (natalPalace?.stars.some(s => s.name === quanStar)) curSiHua.push({ star: quanStar, siHua: '权' });
    if (natalPalace?.stars.some(s => s.name === keStar)) curSiHua.push({ star: keStar, siHua: '科' });
    if (natalPalace?.stars.some(s => s.name === jiStar)) curSiHua.push({ star: jiStar, siHua: '忌' });

    // 叠盘主题
    let resonanceTheme = `【${annualPalaceName}】叠【${daXianName}】与【本命${natalName}】`;
    if (curSiHua.some(s => s.siHua === '忌')) {
      resonanceTheme += ` · ⚠️ 流年化忌引动`;
    }
    if (curSiHua.some(s => s.siHua === '禄')) {
      resonanceTheme += ` · 🌟 流年化禄赋能`;
    }

    overlays.push({
      branchIndex: b,
      branchName,
      natalPalaceName: natalName,
      daXianPalaceName: daXianName,
      annualPalaceName,
      annualStars: curStars,
      annualSiHua: curSiHua.length > 0 ? curSiHua : undefined,
      resonanceTheme,
    });
  }

  // 提炼关键流年动态
  keyObservations.push(`流年岁次【${annualGanZhi}】，流年命宫坐落【${BRANCHES[annualMingBranch]}宫】。`);
  keyObservations.push(`流年天干引动四化：${luStar}化禄、${quanStar}化权、${keStar}化科、${jiStar}化忌。`);
  
  const jiOverlay = overlays.find(o => o.annualSiHua?.some(s => s.siHua === '忌'));
  if (jiOverlay) {
    keyObservations.push(`流年化忌（${jiStar}）落入【${jiOverlay.branchName}宫】，叠【${jiOverlay.annualPalaceName}】与【${jiOverlay.natalPalaceName}】，该领域需防范人事争议或决策波动。`);
  }

  const luOverlay = overlays.find(o => o.annualSiHua?.some(s => s.siHua === '禄'));
  if (luOverlay) {
    keyObservations.push(`流年化禄（${luStar}）落入【${luOverlay.branchName}宫】，叠【${luOverlay.annualPalaceName}】与【${luOverlay.natalPalaceName}】，为主力开拓与顺景收益核心重心。`);
  }

  return {
    targetYear,
    annualGanZhi,
    annualMingBranch,
    annualSiHua,
    annualTransitStars,
    overlays,
    keyDynamicObservations: keyObservations,
  };
}
