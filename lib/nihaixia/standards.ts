/**
 * 倪海厦《人纪》八大健康金标准自测与阴阳状态评估引擎
 */

import { HealthStandardItem, HealthCheckAnswer, HealthCheckResult } from './types';

export const HEALTH_STANDARDS: HealthStandardItem[] = [
  {
    id: 'sleep',
    title: '一、睡眠 (Sleep)',
    dimension: 'sleep',
    question: '你每晚的睡眠质量如何？是否能一觉到天亮，醒后精力充沛？',
    idealStandard: '夜间一觉睡到天亮，无失眠、早醒（尤其夜间1-3点或3-5点惊醒）、多梦盗汗，醒后神清气爽。',
    explanation: '心藏神，肝藏魂。夜间1-3点是肝经当令，3-5点是肺经当令。若能一觉睡到天亮，代表心火下行温暖肾水，阴平阳秘。'
  },
  {
    id: 'appetite',
    title: '二、胃口与知饥 (Appetite)',
    dimension: 'appetite',
    question: '你平时是否知饥知饱？饭前是否有正常的饥饿感，食欲如何？',
    idealStandard: '每日饭前知饥，饭后知饱，胃口正常，消化良好，饭后无胃胀、反酸或昏沉。',
    explanation: '脾胃为后天之本，气血生化之源。知饥是胃气充沛的表现；不知饥或暴饮暴食皆是中焦脾胃运化失常。'
  },
  {
    id: 'thirst',
    title: '三、口渴与喜饮 (Thirst)',
    dimension: 'thirst',
    question: '你平时是否常口渴？喜欢喝冷饮、温水还是常温水？',
    idealStandard: '平时不渴，渴时想喝常温水或温热水；不嗜饮冰水冷饮。',
    explanation: '想喝冰水为阳明实热；口渴但不想喝水或喝水不解渴为水饮停聚；口不渴或喜热饮为下焦虚寒。'
  },
  {
    id: 'bowel',
    title: '四、大便 (Bowel Elimination)',
    dimension: 'bowel',
    question: '你每天的大便频率与形态如何？是否晨起通畅？',
    idealStandard: '每日晨起一次大便，顺畅成形，呈金黄色，如香蕉状，便后有清爽排空感。',
    explanation: '晨起5-7点大肠经当令，肺与大肠相表里。晨起自然排便代表肺气肃降正常，肠胃蠕动有力。'
  },
  {
    id: 'urine',
    title: '五、小便 (Urination)',
    dimension: 'urine',
    question: '你每天小便的颜色、次数如何？夜尿多吗？',
    idealStandard: '每日小便5-7次，颜色淡黄清亮，排尿有力通畅；夜尿0-1次。',
    explanation: '小便反映肾与膀胱气化功能。深黄赤热为热证；清长量多且夜尿频为肾阳虚寒、下焦虚衰。'
  },
  {
    id: 'temperature',
    title: '六、手足与身温 (Hand & Foot Temperature)',
    dimension: 'temperature',
    question: '你的手心、脚心一年四季是常温偏暖，还是容易冰凉？头面额头如何？',
    idealStandard: '手心、脚心常年温热，脚掌温暖；额头微凉，身无畏寒怕冷。',
    explanation: '手脚是四肢末梢，心阳足则手温，肾阳足则脚热。额头微凉、手脚温热是阳气潜藏、心火下交肾水的最高金标准。'
  },
  {
    id: 'sweat',
    title: '七、出汗节律 (Sweating)',
    dimension: 'sweat',
    question: '你平时的出汗情况如何？运动时是否能自然出微汗？是否有盗汗或自汗？',
    idealStandard: '运动或温热时全身均匀出微汗，汗后舒适；静坐无故不出虚汗（自汗），夜睡不盗汗。',
    explanation: '汗为心之液，营卫和则汗出正常。自汗为卫表气虚不固，盗汗为阴虚内热或阳气外浮。'
  },
  {
    id: 'vitality',
    title: '八、精力与晨勃/月经 (Vitality & Cycle)',
    dimension: 'vitality',
    question: '男性早晨是否有晨勃？女性月经周期、经量是否规律顺畅无血块痛经？白天精力充沛吗？',
    idealStandard: '男性晨起有正常晨勃；女性月经28天规律顺畅、经色暗红无血块痛经；白天全天精力饱满无慢性疲劳。',
    explanation: '晨勃是男子阳气生发的晴雨表；经血顺畅无痛经是女子肝气疏泄、血海充盈与下焦无寒的标志。'
  }
];

