/**
 * 五运六气推算引擎 — 依据《黄帝内经·天元纪大论 / 五运行大论》
 * 计算出生年份的岁运、司天、在泉及先天脏腑体质倾向
 */

import { WuyunLiuqiResult } from './types';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干化五运
const STEM_WUYUN_MAP: Record<string, { element: '木' | '火' | '土' | '金' | '水'; desc: string }> = {
  甲: { element: '土', desc: '土运太过（雨湿流行，脾土受邪或肾水受克）' },
  乙: { element: '金', desc: '金运不及（炎火乃行，肺金虚弱或肝木偏亢）' },
  丙: { element: '水', desc: '水运太过（寒气流行，心阳易受抑遏）' },
  丁: { element: '木', desc: '木运不及（燥气乃行，肝气虚衰或脾土不舒）' },
  戊: { element: '火', desc: '火运太过（炎暑流行，心火炽盛或金肺受灼）' },
  己: { element: '土', desc: '土运不及（风乃大行，脾胃虚弱，肌肉萎缩）' },
  庚: { element: '金', desc: '金运太过（燥气流行，肝木受刑，胁肋不适）' },
  辛: { element: '水', desc: '水运不及（湿乃大行，肾虚水泛，腰膝酸软）' },
  壬: { element: '木', desc: '木运太过（风气流行，脾土受克，消化运化迟滞）' },
  癸: { element: '火', desc: '火运不及（寒乃大行，心阳不振，胸阳痹阻）' },
};

// 地支化六气（司天与在泉）
const BRANCH_LIUQI_MAP: Record<string, { siTian: string; zaiQuan: string; siTianImpact: string; zaiQuanImpact: string }> = {
  子: { siTian: '少阴君火司天', zaiQuan: '阳明燥金在泉', siTianImpact: '上半年火气偏旺，心经与血脉易躁', zaiQuanImpact: '下半年燥金主事，肺与大肠易干涩' },
  午: { siTian: '少阴君火司天', zaiQuan: '阳明燥金在泉', siTianImpact: '上半年火气偏旺，心经与血脉易躁', zaiQuanImpact: '下半年燥金主事，肺与大肠易干涩' },
  丑: { siTian: '太阴湿土司天', zaiQuan: '太阳寒水在泉', siTianImpact: '上半年湿气偏重，脾胃运化易困顿', zaiQuanImpact: '下半年寒水主事，下焦肾膀胱易虚寒' },
  未: { siTian: '太阴湿土司天', zaiQuan: '太阳寒水在泉', siTianImpact: '上半年湿气偏重，脾胃运化易困顿', zaiQuanImpact: '下半年寒水主事，下焦肾膀胱易虚寒' },
  寅: { siTian: '少阳相火司天', zaiQuan: '厥阴风木在泉', siTianImpact: '上半年相火升腾，少阳胆腑枢机易逆', zaiQuanImpact: '下半年风木主事，肝经疏泄与筋骨易动风' },
  申: { siTian: '少阳相火司天', zaiQuan: '厥阴风木在泉', siTianImpact: '上半年相火升腾，少阳胆腑枢机易逆', zaiQuanImpact: '下半年风木主事，肝经疏泄与筋骨易动风' },
  卯: { siTian: '阳明燥金司天', zaiQuan: '少阴君火在泉', siTianImpact: '上半年燥气主导，肺金皮毛与呼吸道易燥', zaiQuanImpact: '下半年心肾受火热之扰，虚火易上浮' },
  酉: { siTian: '阳明燥金司天', zaiQuan: '少阴君火在泉', siTianImpact: '上半年燥气主导，肺金皮毛与呼吸道易燥', zaiQuanImpact: '下半年心肾受火热之扰，虚火易上浮' },
  辰: { siTian: '太阳寒水司天', zaiQuan: '太阴湿土在泉', siTianImpact: '上半年寒气偏盛，体表卫阳与太阳经易束', zaiQuanImpact: '下半年湿土在泉，肌肉水肿或大便溏泄' },
  戌: { siTian: '太阳寒水司天', zaiQuan: '太阴湿土在泉', siTianImpact: '上半年寒气偏盛，体表卫阳与太阳经易束', zaiQuanImpact: '下半年湿土在泉，肌肉水肿或大便溏泄' },
  巳: { siTian: '厥阴风木司天', zaiQuan: '少阳相火在泉', siTianImpact: '上半年风气主事，头晕目眩或情绪波动大', zaiQuanImpact: '下半年相火在泉，口苦咽干、胸胁不适' },
  亥: { siTian: '厥阴风木司天', zaiQuan: '少阳相火在泉', siTianImpact: '上半年风气主事，头晕目眩或情绪波动大', zaiQuanImpact: '下半年相火在泉，口苦咽干、胸胁不适' },
};

/**
 * 推算出生年份的五运六气全息格局
 */
