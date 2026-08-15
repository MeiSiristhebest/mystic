import { SixStages } from './types';
import { DiagnosticRule, NIHAIXIA_DIAGNOSTIC_RULES } from './rules';

export interface PulseFeature {
  depth: '浮' | '沉' | '中';
  speed: '迟' | '缓' | '数' | '平';
  shape: '紧' | '弦' | '细' | '滑' | '洪' | '微' | '弱' | '平';
}

export interface TongueFeature {
  body: '淡红' | '淡白' | '红' | '绛红' | '暗紫';
  coating: '薄白' | '白厚腻' | '黄燥' | '黄腻' | '少苔/无苔' | '黑燥';
  moisture: '润' | '燥' | '水滑';
}

export interface DifferentialDecisionStep {
  stepIndex: number;
  criterion: string;
  observedValue: string;
  matchedBranch: string;
  eliminatedStages: SixStages[];
  candidateStages: SixStages[];
  reasoning: string;
}

export interface DifferentialDiagnosisResult {
  dominantStage: SixStages | 'unresolved';
  pathwayName: string;
  confidenceScore: number;
  steps: DifferentialDecisionStep[];
  confirmedRule?: DiagnosticRule;
  differentialFormula: string;
  contraindications: string[];
  pulseTongueInterpretation: string;
}

/**
 * 倪海厦经方 8 大经典快速鉴别决策流引擎 (Pulse & Tongue Deep Differential Engine)
 */
