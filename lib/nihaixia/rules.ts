/**
 * 倪海厦《人纪》经方六经差分辨证决策引擎与确定性规则库
 * 
 * 核心升级：
 * 1. 废除任何无根据的默认经方兜底（如默认小柴胡汤）。
 * 2. 引入 Positive（支持）、Negative（排除/反证）与 Missing Observations（缺失指征）。
 * 3. 规范化四维置信度计算与经典条文依据。
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
  positiveKeywords: string[]; // 支持指征
  negativeKeywords: string[]; // 排除反证 (Contra-indicators)
  requiredObservations: string[]; // 判定所需核心四诊项
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
    positiveKeywords: ['恶风', '怕风', '自汗', '出汗', '发热', '头痛', '鼻鸣', '干呕', '脉浮缓', '微汗'],
    negativeKeywords: ['无汗', '大渴喜冷饮', '便秘不通', '脉浮紧', '日晡潮热'],
    requiredObservations: ['出汗情况 (自汗出)', '恶风程度', '脉象 (浮缓)'],
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
    positiveKeywords: ['恶寒', '怕冷', '无汗', '骨节痛', '身痛', '骨头酸痛', '气喘', '脉浮紧', '全身酸痛'],
    negativeKeywords: ['自汗', '多汗', '大渴喜冷饮', '脉浮弱', '便秘'],
    requiredObservations: ['出汗情况 (无汗)', '恶寒程度', '全身关节疼痛', '脉象 (浮紧)'],
    standardCriteria: [{ dimension: 'sweat', condition: 'lt', threshold: 50 }, { dimension: 'temperature', condition: 'lt', threshold: 60 }],
    classicalCitation: '《伤寒论》第35条：“太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风无汗而喘者，麻黄汤主之。”',
    primaryFormula: '麻黄汤',
    formulaComposition: ['麻黄', '桂枝', '杏仁', '炙甘草'],
    pathologyMechanism: '寒邪严密束缚肌表毛孔，卫阳郁闭不得宣泄，肺气失宣。麻黄开发毛孔以宣肺平喘，桂枝通经达络逐深层寒气，杏仁降气下水。',
    acupoints: ['列缺穴', '合谷穴', '风门穴'],
    foodTherapy: ['葱白生姜紫苏饮', '热汤微汗排寒'],
    contraindication: '失血家、咽干口燥、自汗出或虚劳脉弱者禁用麻黄峻汗。',
    matchedCaseId: 'case_taiyang_mahuang',
  },

  // ── 少阳病 (半表半里枢机) ──
  {
    id: 'RULE_SHAOYANG_SHUJI',
    name: '少阳枢机不利胆热脾寒证',
    sixStage: 'shaoyang',
    dimension: 'health',
    patternName: '少阳经病（半表半里）',
    positiveKeywords: ['往来寒热', '胸胁苦满', '胸口胀', '偏头痛', '口苦', '咽干', '目眩', '恶心', '喜呕', '默默不欲饮食', '心烦', '肋痛'],
    negativeKeywords: ['大便溏泻不止', '四肢厥逆', '身重发黄'],
    requiredObservations: ['往来寒热发作规律', '胸胁胀满感', '口苦咽干目眩 (少阳三纲)'],
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
    name: '阳明经热炽盛四大证',
    sixStage: 'yangming',
    dimension: 'health',
    patternName: '阳明经证（大热大渴）',
    positiveKeywords: ['大热', '大渴', '大汗', '喜冷饮', '口渴引饮', '面红目赤', '烦躁口渴', '脉洪大'],
    negativeKeywords: ['畏寒恶风', '四肢厥冷', '下利清谷', '无汗'],
    requiredObservations: ['体温热势', '饮水喜冷喜温及饮水量', '出汗量', '脉象 (洪大)'],
    standardCriteria: [{ dimension: 'thirst', condition: 'gt', threshold: 75 }],
    classicalCitation: '《伤寒论》第176条：“伤寒，脉浮滑，此表无寒，里有热，白虎汤主之。”第26条：“服桂枝汤，大汗出后，大烦渴不解，脉洪大者，白虎加人参汤主之。”',
    primaryFormula: '白虎汤 / 白虎加人参汤',
    formulaComposition: ['知母', '生石膏', '甘草', '粳米', '人参'],
    pathologyMechanism: '阳热入里亢盛，充斥三焦经络，燥热内盛蒸腾津液。生石膏大寒辛凉直折胃热，知母苦寒滋阴润燥，粳米甘草护胃保津。',
    acupoints: ['曲池穴', '合谷穴', '内庭穴'],
    foodTherapy: ['生石膏芦根绿豆饮', '鲜藕荸荠雪梨汁'],
    contraindication: '表证未解、恶寒无汗或虚寒体质者切禁使用生石膏大寒之剂。',
    matchedCaseId: 'case_yangming_baihu',
  },
  {
    id: 'RULE_YANGMING_FU',
    name: '阳明腑实燥屎内结证',
    sixStage: 'yangming',
    dimension: 'health',
    patternName: '阳明腑证（痞满燥实坚）',
    positiveKeywords: ['便秘', '腹满胀痛', '日晡潮热', '手足濈然汗出', '谵语', '大便硬', '数日不大便', '痛拒按', '脉沉实'],
    negativeKeywords: ['腹泻溏薄', '下利清谷', '恶寒蜷卧'],
    requiredObservations: ['排便天数及质地', '腹部压痛 (拒按/喜按)', '潮热发作时间'],
    standardCriteria: [{ dimension: 'bowel', condition: 'lt', threshold: 40 }],
    classicalCitation: '《伤寒论》第208条：“阳明病，脉迟，虽汗出不恶寒者，其身必重，短气，腹满而喘，有潮热者，此外欲解，可攻其里也。手足濈然汗出者，此大便已硬也，大承气汤主之。”',
    primaryFormula: '大承气汤 / 调胃承气汤',
    formulaComposition: ['大黄', '芒硝', '枳实', '厚朴'],
    pathologyMechanism: '胃肠热结津枯，燥屎内结阻断下焦气机。大黄苦寒逐实下燥，芒硝咸寒软坚润燥，枳实厚朴行气破结除痞满。',
    acupoints: ['天枢穴', '大巨穴', '支沟穴', '上巨虚'],
    foodTherapy: ['决明子火麻仁茶', '菠菜芝麻通便羹'],
    contraindication: '脾胃虚寒久泻者、孕妇及气血虚弱者严禁攻下峻剂。',
    matchedCaseId: 'case_yangming_chengqi',
  },

  // ── 太阴病 (中焦脾虚湿寒) ──
  {
    id: 'RULE_TAIYIN_PIXU',
    name: '太阴脾虚中焦虚寒腹满下利证',
    sixStage: 'taiyin',
    dimension: 'health',
    patternName: '太阴虚寒（脾虚湿停）',
    positiveKeywords: ['腹满', '下利', '拉肚子', '便溏', '食不下', '胃口差', '食欲不振', '吐食', '喜温喜按', '肚子凉', '脉沉缓'],
    negativeKeywords: ['大便燥结', '口渴引饮', '日晡潮热', '腹痛拒按'],
    requiredObservations: ['大便形态 (溏泻/成形)', '腹痛性质 (喜按/拒按)', '胃脘温热喜好'],
    standardCriteria: [{ dimension: 'appetite', condition: 'lt', threshold: 50 }, { dimension: 'bowel', condition: 'lt', threshold: 55 }],
    classicalCitation: '《伤寒论》第273条：“太阴之为病，腹满而吐，食不下，自利益甚，时腹自痛，若下之，必胸下结硬。”第277条：“自利不渴者，属太阴，以其脏有寒故也，当温之，宜服理中四逆辈。”',
    primaryFormula: '理中汤 / 附子理中汤',
    formulaComposition: ['人参', '干姜', '白术', '炙甘草', '炮附子'],
    pathologyMechanism: '中焦脾阳不运，阴寒内阻，不能化生精微。干姜辛热温运中焦寒湿，人参甘温大补脾胃元气，白术苦温健脾燥湿，甘草和中。',
    acupoints: ['中脘穴', '足三里', '脾俞穴', '神阙穴（艾灸）'],
    foodTherapy: ['干姜红枣炖白术汤', '茯苓山药健脾粥'],
    contraindication: '太阴虚寒忌用生冷寒凉、瓜果及清热泻下药物，当以温中健脾为纲。',
    matchedCaseId: 'case_spleen_dampness',
  },

  // ── 少阴病 (心肾阳虚真阳不足) ──
  {
    id: 'RULE_SHAOYIN_XINSHEN_YANGXU',
    name: '少阴心肾阳虚真阳不足水泛证',
    sixStage: 'shaoyin',
    dimension: 'health',
    patternName: '少阴阳虚（真阳式微）',
    positiveKeywords: ['手足冰凉', '畏寒', '恶寒蜷卧', '手脚冰冷', '夜尿频', '夜尿多', '但欲寐', '嗜睡', '精神萎靡', '头昏眼花', '下利清谷', '小便清长', '肢冷', '脉微细'],
    negativeKeywords: ['口苦咽干', '便秘坚硬', '满面红光', '身热汗出'],
    requiredObservations: ['四肢冷热界限 (是否过肘膝)', '精神状态 (但欲寐)', '夜尿次数与色泽', '脉象 (微细)'],
    standardCriteria: [{ dimension: 'temperature', condition: 'lt', threshold: 45 }, { dimension: 'urine', condition: 'lt', threshold: 50 }],
    classicalCitation: '《伤寒论》第281条：“少阴之为病，脉微细，但欲寐也。”第316条：“少阴病，二三日不已，至四五日，腹痛，小便不利，四肢沉重疼痛，自下利者，此为有水气...真武汤主之。”',
    primaryFormula: '真武汤 / 四逆汤',
    formulaComposition: ['制附子', '茯苓', '白芍', '白术', '生姜'],
    pathologyMechanism: '心肾真阳衰微，君火命门火衰，下焦水饮不能气化而泛溢四肢。炮附子大辛大热直入少阴回阳逐阴寒，白术茯苓健脾燥湿利水，白芍敛阴缓急利小便。',
    acupoints: ['关元穴（灸）', '涌泉穴', '太溪穴', '命门穴'],
    foodTherapy: ['肉桂当归羊肉汤', '制附子干姜温阳汤'],
    contraindication: '真阳亏虚严禁一切滋阴降火、寒凉清热利尿药，当固护真阳以挽生命根底。',
    matchedCaseId: 'case_kidney_yang_deficiency',
  },

  // ── 厥阴病 (寒热错杂厥逆) ──
  {
    id: 'RULE_JUEYIN_HANRE_CUOZA',
    name: '厥阴上热下寒蛔厥气上撞心证',
    sixStage: 'jueyin',
    dimension: 'health',
    patternName: '厥阴经病（阴阳气不相顺接）',
    positiveKeywords: ['上热下寒', '胃热下寒', '消渴', '气上撞心', '心中疼热', '饥而不欲食', '下冷', '手足厥逆', '舌红苔白', '口干不欲饮'],
    negativeKeywords: ['单纯表热', '单纯表实无汗'],
    requiredObservations: ['上下身寒热对比 (头面热而下肢冷)', '心中热感与饥饿感', '厥逆与发热交替规律'],
    standardCriteria: [{ dimension: 'temperature', condition: 'lt', threshold: 55 }],
    classicalCitation: '《伤寒论》第326条：“厥阴之为病，消渴，气上冲心，心中疼热，饥而不欲食，食则吐蛔，下之利不止。”',
    primaryFormula: '乌梅丸',
    formulaComposition: ['乌梅', '细辛', '干姜', '黄连', '当归', '炮附子', '花椒', '桂枝', '人参', '黄柏'],
    pathologyMechanism: '阴极阳生之际阴阳交错不顺。肝木失调，寒热错杂于中。乌梅苦酸安蛔下气，黄连黄柏清上部相火，干姜附子细辛椒目温下焦极冷，人参当归养气血。',
    acupoints: ['太冲穴', '足厥阴大敦穴', '期门穴', '行间穴'],
    foodTherapy: ['乌梅生姜山楂茶', '当归干姜调中汤'],
    contraindication: '厥阴寒热错杂严禁单纯重用苦寒清热或单纯重用辛热，必须寒热并用、攻补兼施。',
    matchedCaseId: 'case_jueyin_wumei',
  },
];

export interface DiagnosticResult {
  status: 'confirmed' | 'candidate' | 'insufficient_evidence';
  matchedRules: DiagnosticRule[];
  evidences: CanonicalEvidenceNode[];
  selectedCases: NihaixiaCase[];
  dominantSixStage: SixStages | 'unresolved';
  syndromeSummary: string;
  missingObservations?: string[];
  disclaimer: string;
}

const MEDICAL_DISCLAIMER = '【免责声明】本系统所有推演与辨证结论基于《伤寒论》《金匮要略》古籍文献与倪海厦先生学术思想理论整理，仅供传统中医学术研究与个人健康素养参考，严禁作为临床诊断或用药处方凭据。若有身体不适，请前往正规医疗机构就诊。';

/**
 * 确定性六经差分辨证匹配器
 */
