/**
 * 倪海厦《人纪》典型经方临床医案库（覆盖太阳、阳明、少阳、太阴、少阴、厥阴六经辨证）
 */

import { NihaixiaCase } from './types';

export const NIHAIXIA_CASES: NihaixiaCase[] = [
  {
    id: 'case_taiyang_guizhi',
    title: '太阳中风营卫失和汗出恶风案',
    chiefComplaint: '患者感冒后持续低热两周，恶风自汗，头痛鼻塞，稍动即微汗出，汗后反觉冷。',
    syndromeAnalysis: '此属风邪在表，营卫不和。卫阳浮于外则发热，营阴不能固守则自汗。不可再用抗生素苦寒泻火败胃，宜调和营卫。',
    prescribedFormula: '桂枝汤 原方加生姜大枣',
    outcome: '服药头煎后饮热稀粥温覆微汗，汗出热退，身心轻爽，二剂诸症悉平。',
    classicQuote: '《伤寒论·辨太阳病脉证并治》：太阳病，头痛发热，汗出恶风，桂枝汤主之。'
  },
  {
    id: 'case_taiyang_mahuang',
    title: '太阳伤寒恶寒无汗骨节酸痛案',
    chiefComplaint: '冬季突感风寒，剧烈恶寒发热，周身骨节酸楚，无汗，咳嗽胸闷而微喘，脉浮紧。',
    syndromeAnalysis: '寒邪严闭毛孔，卫阳受遏，肺气失宣。当开鬼门发汗解表，宣通肺气以逐深层寒毒。',
    prescribedFormula: '麻黄汤 原方',
    outcome: '服一剂后微汗出，周身骨节酸痛顿减，恶寒尽退，胸闷咳喘平复。',
    classicQuote: '《伤寒论·辨太阳病脉证并治》：太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风无汗而喘者，麻黄汤主之。'
  },
  {
    id: 'case_liver_depression',
    title: '少阳枢机不利偏头痛伴胸胁苦满案',
    chiefComplaint: '经常性一侧偏头痛，情绪紧张或经前加重，口苦咽干，胸胁胀闷不舒，时欲恶心。',
    syndromeAnalysis: '少阳胆经气机受阻，枢机不利，相火上逆，肝气横逆克脾。治以调和少阳枢机。',
    prescribedFormula: '小柴胡汤 原方',
    outcome: '服药2剂偏头痛未作，胸胁舒畅，口苦咽干消失。',
    classicQuote: '《伤寒论·辨少阳病脉证并治》：伤寒五六日，往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕，小柴胡汤主之。'
  },
  {
    id: 'case_yangming_baihu',
    title: '阳明经热炽盛大渴引饮案',
    chiefComplaint: '夏季高热面赤，大汗淋漓，烦躁不安，口渴极甚必须不停饮用冰水，脉洪大。',
    syndromeAnalysis: '邪入阳明气分，化燥化热，里热蒸腾。非生石膏大寒之剂不能清透无形之热，粳米甘草保胃气以存津液。',
    prescribedFormula: '白虎加人参汤',
    outcome: '服药一剂大渴即减，热退汗收，脉转平和。',
    classicQuote: '《伤寒论·辨阳明病脉证并治》：服桂枝汤，大汗出后，大烦渴不解，脉洪大者，白虎加人参汤主之。'
  },
  {
    id: 'case_taiyin_lizhong',
    title: '太阴脾虚脏寒久泻腹满案',
    chiefComplaint: '慢性腹泻三年，吃生冷即腹痛肠鸣下利，大便溏薄不成形，面色萎黄，畏寒肢凉。',
    syndromeAnalysis: '太阴脾土虚寒，不能为胃行其津液，中阳不振，湿浊下注。当温中健脾以培后天之本。',
    prescribedFormula: '理中汤 加肉桂白术',
    outcome: '服药5剂大便转干成形，胃纳大开，面色转红润，畏寒大减。',
    classicQuote: '《伤寒论·辨太阴病脉证并治》：自利不渴者，属太阴，以其脏有寒故也，当温之，宜服四逆辈。'
  },
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
    id: 'case_jueyin_wumei',
    title: '上热下寒厥热胜复兼慢性口腔溃疡案',
    chiefComplaint: '经常性顽固口腔溃疡、咽喉干痛，但同时双脚冰凉如踩冰块，食冷即胃痛腹胀。',
    syndromeAnalysis: '厥阴上热下寒，相火上逆而真阳衰于下。单清火则下焦更寒，单温阳则上焦更热。必以乌梅酸收敛相火，连柏清上，姜附温下。',
    prescribedFormula: '乌梅丸 改汤剂加减',
    outcome: '服药3剂溃疡愈合，双足回暖，胃痛不作。',
    classicQuote: '《伤寒论·辨厥阴病脉证并治》：厥阴之为病，消渴，气上撞心，心中疼热，饥而不欲食，乌梅丸主之。'
  },
  {
    id: 'case_shaoyin_zhenwu',
    title: '少阴阳虚水肿伴四肢沉重畏寒案',
    chiefComplaint: '下肢常年浮肿，晨起眼睑肿，腰酸如折，极度怕冷，小便不利，行走沉重如裹湿泥。',
    syndromeAnalysis: '少阴肾阳虚衰，命门火微，不能气化水液，水湿内停泛滥于经络肌表。',
    prescribedFormula: '真武汤 加黄芪白术',
    outcome: '服药4剂小便量大增，浮肿尽消，身躯轻便，手足温热。',
    classicQuote: '《伤寒论·辨少阴病脉证并治》：少阴病，二三日不已，至四五日，腹痛，小便不利，四肢沉重疼痛，自下利者，此为有水气...真武汤主之。'
  }
];
