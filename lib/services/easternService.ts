import { Lunar, Solar } from "lunar-javascript";
import { generateChart, detectPatterns } from "@/lib/ziwei";

export class EasternService {
  /**
   * Get Chinese Zodiac animal from birth year.
   */
  static getZodiac(year: number): string {
    if (!year) return "";
    const shengXiao = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
    const index = (year - 4) % 12;
    return shengXiao[index < 0 ? index + 12 : index];
  }

  /**
   * Calculate Bazi four pillars and lunar date string.
   */
  static getBazi(birthDate: string, birthTime: string) {
    if (!birthDate) {
      return {
        baziString: "",
        lunarDateString: "",
        yearGanZhi: "",
        monthGanZhi: "",
        dayGanZhi: "",
        timeGanZhi: "",
      };
    }

    try {
      const [year, month, day] = birthDate.split('-').map(Number);
      const [hour, minute] = (birthTime || '12:00').split(':').map(Number);

      const solar = Solar.fromYmdHms(year, month, day, hour, minute || 0, 0);
      const lunar = solar.getLunar();

      const yearGanZhi = lunar.getYearInGanZhi();
      const monthGanZhi = lunar.getMonthInGanZhi();
      const dayGanZhi = lunar.getDayInGanZhi();
      const timeGanZhi = lunar.getTimeInGanZhi();

      return {
        baziString: `${yearGanZhi}年 ${monthGanZhi}月 ${dayGanZhi}日 ${timeGanZhi}时`,
        lunarDateString: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
        yearGanZhi,
        monthGanZhi,
        dayGanZhi,
        timeGanZhi,
      };
    } catch (e) {
      return {
        baziString: "",
        lunarDateString: "",
        yearGanZhi: "",
        monthGanZhi: "",
        dayGanZhi: "",
        timeGanZhi: "",
      };
    }
  }

  /**
   * Calculate Ziwei chart and detect 80+ classical patterns based on Ni Haixia's Tianji system.
   */
  static getZiwei(birthDate: string, hour: number, gender: '男' | '女') {
    const [year, month, day] = birthDate.split('-').map(Number);

    const chart = generateChart({
      year,
      month,
      day,
      hour,
      gender: gender === '女' ? 'female' : 'male',
    });
    
    const patterns = detectPatterns(chart);

    return {
      chart,
      patterns,
      detectedPatterns: patterns,
    };
  }

  /**
   * Calculate Qi Men Dun Jia time chart.
   */
  static getQiMen(date: Date) {
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
