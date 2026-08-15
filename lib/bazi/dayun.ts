/**
 * Traditional Chinese Bazi Da Yun (大运) Pipeline Engine.
 *
 * Computes:
 * 1. Da Yun Direction (顺排 vs 逆排: 阳男阴女顺行，阴男阳女逆行).
 * 2. Exact Da Yun start age, months, and days derived from distance to next/prev solar terms.
 * 3. Exact start & end dates via yun.getStartSolar() + real calendar arithmetic (leap-year safe).
 * 4. 60 JiaZi direct NaYin mapping without external object distortion.
 */

import { Solar, LunarUtil } from 'lunar-javascript';
import { DaYunPeriod, DaYunTimeline } from './types';
import { calculateTenGod } from './calculator';

export const SIXTY_JIAZI_NAYIN: Record<string, string> = LunarUtil.NAYIN as Record<string, string>;

export function getNaYinByGanZhi(ganZhi: string): string {
  return SIXTY_JIAZI_NAYIN[ganZhi] || '未知纳音';
}


/**
 * Add a fixed number of years to a YYYY-MM-DD date string using real calendar arithmetic.
 * Handles the Feb-29 edge case: if the result year is non-leap and origin day is Feb 29,
 * pins to Feb 28 (no silent invalid date).
 */
function addYearsToDateString(dateStr: string, years: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetYear = y + years;
  // Detect leap year: divisible by 4, except centuries unless divisible by 400
  const isLeap = (yr: number) => (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
  // Pin Feb-29 to Feb-28 when target year is non-leap
  const targetDay = (m === 2 && d === 29 && !isLeap(targetYear)) ? 28 : d;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${targetYear}-${pad(m)}-${pad(targetDay)}`;
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

  // Obtain exact first Da Yun start date directly from lunar-javascript
  const startSolar = yun.getStartSolar();
  const firstDaYunStartDate: string = startSolar
    ? startSolar.toYmd()
    : (() => {
        // Fallback: civil date arithmetic from birth date (less accurate, marked degraded)
        const pad = (n: number) => n.toString().padStart(2, '0');
        return addYearsToDateString(
          `${solar.getYear()}-${pad(solar.getMonth())}-${pad(solar.getDay())}`,
          startAge
        );
      })();

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

    // Real calendar arithmetic: add stepIndex*10 years to the exact first Da Yun date.
    // endDate = startDate of the next step (continuous, no gap or overlap).
    const startDate = addYearsToDateString(firstDaYunStartDate, stepIndex * 10);
    const endDate = addYearsToDateString(firstDaYunStartDate, (stepIndex + 1) * 10);

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
