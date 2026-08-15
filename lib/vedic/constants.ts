import { VedicPlanetName, VedicSignName } from './types';

export const VEDIC_SIGNS: { name: VedicSignName; cnName: string; element: string; ruler: VedicPlanetName }[] = [
  { name: 'Aries', cnName: '白羊宫 (Mesha)', element: 'Fire', ruler: 'Mars' },
  { name: 'Taurus', cnName: '金牛宫 (Vrishabha)', element: 'Earth', ruler: 'Venus' },
  { name: 'Gemini', cnName: '双子宫 (Mithuna)', element: 'Air', ruler: 'Mercury' },
  { name: 'Cancer', cnName: '巨蟹宫 (Karka)', element: 'Water', ruler: 'Moon' },
  { name: 'Leo', cnName: '狮子宫 (Simha)', element: 'Fire', ruler: 'Sun' },
  { name: 'Virgo', cnName: '处女宫 (Kanya)', element: 'Earth', ruler: 'Mercury' },
  { name: 'Libra', cnName: '天秤宫 (Tula)', element: 'Air', ruler: 'Venus' },
  { name: 'Scorpio', cnName: '天蝎宫 (Vrishchika)', element: 'Water', ruler: 'Mars' },
  { name: 'Sagittarius', cnName: '射手宫 (Dhanu)', element: 'Fire', ruler: 'Jupiter' },
  { name: 'Capricorn', cnName: '摩羯宫 (Makara)', element: 'Earth', ruler: 'Saturn' },
  { name: 'Aquarius', cnName: '水瓶宫 (Kumbha)', element: 'Air', ruler: 'Saturn' },
  { name: 'Pisces', cnName: '双鱼宫 (Meena)', element: 'Water', ruler: 'Jupiter' },
];

export const PLANET_CN_MAP: Record<VedicPlanetName, string> = {
  Sun: '太阳 (Surya)',
  Moon: '月亮 (Chandra)',
  Mars: '火星 (Mangala)',
  Mercury: '水星 (Budha)',
  Jupiter: '木星 (Guru)',
  Venus: '金星 (Shukra)',
  Saturn: '土星 (Shani)',
  Rahu: '罗睺 (Rahu)',
  Ketu: '计都 (Ketu)',
  Ascendant: '上升命度 (Lagna)',
};

// Vimsottari Dasha planetary sequence and fixed years (Total: 120 years)
export const DASHA_ORDER: { planet: VedicPlanetName; years: number }[] = [
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 },
];
