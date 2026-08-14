import { getCryptoRandom } from './random';

import { TarotCard } from '@/app/types/divination';

export type { TarotCard };

export const MAJOR_ARCANA_DATA: Omit<TarotCard, 'id' | 'isReversed'>[] = [
  {
    name: "愚人",
    englishName: "The Fool",
    rank: "0",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj00.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["开始", "纯真", "自发性", "自由精神", "冒险", "信任宇宙"],
      reversed: ["鲁莽", "风险", "幼稚", "犹豫不决", "盲目", "错失良机"]
    },
    coreTheme: "无限的可能性与新的旅程；灵魂在物质世界的第一次投射"
  },
  {
    name: "魔术师",
    englishName: "The Magician",
    rank: "I",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj01.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["表现", "资源丰富", "力量", "灵感", "意志力", "创造力"],
      reversed: ["操纵", "计划不周", "未开发的潜力", "欺骗", "能力错位"]
    },
    coreTheme: "意志力与创造力的显化；连接上天与下地的桥梁"
  },
  {
    name: "女祭司",
    englishName: "The High Priestess",
    rank: "II",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj02.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["直觉", "潜意识", "神圣女性", "神秘", "内在智慧", "静默"],
      reversed: ["秘密", "脱离直觉", "肤浅", "混乱", "隐藏的议程"]
    },
    coreTheme: "内在智慧与直觉的引导；守卫潜意识大门的女神"
  },
  {
    name: "皇后",
    englishName: "The Empress",
    rank: "III",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj03.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["丰饶", "自然", "母性", "感官享受", "创造力", "滋养"],
      reversed: ["创造力受阻", "依赖", "空虚", "过度保护", "情感匮乏"]
    },
    coreTheme: "生命力、滋养与创造的丰盈；大地的母亲与感官的极致"
  },
  {
    name: "皇帝",
    englishName: "The Emperor",
    rank: "IV",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj04.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["权威", "结构", "控制", "父亲形象", "稳定", "逻辑"],
      reversed: ["暴政", "僵化", "缺乏纪律", "控制欲强", "无能的领导"]
    },
    coreTheme: "秩序、稳定与理性的力量；物质世界的统治者与规则制定者"
  },
  {
    name: "教皇",
    englishName: "The Hierophant",
    rank: "V",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj05.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["传统", "精神智慧", "宗教", "一致性", "教导", "社会规范"],
      reversed: ["叛逆", "挑战现状", "个人信念", "非传统", "教条主义"]
    },
    coreTheme: "社会规范与精神教导的传承；连接凡俗与神圣的导师"
  },
  {
    name: "恋人",
    englishName: "The Lovers",
    rank: "VI",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj06.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["爱", "和谐", "关系", "价值观对齐", "选择", "吸引力"],
      reversed: ["不平衡", "自我爱护", "不协调", "价值观冲突", "逃避责任"]
    },
    coreTheme: "选择、结合与价值观的考验；灵魂伴侣与内在的整合"
  },
  {
    name: "战车",
    englishName: "The Chariot",
    rank: "VII",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj07.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["控制", "意志力", "成功", "行动", "决心", "克服障碍"],
      reversed: ["缺乏方向", "侵略性", "失控", "阻碍", "意志薄弱"]
    },
    coreTheme: "通过意志力克服冲突并取得胜利；驾驭对立力量的勇士"
  },
  {
    name: "力量",
    englishName: "Strength",
    rank: "VIII",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj08.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["勇气", "说服力", "影响力", "同情心", "内在力量", "耐心"],
      reversed: ["自我怀疑", "低能量", "原始情感", "软弱", "滥用权力"]
    },
    coreTheme: "内在的韧性与温柔的力量；以柔克刚的智慧"
  },
  {
    name: "隐士",
    englishName: "The Hermit",
    rank: "IX",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj09.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["内省", "寻求真理", "孤独", "引导", "智慧", "撤退"],
      reversed: ["孤立", "孤独感", "退缩", "偏执", "拒绝建议"]
    },
    coreTheme: "向内探索与寻求真理的旅程；提灯寻找内在光芒的智者"
  },
  {
    name: "命运之轮",
    englishName: "Wheel of Fortune",
    rank: "X",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj10.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["好运", "业力", "生命周期", "转折点", "命运", "变化"],
      reversed: ["厄运", "抵制变化", "打破循环", "外部力量", "停滞"]
    },
    coreTheme: "命运的变迁与不可控的周期；宇宙的因果律与转机"
  },
  {
    name: "正义",
    englishName: "Justice",
    rank: "XI",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj11.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["正义", "公平", "真理", "法律", "因果", "责任"],
      reversed: ["不公平", "缺乏责任感", "不诚实", "偏见", "严苛"]
    },
    coreTheme: "因果报应与客观的平衡；真理之剑与公平之秤"
  },
  {
    name: "倒吊人",
    englishName: "The Hanged Man",
    rank: "XII",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj12.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["暂停", "投降", "新视角", "牺牲", "等待", "释放"],
      reversed: ["拖延", "抵制", "停滞", "无谓的牺牲", "固执"]
    },
    coreTheme: "通过换位思考与等待获得洞见；为了更高目的的自我牺牲"
  },
  {
    name: "死神",
    englishName: "Death",
    rank: "XIII",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj13.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["结束", "变化", "转型", "过渡", "重生", "消除"],
      reversed: ["抵制变化", "停滞", "重复旧模式", "恐惧", "慢性死亡"]
    },
    coreTheme: "旧事物的终结与新生命的萌芽；彻底的转化与蜕变"
  },
  {
    name: "节制",
    englishName: "Temperance",
    rank: "XIV",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj14.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["平衡", "节制", "耐心", "目的", "融合", "炼金术"],
      reversed: ["失衡", "过度", "缺乏长期视野", "冲突", "急躁"]
    },
    coreTheme: "和谐、融合与中庸之道；灵魂的炼金与平衡"
  },
  {
    name: "恶魔",
    englishName: "The Devil",
    rank: "XV",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj15.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["阴影自我", "依恋", "成瘾", "限制", "物质主义", "诱惑"],
      reversed: ["释放", "脱离", "重获控制", "觉醒", "面对恐惧"]
    },
    coreTheme: "物质束缚与内在阴影的面对；被欲望囚禁的灵魂"
  },
  {
    name: "高塔",
    englishName: "The Tower",
    rank: "XVI",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj16.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["突变", "灾难", "剧变", "启示", "觉醒", "崩溃"],
      reversed: ["延迟灾难", "恐惧变化", "避免剧变", "余震", "侥幸心理"]
    },
    coreTheme: "虚假结构的崩塌与真相的显现；瞬间的觉醒与痛苦的重建"
  },
  {
    name: "星星",
    englishName: "The Star",
    rank: "XVII",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj17.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["希望", "信仰", "目的", "更新", "灵感", "宁静"],
      reversed: ["绝望", "缺乏信仰", "断开连接", "消沉", "不切实际"]
    },
    coreTheme: "治愈、希望与宇宙的指引；黑暗后的第一缕曙光"
  },
  {
    name: "月亮",
    englishName: "The Moon",
    rank: "XVIII",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj18.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["幻觉", "恐惧", "焦虑", "潜意识", "直觉", "迷茫"],
      reversed: ["释放恐惧", "揭穿谎言", "清晰", "直觉增强", "走出阴影"]
    },
    coreTheme: "迷茫、幻觉与直觉的考验；潜意识深处的恐惧与梦境"
  },
  {
    name: "太阳",
    englishName: "The Sun",
    rank: "XIX",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj19.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["积极", "活力", "成功", "光芒", "喜悦", "真理"],
      reversed: ["消极", "抑郁", "暂时的挫折", "过度自负", "虚假繁荣"]
    },
    coreTheme: "光明、成功与纯粹的快乐；意识的觉醒与生命的庆典"
  },
  {
    name: "审判",
    englishName: "Judgement",
    rank: "XX",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj20.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["审判", "重生", "内在召唤", "宽恕", "觉醒", "决定"],
      reversed: ["自我怀疑", "拒绝召唤", "犹豫不决", "自责", "错失良机"]
    },
    coreTheme: "灵魂的觉醒与最终的裁决；听从内在的召唤而重生"
  },
  {
    name: "世界",
    englishName: "The World",
    rank: "XXI",
    image: "https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/maj21.jpeg",
    arcana: 'Major',
    keywords: {
      upright: ["完成", "整合", "成就", "旅行", "圆满", "统一"],
      reversed: ["未完成", "缺乏闭环", "停滞", "捷径", "眼界狭窄"]
    },
    coreTheme: "圆满、整合与新的循环开始; 灵魂旅程的终点与起点"
  }
];

