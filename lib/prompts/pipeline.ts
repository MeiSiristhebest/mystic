/**
 * Lightweight Middleware Pipeline for Dynamic Prompt Assembly.
 * Ensures domain purity, hallucination prevention, canonical evidence grounding,
 * and dialectical cross-domain arbitration.
 */

import { CanonicalEvidenceNode, CrossDomainConflict } from '../contracts/types';
import { CrossDomainConflictDetector } from '../reasoning/conflict-detector';

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

// 2. Injects 4-Tier Evidence-Based Grounding & Anti-Hallucination Firewall
export const createEvidenceFirewallPlugin = (): PromptMiddleware => {
  return (_, next) => {
    const current = next();
    return `${current}

<evidence_firewall>
【四层解耦推演与防幻觉审查规范】
1. 你的所有推演必须严格遵照以下四层分级：
   - 【A 类：确定性计算事实】（行星度数、宫位、干支、宿度、Dasha时间）必须100%客观呈现，严禁捏造。
   - 【B 类：规则与格局命中】（如三奇加会、太阳中风、Atmakaraka）必须基于确定性算法输出。
   - 【C 类：经典出处与经方】（如《伤寒论》《金匮要略》《骨髓赋》）必须引用真实传世典籍。
   - 【D 类：启发式生活建议】仅作为决策辅助，严禁代替医疗诊断或做宿命论断言。
2. 严禁巴纳姆效应式的模棱两可套话，每一条关键论断必须在上下文证据库中具备对应 Evidence 依据。
</evidence_firewall>`;
  };
};

// 3. Injects Structured Canonical Evidence Nodes
export const createCanonicalEvidencePlugin = (evidences: CanonicalEvidenceNode[] = []): PromptMiddleware => {
  return (_, next) => {
    const current = next();
    if (!evidences || evidences.length === 0) return current;

    const evidenceList = evidences.map((e, idx) => 
      `[Evidence #${idx + 1}] ID: ${e.id} | Domain: ${e.domain.toUpperCase()} | Rule: ${e.ruleName} | Level: ${e.level.toUpperCase()}
  - 经典出处: ${e.classicalSource || '经典传承'}
  - 领域原义: ${e.canonicalInterpretation}
  - 判定倾向: ${e.polarity.toUpperCase()} (置信度: ${(e.confidence * 100).toFixed(0)}%)`
    ).join('\n\n');

    return `${current}

<canonical_evidences_graph>
【经算法确定性校验的领域证据图谱 (Canonical Evidence Graph)】
以下是由底层计算与规则引擎锁定的客观证据链，请基于这些证据组织你的论述：

${evidenceList}
</canonical_evidences_graph>`;
  };
};

// 4. Injects Cross-Domain Dialectical Conflict / Tension Analysis
export const createDialecticalConflictPlugin = (conflicts: CrossDomainConflict[] = []): PromptMiddleware => {
  return (_, next) => {
    const current = next();
    if (!conflicts || conflicts.length === 0) return current;

    const conflictBlock = CrossDomainConflictDetector.formatConflictPromptBlock(conflicts);
    if (!conflictBlock) return current;

    return `${current}

${conflictBlock}`;
  };
};

// 5. Injects Cross-System Synergy (Only if explicitly enabled by user)
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
- 严禁生硬堆砌杂糅词汇，若体系间存在分歧，必须坦诚指出分歧并给出阴阳平衡建议，绝不强行编造伪共识。
</cross_system_synergy>`;
  };
};
