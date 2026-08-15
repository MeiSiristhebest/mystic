/**
 * Traditional Chinese Bazi Da Yun (大运) Pipeline Engine.
 * 
 * Computes:
 * 1. Da Yun Direction (顺排 vs 逆排: 阳男阴女顺行，阴男阳女逆行).
 * 2. Exact Da Yun start age, months, and days derived from distance to next/prev solar terms.
 * 3. Complete 10-step Da Yun timeline with GanZhi, Ten Gods, NaYin, and precise YYYY-MM-DD temporal intervals.
 */

import { DaYunPeriod, DaYunTimeline } from './types';
import { calculateTenGod } from './calculator';

export function calculateDaYunTimeline(
  solar: any, // lunar-javascript Solar object
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

  const birthYear = solar.getYear();
  const birthMonth = solar.getMonth();
  const birthDay = solar.getDay();

  const firstDaYunYear = birthYear + startAge;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const exactFirstDaYunDate = `${firstDaYunYear}-${pad(birthMonth)}-${pad(birthDay)}`;

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

    const startDate = `${sYear}-${pad(birthMonth)}-${pad(birthDay)}`;
    const endDate = `${eYear}-${pad(birthMonth)}-${pad(birthDay)}`;

    const shiShen = calculateTenGod(dayMasterGan, dyGan);
    let naYin = '大运纳音';
    try {
      if (dy.getLunar) {
        naYin = dy.getLunar().getEightChar().getYearNaYin() || '大运纳音';
      }
    } catch {
      naYin = '大运纳音';
    }

    periods.push({
      step: periods.length + 1,
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
    exactFirstDaYunDate,
    periods,
  };
}
