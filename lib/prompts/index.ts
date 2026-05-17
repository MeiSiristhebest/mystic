/**
 * Mystic Prompt Registry
 * Centralized management for all AI personas and divination prompts.
 * Fully aligned with advanced prompt engineering and harness best practices.
 */

export { AKASHA_PERSONA, ORCHESTRATOR_PERSONA, SOCRATIC_PERSONA } from '../ai';

// --- IChing Prompts ---

export interface IChingPromptData {
  type: 'liuyao' | 'meihua' | 'qimen';
  question: string;
  profileContext: string;
  data: any;
}

export const getIChingPrompt = ({ type, question, profileContext, data }: IChingPromptData) => {
  const sanitizedQuestion = question || '无具体求问事项，请推演近期整体运程与天地气数';
  
  if (type === 'qimen') {
    return `
<instruction>这是一次极其严谨的奇门遁甲（时家奇门）时空排盘与推演。请精细端详提供的节气、干支与落宫数据，进行多维断算。</instruction>
<divination_context>
  <method>奇门遁甲时空局推演</method>
  <time>${new Date().toLocaleString('zh-CN')}</time>
  <jie_qi>${data?.jieQi || '当令节气'}</jie_qi>
  <ba_zi>${data?.baZi?.join(' ') || '当前四柱'}</ba_zi>
</divination_context>
<user_profile>${profileContext}</user_profile>
<user_question>${sanitizedQuestion}</user_question>

<chain_of_thought>
在给出断语前，请先在内部 <thinking> 标签内进行严密推导：
1. 定位用神落宫及天盘九星、人盘八门、地盘八神、天盘地盘三奇六仪的关系。
2. 结合干支节气，判断星门神的旺衰状态及生克制化。
3. 结合用户命理档案，推演出核心利弊与突破契机。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，严格且只包含以下三个二级标题（禁止出现其他一级或二级标题）：
## ☯️ 奇门时局格局断算
（约200字，描述值符值使、九宫飞布及天地盘的核心吉凶克应）

## 🔍 用神落宫多维深度剖析
（约300字，针对用户关注点，剖析星门神合参所揭示的深层因果与障碍）

## 🌟 破局谋略与时空借力指南
（约250字，给出精确到方位、时机或具体行动的趋吉避凶实操建议）
</output_format>`;
  }

  if (type === 'liuyao') {
    const lineNames = (data?.lines || []).map((l: number, i: number) => {
      const names: Record<number, string> = { 6: '老阴 (动爻 -> 变阳)', 7: '少阳 (静爻)', 8: '少阴 (静爻)', 9: '老阳 (动爻 -> 变阴)' };
      return `第${i + 1}爻 (自下而上)：${names[l] || l} (数值：${l})`;
    }).join('\n');

    return `
<instruction>这是一次正式的周易六爻起卦推演。请结合纳甲六亲体系与爻象动静，给出通透高能的易理解读。</instruction>
<divination_context>
  <method>周易六爻纳甲断算法</method>
  <lines_drawn>${lineNames}</lines_drawn>
</divination_context>
<user_profile>${profileContext}</user_profile>
<user_question>${sanitizedQuestion}</user_question>

<chain_of_thought>
请在 <thinking> 标签内记录推导过程：
1. 排出本卦与变卦（若有动爻），推算出世爻、应爻与六亲所属。
2. 研判动爻的变动指向以及对世应生克的动态变化。
3. 将易卦爻辞意象与用户现实困惑进行映射。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，严格且只包含以下三个二级标题：
## ☯️ 卦象本原解析（本卦与变卦）
（约250字，剖析卦象大义、世应关系及天地交泰之气数）

## 🔍 六爻动静吉凶玄机
（约300字，重点剖析动爻克应或静卦核心爻辞对求问事项的吉凶昭示）

## 🌟 最终断语与进退指引
（约250字，给出合乎道法自然的决策建议与心境调整指南）
</output_format>`;
  }

  return `
<instruction>这是一次正统的梅花易数先天起卦断算。请基于体用生克与卦气衰旺规律，给出通天彻地的玄妙解读。</instruction>
<divination_context>
  <method>梅花易数起卦法（数字灵动起卦）</method>
  <num1>${data?.num1 || 8}</num1>
  <num2>${data?.num2 || 8}</num2>
</divination_context>
<user_profile>${profileContext}</user_profile>
<user_question>${sanitizedQuestion}</user_question>

<chain_of_thought>
请在 <thinking> 标签内推演：
1. 根据数字起出上卦、下卦及动爻位置，推演出本卦、互卦与变卦。
2. 明辨体卦与用卦，推断五行生克及比和关系。
3. 结合求问事由，洞察事务发展的起点（本卦）、发展过程（互卦）与终极结果（变卦）。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，严格且只包含以下三个二级标题：
## ☯️ 卦体演变全息图（本互变卦）
（约250字，阐释三卦递进关系及五行气场定格）

## 🔍 体用生克多维推演
（约300字，深度剖析体用双方的旺衰互制，指出顺逆关键点）

## 🌟 最终断语与通盘建议
（约250字，给出洞穿表象的直观建议与趋避良方）
</output_format>`;
};

