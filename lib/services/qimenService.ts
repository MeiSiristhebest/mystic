import { Lunar } from "lunar-javascript";

export interface QiMenResult {
  jieQi: string;
  baZi: string[];
  isDaylight: boolean;
}

export class QiMenService {
  /**
   * Calculate Qi Men Dun Jia time chart.
   */
  static getQiMen(date: Date): QiMenResult {
    const lunar = Lunar.fromDate(date);
    return {
      jieQi: lunar.getJieQi(),
      baZi: [
        lunar.getYearInGanZhi(),
        lunar.getMonthInChinese(),
        lunar.getDayInChinese(),
        lunar.getTimeZhi()
      ],
      isDaylight: date.getHours() >= 6 && date.getHours() < 18,
    };
  }
}
