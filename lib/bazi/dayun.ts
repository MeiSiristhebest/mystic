/**
 * Traditional Chinese Bazi Da Yun (大运) Pipeline Engine.
 * 
 * Computes:
 * 1. Da Yun Direction (顺排 vs 逆排: 阳男阴女顺行，阴男阳女逆行).
 * 2. Exact Da Yun start age, months, and days derived from distance to next/prev solar terms.
 * 3. Exact start & end dates derived from `yun.getStartSolar()` with exact month & day offsets.
 * 4. 60 JiaZi direct NaYin mapping without external object distortion.
 */

import { Solar } from 'lunar-javascript';
import { DaYunPeriod, DaYunTimeline } from './types';
import { calculateTenGod } from './calculator';

export const SIXTY_JIAZI_NAYIN: Record<string, string> = {
  甲子: '海中金', 乙丑: '海中金', 丙寅: '炉中火', 丁卯: '炉中火', 戊辰: '大林木', 己巳: '大林木',
  庚午: '路旁土', 辛未: '路旁土', 壬申: '剑锋金', 癸酉: '剑锋金', 甲戌: '山头火', 乙亥: '山头火',
  丙子: '涧下水', 丁丑: '涧下水', 戊寅: '城头土', 己卯: '城头土', 庚辰: '白蜡金', 辛巳: '白蜡金',
  壬午: '杨柳木', 癸未: '杨柳木', 甲申: '泉中水', 乙酉: '泉中水', 丙戌: '屋上土', 丁亥: '屋上土',
  戊子: '霹雳火', 己丑: '霹雳火', 庚寅: '松柏木', 辛卯: '松柏木', 壬辰: '长流水', 癸巳: '长流水',
  甲午: '沙中金', 乙未: '沙中金', 丙申: '山下火', 丁酉: '山下火', 戊戌: '平地木', 己亥: '平地木',
  庚子: '壁上土', 辛丑: '壁上土', 壬寅: '金箔金', 癸卯: '金箔金', 甲辰: '覆灯火', 乙巳: '覆灯火',
  丙午: '天河水', 丁未: '天河水', 戊申: '大驿土', 己酉: '大驿土', 庚戌: '钗钏金', 辛亥: '钗钏金',
  壬子: '桑柘木', 癸丑: '桑柘木', 甲寅: '大溪水', 乙卯: '大溪水', 丙辰: '沙中土', 丁巳: '沙中土',
  戊午: '天上火', 己未: '天上火', 庚申: '石榴木', 辛酉: '石榴木', 壬戌: '大海水', 癸亥: '大海水',
};

export function getNaYinByGanZhi(ganZhi: string): string {
  return SIXTY_JIAZI_NAYIN[ganZhi] || '未知纳音';
}

export function calculateDaYunTimeline(
  solar: InstanceType<typeof Solar>,
  gender: 'male' | 'female' = 'male',
  dayMasterGan: string = '庚'
): DaYunTimeline {
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 1: 男, 0: 女
  const genderCode = gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderCode);

  const startAge = yun.getStartYear(); // 起运整岁
  const startMonthsRemainder = yun.getStartMonth();
  const startDaysRemainder = yun.getStartDay();
  const isForward = yun.isForward();
  const direction: '顺行' | '逆行' = isForward ? '顺行' : '逆行';

  const startSolar = yun.getStartSolar();
  const startSolarYear = startSolar ? startSolar.getYear() : (solar.getYear() + startAge);
  const startSolarMonth = startSolar ? startSolar.getMonth() : (solar.getMonth() + startMonthsRemainder);
  const startSolarDay = startSolar ? startSolar.getDay() : (solar.getDay() + startDaysRemainder);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const firstDaYunStartDate = startSolar ? startSolar.toYmd() : `${startSolarYear}-${pad(startSolarMonth)}-${pad(startSolarDay)}`;

  const periods: DaYunPeriod[] = [];
  const daYunList = yun.getDaYun();

  for (let i = 1; i < daYunList.length && periods.length < 10; i++) {
    const dy = daYunList[i];
    const dyGanZhi = dy.getGanZhi();
    if (!dyGanZhi) continue;

    const dyGan = dyGanZhi.charAt(0);
    const sAge = dy.getStartAge();
    const eAge = dy.getEndAge();
    const sYear = dy.getStartYear();
    const eYear = dy.getEndYear();

    const stepIndex = periods.length;
    const startDate = `${startSolarYear + stepIndex * 10}-${pad(startSolarMonth)}-${pad(startSolarDay)}`;
    const endDate = `${startSolarYear + (stepIndex + 1) * 10}-${pad(startSolarMonth)}-${pad(startSolarDay)}`;

    const shiShen = calculateTenGod(dayMasterGan, dyGan);
    const naYin = getNaYinByGanZhi(dyGanZhi);

    periods.push({
      step: stepIndex + 1,
      ganZhi: dyGanZhi,
      startAge: sAge,
      endAge: eAge,
      startYear: sYear,
      endYear: eYear,
      startDate,
      endDate,
      shiShen,
      naYin,
    });
  }

  return {
    direction,
    startAge,
    startMonthsRemainder,
    startDaysRemainder,
    firstDaYunStartDate,
    periods,
  };
}
