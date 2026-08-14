/**
 * Lightweight Middleware Pipeline for Dynamic Prompt Assembly.
 * Ensures domain purity, hallucination prevention, and conditional cross-system synergy.
 */

export interface PromptContext {
  [key: string]: any;
}

export type PromptMiddleware = (context: PromptContext, next: () => string) => string;

export class PromptPipeline {
  private middlewares: PromptMiddleware[] = [];
  private basePrompt: string = "";

  constructor(basePrompt: string = "") {
    this.basePrompt = basePrompt;
  }

  /**
   * Attach a middleware to the prompt assembly pipeline.
   */
  use(middleware: PromptMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Conditionally attach a middleware.
   */
  useIf(condition: boolean | undefined | null, middleware: PromptMiddleware): this {
    if (condition) {
      this.middlewares.push(middleware);
    }
    return this;
  }

  /**
   * Execute all middlewares and assemble the final prompt string.
   */
  build(context: PromptContext = {}): string {
    let index = -1;

    const runner = (i: number): string => {
      if (i <= index) {
        throw new Error("next() called multiple times in PromptPipeline");
      }
      index = i;

      if (i < this.middlewares.length) {
        const middleware = this.middlewares[i];
        return middleware(context, () => runner(i + 1));
      }

      return this.basePrompt;
    };

    return runner(0).trim();
  }
}

/**
 * Standard Prompt Plugins / Middlewares
 */

// 1. Injects User Profile Context
export const createProfilePlugin = (profileContext?: string): PromptMiddleware => {
  return (_, next) => {
    const current = next();
    if (!profileContext || !profileContext.trim()) return current;
    return `${current}

<user_profile_context>
${profileContext}
</user_profile_context>`;
  };
};

// 2. Injects Evidence-Based Anti-Hallucination Firewall
export const createEvidenceFirewallPlugin = (): PromptMiddleware => {
  return (_, next) => {
    const current = next();
    return `${current}

<evidence_firewall>
【防幻觉与客观事实审查规范】
1. 你的所有推演必须严格基于输入的排盘/指标数据（客观事实区），严禁凭空捏造未出现的星曜、神煞或病机。
2. 严禁无底线迎合或巴纳姆效应式模糊算命，必须给出确凿的理据。
3. 严格区隔【客观命理/生理数据】与【求问者主观诉求】，执行先断事实、后答疑惑的三步推演法。
</evidence_firewall>`;
  };
};

// 3. Injects Cross-System Synergy (Only if explicitly enabled by user)
export const createCrossSynergyPlugin = (
  enabled: boolean,
  activeModules: Record<string, boolean> = {}
): PromptMiddleware => {
  return (_, next) => {
    const current = next();
    if (!enabled) return current;

    const activeList = Object.entries(activeModules)
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join(', ');

    return `${current}

<cross_system_synergy>
【跨体系全息共振指引】
用户已主动开启【跨体系能量共振】模式（当前已激活模块：${activeList || '全部'}）。
- 在保持本学科（如八字/紫微/经方）100% 正统专业推演的前提下，若发现命局中五行偏枯、气机失调或星盘出现显著相位共振，可提供跨维度的身心调摄与星象全息参照。
- 严禁生硬堆砌杂糅词汇，必须符合天人相应与心理学原型的自然通透。
</cross_system_synergy>`;
  };
};