export const SUITS = ["权杖", "圣杯", "宝剑", "星币"];
export const SUITS_EN = ["Wands", "Cups", "Swords", "Pentacles"];
export const RANKS = ["王牌", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "王后", "国王"];
export const RANKS_EN = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

export function generateDeck(): TarotCard[] {
  const deck: TarotCard[] = [];
  
  MAJOR_ARCANA_DATA.forEach((data, index) => {
    deck.push({
      ...data,
      id: `major-${index}`,
      isReversed: false
    });
  });

  const suitThemes: Record<string, string> = {
    "权杖": "行动、创造力、激情与意志力（火元素）",
    "圣杯": "情感、关系、直觉与潜意识（水元素）",
    "宝剑": "理智、冲突、决策与沟通（风元素）",
    "星币": "物质、金钱、工作与身体健康（土元素）"
  };

  const rankMeanings: Record<string, { upright: string[], reversed: string[], theme: string }> = {
    "王牌": {
      upright: ["新开始", "机会", "潜力", "灵感"],
      reversed: ["错失良机", "缺乏动力", "延迟", "受阻"],
      theme: "纯粹的能量种子与新的起点"
    },
    "二": {
      upright: ["平衡", "决策", "伙伴关系", "二元性"],
      reversed: ["失衡", "犹豫不决", "冲突", "脱节"],
      theme: "能量的初步平衡与选择的出现"
    },
    "三": {
      upright: ["扩张", "表达", "合作", "初步成果"],
      reversed: ["缺乏进展", "沟通不良", "延迟", "挫折"],
      theme: "能量的流动、表达与初步的显化"
    },
    "四": {
      upright: ["稳定", "基础", "结构", "休息"],
      reversed: ["停滞", "僵化", "不安", "缺乏安全感"],
      theme: "能量的稳固、整合与暂时的停歇"
    },
    "五": {
      upright: ["挑战", "冲突", "损失", "变化"],
      reversed: ["缓解", "克服困难", "持续混乱", "内疚"],
      theme: "能量的波动、冲突与成长的阵痛"
    },
    "六": {
      upright: ["和谐", "过渡", "支持", "回忆"],
      reversed: ["不平衡", "沉溺过去", "缺乏支持", "阻碍"],
      theme: "能量的恢复、和谐与平稳的过渡"
    },
    "七": {
      upright: ["评估", "策略", "坚持", "选择"],
      reversed: ["优柔寡断", "放弃", "欺骗", "困惑"],
      theme: "能量的审视、挑战与智慧的考验"
    },
    "八": {
      upright: ["行动", "速度", "奉献", "技能"],
      reversed: ["匆忙", "拖延", "缺乏重点", "挫败"],
      theme: "能量的加速、专注与技能的磨炼"
    },
    "九": {
      upright: ["强度", "即将完成", "孤独", "丰盛"],
      reversed: ["压力", "精疲力竭", "缺乏信心", "匮乏"],
      theme: "能量的顶峰、内在的整合与最后的考验"
    },
    "十": {
      upright: ["完成", "圆满", "传承", "过度"],
      reversed: ["负担", "终结", "缺乏闭环", "崩溃"],
      theme: "能量的最终完成、传承与循环的终点"
    },
    "侍从": {
      upright: ["消息", "好奇心", "学习", "新计划"],
      reversed: ["坏消息", "不成熟", "缺乏方向", "分心"],
      theme: "年轻的能量、探索的热情与讯息的传递"
    },
    "骑士": {
      upright: ["行动", "冲刺", "专注", "改变"],
      reversed: ["鲁莽", "停滞", "缺乏动力", "焦躁"],
      theme: "动态的能量、追求目标的勇气与速度"
    },
    "王后": {
      upright: ["成熟", "直觉", "滋养", "内在力量"],
      reversed: ["情绪化", "冷漠", "不安全感", "操纵"],
      theme: "成熟的女性能量、内在的掌控与情感的深度"
    },
    "国王": {
      upright: ["权威", "领导力", "稳定", "掌控"],
      reversed: ["暴政", "软弱", "缺乏远见", "控制欲"],
      theme: "成熟的男性能量、外部的秩序与权力的运用"
    }
  };

  SUITS.forEach((suit, suitIndex) => {
    RANKS.forEach((rank, rankIndex) => {
      const rankData = rankMeanings[rank];
      deck.push({
        id: `minor-${suitIndex}-${rankIndex}`,
        name: `${suit}${rank}`,
        englishName: `${RANKS_EN[rankIndex]} of ${SUITS_EN[suitIndex]}`,
        image: `https://fastly.jsdelivr.net/gh/wpwarman/TarotImages@master/${SUITS_EN[suitIndex].toLowerCase() === 'pentacles' ? 'pents' : SUITS_EN[suitIndex].toLowerCase()}${(rankIndex + 1).toString().padStart(2, '0')}.jpeg`,
        rank: RANKS_EN[rankIndex],
        arcana: 'Minor',
        suit,
        isReversed: false,
        keywords: {
          upright: rankData.upright.map(k => `${suit}的${k}`),
          reversed: rankData.reversed.map(k => `${suit}的${k}`)
        },
        coreTheme: `${suitThemes[suit]}：${rankData.theme}`
      });
    });
  });

  return deck;
}

export function shuffleDeck(deck: TarotCard[]): TarotCard[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(getCryptoRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    shuffled[i].isReversed = getCryptoRandom() > 0.5;
  }
  shuffled[0].isReversed = getCryptoRandom() > 0.5;
  return shuffled;
}


export function getDailyTarotCards(count: number): TarotCard[] {
  const deck = generateDeck();
  const shuffled = shuffleDeck(deck);
  return shuffled.slice(0, count);
}
