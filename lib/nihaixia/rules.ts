/**
 * 倪海厦《人纪》经方六经辨证决策引擎与确定性规则库
 * 
 * 实现可追溯的推理链路：
 * 用户自述症状 / 八大金标准 / 五运六气 
 *   ↓
 * 确定性八纲六经规则树匹配
 *   ↓
 * 命中经典条文 (《伤寒论》《金匮要略》) + 经方机制 + 禁忌
 *   ↓
 * 组装 CanonicalEvidenceNode[] 与经典医案佐证 Few-Shot
 *   ↓
 * 注入 Prompt Context 供给 LLM 推理
 */

import { SixStages, NihaixiaCase } from './types';
import { CanonicalEvidenceNode } from '../contracts/types';
import { NIHAIXIA_CASES } from './cases';

export interface DiagnosticRule {
  id: string;
  name: string;
  sixStage: SixStages;
  dimension: 'health';
  patternName: string; // 证型名称
  keywords: string[];
  standardCriteria?: {
    dimension: string;
    condition: 'lt' | 'gt';
    threshold: number;
  }[];
  classicalCitation: string; // 经典出处与原文
  primaryFormula: string; // 对应经典经方
  formulaComposition: string[];
  pathologyMechanism: string; // 倪师核心病机拆解
  acupoints: string[];
  foodTherapy: string[];
  contraindication: string; // 禁忌与误治警示
  matchedCaseId?: string;
}

