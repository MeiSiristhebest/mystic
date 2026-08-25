# 🔮 Mystic 多领域 AI 推理与证据图架构设计 (Architecture Guide)

<p align="center">
  <b><a href="./ARCHITECTURE.md">English</a> | 简体中文</b>
</p>

本文档阐述 **Mystic** 4 层解耦 AI 推理架构与规范证据图 (CEG) 引擎的设计原理。

```mermaid
graph TD
    User[客户端 / Next.js 16 UI] -->|用户查询| Router[领域分发路由器]

    subgraph "第 1 层：确定性领域计算层"
        Router --> Ephemeris[Moshier 历表精确算法]
        Router --> AstroRules[天文学与年代学确定性算法]
    end

    subgraph "第 2 层：规范证据图 (CEG 引擎)"
        Ephemeris --> EvidenceGen[确定性物证合成器]
        AstroRules --> EvidenceGen
        EvidenceGen --> Arbiter[跨领域时空冲突仲裁器]
        Arbiter --> ScoredGraph[(规范证据图 CEG)]
    end

    subgraph "Tier 3: 推理约束与大模型接地 (Reasoning & Grounding)"
        ScoredGraph --> ContextPacker[约束与事实提取器 (ContextPacker)]
        ContextPacker --> LLM[全模型统一引擎 (Vercel AI SDK · DeepSeek / Claude / GPT / Gemini)]
    end

    subgraph "第 4 层：零幻觉事实验证门禁"
        LLM --> FactValidator[事实一致性检验校验器]
        FactValidator --> User
    end
```

---

## 📐 1. 4 层严格解耦架构
为了杜绝大语言模型的幻觉问题，Mystic 严格将**事实计算**与**自然语言生成**剥离：
- **坐标与规则计算**：100% 由底层 C/Wasm 编译的高精度历表与符号算法执行。
- **LLM 生成**：大模型仅基于已裁决的证据图节点进行语义转化，无权编造事实。

---

## 📊 2. 规范证据图 (CEG)
- 将多领域推演规则构建为有向无环证据图。
- 每一个分析输出均携带确定性置信度评分与可溯源的数学计算链条。

---

<sub>© 2026 Mystic. Licensed under the MIT License.</sub>
