
export function getZodiacFromLongitude(longitude: number) {
  const signs = [
    "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
    "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"
  ];
  const index = Math.floor(longitude / 30) % 12;
  const degrees = Math.floor(longitude % 30);
  const minutes = Math.floor((longitude % 1) * 60);
  return `${signs[index]} ${degrees}°${minutes}'`;
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

export function getRulingPlanet(sign: string): string {
  const mapping: Record<string, string> = {
    "白羊座": "火星",
    "金牛座": "金星",
    "双子座": "水星",
    "巨蟹座": "月亮",
    "狮子座": "太阳",
    "处女座": "水星",
    "天秤座": "金星",
    "天蝎座": "冥王星/火星",
    "射手座": "木星",
    "摩羯座": "土星",
    "水瓶座": "天王星/土星",
    "双鱼座": "海王星/木星"
  };
  return mapping[sign] || "未知";
}

export function getAscendant(birthDate: Date, birthTime: string): string {
  if (!birthTime) return "未知";
  
  const sunSign = getSunSign(birthDate);
  const signs = [
    "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
    "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"
  ];
  
  const sunIndex = signs.indexOf(sunSign);
  if (sunIndex === -1) return "未知";
  
  const [hours, minutes] = birthTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  const sunriseMinutes = 6 * 60; 
  const diffMinutes = totalMinutes - sunriseMinutes;
  const signShift = Math.floor(diffMinutes / 120);
  
  let ascIndex = (sunIndex + signShift) % 12;
  if (ascIndex < 0) ascIndex += 12;
  
  return signs[ascIndex];
}

export function getDescendant(ascendant: string): string {
  const signs = [
    "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
    "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"
  ];
  const index = signs.indexOf(ascendant);
  if (index === -1) return "未知";
  
  return signs[(index + 6) % 12];
}