export const NIHAIXIA_DIAGNOSTIC_RULES: DiagnosticRule[] = [
  // ── 太阳病 (表证) ──
  {
    id: 'RULE_TAIYANG_ZHONGFENG',
    name: '太阳中风营卫不和证',
    sixStage: 'taiyang',
    dimension: 'health',
    patternName: '太阳中风（表虚证）',
    keywords: ['恶风', '怕风', '自汗', '出汗', '发热', '头痛', '鼻鸣', '干呕', '脉浮缓'],
    standardCriteria: [{ dimension: 'sweat', condition: 'lt', threshold: 65 }],
    classicalCitation: '《伤寒论》第12条：“太阳中风，阳浮而阴弱，阳浮者热自发，阴弱者汗自出，啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。”',
    primaryFormula: '桂枝汤',
    formulaComposition: ['桂枝', '白芍', '生姜', '大枣', '炙甘草'],
    pathologyMechanism: '风邪侵袭肌表，卫阳浮于外而发热，营阴不能内守而汗出。卫强营弱，需借桂枝宣阳、白芍敛阴，二者等量一散一收，调和营卫。',
    acupoints: ['风池穴', '大椎穴', '足三里'],
    foodTherapy: ['生姜红枣红糖茶', '热稀粥覆被取微汗'],
    contraindication: '汗出恶风者切忌盲目使用大苦大寒退热药，亦不可单用麻黄重汗，以免大汗亡阳。',
    matchedCaseId: 'case_taiyang_guizhi',
  },
  {
    id: 'RULE_TAIYANG_SHANGHAN',
    name: '太阳伤寒表实无汗证',
    sixStage: 'taiyang',
    dimension: 'health',
    patternName: '太阳伤寒（表实证）',
    keywords: ['恶寒', '怕冷', '无汗', '骨节痛', '身痛', '骨头酸痛', '气喘', '脉浮紧'],
    standardCriteria: [{ dimension: 'sweat', condition: 'lt', threshold: 50 }, { dimension: 'temperature', condition: 'lt', threshold: 60 }],
    classicalCitation: '《伤寒论》第35条：“太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风无汗而喘者，麻黄汤主之。”',
    primaryFormula: '麻黄汤',
    formulaComposition: ['麻黄', '桂枝', '杏仁', '炙甘草'],
    pathologyMechanism: '寒邪严密束缚肌表毛孔，卫阳郁闭不得宣泄，肺气失宣。麻黄开发毛孔以宣肺平喘，桂枝通经达络逐深层寒气，杏仁降气下水。',
    acupoints: ['列缺穴', '合谷穴', '风门穴'],
    foodTherapy: ['葱白生姜紫苏饮', '热汤微汗排寒'],
    contraindication: '失血家、咽干口燥或虚劳脉弱者禁用麻黄峻汗。',
    matchedCaseId: 'case_taiyang_mahuang',
  },

  // ── 少阳病 (半表半里枢机) ──
  {
    id: 'RULE_SHAOYANG_SHUJI',
    name: '少阳枢机不利胆热脾寒证',
    sixStage: 'shaoyang',
    dimension: 'health',
    patternName: '少阳经病（半表半里）',
    keywords: ['往来寒热', '胸胁苦满', '胸口胀', '偏头痛', '口苦', '咽干', '目眩', '恶心', '喜呕', '默默不欲饮食', '心烦'],
    standardCriteria: [{ dimension: 'appetite', condition: 'lt', threshold: 60 }, { dimension: 'sleep', condition: 'lt', threshold: 65 }],
    classicalCitation: '《伤寒论》第96条：“伤寒五六日中风，往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕...小柴胡汤主之。”',
    primaryFormula: '小柴胡汤',
    formulaComposition: ['柴胡', '黄芩', '人参', '半夏', '生姜', '大枣', '炙甘草'],
    pathologyMechanism: '邪在半表半里，少阳相火郁滞，胆木克逆中焦脾土。柴胡透达少阳郁火，黄芩清胆热，半夏生姜降逆和胃，人参甘草大枣安固中焦防邪入阴经。',
    acupoints: ['阳陵泉（胆经合穴）', '太冲穴（平肝解郁）', '内关穴'],
    foodTherapy: ['陈皮佛手枸杞茶', '柴胡菊花决明茶'],
    contraindication: '少阳病禁用汗、吐、下三法，唯有“和法”运转少阳枢机方为正治。',
    matchedCaseId: 'case_liver_depression',
  },

  // ── 阳明病 (里热实证) ──
  {
    id: 'RULE_YANGMING_JING',
    name: '阳明经热炽盛大渴证',
    sixStage: 'yangming',
    dimension: 'health',
    patternName: '阳明经证（大热大渴）',
    keywords: ['身大热', '大渴', '想喝冰水', '喝冷饮', '大汗出', '口燥咽干', '面赤', '脉洪大'],
    standardCriteria: [{ dimension: 'thirst', condition: 'lt', threshold: 50 }, { dimension: 'temperature', condition: 'gt', threshold: 75 }],
    classicalCitation: '《伤寒论》第176条：“伤寒，脉浮滑，此表无寒，里有热，白虎汤主之。”第26条：“服桂枝汤，大汗出后，大烦渴不解，脉洪大者，白虎加人参汤主之。”',
    primaryFormula: '白虎汤 / 白虎加人参汤',
    formulaComposition: ['生石膏', '知母', '炙甘草', '粳米', '人参(可选)'],
    pathologyMechanism: '邪入阳明化燥成热，四大症具显（大热、大汗、大渴、脉洪大）。生石膏辛甘大寒清透阳明无形之热而不伤胃，知母苦寒滋阴润燥，粳米甘草顾护胃气生津。',
    acupoints: ['曲池穴', '内庭穴（胃经荥穴清热）', '合谷穴'],
    foodTherapy: ['西瓜翠衣鲜芦根水', '麦冬百合生津饮'],
    contraindication: '无大渴大热、脉虚细无力者切不可妄投石膏，防伤胃阳。',
    matchedCaseId: 'case_yangming_baihu',
  },

  // ── 太阴病 (中焦虚寒与水饮) ──
  {
    id: 'RULE_TAIYIN_PIXU_HANSHI',
    name: '太阴脾虚脏寒水饮内停证',
    sixStage: 'taiyin',
    dimension: 'health',
    patternName: '太阴虚寒（脾阳不振）',
    keywords: ['大便稀溏', '便溏', '腹泻', '腹胀', '胃胀', '吃不下', '食欲差', '腹满', '时腹自痛', '手脚冰冷'],
    standardCriteria: [{ dimension: 'bowel', condition: 'lt', threshold: 60 }, { dimension: 'appetite', condition: 'lt', threshold: 60 }],
    classicalCitation: '《伤寒论》第273条：“太阴之为病，腹满而吐，食不下，自利益甚，时腹自痛。若下之，必胸下结硬。”第277条：“自利不渴者，属太阴，以其脏有寒故也，当温之，宜服四逆辈。”',
    primaryFormula: '理中汤 / 附子理中汤',
    formulaComposition: ['人参', '干姜', '白术', '炙甘草', '制附子(寒甚加)'],
    pathologyMechanism: '中焦脾胃真阳受损，阴寒内生，不能运化水湿与精微。干姜大辛大热直入中焦温脾逐寒，白术苦温燥湿健脾，参草补气培元。',
    acupoints: ['中脘穴', '足三里', '关元穴（艾灸大补脾阳）', '脾俞穴'],
    foodTherapy: ['干姜红枣炒米粥', '胡椒生姜猪肚汤', '山药莲子砂仁羹'],
    contraindication: '脾虚水泻忌用苦寒通便或消食伤阳之品，必须温中健脾以绝其源。',
    matchedCaseId: 'case_taiyin_lizhong',
  },
  {
    id: 'RULE_TAIYIN_SHUICHONG_XINJI',
    name: '中阳不足水气凌心目眩心悸证',
    sixStage: 'taiyin',
    dimension: 'health',
    patternName: '太阴水气上冲（心下停饮）',
    keywords: ['心悸', '心慌', '头晕', '目眩', '头昏沉', '起立头晕', '胸胁胀满', '短气', '恶心水泛'],
    standardCriteria: [{ dimension: 'sleep', condition: 'lt', threshold: 60 }, { dimension: 'vitality', condition: 'lt', threshold: 60 }],
    classicalCitation: '《金匮要略·痰饮咳嗽病脉证并治》：“心下有痰饮，胸胁支满，目眩，苓桂术甘汤主之。”',
    primaryFormula: '苓桂术甘汤',
    formulaComposition: ['茯苓', '桂枝', '白术', '炙甘草'],
    pathologyMechanism: '中阳虚衰不能制水，水饮聚于心下胃脘，阴邪上冲凌犯心胸。茯苓淡渗利湿化水饮，桂枝辛温下气降水冲并温心阳，白术甘草崇土以制水。',
    acupoints: ['膻中穴', '内关穴', '丰隆穴（化痰要穴）', '水分穴'],
    foodTherapy: ['茯苓山药赤小豆粥', '桂枝陈皮生姜饮'],
    contraindication: '心下水饮忌用纯温燥或妄用镇静安神，需温化水湿降冲逆。',
    matchedCaseId: 'case_insomnia_water',
  },

  // ── 少阴病 (心肾真阳衰微) ──
  {
    id: 'RULE_SHAOYIN_XINSHEN_YANGXU',
    name: '少阴心肾阳虚真阳不足水泛证',
    sixStage: 'shaoyin',
    dimension: 'health',
    patternName: '少阴阳虚（心肾阴寒）',
    keywords: ['常年手脚冰凉', '手脚冰冷', '手足逆冷', '恶寒蜷卧', '怕冷畏寒', '但欲寐', '精神萎靡', '夜尿频多', '夜尿清长', '小便清长', '腰酸膝软', '浮肿', '下肢冷'],
    standardCriteria: [{ dimension: 'temperature', condition: 'lt', threshold: 55 }, { dimension: 'urine', condition: 'lt', threshold: 60 }],
    classicalCitation: '《伤寒论》第281条：“少阴之为病，脉微细，但欲寐也。”第82条：“太阳病发汗，汗出不解，其人仍发热，心下悸，头眩，身瞤动，振振欲擗地者，真武汤主之。”',
    primaryFormula: '真武汤 / 四逆汤',
    formulaComposition: ['制附子', '茯苓', '白芍', '白术', '生姜'],
    pathologyMechanism: '少阴本虚，心肾真火衰微，下焦如冰窖，水邪泛滥。附子大辛大热直补命门真火以化冰水，茯苓白术健脾渗湿，白芍敛阴防附子之燥，生姜宣散外越。',
    acupoints: ['命门穴', '关元穴（重度艾灸）', '太溪穴（肾经原穴）', '涌泉穴'],
    foodTherapy: ['肉桂生姜炖羊肉汤', '熟地黑豆制首乌核桃茶'],
    contraindication: '少阴阳虚忌用任何寒凉清火药，即便有虚阳外越（面赤咽干）亦属真寒假热，必须温阳引火归元。',
    matchedCaseId: 'case_cold_extremities',
  },

  // ── 厥阴病 (寒热错杂 / 上热下寒) ──
  {
    id: 'RULE_JUEYIN_SHANGRE_XIAHAN',
    name: '厥阴寒热错杂上热下寒厥热胜复证',
    sixStage: 'jueyin',
    dimension: 'health',
    patternName: '厥阴寒热错杂（上热下寒）',
    keywords: ['上热下寒', '头面发热手脚冰凉', '口腔溃疡手脚冷', '胸中烦热脚冷', '消渴', '心中疼热', '饥而不欲食', '情绪焦虑易怒'],
    standardCriteria: [{ dimension: 'temperature', condition: 'lt', threshold: 60 }, { dimension: 'sleep', condition: 'lt', threshold: 60 }],
    classicalCitation: '《伤寒论》第326条：“厥阴之为病，消渴，气上撞心，心中疼热，饥而不欲食，食则吐蛔，下之利不止。”',
    primaryFormula: '乌梅丸 / 半夏泻心汤',
    formulaComposition: ['乌梅', '黄连', '黄柏', '干姜', '细辛', '制附子', '桂枝', '人参', '当归', '花椒'],
    pathologyMechanism: '阴尽阳生之界，阴阳气不相顺接。肝木相火上冲致头面心胸烦热，下焦肾命真阳衰微致腰膝双足冰寒。以乌梅酸收敛肝，连柏苦寒清上焦实火，姜辛附椒大辛大热温下焦寒窟，参归和营调血。',
    acupoints: ['行间穴', '太冲穴', '三阴交', '涌泉穴（引火归元）'],
    foodTherapy: ['乌梅干姜红枣饮', '肉桂生姜山楂茶'],
    contraindication: '上热下寒者严禁单投苦寒清热或单投热药温燥，必须寒热并用、攻补兼施方能调和水火。',
    matchedCaseId: 'case_jueyin_wumei',
  }
];