export function matchDiagnosticRules(
  symptoms: string,
  healthScores?: Record<string, number>,
  wuyunLiuqi?: any
): DiagnosticResult {
  const normalizedText = (symptoms || '').toLowerCase().trim();
  const scoredRules: Array<{ rule: DiagnosticRule; score: number; positiveHits: string[]; negativeHits: string[] }> = [];

  for (const rule of NIHAIXIA_DIAGNOSTIC_RULES) {
    let matchScore = 0;
    const positiveHits: string[] = [];
    const negativeHits: string[] = [];

    // 1. Check positive keywords
    for (const kw of rule.positiveKeywords) {
      if (normalizedText.includes(kw.toLowerCase())) {
        matchScore += 2.5;
        positiveHits.push(kw);
      }
    }

    // 2. Check negative (counter-evidence) keywords
    for (const nkw of rule.negativeKeywords) {
      if (normalizedText.includes(nkw.toLowerCase())) {
        matchScore -= 3.0; // Heavy penalty for counter indicators
        negativeHits.push(nkw);
      }
    }

    // 3. Check health standard criteria
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

    // 4. Wuyun Liuqi predisposition boost
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

    if (matchScore > 1.5 && positiveHits.length > 0) {
      scoredRules.push({ rule, score: matchScore, positiveHits, negativeHits });
    }
  }

  // Sort descending by score
  scoredRules.sort((a, b) => b.score - a.score);

  // Insufficient Evidence Check
  if (scoredRules.length === 0) {
    return {
      status: 'insufficient_evidence',
      matchedRules: [],
      evidences: [],
      selectedCases: NIHAIXIA_CASES.slice(0, 2),
      dominantSixStage: 'unresolved',
      syndromeSummary: '当前输入症状缺乏六经定性之特异性指征，不足以确立经典证型。建议补充四诊核心要素以支持差分辨证。',
      missingObservations: [
        '出汗状况（自汗出 / 无汗 / 盗汗 / 汗出部位）',
        '寒热喜恶（恶风 / 恶寒 / 发热 / 往来寒热 / 手足冰冷过肘膝）',
        '口渴与喜饮（口干不欲饮 / 大渴喜冷饮 / 渴喜温水）',
        '二便性状（大便干结 / 溏泻夹杂 / 小便清长 / 小便黄赤不利）',
        '舌苔与脉象（舌质淡红/红/暗，苔薄白/白厚腻/黄燥；脉浮/沉/迟/数/微细）',
      ],
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // Take top matched rules
  const topMatched = scoredRules.slice(0, 3).map(s => s.rule);
  const dominantRule = topMatched[0];
  const dominantSixStage = dominantRule.sixStage;
  const isHighConfidence = scoredRules[0].score >= 4.0;

  // Select matching cases
  const matchedCaseIds = new Set(topMatched.map(r => r.matchedCaseId).filter(Boolean));
  let selectedCases = NIHAIXIA_CASES.filter(c => matchedCaseIds.has(c.id));
  if (selectedCases.length === 0) {
    selectedCases = NIHAIXIA_CASES.slice(0, 2);
  }

  // Generate Canonical Evidence Nodes with Multi-Factor Confidence
  const evidences: CanonicalEvidenceNode[] = topMatched.map((r, idx) => {
    const sObj = scoredRules.find(s => s.rule.id === r.id);
    const posCount = sObj?.positiveHits.length || 1;
    const ruleMatch = Math.min(0.7 + posCount * 0.1, 0.98);

    return {
      id: `tcm_rule_${r.id.toLowerCase()}`,
      domain: 'nihaixia',
      ruleId: r.id,
      ruleName: r.name,
      level: idx === 0 ? 'core' : 'support',
      dimension: 'health',
      polarity: r.sixStage.startsWith('shao') || r.sixStage.startsWith('tai') ? 'transformative' : 'unfavorable',
      confidence: Math.min(0.75 + (idx === 0 ? 0.2 : 0.1), 0.95),
      confidenceBreakdown: {
        calculation: 0.92,
        inputCompleteness: Math.min(posCount / (r.requiredObservations.length || 3), 1.0),
        ruleMatch,
        sourceAuthority: 1.0, // Authentic Shanghan Lun clause
        overall: Math.min(0.75 + (idx === 0 ? 0.2 : 0.1), 0.95),
      },
      temporalScope: {
        scopeType: 'acute',
      },
      parameters: {
        sixStage: r.sixStage,
        formula: r.primaryFormula,
        composition: r.formulaComposition,
        acupoints: r.acupoints,
        positiveHits: sObj?.positiveHits,
      },
      classicalSource: r.classicalCitation,
      canonicalInterpretation: `依据六经辨证条文，符合【${r.patternName}】病机特征：${r.pathologyMechanism} 经典对证经方为《${r.primaryFormula}》（组成：${r.formulaComposition.join('、')}）。调护禁忌：${r.contraindication}`,
    };
  });

  const syndromeSummary = `辨证候选归入【${dominantRule.patternName}】（六经：${dominantRule.sixStage.toUpperCase()}），病机机制为“${dominantRule.pathologyMechanism.slice(0, 50)}...”，参考典籍对证经方为《${dominantRule.primaryFormula}》。`;

  return {
    status: isHighConfidence ? 'confirmed' : 'candidate',
    matchedRules: topMatched,
    evidences,
    selectedCases,
    dominantSixStage,
    syndromeSummary,
    missingObservations: dominantRule.requiredObservations,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}