/**
 * 计算八大健康标准评估结果
 */
export function evaluateHealthStandards(answers: Record<string, number>): HealthCheckResult {
  const sleep = answers['sleep'] ?? 75;
  const appetite = answers['appetite'] ?? 75;
  const thirst = answers['thirst'] ?? 75;
  const bowel = answers['bowel'] ?? 75;
  const urine = answers['urine'] ?? 75;
  const temp = answers['temperature'] ?? 75;
  const sweat = answers['sweat'] ?? 75;
  const vitality = answers['vitality'] ?? 75;

  const total = (sleep + appetite + thirst + bowel + urine + temp + sweat + vitality) / 8;
  const overallScore = Math.round(total);

  // 阴阳状态判定
  let yinYangBalance: HealthCheckResult['yinYangBalance'] = '阴阳调和';
  let qiBloodStatus: HealthCheckResult['qiBloodStatus'] = '气血充盈';

  if (temp < 60 && urine < 60) {
    yinYangBalance = '阳虚阴盛';
    qiBloodStatus = '下焦阴寒';
  } else if (temp < 60 && sleep < 60 && thirst > 70) {
    yinYangBalance = '上热下寒';
    qiBloodStatus = '心肾不交';
  } else if (appetite < 60 && bowel < 60) {
    yinYangBalance = '阳虚阴盛';
    qiBloodStatus = '中焦脾寒';
  } else if (thirst < 50 && bowel < 50) {
    yinYangBalance = '阳明燥实';
    qiBloodStatus = '中焦脾寒';
  } else if (sweat < 60 || sleep < 60) {
    yinYangBalance = '阴虚阳亢';
    qiBloodStatus = '枢机不利';
  }

  // 建议
  const keyAdvice: string[] = [];
  const recommendedAcupoints: string[] = [];
  const dietaryRecommendations: string[] = [];

  if (temp < 70) {
    keyAdvice.push('四肢末梢偏凉提示心肾阳气未充分下达，日常忌食冰冷寒凉与生冷瓜果。');
    recommendedAcupoints.push('关元穴（艾灸温补元阳）', '涌泉穴（睡前热水泡脚后搓热）');
    dietaryRecommendations.push('生姜红枣茶', '当归生姜羊肉汤（秋冬宜温补）');
  }

  if (sleep < 70) {
    keyAdvice.push('夜间睡眠欠佳提示心神不宁或肝魂未藏，晚间9点后避免刷剧与剧烈思虑。');
    recommendedAcupoints.push('神门穴（按揉宁心安神）', '太冲穴（平肝潜阳）');
    dietaryRecommendations.push('酸枣仁百合汤', '桂圆莲子羹');
  }

  if (bowel < 70 || appetite < 70) {
    keyAdvice.push('中焦脾胃运化偏滞，吃饭宜细嚼慢咽、七分饱，晨起一杯温开水。');
    recommendedAcupoints.push('足三里（强壮中焦脾胃）', '中脘穴（和胃理气）');
    dietaryRecommendations.push('山药茯苓薏米粥（健脾渗湿）', '生姜陈皮茶');
  }

  if (keyAdvice.length === 0) {
    keyAdvice.push('当前八大指标整体良好，气血阴阳平衡，继续保持规律作息与平和心境。');
    recommendedAcupoints.push('足三里（日常保健）', '合谷穴（通调气血）');
    dietaryRecommendations.push('五谷杂粮粥', '当令应季温和果蔬');
  }

  return {
    overallScore,
    yinYangBalance,
    qiBloodStatus,
    radarScores: {
      sleep: Math.round(sleep),
      appetiteThirst: Math.round((appetite + thirst) / 2),
      elimination: Math.round((bowel + urine) / 2),
      temperature: Math.round(temp),
      sweatRegulation: Math.round(sweat),
      vitality: Math.round(vitality),
    },
    keyAdvice,
    recommendedAcupoints,
    dietaryRecommendations,
  };
}
