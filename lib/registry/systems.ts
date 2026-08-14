import {
  Sparkles,
  Compass,
  Star,
  Leaf,
  Moon,
  Zap,
  Users,
  Clock,
  Globe,
  Smile,
  LucideIcon,
} from "lucide-react";

export type SystemCategory = "core" | "advanced";

export interface MysticSystemDefinition {
  id: string;
  name: string;
  category: SystemCategory;
  icon: LucideIcon;
  desc: string;
  bgImage: string;
  defaultEnabled: boolean;
  tagline?: string;
}

export const SYSTEM_DEFINITIONS: MysticSystemDefinition[] = [
  // --- 6 大核心体系 (探索大厅) ---
  {
    id: "tarot",
    name: "塔罗仪式",
    category: "core",
    icon: Sparkles,
    desc: "西方神秘学的基石。通过78张卡片，洞察能量的微妙流动与潜意识投射。",
    bgImage: "/systems/tarot.jpg",
    defaultEnabled: true,
    tagline: "感知潜意识与共时性流动",
  },
  {
    id: "eastern",
    name: "东方命理",
    category: "core",
    icon: Compass,
    desc: "融合八字、易经、倪海厦天纪紫微(80+经典格局)与相学。推演人生起伏。",
    bgImage: "/systems/eastern.jpg",
    defaultEnabled: true,
    tagline: "天纪紫微格局与四化精微",
  },
  {
    id: "vedic",
    name: "吠陀占星",
    category: "core",
    icon: Star,
    desc: "古印度恒星黄道(Jyotish)。审计27月宿、D1/D9/D10分盘、Vimsottari大运与灵魂星。",
    bgImage: "/systems/vedic.jpg",
    defaultEnabled: true,
    tagline: "恒星黄道与灵魂契约审计",
  },
  {
    id: "renji",
    name: "人纪经方",
    category: "core",
    icon: Leaf,
    desc: "倪海厦《人纪》经方体系。八大健康金标准自测、六经病机辨证问止与五运六气体质。",
    bgImage: "/systems/renji.jpg",
    defaultEnabled: true,
    tagline: "六经辨证问止与五运六气",
  },
  {
    id: "astrology",
    name: "星象人格",
    category: "core",
    icon: Moon,
    desc: "结合高精度天体星盘与心理学。解读星盘、合盘与MBTI，探索性格蓝图与命运契机。",
    bgImage: "/systems/astrology.jpg",
    defaultEnabled: true,
    tagline: "天体几何与荣格人格蓝图",
  },
  {
    id: "soul",
    name: "心灵实验室",
    category: "core",
    icon: Zap,
    desc: "深层心理探索。包含阴影工作、双人六维合盘、梦境解析等进阶神秘学工具。",
    bgImage: "/systems/soul.jpg",
    defaultEnabled: true,
    tagline: "阴影转化与深层潜意识觉照",
  },

  // --- 4 大进阶体系 (更多奥秘) ---
  {
    id: "synastry",
    name: "三才合参",
    category: "advanced",
    icon: Users,
    desc: "多维度的关系合盘。探索两人之间的业力纠缠与灵魂契约。",
    bgImage: "/systems/synastry.jpg",
    defaultEnabled: true,
    tagline: "六维因果引力与能量契合",
  },
  {
    id: "time",
    name: "时空智慧",
    category: "advanced",
    icon: Clock,
    desc: "穿越过去与未来，解析特定时间节点的能量轨迹。",
    bgImage: "/systems/time.jpg",
    defaultEnabled: true,
    tagline: "时间节点能量周期推演",
  },
  {
    id: "collective",
    name: "集体镜像",
    category: "advanced",
    icon: Globe,
    desc: "探索你与世界、社会趋势之间的潜意识连结。",
    bgImage: "/systems/collective.jpg",
    defaultEnabled: true,
    tagline: "阿卡夏网络与时代共振",
  },
  {
    id: "face",
    name: "灵气面相",
    category: "advanced",
    icon: Smile,
    desc: "融合传统相术与能量场感应，洞察你的隐藏特质。",
    bgImage: "/systems/face.jpg",
    defaultEnabled: true,
    tagline: "五官气色与能量光晕洞察",
  },
];

export const SYSTEM_MAP = new Map<string, MysticSystemDefinition>(
  SYSTEM_DEFINITIONS.map((sys) => [sys.id, sys])
);

export function getCoreSystems(): MysticSystemDefinition[] {
  return SYSTEM_DEFINITIONS.filter((sys) => sys.category === "core");
}

export function getAdvancedSystems(): MysticSystemDefinition[] {
  return SYSTEM_DEFINITIONS.filter((sys) => sys.category === "advanced");
}

export function getSystemById(id: string): MysticSystemDefinition | undefined {
  return SYSTEM_MAP.get(id);
}

export function getDefaultEnabledModules(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const sys of SYSTEM_DEFINITIONS) {
    result[sys.id] = sys.defaultEnabled;
  }
  return result;
}

export type SystemId = (typeof SYSTEM_DEFINITIONS)[number]["id"];
