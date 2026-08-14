/**
 * 倪海厦《人纪》典型医案索引
 */

import { NihaixiaCase } from './types';

export const NIHAIXIA_CASES: NihaixiaCase[] = [
  {
    id: 'case_insomnia_water',
    title: '顽固性失眠伴心悸案（水气凌心）',
    chiefComplaint: '患者长期严重失眠5年，夜间1-3点必惊醒，伴心下悸动，头晕目眩，手脚冰冷。',
    syndromeAnalysis: '此非单纯心火亢盛，实为下焦肾阳不足，水饮内停，夜间阴盛水气上冲凌心所致。若单用苦寒降火安神药必败胃绝阳。',
    prescribedFormula: '苓桂术甘汤 加制附子',
    outcome: '服药3剂后水气得化，心悸顿消，夜间能安睡至天明，手脚回暖。',
    classicQuote: '《金匮要略·痰饮咳嗽病脉证并治》：心下有痰饮，胸胁支满，目眩，苓桂术甘汤主之。'
  },
  {
    id: 'case_cold_extremities',
    title: '手足常年冰凉伴痛经腹泻案（少阴太阴合病）',
    chiefComplaint: '女性患者常年手脚冰凉至肘膝关节，月经推迟且有黑血块剧烈痛经，晨起大便稀溏。',
    syndromeAnalysis: '中焦虚寒，下焦真阳衰微，血得寒则凝。当温补脾肾之阳，散下焦之沉寒痼冷。',
    prescribedFormula: '附子理中汤 合 当归四逆汤',
    outcome: '二诊时手脚温热，次月经行顺畅无痛感，大便成形。',
    classicQuote: '《伤寒论·辨少阴病脉证并治》：少阴病，脉微细，但欲寐，口中和，其背恶寒者，当灸之，附子汤主之。'
  },
  {
    id: 'case_liver_depression',
    title: '偏头痛伴胸胁苦满案（少阳郁热）',
    chiefComplaint: '经常性一侧偏头痛，情绪紧张或经前加重，口苦咽干，胸胁胀闷不舒。',
    syndromeAnalysis: '少阳胆经气机受阻，枢机不利，相火上逆，肝气横逆克脾。',
    prescribedFormula: '小柴胡汤 原方',
    outcome: '服药2剂偏头痛未作，胸胁舒畅，口苦咽干消失。',
    classicQuote: '《伤寒论·辨少阳病脉证并治》：伤寒五六日，往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕，小柴胡汤主之。'
  }
];
