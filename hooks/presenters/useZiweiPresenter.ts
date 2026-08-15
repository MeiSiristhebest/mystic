import { useMemo } from 'react';
import { ZiweiChart, Palace, Pattern } from '@/lib/ziwei/types';

export interface ZiweiViewModel {
  mingGongBranchName: string;
  shenGongBranchName: string;
  wuxingJuTitle: string;
  majorPatterns: Array<{
    name: string;
    level: string;
    levelCn: string;
    description: string;
  }>;
  mingPalaceStars: string[];
  shenPalaceStars: string[];
  currentDaXianText: string;
  palacesSummary: Array<{
    branch: number;
    name: string;
    majorStars: string[];
    hasSihua: boolean;
  }>;
}

const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 紫微斗数表现层模型 Presenter (Passive View Pattern)
 */
export function useZiweiPresenter(chart: ZiweiChart | null | undefined): ZiweiViewModel | null {
  return useMemo(() => {
    if (!chart) return null;

    const mingBranchName = BRANCH_NAMES[chart.mingGongBranch] || '未知';
    const shenBranchName = BRANCH_NAMES[chart.shenGongBranch] || '未知';
    const wuxingJuTitle = `${chart.wuxingJuName} (${chart.wuxingJu}局)`;

    const levelMap: Record<string, string> = {
      excellent: '极吉上格',
      good: '吉格清贵',
      neutral: '平稳格局',
      caution: '破格/煞格提示',
    };

    const majorPatterns = (chart.patterns || []).map((p: Pattern) => ({
      name: p.name,
      level: p.level,
      levelCn: levelMap[p.level] || '吉格',
      description: p.description,
    }));

    const mingPalace = chart.palaces.find((p: Palace) => p.branch === chart.mingGongBranch);
    const shenPalace = chart.palaces.find((p: Palace) => p.branch === chart.shenGongBranch);

    const mingPalaceStars = mingPalace?.stars.filter(s => s.type === 'major').map(s => s.name) || ['空宫'];
    const shenPalaceStars = shenPalace?.stars.filter(s => s.type === 'major').map(s => s.name) || ['空宫'];

    const currentDaXian = (chart.daXians || []).find(d => chart.currentAge >= d.startAge && chart.currentAge <= d.endAge);
    const currentDaXianText = currentDaXian 
      ? `${currentDaXian.startAge}~${currentDaXian.endAge}岁 (${currentDaXian.palaceName})`
      : '大限未载';

    const palacesSummary = (chart.palaces || []).map((p: Palace) => ({
      branch: p.branch,
      name: p.name,
      majorStars: p.stars.filter(s => s.type === 'major').map(s => s.name),
      hasSihua: p.stars.some(s => !!s.siHua),
    }));

    return {
      mingGongBranchName: `${mingBranchName}宫`,
      shenGongBranchName: `${shenBranchName}宫`,
      wuxingJuTitle,
      majorPatterns,
      mingPalaceStars,
      shenPalaceStars,
      currentDaXianText,
      palacesSummary,
    };
  }, [chart]);
}