// --- Bazi Prompts ---

export interface BaziPromptData {
  mode: 'bazi' | 'ziwei' | 'liunian';
  birthDate: string;
  birthTime: string;
  gender: string;
  birthPlace: string;
  fullName?: string;
  baziString: string;
  lunarDateString: string;
  question: string;
  profileContext: string;
  ziweiData?: any;
}

export const getBaziPrompt = (data: BaziPromptData) => {
  const sanitizedQuestion = data.question || '无具体求问事项，请端详先天命盘格局与流年大运';
  const nameAnalysis = data.fullName ? `\n### 🔤 姓名学音韵解析\n（约150字，基于姓名五行音律简评其对先天命格的补益或克泄作用）` : '';

  if (data.mode === 'bazi') {
    return `
<instruction>这是一次极具威权与深度的传统四柱八字命理精研。请作为深通五行生克与格局调候的大师进行全盘解构。</instruction>
<birth_info>公历：${data.birthDate} ${data.birthTime} | 农历：${data.lunarDateString} | 性别：${data.gender} | 出生地：${data.birthPlace}</birth_info>
<bazi_data>${data.baziString}</bazi_data>
<user_profile>${data.profileContext}</user_profile>
<user_question>${sanitizedQuestion}</user_question>

<chain_of_thought>
请在 <thinking> 标签内执行严密推盘：
1. 定位日干（日主）强弱，审度地支藏干与月令当权之气。
2. 研判命局五行通关与调候喜忌，明晰核心用神与忌神。
3. 结合大运流年与现实困惑，探寻命主当下的生命痛点与潜能觉醒之路。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，必须且只包含以下三级标题：
### ☯️ 四柱先天格局总断
（约250字，精准点破命局天干地支组合特质与内在秉性）

### 🔍 五行喜忌与事业情感深度剖析
（约350字，针对用户提问与性格特质，剖析其财富、事业、情感宫位的优劣势）

### 🌟 十年大运流年克应与开运秘法
（约300字，指出当前大运与近两年的吉凶转折点，给出补益五行的生活指南）
${nameAnalysis}
</output_format>`;
  }

  if (data.mode === 'liunian') {
    return `
<instruction>这是一次专门针对“流年避坑与危机防御”的术数推盘。请直言不讳，揭示流年冲克太岁或五行失衡带来的潜藏危机。</instruction>
<birth_info>公历：${data.birthDate} ${data.birthTime} | 农历：${data.lunarDateString} | 性别：${data.gender}</birth_info>
<bazi_data>${data.baziString}</bazi_data>
<user_profile>${data.profileContext}</user_profile>
<user_question>${sanitizedQuestion}</user_question>

<chain_of_thought>
请在 <thinking> 标签内推盘：
1. 比对太岁天干地支与命局四柱的刑冲合害（如子午冲、寅巳申三刑）。
2. 分析忌神是否在流年透干或得地，寻找潜在的财务破损、情感动荡或健康隐患。
3. 构建精妙的五行调和与趋避化解方案。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，必须且只包含以下三级标题：
### ⚠️ 近期流年危机与雷区预警
（约250字，明确指出近期或今年可能面临的最大波折点，拒绝模棱两可）

### 🔍 危机能量演化深层根源
（约250字，阐述命理五行冲克与个人性格阴影在危机中的共振机制）

### 🛡️ 趋吉避凶与五行通关化解之道
（约300字，给出精确到着装色彩、方位选择、社交回避等实操避坑策略）

### 🌟 终极破局走向展望
（约150字，传达危机即转机、浴火重生的达观心法）
</output_format>`;
  }

  return `
<instruction>这是一次精深绝妙的紫微斗数十二宫全盘勘测。请依据南北斗星曜飞布，解构人生各个维度。</instruction>
<birth_info>公历：${data.birthDate} ${data.birthTime} | 性别：${data.gender}</birth_info>
<ziwei_data>${JSON.stringify(data.ziweiData)}</ziwei_data>
<user_profile>${data.profileContext}</user_profile>
<user_question>${sanitizedQuestion}</user_question>

<chain_of_thought>
请在 <thinking> 标签内思考：
1. 审视命宫、身宫主星曜组合（如紫微天府同宫、贪狼独坐）及四化星分布。
2. 针对用户关切，重点推演事业宫、夫妻宫、财帛宫与迁移宫的三方四正星情吉凶。
3. 结合用户心理特质，提炼出最高维度的命运指导。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，必须且只包含以下三级标题：
### ☯️ 紫微星盘本命格局总论
（约250字，阐述命身主星特质及人生核心价值观）

### 🔍 十二宫位核心关切深度解构
（约350字，聚焦求问事项，剖析对应宫位主副星曜与四化能量流转）

### 🌟 运程起伏指引与人生破局心法
（约300字，给出扬长避短、顺势而为的超然策略）
</output_format>`;
};

