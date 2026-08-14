/**
 * Smart Oracle Router (心念直达 · 智能术数分流罗盘)
 * Analyzes the user's natural language question and intelligently recommends
 * the most suitable divination system, mode, and rationale.
 */

export interface OracleRouteResult {
  systemTab: string;
  subTab?: string;
  systemName: string;
  iconName: string;
  badge: string;
  rationale: string;
  suggestedQuestion: string;
  handoffPayload: {
    system: string;
    modeId?: string;
    question: string;
    autoTrigger?: boolean;
  };
}

export function routeUserIntent(userInput: string): OracleRouteResult {
  const text = userInput.trim().toLowerCase();

  // 1. 具体事件成败 / 考试 / 面试 / 胜负 / 当下吉凶 / 能否成功 -> 周易六爻
  if (
    /能否|会不会|能不能|成败|吉凶|面试|考试|胜负|胜败|借钱|官司|输赢|成交|应聘|考研|录取|通过|比赛/.test(text)
  ) {
    return {
      systemTab: "eastern",
      subTab: "liuyao",
      systemName: "周易六爻 · 动爻断事",
      iconName: "Coins",
      badge: "专断成败应期",
      rationale: "六爻铜钱起卦以动爻生克与时空感应，最为擅长精准决断具体单一事件的吉凶、胜负与应期。",
      suggestedQuestion: userInput,
      handoffPayload: {
        system: "eastern",
        modeId: "liuyao",
        question: userInput,
        autoTrigger: true
      }
    };
  }

  // 2. 情感心理 / 潜意识 / 对方想法 / 关系走向 / 迷茫选择 -> 韦特塔罗
  if (
    /他想|她想|感情|恋爱|前任|复合|喜欢|心意|选择|纠结|迷茫|心理|潜意识|关系|塔罗|桃花/.test(text)
  ) {
    return {
      systemTab: "tarot",
      systemName: "神圣塔罗 · 潜意识灵境",
      iconName: "Layers",
      badge: "透视心理与走向",
      rationale: "塔罗牌阵善于透视双方潜意识深层动机、情感张力与近未来动态走向，为你照亮迷雾。",
      suggestedQuestion: userInput,
      handoffPayload: {
        system: "tarot",
        question: userInput,
        autoTrigger: false
      }
    };
  }

  // 3. 一生命格 / 大运流年 / 富贵层次 / 适合行业 / 财官格局 -> 四柱八字
  if (
    /八字|生辰|大运|流年|一生|发财|财运|事业运|命格|格局|五行|适合什么工作|官运|富贵/.test(text)
  ) {
    return {
      systemTab: "eastern",
      subTab: "bazi",
      systemName: "四柱八字 · 天命格局",
      iconName: "Compass",
      badge: "通晓大运格局",
      rationale: "四柱八字通晓天干地支五行制化，洞悉一生财官印受用与十年大运起伏。",
      suggestedQuestion: userInput,
      handoffPayload: {
        system: "eastern",
        modeId: "bazi",
        question: userInput,
        autoTrigger: true
      }
    };
  }

  // 4. 全年全景运势 / 十二宫位 / 整体走势 -> 紫微斗数
  if (
    /紫微|命宫|流年运势|运程|整体运势|下半年|明年|宫位/.test(text)
  ) {
    return {
      systemTab: "eastern",
      subTab: "ziwei",
      systemName: "紫微斗数 · 十二宫星曜",
      iconName: "Star",
      badge: "全盘星曜俯瞰",
      rationale: "紫微斗数以紫微、天府等星曜排布十二宫，全景式剖析流年事业、财帛、迁移与田宅气数。",
      suggestedQuestion: userInput,
      handoffPayload: {
        system: "eastern",
        modeId: "ziwei",
        question: userInput,
        autoTrigger: true
      }
    };
  }

  // 5. 身体不适 / 睡眠焦虑 / 情绪内耗 / 气血失调 -> 中医灵枢
  if (
    /失眠|焦虑|累|疲劳|头痛|胃|气血|体质|情绪|内耗|养生|调理|健康|中医|失衡/.test(text)
  ) {
    return {
      systemTab: "renji",
      systemName: "中医灵枢 · 脏腑调和",
      iconName: "HeartPulse",
      badge: "医道调和身心",
      rationale: "灵枢古医秉承《黄帝内经》与经方精义，探究脏腑气血与七情郁结，以医道调和身心。",
      suggestedQuestion: userInput,
      handoffPayload: {
        system: "renji",
        question: userInput,
        autoTrigger: true
      }
    };
  }

  // 6. 星盘相位 / 行运星象 / 灵魂课题 -> 西方占星
  if (
    /占星|星盘|水逆|上升星座|月亮星座|行星|太阳星座|行运/.test(text)
  ) {
    return {
      systemTab: "western",
      systemName: "西方占星 · 行星神圣几何",
      iconName: "Sun",
      badge: "宇宙星轨映射",
      rationale: "西方占星学通过本命星盘与行星行运交角，解密灵魂蓝图与当下的宇宙能量相位。",
      suggestedQuestion: userInput,
      handoffPayload: {
        system: "western",
        question: userInput,
        autoTrigger: true
      }
    };
  }

  // 默认：智能导向周易六爻或神圣塔罗
  return {
    systemTab: "eastern",
    subTab: "liuyao",
    systemName: "周易六爻 · 动爻观变",
    iconName: "Sparkles",
    badge: "感应时空生克",
    rationale: "周易六爻以动爻感应天地造化，随时随念起卦，为你提供当下最清晰的指引。",
    suggestedQuestion: userInput,
    handoffPayload: {
      system: "eastern",
      modeId: "liuyao",
      question: userInput,
      autoTrigger: true
    }
  };
}
