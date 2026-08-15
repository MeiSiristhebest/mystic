/**
 * True Solar Time (真太阳时) & Equation of Time (均时差) Engine.
 * 
 * Computes astronomical True Solar Time from civil wall-clock time,
 * accounting for:
 * 1. Geographic longitude time-angle offset relative to the standard timezone meridian (4 min / deg).
 * 2. Equation of Time (EoT) caused by Earth's orbital eccentricity and axial tilt.
 */

export function calculateEquationOfTime(date: Date): number {
  // Day of the year (1 - 366)
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (86400000)) + 1;

  // B angle in radians
  const bDeg = (360 / 365.24) * (dayOfYear - 81);
  const bRad = (bDeg * Math.PI) / 180.0;

  // Spencer formula for Equation of Time (in minutes)
  const eotMinutes = 9.87 * Math.sin(2 * bRad) - 7.53 * Math.cos(bRad) - 1.5 * Math.sin(bRad);
  return Math.round(eotMinutes * 100) / 100;
}

export function getStandardTimezoneMeridian(timeZone: string, lon = 116.40): number {
  if (timeZone === 'Asia/Shanghai' || timeZone === 'Asia/Taipei' || timeZone === 'Asia/Hong_Kong') return 120.0;
  if (timeZone === 'Asia/Tokyo' || timeZone === 'Asia/Seoul') return 135.0;
  if (timeZone === 'Asia/Kolkata') return 82.5;
  if (timeZone === 'Europe/London') return 0.0;
  if (timeZone === 'Europe/Paris' || timeZone === 'Europe/Berlin') return 15.0;
  if (timeZone === 'America/New_York') return -75.0;
  if (timeZone === 'America/Chicago') return -90.0;
  if (timeZone === 'America/Denver') return -105.0;
  if (timeZone === 'America/Los_Angeles') return -120.0;

  // Default to standard 15° per hour meridian closest to longitude
  return Math.round(lon / 15.0) * 15.0;
}

export function calculateTrueSolarTime(
  civilDate: Date,
  longitude: number = 116.40,
  timeZone: string = 'Asia/Shanghai'
): {
  trueSolarDate: Date;
  eotMinutes: number;
  longitudeOffsetMinutes: number;
  totalShiftMinutes: number;
  formattedCivilTime: string;
  formattedTrueSolarTime: string;
} {
  const standardMeridian = getStandardTimezoneMeridian(timeZone, longitude);
  const longitudeOffsetMinutes = (longitude - standardMeridian) * 4.0;
  const eotMinutes = calculateEquationOfTime(civilDate);
  const totalShiftMinutes = longitudeOffsetMinutes + eotMinutes;

  const trueSolarDate = new Date(civilDate.getTime() + totalShiftMinutes * 60000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedCivilTime = `${pad(civilDate.getHours())}:${pad(civilDate.getMinutes())}`;
  const formattedTrueSolarTime = `${pad(trueSolarDate.getHours())}:${pad(trueSolarDate.getMinutes())}`;

  return {
    trueSolarDate,
    eotMinutes,
    longitudeOffsetMinutes: Math.round(longitudeOffsetMinutes * 100) / 100,
    totalShiftMinutes: Math.round(totalShiftMinutes * 100) / 100,
    formattedCivilTime,
    formattedTrueSolarTime,
  };
}