export function calculateWuyunLiuqi(year: number): WuyunLiuqiResult {
  // 计算农历天干地支（以公元4年为甲子年基准）
  const offset = year - 4;
  const stemIdx = ((offset % 10) + 10) % 10;
  const branchIdx = ((offset % 12) + 12) % 12;

  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  const yearGanZhi = `${stem}${branch}年`;

  // 岁运（大运）
  const isYangStem = stemIdx % 2 === 0; // 甲丙戊庚壬为阳干
  const wuyunMeta = STEM_WUYUN_MAP[stem] || { element: '土', desc: '土运平气' };
  const excessOrDeficiency = isYangStem ? '太过' : '不及';

  // 司天与在泉
  const liuqiMeta = BRANCH_LIUQI_MAP[branch] || BRANCH_LIUQI_MAP['子'];

  // 先天体质倾向推导
  let predisposition = '';
  const vulnerableOrgans: string[] = [];
  const potentialPathologies: string[] = [];
  const lifestyleBalancingTips: string[] = [];
  const recommendedHerbalDiet: string[] = [];

  if (wuyunMeta.element === '木') {
    predisposition = excessOrDeficiency === '太过' 
      ? '木气偏旺型：肝胆之气升发偏急，情绪易激动，克制脾土運化。' 
      : '木气虚衰型：肝血易虚，筋骨易酸软，双目易干涩，遇事易优柔寡断。';
    vulnerableOrgans.push('肝脏', '胆腑', '脾胃');
    potentialPathologies.push('头目眩晕', '胸胁胀闷', '消化不良', '气机郁结');
    lifestyleBalancingTips.push('早晨宜多散步舒展筋骨，避免长期压抑怒气，晚上11点前入睡以养肝血。');
    recommendedHerbalDiet.push('佛手陈皮茶', '当归芍药排骨汤', '枸杞菊花茶');
  } else if (wuyunMeta.element === '火') {
    predisposition = excessOrDeficiency === '太过' 
      ? '火热偏亢型：心火易旺，思维敏捷但易急躁，口舌生疮，耗伤阴血。' 
      : '火阳不足型：心阳虚弱，胸阳不振，畏寒怕冷，四肢欠温，精神易疲惫。';
    vulnerableOrgans.push('心经', '小肠', '血脉');
    potentialPathologies.push('心慌心悸', '失眠多梦', '血压不稳', '舌痛口疮');
    lifestyleBalancingTips.push('静坐冥想以宁心神，午间小憩15分钟养心阳，饮食宜清润微温。');
    recommendedHerbalDiet.push('酸枣仁百合汤', '生姜肉桂茶（阳虚者）', '莲子心茶（火旺者）');
  } else if (wuyunMeta.element === '土') {
    predisposition = excessOrDeficiency === '太过' 
      ? '湿土壅滞型：脾运易滞，湿气较重，肌肉易困重，体型易浮肿或发胖。' 
      : '脾胃虚弱型：脾气不足，知饥不知饱，消化力弱，大便易稀溏，面色萎黄。';
    vulnerableOrgans.push('脾脏', '胃腑', '肌肉');
    potentialPathologies.push('腹胀食少', '便溏腹泻', '肢体沉重', '痰湿水饮');
    lifestyleBalancingTips.push('吃饭细嚼慢咽、七分饱，忌贪食生冷甜腻油炸食物，常艾灸足三里。');
    recommendedHerbalDiet.push('山药茯苓薏米粥', '四君子汤（党参茯苓白术甘草）', '生姜红枣茶');
  } else if (wuyunMeta.element === '金') {
    predisposition = excessOrDeficiency === '太过' 
      ? '燥金肃杀型：肺金偏燥，性格坚毅但易内收，皮肤偏干，呼吸道敏感。' 
      : '肺气虚弱型：卫表不固，易感冒畏风，自汗，说话声音较小，气短。';
    vulnerableOrgans.push('肺脏', '大肠', '皮毛');
    potentialPathologies.push('干咳少痰', '过敏鼻炎', '皮肤干燥', '便秘不畅');
    lifestyleBalancingTips.push('注意早晚防风保暖，多练习深呼吸或腹式呼吸，秋季多食润燥之物。');
    recommendedHerbalDiet.push('银耳雪梨百合羹', '黄芪生姜粥（补卫表气）', '蜂蜜杏仁茶');
  } else {
    // 水
    predisposition = excessOrDeficiency === '太过' 
      ? '寒水偏盛型：体质偏偏寒偏凝，下焦阳气易受压制，腰膝易冷痛。' 
      : '肾阳虚水泛型：肾精肾气易亏虚，夜尿较多，早起浮肿，精力易耗竭。';
    vulnerableOrgans.push('肾脏', '膀胱', '骨髓');
    potentialPathologies.push('腰酸腿软', '畏寒肢冷', '脱发耳鸣', '夜尿频多');
    lifestyleBalancingTips.push('每晚热水泡脚后搓涌泉穴，冬日注意腰腹脚踝保暖，房事节制守精。');
    recommendedHerbalDiet.push('核桃黑芝麻粥', '当归生姜羊肉汤', '熟地肉桂枸杞炖品');
  }

  return {
    birthYear: year,
    yearGanZhi,
    greatMovement: {
      element: wuyunMeta.element,
      excessOrDeficiency,
      desc: wuyunMeta.desc,
    },
    siTian: {
      climate: liuqiMeta.siTian,
      organImpact: liuqiMeta.siTianImpact,
      desc: `司天上半年主事，代表出生年份上半年天运主导气场为【${liuqiMeta.siTian}】。`,
    },
    zaiQuan: {
      climate: liuqiMeta.zaiQuan,
      organImpact: liuqiMeta.zaiQuanImpact,
      desc: `在泉下半年主事，代表出生年份下半年地运主导气场为【${liuqiMeta.zaiQuan}】。`,
    },
    constitutionalTendency: {
      predisposition,
      vulnerableOrgans,
      potentialPathologies,
      lifestyleBalancingTips,
      recommendedHerbalDiet,
    },
  };
}