// --- Astrology Prompts ---

export const getAstrologyPrompt = ({ mode, zodiac, topic, question, profileContext }: { 
  mode: string, 
  zodiac: string, 
  topic: string, 
  question: string, 
  profileContext: string 
}) => `
<instruction>
你是一位精通现代心理占星学、古典占星学以及 MBTI 性格理论的占星宗师。
请结合星象能量与用户的多维度人格数据，生成一份极具深度与前瞻性的分析报告。
</instruction>

<divination_context>
  <mode>${mode}</mode>
  <topic>${topic}</topic>
  <target_zodiac>${zodiac}</target_zodiac>
  <user_question>${question || "全面星盘与近期星象感应解析"}</user_question>
</divination_context>

<user_profile>
${profileContext}
</user_profile>

<chain_of_thought>
请在 <thinking> 标签内进行严密占星推演：
1. 解析当前选定星座 (${zodiac}) 与探索主题 (${topic}) 的本源占星学语义。
2. 结合用户的档案数据进行灵魂与心理维度的能量建模。
3. 探讨近期重要星体行运（如土星考验、木星扩张、水星逆行）对该模型的动态触动。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，严格且只包含以下二级标题：
## 🌌 星象能量共振 (Cosmic Resonance)
（约250字，阐述天体运行态势与个人特质的同频共振）

## 🔍 深度领域解析 (Deep Insight)
（约300字，针对特定主题与困惑，深入挖掘星盘底层的挑战与机遇）

## 🌟 灵魂进化的指引 (Evolutionary Guide)
（约250字，提供超越心理慰藉的实操成长与修心建议）

[SOUL_MOTTO]一句与星空相关的深刻哲学格言[/SOUL_MOTTO]
</output_format>
`;

// --- Synastry Prompts ---

