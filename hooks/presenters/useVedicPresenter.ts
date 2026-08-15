import { useMemo } from 'react';
import { VedicChart, VedicPlanetPosition, CharaKaraka } from '@/lib/vedic/types';

export interface VedicViewModel {
  ascendantText: string;
  sunSignText: string;
  moonNakshatraText: string;
  activeDashaText: string;
  activeDashaPeriod: string;
  topCharaKarakas: Array<{
    role: string;
    roleName: string;
    planet: string;
    planetCn: string;
    degree: string;
  }>;
  d1PlanetsByHouse: Record<number, VedicPlanetPosition[]>;
  evidenceCount: number;
}

/**
 * 吠陀占星表现层模型 Presenter (Passive View Pattern)
 * 提取所有派生格式化计算，使 UI 组件纯粹化为声明式视图
 */
export function useVedicPresenter(chart: VedicChart | null | undefined): VedicViewModel | null {
  return useMemo(() => {
    if (!chart) return null;

    const asc = chart.ascendant;
    const moonNak = chart.moonNakshatra;
    const currentDasha = chart.currentDasha;

    const ascendantText = `${asc.signCn} (${asc.degreeInSign.toFixed(2)}°) [${asc.nakshatraCn || ''} ${asc.pada ? `第${asc.pada}宿度` : ''}]`;
    const sunPlanet = chart.planets.find(p => p.name === 'Sun');
    const sunSignText = sunPlanet ? `${sunPlanet.signCn} (${sunPlanet.degreeInSign.toFixed(2)}°)` : '待定';
    const moonNakshatraText = `${moonNak.cnName} (主星: ${moonNak.ruler} | 元素: ${moonNak.element})`;

    const activeDashaText = currentDasha.formattedDisplay || `${currentDasha.mahaDasha?.planetCn || ''}大运`;
    const activeDashaPeriod = `${currentDasha.mahaDasha?.startDate || ''} ~ ${currentDasha.mahaDasha?.endDate || ''}`;

    const topCharaKarakas = (chart.charaKarakas || []).slice(0, 3).map((k: CharaKaraka) => ({
      role: k.role,
      roleName: k.roleName,
      planet: k.planet,
      planetCn: k.planetCn,
      degree: `${k.degree.toFixed(2)}°`,
    }));

    return {
      ascendantText,
      sunSignText,
      moonNakshatraText,
      activeDashaText,
      activeDashaPeriod,
      topCharaKarakas,
      d1PlanetsByHouse: chart.d1Chart || {},
      evidenceCount: chart.evidences?.length || 0,
    };
  }, [chart]);
}
