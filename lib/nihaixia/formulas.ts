/**
 * 倪海厦《人纪》经方核心数据库（伤寒论、金匮要略经典经方与倪师方解精要）
 */

import { ClassicFormula, SixStages } from './types';

export const CLASSIC_FORMULAS: ClassicFormula[] = [
  {
    id: 'guizhi_tang',
    name: '桂枝汤',
    source: '伤寒论',
    sixStage: 'taiyang',
    composition: ['桂枝', '白芍', '生姜', '大枣', '炙甘草'],
    keyPathology: '太阳中风，营卫不和，卫强营弱，汗出恶风。',
    nihaixiaInsight: '倪师称桂枝汤为群方之首、万方之祖。桂枝性热发汗以助卫阳，白芍酸寒敛阴以滋营血，二者等量，一散一收，调和营卫阴阳。',
    indications: ['发热头痛', '恶风自汗', '鼻鸣干呕', '脉浮缓'],
    foodHerbalAnalogs: ['生姜红枣红糖饮（调和营卫）', '白芍甘草甜汤（缓急止痛）'],
    pairedAcupoints: ['风池穴', '大椎穴', '足三里']
  },
  {
    id: 'mahuang_tang',
    name: '麻黄汤',
    source: '伤寒论',
    sixStage: 'taiyang',
    composition: ['麻黄', '桂枝', '杏仁', '炙甘草'],
    keyPathology: '太阳伤寒表实证，风寒束表，肺气失宣，无汗而喘。',
    nihaixiaInsight: '麻黄开发毛孔以宣肺气，桂枝通达经络以驱深层寒邪，杏仁降肺气利水道，甘草安中调和。乃开鬼门、发汗解表之纯阳峻剂。',
    indications: ['恶寒重发热轻', '全身骨节酸痛', '无汗而喘', '脉浮紧'],
    foodHerbalAnalogs: ['葱白生姜紫苏叶饮', '热稀粥覆被取微汗'],
    pairedAcupoints: ['列缺穴', '合谷穴', '风门穴']
  },
  {
    id: 'xiaochaihu_tang',
    name: '小柴胡汤',
    source: '伤寒论',
    sixStage: 'shaoyang',
    composition: ['柴胡', '黄芩', '人参', '半夏', '生姜', '大枣', '炙甘草'],
    keyPathology: '少阳枢机不利，邪在半表半里，胆热脾寒，气机郁滞。',
    nihaixiaInsight: '少阳为三阳之枢纽，柴胡透少阳之郁热，黄芩清胆经之里热，半夏降胃气之逆，参草枣固护中焦脾胃，使邪不传三阴。',
    indications: ['往来寒热', '胸胁苦满', '默默不欲饮食', '心烦喜呕', '口苦咽干目眩'],
    foodHerbalAnalogs: ['陈皮佛手茶', '生姜半夏粥', '菊花枸杞茶'],
    pairedAcupoints: ['阳陵泉（胆经合穴）', '太冲穴', '内关穴']
  },
  {
    id: 'baihu_tang',
    name: '白虎汤',
    source: '伤寒论',
    sixStage: 'yangming',
    composition: ['石膏', '知母', '炙甘草', '粳米'],
    keyPathology: '阳明经证大热，里热炽盛，津气两伤。',
    nihaixiaInsight: '四大症：大热、大汗、大渴、脉洪大。生石膏辛寒清阳明之大火，知母苦寒滋阴润燥，粳米与甘草保胃气以存津液，绝非伤胃之苦寒药。',
    indications: ['身大热', '汗大出', '大渴引饮想喝冰水', '脉洪大有力'],
    foodHerbalAnalogs: ['西瓜翠衣生津饮', '金银花芦根麦冬茶'],
    pairedAcupoints: ['曲池穴', '内庭穴（阳明胃经荥穴）', '合谷穴']
  },
  {
    id: 'lizhong_tang',
    name: '理中汤 / 附子理中汤',
    source: '伤寒论',
    sixStage: 'taiyin',
    composition: ['人参', '白术', '干姜', '炙甘草', '制附子(可选)'],
    keyPathology: '太阴脾胃虚寒，寒湿内生，运化失司。',
    nihaixiaInsight: '太阴为三阴之始，中焦虚寒则脾不能为胃行其津液。干姜辛热温中逐寒，白术苦温燥湿健脾，参草补气培中。',
    indications: ['自利不渴', '腹满而吐', '食不下', '时腹自痛', '手足不温'],
    foodHerbalAnalogs: ['干姜红糖炒米茶', '胡椒猪肚鸡汤', '山药砂仁粥'],
    pairedAcupoints: ['中脘穴', '足三里', '关元穴（艾灸大补脾肾之阳）']
  },
  {
    id: 'zhenwu_tang',
    name: '真武汤',
    source: '伤寒论',
    sixStage: 'shaoyin',
    composition: ['茯苓', '白芍', '白术', '生姜', '附子'],
    keyPathology: '少阴阳虚水泛，心肾阳虚，水气内停。',
    nihaixiaInsight: '真武即北方玄武水神。附子大辛大热温壮肾阳以化水气，茯苓白术健脾渗湿以利水道，生姜宣散水气，白芍敛阴缓急制附子之燥烈。',
    indications: ['头眩心下悸', '手足逆冷', '四肢沉重浮肿', '小便不利或下利'],
    foodHerbalAnalogs: ['茯苓冬瓜赤小豆老鸭汤', '生姜肉桂羊肉汤'],
    pairedAcupoints: ['命门穴', '肾俞穴', '太溪穴', '涌泉穴']
  },
  {
    id: 'wumei_wan',
    name: '乌梅丸',
    source: '伤寒论',
    sixStage: 'jueyin',
    composition: ['乌梅', '细辛', '干姜', '黄连', '当归', '附子', '花椒', '桂枝', '人参', '黄柏'],
    keyPathology: '厥阴病，寒热错杂，厥热胜复，上热下寒。',
    nihaixiaInsight: '厥阴为阴尽阳生之所，极度复杂。乌梅酸以敛肝，连柏苦以清上热，姜辛附椒辛热以温下寒，参归调和气血，为治疗上热下寒之神方。',
    indications: ['消渴心中疼热', '饥而不欲食', '食则吐蛔', '手足厥冷而头面烘热'],
    foodHerbalAnalogs: ['酸梅干姜乌梅饮', '山楂荷叶肉桂茶'],
    pairedAcupoints: ['行间穴', '太冲穴', '三阴交', '涌泉穴']
  },
  {
    id: 'linggui_zhugan_tang',
    name: '苓桂术甘汤',
    source: '伤寒论',
    sixStage: 'taiyin',
    composition: ['茯苓', '桂枝', '白术', '炙甘草'],
    keyPathology: '中阳不足，水饮停聚心下，水气上冲。',
    nihaixiaInsight: '倪师临床用于治疗心悸、眩晕、水饮上犯之极品。茯苓渗湿利水，桂枝温通阳气以降水冲，白术甘草培土制水。',
    indications: ['胸胁支满', '目眩头重', '心下悸动', '短气咳嗽'],
    foodHerbalAnalogs: ['茯苓山药粥', '桂枝陈皮红枣饮'],
    pairedAcupoints: ['膻中穴', '内关穴', '丰隆穴（化痰湿要穴）']
  }
];