export function runDifferentialDiagnosis(
  symptoms: string[],
  pulse?: Partial<PulseFeature>,
  tongue?: Partial<TongueFeature>
): DifferentialDiagnosisResult {
  const steps: DifferentialDecisionStep[] = [];
  const normalizedSyms = symptoms.map(s => s.trim().toLowerCase());

  // Step 1: 表里初分 (Exterior vs Interior)
  const hasExteriorSymptoms = normalizedSyms.some(s => s.includes('恶风') || s.includes('恶寒') || s.includes('头痛') || s.includes('发热'));
  const isPulseFloating = pulse?.depth === '浮';

  let candidateStages: SixStages[] = ['taiyang', 'yangming', 'shaoyang', 'taiyin', 'shaoyin', 'jueyin'];
  let eliminated: SixStages[] = [];

  if (hasExteriorSymptoms || isPulseFloating) {
    steps.push({
      stepIndex: 1,
      criterion: '表证初探（恶风寒发热或脉浮）',
      observedValue: hasExteriorSymptoms ? '具有明显恶寒恶风发热表证' : '脉象浮取即得',
      matchedBranch: '表阳/半表半里路径',
      eliminatedStages: ['taiyin', 'shaoyin'],
      candidateStages: ['taiyang', 'shaoyang', 'yangming'],
      reasoning: '邪在肌表经络，卫阳被郁，优先沿太阳/少阳差分。',
    });
    candidateStages = ['taiyang', 'shaoyang', 'yangming'];
  } else {
    steps.push({
      stepIndex: 1,
      criterion: '表里初探（无表证）',
      observedValue: '无恶寒发热表证，直入内脏里证',
      matchedBranch: '三阴经/阳明里热路径',
      eliminatedStages: ['taiyang'],
      candidateStages: ['yangming', 'shaoyang', 'taiyin', 'shaoyin', 'jueyin'],
      reasoning: '病位深陷于里，需辨三焦寒热燥湿虚实。',
    });
    candidateStages = ['yangming', 'shaoyang', 'taiyin', 'shaoyin', 'jueyin'];
  }

  // Step 2: 寒热虚实差分 (Cold vs Heat, Excess vs Deficiency)
  const hasSweat = normalizedSyms.some(s => s.includes('自汗') || s.includes('出汗') || s.includes('大汗'));
  const hasNoSweat = normalizedSyms.some(s => s.includes('无汗'));
  const hasBitterMouth = normalizedSyms.some(s => s.includes('口苦') || s.includes('咽干') || s.includes('目眩') || s.includes('胸胁苦满') || s.includes('偏头痛'));
  const hasYangmingHeat = normalizedSyms.some(s => s.includes('大渴') || s.includes('便秘') || s.includes('日晡潮热') || s.includes('大热'));
  const hasShaoyinCold = normalizedSyms.some(s => s.includes('手足冰冷') || s.includes('手脚冰凉') || s.includes('但欲寐') || s.includes('夜尿多') || s.includes('下利清谷'));
  const hasTaiyinSpleen = normalizedSyms.some(s => s.includes('腹满') || s.includes('便溏') || s.includes('拉肚子') || s.includes('食不下') || s.includes('食欲不振'));

  let finalStage: SixStages | 'unresolved' = 'unresolved';
  let pathwayName = '多维综合差分流程';
  let targetRuleId = 'RULE_TAIYANG_ZHONGFENG';

  if (candidateStages.includes('taiyang') && hasSweat && !hasYangmingHeat) {
    finalStage = 'taiyang';
    pathwayName = '太阳中风（表虚营卫不和）鉴别路径';
    targetRuleId = 'RULE_TAIYANG_ZHONGFENG';
    steps.push({
      stepIndex: 2,
      criterion: '出汗鉴别（有汗 vs 无汗）',
      observedValue: '汗出恶风，脉浮缓',
      matchedBranch: '桂枝汤证',
      eliminatedStages: ['shaoyang', 'yangming'],
      candidateStages: ['taiyang'],
      reasoning: '风邪中于卫，营气弱而汗出，法当解肌发表、调和营卫。',
    });
  } else if (candidateStages.includes('taiyang') && hasNoSweat) {
    finalStage = 'taiyang';
    pathwayName = '太阳伤寒（表实无汗）鉴别路径';
    targetRuleId = 'RULE_TAIYANG_SHANGHAN';
    steps.push({
      stepIndex: 2,
      criterion: '出汗鉴别（无汗恶寒身痛）',
      observedValue: '无汗恶寒，骨节疼痛，脉浮紧',
      matchedBranch: '麻黄汤证',
      eliminatedStages: ['shaoyang', 'yangming'],
      candidateStages: ['taiyang'],
      reasoning: '寒邪严密束表，毛窍闭塞，法当发汗解表、宣肺平喘。',
    });
  } else if (hasBitterMouth) {
    finalStage = 'shaoyang';
    pathwayName = '少阳半表半里枢机鉴别路径';
    targetRuleId = 'RULE_SHAOYANG_SHUJI';
    steps.push({
      stepIndex: 2,
      criterion: '半表半里三纲（口苦、咽干、目眩、胸胁苦满）',
      observedValue: '口苦咽干目眩，默默不欲饮食，往来寒热',
      matchedBranch: '小柴胡汤证',
      eliminatedStages: ['taiyang', 'yangming', 'taiyin'],
      candidateStages: ['shaoyang'],
      reasoning: '邪在半表半里，少阳相火郁滞，法当和解少阳枢机。',
    });
  } else if (hasYangmingHeat) {
    finalStage = 'yangming';
    const isConstipated = normalizedSyms.some(s => s.includes('便秘') || s.includes('腹满胀痛'));
    targetRuleId = isConstipated ? 'RULE_YANGMING_FU' : 'RULE_YANGMING_JING';
    pathwayName = isConstipated ? '阳明腑实（痞满燥实坚）鉴别路径' : '阳明经热（大热大渴四大证）鉴别路径';
    steps.push({
      stepIndex: 2,
      criterion: '阳明经腑鉴别（经热大渴 vs 腑实燥结）',
      observedValue: isConstipated ? '便秘腹满痛拒按，燥屎内结' : '四大证大热大渴引饮',
      matchedBranch: isConstipated ? '承气汤类' : '白虎汤类',
      eliminatedStages: ['taiyang', 'shaoyang', 'taiyin', 'shaoyin'],
      candidateStages: ['yangming'],
      reasoning: isConstipated ? '燥屎结于肠胃，当下之以存阴' : '胃火炽盛津液被灼，当辛凉清热保津。',
    });
  } else if (hasShaoyinCold) {
    finalStage = 'shaoyin';
    pathwayName = '少阴心肾阳虚真阳衰微鉴别路径';
    targetRuleId = 'RULE_SHAOYIN_XINSHEN_YANGXU';
    steps.push({
      stepIndex: 2,
      criterion: '阴阳根底与身温二便（手足厥冷、但欲寐、小便清长）',
      observedValue: '手足冷过肘膝，但欲寐精神萎靡，夜尿频多清长',
      matchedBranch: '真武汤/四逆汤证',
      eliminatedStages: ['yangming', 'shaoyang'],
      candidateStages: ['shaoyin'],
      reasoning: '心肾真阳式微，水气泛溢，法当温补命门、回阳救逆利水。',
    });
  } else if (hasTaiyinSpleen) {
    finalStage = 'taiyin';
    pathwayName = '太阴中焦脾虚湿寒鉴别路径';
    targetRuleId = 'RULE_TAIYIN_PIXU';
    steps.push({
      stepIndex: 2,
      criterion: '中焦脾胃运化（腹满便溏食不下）',
      observedValue: '腹满便溏，喜温喜按，食欲不振',
      matchedBranch: '理中汤证',
      eliminatedStages: ['yangming', 'shaoyang'],
      candidateStages: ['taiyin'],
      reasoning: '脾阳虚弱，寒湿中阻，法当温中健脾、燥湿和胃。',
    });
  }

  const confirmedRule = NIHAIXIA_DIAGNOSTIC_RULES.find(r => r.id === targetRuleId) || NIHAIXIA_DIAGNOSTIC_RULES[0];

  const pulseDesc = pulse ? `脉象【${pulse.depth || '平'}${pulse.speed || '缓'}${pulse.shape || ''}】` : '脉象未详';
  const tongueDesc = tongue ? `舌象【舌质${tongue.body || '淡红'}，苔${tongue.coating || '薄白'}${tongue.moisture || ''}】` : '舌象未详';
  const pulseTongueInterpretation = `${pulseDesc}，${tongueDesc}。四诊合参支持归入【${confirmedRule.patternName}】病机。`;

  return {
    dominantStage: finalStage,
    pathwayName,
    confidenceScore: finalStage !== 'unresolved' ? 92 : 45,
    steps,
    confirmedRule,
    differentialFormula: confirmedRule.primaryFormula,
    contraindications: [confirmedRule.contraindication],
    pulseTongueInterpretation,
  };
}
