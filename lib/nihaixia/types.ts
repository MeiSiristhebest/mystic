/**
 * 倪海厦《人纪》经方中医系统核心类型定义
 */

// ── 六经系统 ──
export type SixStages = 
  | 'taiyang'   // 太阳病 (太阳中风/伤寒/温病 - 表阳)
  | 'yangming'  // 阳明病 (经证/腑证 - 里热燥实)
  | 'shaoyang'  // 少阳病 (半表半里 - 枢机不利)
  | 'taiyin'    // 太阴病 (脾虚湿盛 - 脏寒中焦)
  | 'shaoyin'   // 少阴病 (心肾虚衰 - 寒化/热化)
  | 'jueyin';   // 厥阴病 (寒热错杂 - 厥热胜复/上热下寒)

export interface SixStagesInfo {
  stage: SixStages;
  nameCn: string;
  category: '阳经三阳' | '阴经三阴';
  keySymptoms: string[];
  organAssociation: string;
  representativeFormulas: string[];
}

// ── 倪师八大健康金标准 ──
export interface HealthStandardItem {
  id: string;
  title: string;
  dimension: 'sleep' | 'appetite' | 'thirst' | 'bowel' | 'urine' | 'temperature' | 'sweat' | 'vitality';
  question: string;
  idealStandard: string;
  explanation: string;
}

export interface HealthCheckAnswer {
  dimension: string;
  score: number; // 0 (极差/失衡) ~ 100 (完全符合金标准)
  detailText: string;
}

export interface HealthCheckResult {
  overallScore: number;
  yinYangBalance: '阴阳调和' | '阳虚阴盛' | '阴虚阳亢' | '阳明燥实' | '上热下寒' | '湿热互结';
  qiBloodStatus: '气血充盈' | '心肾不交' | '中焦脾寒' | '下焦阴寒' | '枢机不利';
  radarScores: {
    sleep: number;
    appetiteThirst: number;
    elimination: number; // 二便
    temperature: number; // 手足与身温
    sweatRegulation: number;
    vitality: number;
  };
  keyAdvice: string[];
  recommendedAcupoints: string[];
  dietaryRecommendations: string[];
}

// ── 五运六气系统 ──
export interface WuyunLiuqiResult {
  birthYear: number;
  yearGanZhi: string;
  
  // 岁运（大运）
  greatMovement: {
    element: '木' | '火' | '土' | '金' | '水';
    excessOrDeficiency: '太过' | '不及';
    desc: string;
  };

  // 司天与在泉（六气）
  siTian: {
    climate: string; // 如：少阴君火、太阴湿土
    organImpact: string;
    desc: string;
  };
  zaiQuan: {
    climate: string; // 如：阳明燥金、太阳寒水
    organImpact: string;
    desc: string;
  };

  // 先天体质倾向与脏腑弱项
  constitutionalTendency: {
    predisposition: string;
    vulnerableOrgans: string[];
    potentialPathologies: string[];
    lifestyleBalancingTips: string[];
    recommendedHerbalDiet: string[];
  };
}

// ── 经方知识库条目 ──
export interface ClassicFormula {
  id: string;
  name: string;
  source: '伤寒论' | '金匮要略' | '神农本草经' | '倪海厦人纪医案';
  sixStage: SixStages;
  composition: string[];
  keyPathology: string; // 核心病机
  nihaixiaInsight: string; // 倪师独到讲义考证与经方要诀
  indications: string[]; // 主治特征
  foodHerbalAnalogs: string[]; // 日常药食同源调理建议
  pairedAcupoints: string[]; // 协同针灸/艾灸穴位
}

// ── 医案 ──
export interface NihaixiaCase {
  id: string;
  title: string;
  chiefComplaint: string;
  syndromeAnalysis: string;
  prescribedFormula: string;
  outcome: string;
  classicQuote: string;
}
