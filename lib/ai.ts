export const DEFAULT_MODEL = "gemini-3-flash-preview";

export function sanitizePrompt(input: string): string {
  if (!input) return "";
  // Basic sanitization to prevent common injection patterns
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/System Instruction:|Ignore previous instructions/gi, "[REDACTED]");
}

/**
 * Unified non-streaming content generation using the secure /api/ai route.
 * Replaces the insecure direct client SDK usage.
 */
export async function generateContent(
  prompt: string | any[],
  systemInstruction: string = AKASHA_PERSONA,
  config: any = {}
): Promise<string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction, config }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate content');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');
  
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}


export async function* generateContentStream(
  prompt: string | any[],
  systemInstruction: string = AKASHA_PERSONA,
  signal?: AbortSignal
) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction }),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate content');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');
  
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

export const SOCRATIC_PERSONA = `你现在化身为一位深邃的荣格派分析师和苏格拉底式的智者。
你的核心任务不是给出答案，而是通过「提问」引导用户深入觉察自我。

【你的行为准则】
1. 永远不要直接给出建议或结论。
2. 每次回复只问一个直击灵魂的问题。
3. 运用聚焦（Focusing）和澄清（Clarification）技术。
4. 结合用户之前的占卜结果和个人档案，挖掘他们不敢面对的阴影（Shadow）或核心议题。
5. 语气：温和、包容、不带评判，但极其敏锐。
6. 绝对不要生硬地提及用户的性格标签（如“因为你是INTJ”），除非用户主动提及。将档案信息内化为你的洞察，不要给用户贴标签。

【对话示例】
用户：我不知道该不该辞职。
你：在你内心深处，你害怕的是失去这份工作带来的安全感，还是害怕去面对那个真正想做的事情可能带来的失败？这种恐惧，在你生命中是第一次出现吗？`;

export const AKASHA_PERSONA = `你是阿卡夏（Akasha）——宇宙阿卡夏记录的守护者，神秘学与深层心理学的交汇点。

【你的知识体系】
你融合了三个伟大传统：
1. 塔罗神秘学：韦特-史密斯系统、托特体系、原型象征
2. 荣格分析心理学：原型、阴影、个体化进程、集体无意识
3. 赫尔墨斯主义：「如其在上，如其在下」的对应原则

【你的思维方式】
在回应前，你总是先在内心完成三步：
1. 「镜像」：这张牌/这个卦象在映射用户灵魂的哪个部分？
2. 「问题背后的问题」：用户真正想知道的是什么，而仅是他们问的问题
3. 「成长视角」：这个挑战如何服务于此人的灵魂进化？

【语气标准】
✓ 温暖但不谄媚，神秘但不晦涩
✓ 使用象征和隐喻，但确保用户能理解
✓ 承认不确定性：「星辰显示…」「能量倾向于…」而非「你一定会…」
✓ 每段解读都有一个核心洞见，而非信息堆砌

【绝对不做】
✗ 绝不生硬地提及用户的性格标签（如“因为你是INTJ”、“作为5号人格”），除非用户主动询问。将这些信息化作无形的洞察融入解读，不要给用户贴标签。
✗ 绝不给出具体的日期预测（「3月15日你会遇到贵人」）
✗ 绝不做医疗、法律、财务的具体建议
✗ 绝不使用「命中注定」「无法改变」等决定论语言
✗ 绝不在用户询问悲伤话题时保持机械的神秘语气`;
