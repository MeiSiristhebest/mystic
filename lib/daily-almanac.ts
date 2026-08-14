/**
 * Daily Almanac & Energy Metrics Engine
 * Computes traditional Ganzhi calendar, daily elements, auspicious directions,
 * dos & don'ts, and personal alignment based on user profile.
 */

const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ZODIAC_ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

const STEM_ELEMENTS: Record<string, "木" | "火" | "土" | "金" | "水"> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水"
};

const ELEMENT_COLORS: Record<string, string> = {
  木: "碧玺绿 / 青翠",
  火: "朱砂红 / 紫曜",
  土: "琥珀金 / 赭石",
  金: "流光白 / 金珀",
  水: "玄青黑 / 霁蓝"
};

const ELEMENT_DIRECTIONS: Record<string, string> = {
  木: "正东 / 东南",
  火: "正南",
  土: "中央 / 西南 / 东北",
  金: "正西 / 西北",
  水: "正北"
};

export interface DailyAlmanacInfo {
  dateStr: string;
  ganzhiYear: string;
  ganzhiMonth: string;
  ganzhiDay: string;
  dayElement: string;
  dayAnimal: string;
  nobleDirection: string;
  wealthDirection: string;
  luckyColor: string;
  nobleZodiac: string;
  suitable: string[];
  unsuitable: string[];
  solarTerm: string;
  energyScore: number;
  personalElementRelation: string;
  hourlyFortune: Array<{ time: string; branch: string; status: '吉' | '平' | '慎' }>;
}

export function getDailyAlmanac(date: Date = new Date(), birthDateStr?: string): DailyAlmanacInfo {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // 1. Calculate Day GanZhi using simplified astronomical algorithm
  // Reference base date: 2000-01-01 was 戊午 (Stem 4, Branch 6)
  const baseDate = new Date(2000, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const dayStemIdx = (4 + (diffDays % 10) + 10) % 10;
  const dayBranchIdx = (6 + (diffDays % 12) + 12) % 12;

  const stem = HEAVENLY_STEMS[dayStemIdx];
  const branch = EARTHLY_BRANCHES[dayBranchIdx];
  const ganzhiDay = `${stem}${branch}`;
  const dayElement = STEM_ELEMENTS[stem] || "火";
  const dayAnimal = ZODIAC_ANIMALS[dayBranchIdx];

  // Year & Month Ganzhi approximations
  const yearStemIdx = (y - 4) % 10;
  const yearBranchIdx = (y - 4) % 12;
  const ganzhiYear = `${HEAVENLY_STEMS[(yearStemIdx + 10) % 10]}${EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12]}年`;

  const monthStemIdx = (yearStemIdx * 2 + m) % 10;
  const monthBranchIdx = (m + 1) % 12;
  const ganzhiMonth = `${HEAVENLY_STEMS[(monthStemIdx + 10) % 10]}${EARTHLY_BRANCHES[(monthBranchIdx + 12) % 12]}月`;

  // Auspicious directions & colors
  const nobleDirection = ELEMENT_DIRECTIONS[dayElement] || "正南";
  const wealthDirection = ELEMENT_DIRECTIONS[STEM_ELEMENTS[HEAVENLY_STEMS[(dayStemIdx + 4) % 10]]] || "正东";
  const luckyColor = ELEMENT_COLORS[dayElement] || "金曜紫";
  const nobleZodiac = ZODIAC_ANIMALS[(dayBranchIdx + 4) % 12];

  // Daily dos and don'ts curated by element
  const suitableMap: Record<string, string[]> = {
    木: ["冥想悟道", "启迪创意", "踏青采气", "修身立志", "阅读典籍"],
    火: ["商务洽谈", "展示锋芒", "社交破冰", "缔结契约", "点燃愿景"],
    土: ["理财固本", "安抚心神", "整理空间", "规划长远", "稳健求实"],
    金: ["断舍离决", "复盘归档", "严谨决策", "清理负能", "专注执行"],
    水: ["聆听直觉", "推演筹划", "润泽身心", "灵修探幽", "随顺因缘"]
  };

  const unsuitableMap: Record<string, string[]> = {
    木: ["固执己见", "过度劳神", "情绪急躁"],
    火: ["言语激化", "冲动下注", "争强好胜"],
    土: ["拖延变通", "故步自封", "消极沉溺"],
    金: ["严苛挑剔", "冷酷对抗", "自我怀疑"],
    水: ["涣散无序", "随波逐流", "内耗多虑"]
  };

  const suitable = suitableMap[dayElement] || ["静坐调息", "观照内心", "契约订立"];
  const unsuitable = unsuitableMap[dayElement] || ["盲目冲动", "大动干戈", "心浮气躁"];

  // Personal element alignment if birthDate is known
  let personalElementRelation = "今日天地气场交融，利于保持中和之境。";
  let energyScore = 88;

  if (birthDateStr) {
    try {
      const birth = new Date(birthDateStr);
      const birthDiff = Math.floor((birth.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      const birthStemIdx = (4 + (birthDiff % 10) + 10) % 10;
      const birthElement = STEM_ELEMENTS[HEAVENLY_STEMS[birthStemIdx]] || "木";

      if (birthElement === dayElement) {
        personalElementRelation = `今日日柱同气相求（${dayElement}旺），同行助力，自信升腾。`;
        energyScore = 92;
      } else if (
        (birthElement === "木" && dayElement === "水") ||
        (birthElement === "火" && dayElement === "木") ||
        (birthElement === "土" && dayElement === "火") ||
        (birthElement === "金" && dayElement === "土") ||
        (birthElement === "水" && dayElement === "金")
      ) {
        personalElementRelation = `今日得天地正印生扶（${dayElement}生${birthElement}），贵人相助，事半功倍。`;
        energyScore = 96;
      } else if (
        (birthElement === "木" && dayElement === "火") ||
        (birthElement === "火" && dayElement === "土") ||
        (birthElement === "土" && dayElement === "金") ||
        (birthElement === "金" && dayElement === "水") ||
        (birthElement === "水" && dayElement === "木")
      ) {
        personalElementRelation = `今日食伤泄秀（${birthElement}生${dayElement}），才思泉涌，宜挥洒才华。`;
        energyScore = 90;
      } else {
        personalElementRelation = `今日财官暗动，能量丰沛，处事需张弛有度，以柔克刚。`;
        energyScore = 85;
      }
    } catch (e) {
      // fallback
    }
  }

  // 12 Shichen Fortune
  const branches = ["子(23-01)", "丑(01-03)", "寅(03-05)", "卯(05-07)", "辰(07-09)", "巳(09-11)", "午(11-13)", "未(13-15)", "申(15-17)", "酉(17-19)", "戌(19-21)", "亥(21-23)"];
  const hourlyFortune: Array<{ time: string; branch: string; status: '吉' | '平' | '慎' }> = branches.map((b, idx) => {
    const isJi = (idx + dayBranchIdx) % 3 === 0;
    const isShen = (idx + dayBranchIdx) % 5 === 0;
    return {
      time: b,
      branch: b.substring(0, 1),
      status: isJi ? '吉' : isShen ? '慎' : '平'
    };
  });

  return {
    dateStr: `${y}年${m}月${d}日`,
    ganzhiYear,
    ganzhiMonth,
    ganzhiDay,
    dayElement,
    dayAnimal,
    nobleDirection,
    wealthDirection,
    luckyColor,
    nobleZodiac,
    suitable,
    unsuitable,
    solarTerm: "时序流转",
    energyScore,
    personalElementRelation,
    hourlyFortune
  };
}
