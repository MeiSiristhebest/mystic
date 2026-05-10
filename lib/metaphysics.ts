/**
 * Simplified Metaphysics Utilities for Bazi and Zodiac
 */

const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const SHENG_XIAO = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

/**
 * Get Zodiac (Sheng Xiao) from birth year
 */
export function getZodiac(year: number): string {
  if (!year) return "";
  // 1900 is a Rat year (子)
  const index = (year - 1900) % 12;
  return SHENG_XIAO[index < 0 ? index + 12 : index];
}

/**
 * Simplified Bazi calculation
 * Note: Real Bazi calculation is extremely complex and requires a perpetual calendar.
 * This is a simplified version for demonstration/entertainment purposes.
 */
export function calculateBazi(birthDate: string, birthTime: string): string {
  if (!birthDate) return "";
  
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = birthTime ? parseInt(birthTime.split(":")[0]) : 12;

  // Year Gan-Zhi
  const yearGanIndex = (year - 4) % 10;
  const yearZhiIndex = (year - 4) % 12;
  const yearPillar = TIAN_GAN[yearGanIndex] + DI_ZHI[yearZhiIndex];

  // Month Pillar (Simplified)
  // This is a very rough approximation
  const monthZhiIndex = (month + 1) % 12;
  const monthGanIndex = (yearGanIndex * 2 + month) % 10;
  const monthPillar = TIAN_GAN[monthGanIndex] + DI_ZHI[monthZhiIndex];

  // Day Pillar (Simplified)
  // Real day pillar requires complex calculation or lookup table
  const baseDate = new Date(1900, 0, 31); // Known Gan-Zhi date
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayGanIndex = (diffDays % 10 + 10) % 10;
  const dayZhiIndex = (diffDays % 12 + 12) % 12;
  const dayPillar = TIAN_GAN[dayGanIndex] + DI_ZHI[dayZhiIndex];

  // Hour Pillar
  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
  const hourGanIndex = (dayGanIndex * 2 + hourZhiIndex) % 10;
  const hourPillar = TIAN_GAN[hourGanIndex] + DI_ZHI[hourZhiIndex];

  return `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`;
}

export function getSunSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "白羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "金牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "巨蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "狮子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "处女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "天蝎座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "摩羯座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "双鱼座";
  return "未知";
}
