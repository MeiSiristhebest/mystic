# 🔮 Mystic - Multi-Domain AI Wisdom & Interpretable Reasoning Suite

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14_App_Router-black.svg?style=for-the-badge" alt="Next.js 14 App Router" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/AI_Engine-Gemini_Stream_%26_Vision_API-8E44AD.svg?style=for-the-badge" alt="Gemini Stream and Vision API" /></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Database-Firebase_Firestore-FFCA28.svg?style=for-the-badge" alt="Firebase Firestore" /></a>
</p>

<p align="center">
  <a href="README.md">🇨🇳 中文</a> &nbsp;|&nbsp; <a href="README_EN.md">🇺🇸 English</a>
  </p>

---

<p align="center">
  <strong>基于结构化事实约束与确定性规则引擎的多领域可解释 AI 推演系统</strong><br/>
  <em>四层解耦架构 · 证据图谱 (Canonical Evidence Graph) · 跨体系辩证冲突仲裁 · 严格确定性计算与校验</em>
</p>

<p align="center">
  <img width="1262" height="694" alt="Mystic 产品界面预览" src="https://github.com/user-attachments/assets/64f63a5e-c24d-414b-ac60-d86552c7c563" />
</p>

---

## 目录 (Table of Contents)

- [项目简介 (About)](#项目简介-about)
- [核心架构：四层解耦模型 (Architecture)](#核心架构四层解耦模型-architecture)
- [核心领域推演引擎 (Domain Engines)](#核心领域推演引擎-domain-engines)
  - [1. 印度吠陀占星 (Vedic Jyotish Engine)](#1-印度吠陀占星-vedic-jyotish-engine)
  - [2. 倪海厦《人纪》经方辨证系统 (Ni Haixia TCM Engine)](#2-倪海厦人纪经方辨证系统-ni-haixia-tcm-engine)
  - [3. 紫微斗数格局与四化引擎 (Ziwei Doushu Engine)](#3-紫微斗数格局与四化引擎-ziwei-doushu-engine)
  - [4. 跨体系冲突检测与辩证推理 (Cross-Domain Dialectics)](#4-跨体系冲突检测与辩证推理-cross-domain-dialectics)
- [环境要求与安装 (Installation & Setup)](#环境要求与安装-installation--setup)
- [项目结构 (Project Structure)](#项目结构-project-structure)
- [参与贡献与安全说明 (Contributing & Security)](#参与贡献与安全说明-contributing--security)
- [许可证 (License)](#许可证-license)

---

## 项目简介 (About)

**Mystic** 是一套构建在 **Next.js 14 App Router** 与 **Google Gemini API** 之上的**多领域结构化可解释 AI 推演引擎**。

传统的玄学与命理 AI 往往直接将出生日期或主观提问粗暴地作为 Prompt 丢给大语言模型，导致极易产生“巴纳姆效应”套话、事实捏造与虚假的多系统一致性幻觉。

**Mystic 拒绝简单的 Prompt 套壳。** 本项目在前端交互与大模型生成之间，建立了一套严密的**确定性计算与规则推理中枢**：
1. **确定性计算事实先行**：天文历法、恒星黄道、分盘与经方指标 100% 由纯算法确定性计算，严禁模型猜度。
2. **确定性规则树与格局匹配**：六经辨证决策树、紫微格局库、吠陀 Karaka 机制均由独立规则引擎提取，直接对应古籍经典出处。
3. **结构化证据图谱 (Canonical Evidence Graph)**：每条结论均携带明确的 `EvidenceNode` 证据溯源链。
4. **跨体系张力与冲突呈现**：允许并展示不同学科之间的推演分歧（如紫微变动 vs 吠陀沉淀），拒绝和稀泥式的伪共识。

---

## 核心架构：四层解耦模型 (Architecture)

```mermaid
graph TD
    subgraph Layer1 [Layer 1: 确定性计算与天文历法事实层 (Tier A)]
        Z_Calc[紫微: iztro 农历/主星/四化排盘]
        V_Calc[吠陀: 恒星黄道 Lahiri Ayanamsa + 120年递归三级 Dasha]
        N_Fact[中医: 问诊采集 + 节气与五运六气先天天时]
    end

    subgraph Layer2 [Layer 2: 确定性规则与格局匹配层 (Tier B)]
        Z_Rule[紫微 Patterns 规则引擎: 80+ 经典格局命中]
        V_Rule[吠陀 7-Chara Karakas + D9/D10 分盘映射 + Sade Sati 周期]
        N_Rule[倪师八纲六经辨证决策树 + 经典经方药对匹配]
    end

    subgraph Layer3 [Layer 3: 证据图谱与经典溯源层 (Tier C)]
        EG[Canonical Evidence Graph 证据图谱]
        Z_Rule --> EG
        V_Rule --> EG
        N_Rule --> EG
    end

    subgraph Layer4 [Layer 4: 跨体系辩证冲突检测与 LLM 综合层 (Tier D)]
        CD[CrossDomainConflictDetector 冲突仲裁器]
        EG --> CD
        CD --> Pipeline[PromptPipeline 上下文编排]
        Pipeline --> LLM[Gemini 1.5/2.0 多模态推理]
        LLM --> UI[结构化可解释呈现: 事实 | 证据 | 分歧 | 建议]
    end
```

| 层级 | 性质 | 职责范围 | 典型产出 |
| :--- | :--- | :--- | :--- |
| **Tier A: 计算事实层** | 100% 确定性算法 | 太阳/月亮度数、宫位、干支、宿度、Dasha 时间跨度 | `VedicPlanetPosition`, `ZiweiChart`, `WuyunLiuqi` |
| **Tier B: 规则命中层** | 100% 确定性规则 | 条件判定、格局命中、决策树路由、禁忌防范 | `DiagnosticRuleMatch`, `PatternCondition` |
| **Tier C: 证据图谱层** | 经典知识图谱 | 古籍条文索引、经方组成、倪师考证与标准原话 | `CanonicalEvidenceNode[]` |
| **Tier D: 综合推演层** | 生成式辩证推理 | 多体系分歧呈现、防幻觉防火墙约束、现实决策建议 | 最终结构化 Markdown 审计报告 |

---

## 核心领域推演引擎 (Domain Engines)

### 1. 印度吠陀占星 (Vedic Jyotish Engine)
- **恒星黄道转换**：基于 True Citra (Lahiri Ayanamsa) 岁差校正。
- **三级递归 Vimshottari Dasha 引擎**：
  - 计算全周期 120 年 **9 大运 (Maha Dasha) $\to$ 81 中运 (Antar Dasha) $\to$ 729 小运 (Pratyantar Dasha)**。
  - 根据出生月宿度数精准扣除出生前已消耗年数，确保时间区间严密连续、无缝衔接。
- **分盘与指示星**：
  - D1 (本命身盘)、D9 (Navamsa 灵魂与婚姻)、D10 (Dasamsa 事业社会成就)。
  - 7-Chara Karaka 灵魂指示星体系（AK 灵魂星、AmK 事业星、DK 配偶星等）。
  - 7.5 年 Sade Sati 土星回归周期动态监测。
- **16 项结构完整性校验层 (Validation Layer)**：自动校验行星度数范围、九曜完整性、分盘映射自洽性与运势无重叠性。

### 2. 倪海厦《人纪》经方辨证系统 (Ni Haixia TCM Engine)
- **八大健康金标准自测**：对睡眠、胃口、渴饮、二便、手足身温、出汗与精力建立雷达量化模型。
- **确定性六经辨证决策树 (`rules.ts`)**：
  - 输入多维症状与金标准得分，自动推断归经（太阳、阳明、少阳、太阴、少阴、厥阴）。
  - 自动索引《伤寒论》《金匮要略》经典条文（如第12条、第96条、第326条）。
  - 匹配核心经方（桂枝汤、麻黄汤、小柴胡汤、白虎汤、理中汤、苓桂术甘汤、真武汤、乌梅丸）与药对机制、禁忌与日常药食同源调摄。
- **经典医案佐证 Few-Shot**：根据命中规则精确提取对应的倪师临床经典病案作为证据锚点。

### 3. 紫微斗数格局与四化引擎 (Ziwei Doushu Engine)
- **核心排盘**：集成 `iztro` 与 `lunar-javascript`，提供十二宫、干支、主星、辅星、大限及身宫定位。
- **80+ 经典格局规则引擎 (`patterns.ts`)**：
  - 三方四正、对宫借星、夹宫分析。
  - 包含三奇加会、紫府同宫、极向离明、杀破狼、机月同梁、日月反背、石中隐玉等经典吉格与恶格。
  - 严格输出 `PatternCondition`（必须满足/加分/破格条件）与《骨髓赋》《全集》出处。
- **证据节点结构化输出**：自动打标 `career`, `wealth`, `relationship`, `health` 等维度。

### 4. 跨体系冲突检测与辩证推理 (Cross-Domain Dialectics)
- **`CrossDomainConflictDetector`**：
  - 聚合各领域的 `CanonicalEvidenceNode`，按维度扫描极性分歧。
  - 自动识别 **直接矛盾 (`direct_contradiction`)**、**时机相位差 (`timing_mismatch`)** 与 **表象与根基脱节 (`surface_vs_root`)**。
- **防伪共识与辩证指引**：
  - 严禁强行统一矛盾。
  - 在输出中分别列出各体系证据立场，指导用户采取兼顾“机遇把握”与“底线防守”的平衡策略。

---

## 环境要求与安装 (Installation & Setup)

| 依赖项 | 版本要求 | 说明 |
|:-------|:---------|:-----|
| **Node.js** | 18.0 或更高版本 | Next.js 14 App Router 运行时 |
| **pnpm / npm** | 推荐 pnpm v9+ | 依赖管理 |
| **Gemini API Key** | 必填 | 前往 [Google AI Studio](https://aistudio.google.com/) 免费获取 |
| **Firebase** | 可选 | 仅「灵感共鸣镜」模态需要 Firestore |

### 安装与启动

```bash
# 1. 克隆代码仓库
git clone https://github.com/MeiSiristhebest/mystic.git
cd mystic

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 在 .env.local 中填入你的 GEMINI_API_KEY="AIzaSy..."

# 4. 启动本地开发服务
pnpm run dev
```

打开浏览器访问 `http://localhost:3000` 即可开始推演。

---

## 项目结构 (Project Structure)

```text
mystic/
├── app/                            # Next.js App Router 页面、组件与 Server Actions
│   ├── actions/                    # Server Actions (后端确定性计算与 API 代理)
│   ├── components/                 # 核心交互与展示组件 (VedicApp, RenjiApp, BaziApp 等)
│   └── globals.css                 # 水晶玻璃拟物化设计样式系统
├── lib/                            # 核心推演中枢与领域引擎
│   ├── contracts/                  # 领域通用契约 (Canonical Evidence Node, Validation Report)
│   ├── vedic/                      # 吠陀占星引擎 (Lahiri 转换、递归 Dasha、分盘、校验)
│   ├── nihaixia/                   # 倪海厦经方系统 (六经决策树、金标准评估、医案库)
│   ├── ziwei/                      # 紫微斗数系统 (iztro 排盘适配、80+ 格局识别、四化)
│   ├── reasoning/                  # 跨体系冲突检测器 (CrossDomainConflictDetector)
│   ├── prompts/                    # 结构化上下文编排管道 (PromptPipeline, Plugins, Personas)
│   └── services/                   # 服务层适配器 (AstrologyService, TCMService, EasternService)
├── public/                         # 静态资源与 PWA 资产
└── README.md                       # 项目说明文档
```

---

## 参与贡献与安全说明 (Contributing & Security)

欢迎提交 Issue 与 Pull Request。提交 PR 前请确保：
1. 运行 `pnpm exec tsc --noEmit` 保证全量类型检查通过。
2. 保持确定性计算算法与 LLM 上下文管道严格解耦。

**安全免责**：本项目提供的健康与传统文化推演内容仅作学术探讨与日常身心调摄参考，绝不构成临床医学诊断与专业法律/财务建议。

---

## 许可证 (License)

本项目基于 **MIT License** 协议开源，详见 [LICENSE](LICENSE) 文件。