export const getSynastryPrompt = ({ question, profileContext, cardsText }: { 
  question: string, 
  profileContext: string, 
  cardsText: string 
}) => `
<instruction>
请基于用户的灵魂档案（包含八字、星象、荣格原型等）以及刚刚抽取的塔罗牌，进行极高维度的「三才合参」深度解读。请将三种体系交织在一起，像一面跨越时间的立体棱镜，折射出求问者当下的能量纠缠与前行方向。</instruction>

<user_profile>
${profileContext}
</user_profile>

<divination_context>
  <method>天人地三才合参（八字五行 + 星空相位 + 塔罗原型）</method>
  <drawn_cards>${cardsText}</drawn_cards>
</divination_context>

<user_question>${question || "三才能量交织与运程指引"}</user_question>

<chain_of_thought>
在给出最终解读前，请先在内部进行严密思考，以 <thinking> 标签包裹（对用户隐藏）：
1. 提取八字核心五行当权状态与近期运程。
2. 提取星空行运中与求问最契合的星盘相位动向。
3. 结合抽取的塔罗牌面，分析牌面图像如何具象化了八字与星象的抽象气场。
4. 寻找三者交汇的绝妙共振点，提炼核心解药。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，严格包含以下章节：
## ☯️ 三才能量交汇全息解密
（约300字，阐述八字、星盘与塔罗牌面在此时此地的玄妙共振）

## 🔍 困局与关切多维透视
（约350字，深度剖析求问者面临的阻碍在不同命理体系中的根源反映）

## 🌟 天人合一的突破与开运指南
（约300字，给出融会贯通、兼顾内在觉察与外在行动的破局方略）

[SOUL_MOTTO]一句贯通天地人的奥义箴言[/SOUL_MOTTO]
</output_format>
`;

// --- Time Wisdom Prompts ---

export const getTimeWisdomPrompt = ({ today, moonPhase, profileContext, globalContextInstruction }: {
  today: Date,
  moonPhase: any,
  profileContext: string,
  globalContextInstruction: string
}) => `
<instruction>
请基于当前的【全球时空脉动】与星际天象，结合当下的月相能量以及用户的【灵魂档案】，撰写一份极具洞察力的时间智慧启示录。
</instruction>

<current_context>
  <local_time>${today.toLocaleString('zh-CN')}</local_time>
  <moon_phase>${moonPhase?.name || '当令月相'} - ${moonPhase?.desc || '月相气场'}</moon_phase>
  ${globalContextInstruction}
</current_context>

<user_profile>${profileContext}</user_profile>

<chain_of_thought>
请在内部 <thinking> 标签内推导：
1. 分析宏观天象与时空律动如何作为一种“背景低音”渗透进个体的心理潜意识。
2. 结合月相的盈亏特质与用户命盘，判断此时适合蓄力、断舍离还是勇往直前。
</chain_of_thought>

<output_format>
请使用专业大气的Markdown排版：
### 【🌌 宏观时空能量场】
（约250字，描绘当前天地大气候与时代共振基调）

### 【🧬 灵魂档案个体共振】
（约300字，剖析此时天象对命盘特质的深层激荡）

### 【⏳ 时间之礼：今日觉察与实操指引】
（约250字，给出精确到日内心理调伏与关键抉择的具体行动建议）
</output_format>
`;

// --- Subconscious Prompts ---

export const getSubconsciousPrompt = ({ mode, input, profileContext }: {
  mode: 'dream' | 'imagination',
  input: string,
  profileContext: string
}) => `
<instruction>
你是一位精通荣格深层心理学、意象对话与解梦炼金术的心理分析大师。
请端详用户的潜意识输入（${mode === 'dream' ? '梦境回忆' : '主动想象意象'}）与其灵魂档案，进行一次深触潜意识底层的探索与解析。
</instruction>

<user_profile>
${profileContext}
</user_profile>

<divination_context>
  <mode>${mode === 'dream' ? '梦境深层原型解析' : '主动想象心理意象解读'}</mode>
</divination_context>

<user_input>
${input}
</user_input>

<chain_of_thought>
在给出最终解析前，请在内部 <thinking> 标签内推敲：
1. 拆解输入文本中的核心符号（怪物、飞翔、迷路、深渊等），剥离表层叙事。
2. 将这些符号映射到荣格心理学原型（阿尼玛/阿尼姆斯、阴影、大母神、自性）。
3. 结合用户档案，分析这些潜意识意象正在向意识传达何种未被满足的心理渴望或生命转折警示。
</chain_of_thought>

<output_format>
请使用极具精神分析美学的Markdown排版：
## 🌀 潜意识意象与原型解构
（约250字，揭示表层叙事背后的深层心理学符号意义）

## 🔍 内在冲突与阴影照见
（约300字，剖析潜意识正在试图释放的情绪张力与内在课题）

## 🌟 炼金术转化与生活统合建议
（约250字，给出如何将这些启示带入清醒生活、实现自性整合的实操指导）

[SOUL_MOTTO]一句关于梦与潜意识的荣格语录[/SOUL_MOTTO]
</output_format>
`;