export interface DiagnosticResult {
  matchedRules: DiagnosticRule[];
  evidences: CanonicalEvidenceNode[];
  selectedCases: NihaixiaCase[];
  dominantSixStage: SixStages;
  syndromeSummary: string;
}

/**
 * 确定性六经辨证匹配器
 */
export function matchDiagnosticRules(
  symptoms: string,
  healthScores?: Record<string, number>,
  wuyunLiuqi?: any
): DiagnosticResult {
  const normalizedText = (symptoms || '').toLowerCase();
  const scoredRules: Array<{ rule: DiagnosticRule; score: number }> = [];

  for (const rule of NIHAIXIA_DIAGNOSTIC_RULES) {
    let matchScore = 0;

    // 1. Check keyword occurrences
    for (const kw of rule.keywords) {
      if (normalizedText.includes(kw.toLowerCase())) {
        matchScore += 2.0;
      }
    }

    // 2. Check health standard criteria
    if (healthScores && rule.standardCriteria) {
      for (const crit of rule.standardCriteria) {
        const val = healthScores[crit.dimension];
        if (typeof val === 'number') {
          if (crit.condition === 'lt' && val < crit.threshold) {
            matchScore += 1.5;
          } else if (crit.condition === 'gt' && val > crit.threshold) {
            matchScore += 1.5;
          }
        }
      }
    }

    // 3. Wuyun Liuqi predisposition boost
    if (wuyunLiuqi?.constitutionalTendency) {
      const vul = wuyunLiuqi.constitutionalTendency.vulnerableOrgans || [];
      if (rule.sixStage === 'taiyin' && vul.some((o: string) => o.includes('脾') || o.includes('胃'))) {
        matchScore += 1.0;
      }
      if (rule.sixStage === 'shaoyin' && vul.some((o: string) => o.includes('肾') || o.includes('心'))) {
        matchScore += 1.0;
      }
      if (rule.sixStage === 'shaoyang' && vul.some((o: string) => o.includes('肝') || o.includes('胆'))) {
        matchScore += 1.0;
      }
    }

    if (matchScore > 0) {
      scoredRules.push({ rule, score: matchScore });
    }
  }

  // Sort descending by score
  scoredRules.sort((a, b) => b.score - a.score);

  // Take top 1-3 matched rules
  const topMatched = scoredRules.length > 0 
    ? scoredRules.slice(0, 3).map(s => s.rule)
    : [NIHAIXIA_DIAGNOSTIC_RULES[2]]; // Default fallback: Shaoyang Shuji / Xiaochaihu

  const dominantRule = topMatched[0];
  const dominantSixStage = dominantRule.sixStage;

  // Select matching cases
  const matchedCaseIds = new Set(topMatched.map(r => r.matchedCaseId).filter(Boolean));
  let selectedCases = NIHAIXIA_CASES.filter(c => matchedCaseIds.has(c.id));
  if (selectedCases.length === 0) {
    selectedCases = NIHAIXIA_CASES.slice(0, 2);
  }

  // Generate Canonical Evidence Nodes
  const evidences: CanonicalEvidenceNode[] = topMatched.map((r, idx) => ({
    id: `tcm_rule_${r.id.toLowerCase()}`,
    domain: 'nihaixia',
    ruleId: r.id,
    ruleName: r.name,
    level: idx === 0 ? 'core' : 'support',
    dimension: 'health',
    polarity: r.sixStage.startsWith('shao') || r.sixStage.startsWith('tai') ? 'transformative' : 'unfavorable',
    confidence: Math.min(0.75 + (idx === 0 ? 0.2 : 0.1), 0.95),
    parameters: {
      sixStage: r.sixStage,
      formula: r.primaryFormula,
      composition: r.formulaComposition,
      acupoints: r.acupoints,
    },
    classicalSource: r.classicalCitation,
    canonicalInterpretation: `辨证定为【${r.patternName}】，核心病机：${r.pathologyMechanism} 首选经方：${r.primaryFormula}（组成：${r.formulaComposition.join('、')}）。禁忌：${r.contraindication}`,
  }));

  const syndromeSummary = `核心辨证归入【${dominantRule.patternName}】（六经：${dominantRule.sixStage.toUpperCase()}），病机关键为“${dominantRule.pathologyMechanism.slice(0, 50)}...”，经方宗案对准《${dominantRule.primaryFormula}》。`;

  return {
    matchedRules: topMatched,
    evidences,
    selectedCases,
    dominantSixStage,
    syndromeSummary,
  };
}