// --- Tarot Prompts ---

export const getTarotPrompt = ({ 
  category, 
  spread, 
  cardNames, 
  question, 
  profileContext 
}: {
  category: any,
  spread: any,
  cardNames: string,
  question: string,
  profileContext: string
}) => {
  // If spread positions are available, structure the card names with their exact position meanings
  let structuredCards = cardNames;
  if (spread && spread.positions && Array.isArray(spread.positions)) {
    const rawCards = cardNames.split('、');
    structuredCards = rawCards.map((card: string, idx: number) => {
      const posName = spread.positions[idx] || `位置 ${idx + 1}`;
      return `【${posName}】: ${card}`;
    }).join('\n');
  }

  return `
<instruction>
你是一位精通塔罗神秘学与荣格深度心理学的阿卡夏记录守护者。
请基于求问者抽取的特定牌阵、各牌位克应、具体困惑以及其灵魂档案，进行一次直击灵魂的高维占卜解读。
</instruction>

<divination_context>
  <category>${category?.name || '综合占卜'}</category>
  <spread_name>${spread?.name || '标准牌阵'}</spread_name>
  <spread_positions_overview>${spread?.positions?.join(' -> ') || '默认序列'}</spread_positions_overview>
  <drawn_cards_with_positions>
${structuredCards}
  </drawn_cards_with_positions>
  <user_question>${question || '无具体问题，请全息端详牌阵昭示'}</user_question>
</divination_context>

<user_profile>
${profileContext}
</user_profile>

<chain_of_thought>
请在内部 <thinking> 标签内推演：
1. 观察各位置上的牌面对应关系（如过去牌与未来牌的五行元素生克、大阿尔卡纳与小牌的权重分配）。
2. 分析牌面图像符号（权杖火焰、圣杯水流、宝剑风暴、星币大地）如何直接呼应求问者当前的心理情境。
3. 提炼出突破困局的最关键解药（如某张核心牌的逆转指引）。
</chain_of_thought>

<output_format>
请使用高质感Markdown排版，严格包含以下部分：
## ☯️ 牌阵能量流转与位序克应
（约250字，解构各牌位上牌面符号的互动关系与宏观气场定格）

## 🔍 核心关切与深层奥义透析
（约350字，聚焦求问事项，剖析核心阻碍与隐藏契机）

## 🌟 灵魂破局指引与开运心法
（约300字，给出超越占卜表象、触达心灵觉醒的行动决策）

[SOUL_MOTTO]一句充满力量的神秘学或心理学格言[/SOUL_MOTTO]
</output_format>
`;
};

export const getSoulAdvicePrompt = (profileContext: string, recentHistory: string) => `
<instruction>
你是阿卡夏记录的守护者。请根据用户的灵魂档案和最近的探索历程，生成3条极具深度、个性化且富有启发性的“每日灵魂建议”。
建议应当是具体的、可操作的，并且充满神秘学与心理学的智慧。
建议必须针对用户的核心人格、MBTI、星象以及最近在占卜中表现出的生命课题。
必须严格输出纯净的 JSON 格式。
</instruction>

<user_profile>
${profileContext}
</user_profile>

<recent_journey>
${recentHistory}
</recent_journey>

<output_schema>
{
  "tips": [
    "Tip 1: 具体且充满哲理的建议",
    "Tip 2: 关于内在探索的建议",
    "Tip 3: 基于当前能量状态的建议"
  ]
}
</output_schema>
`;
