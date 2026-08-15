# 🔮 Mystic - Multi-Domain AI Wisdom & Interpretable Reasoning Suite

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16_App_Router-black.svg?style=for-the-badge" alt="Next.js 16 App Router" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/AI_Engine-Gemini_Stream_%26_Vision_API-8E44AD.svg?style=for-the-badge" alt="Gemini Stream and Vision API" /></a>
  <a href="https://github.com/MeiSiristhebest/mystic/actions"><img src="https://img.shields.io/badge/CI-Passing-brightgreen.svg?style=for-the-badge" alt="GitHub Actions CI" /></a>
</p>

<p align="center">
  <a href="README.md">🇨🇳 中文</a> &nbsp;|&nbsp; <a href="README_EN.md">🇺🇸 English</a>
</p>

---

<p align="center">
  <strong>基于确定性事实约束与规范证据图谱的多领域可解释 AI 推演引擎</strong><br/>
  <em>四层解耦架构 · Moshier 天文星历与恒星黄道 · 差分辨证决策树 · 证据关系图谱与确定性置信度 · 跨体系时空张力仲裁</em>
</p>

<p align="center">
  <img width="1262" height="694" alt="Mystic 产品界面预览" src="https://github.com/user-attachments/assets/64f63a5e-c24d-414b-ac60-d86552c7c563" />
</p>

---

## 目录 (Table of Contents)

- [项目简介 (About)](#项目简介-about)
- [领域能力实现边界矩阵 (Capabilities & Scope Matrix)](#领域能力实现边界矩阵-capabilities--scope-matrix)
- [核心架构：四层解耦模型 (Architecture)](#核心架构四层解耦模型-architecture)
- [核心领域推演引擎 (Domain Engines)](#核心领域推演引擎-domain-engines)
  - [1. 吠陀占星天文与运势内核 (Vedic Jyotish & Ephemeris Engine)](#1-吠陀占星天文与运势内核-vedic-jyotish--ephemeris-engine)
  - [2. 倪海厦经方差分辨证系统 (Ni Haixia Differential TCM Engine)](#2-倪海厦经方差分辨证系统-ni-haixia-differential-tcm-engine)
  - [3. 紫微斗数排盘与格局引擎 (Ziwei Doushu Astrolabe Engine)](#3-紫微斗数排盘与格局引擎-ziwei-doushu-astrolabe-engine)
  - [4. 证据语义关系图谱与跨体系冲突仲裁 (Evidence Relation Graph & Dialectics)](#4-证据语义关系图谱与跨体系冲突仲裁-evidence-relation-graph--dialectics)
- [自动化验证与 CI 体系 (Verification & Quality Harness)](#自动化验证与-ci-体系-verification--quality-harness)
- [环境要求与安装 (Installation & Setup)](#环境要求与安装-installation--setup)
- [许可证 (License)](#许可证-license)

---

## 项目简介 (About)

**Mystic** 是一套构建在 **Next.js 16 (App Router)**、**React 19**、**TypeScript 6** 与 **`@google/genai` (Gemini API v2)** 之上的**多领域结构化可解释 AI 推演引擎**。

传统的玄学与命理 AI 往往直接将出生日期或主观提问粗暴地作为 Prompt 丢给大语言模型，导致极易产生“巴纳姆效应”套话、事实捏造与虚假的多系统一致性幻觉。

**Mystic 拒绝简单的 Prompt 套壳。** 本项目在前端交互与大模型生成之间，建立了一套严密的**确定性计算与规则推理中枢**：
1. **真实天文与历法事实先行**：集成 UTC Instant 时间标准化、儒略日（JD）、Moshier 天文星历、恒星时（LST）与 Lahiri 恒星黄道岁差校正，确保底层输入客观真实。
2. **确定性规则树与差分判定**：中医正反指征排除法与缺失要素拒诊、紫微 80+ 经典格局规则、吠陀 7-Karaka 梯队，均由程序逻辑确定性产出。
3. **结构化证据图谱 (Canonical Evidence Graph)**：每条推演均携带由确定性数学公式加权聚合的 4 维置信度（`calculation`, `inputCompleteness`, `ruleMatch`, `sourceAuthority`），以及动态推断的语义关系边（`corroborating`, `contradicting`, `surface_vs_root`, `timing_precursor`）。
4. **跨体系张力与时空冲突仲裁**：识别多体系在相同时间窗口内的语义张力，通过 Prompt Firewall 强制指导 LLM 开展多视角辩证综合。

---

## 领域能力实现边界矩阵 (Capabilities & Scope Matrix)

为保持严谨的技术诚信，下表清晰界定 Mystic 当前版本的实现边界：

| 领域模块 | ✅ 完整实现的能力 | ⚠️ 简化/部分实现的能力 | ❌ 超出当前范围 / 未包含能力 |
| :--- | :--- | :--- | :--- |
| **紫微斗数** | 12 宫排盘、108 星曜、三方四正、80+ 经典格局必须/加分/破格判定、iztro 1:1 差分回归测试 | 流曜与小限动态叠盘 | 飞星派十四化飞宫（本项目坚持经典三合派） |
| **吠陀占星** | UTC Instant 国际时区转换、JD 儒略日、Moshier 天文九曜真黄道、Lahiri 岁差、上升点 Lagna、27 月宿与 Pada、120 年全量 3 级递归 Vimshottari (9/81/729)、7-Chara Karakas、D1/D7/D9/D10/D12/D60 分盘映射 | 基础 Ashtakavarga 与星曜强弱定性 | C++ 原生 Swiss Ephemeris (`pysweph`) 绑定、JHora 桌面级 15 张全分盘精细运算 |
| **倪海厦中医** | 正向支持（Positive）、反向排除（Negative）、五大核心四诊缺失拒诊机制（`insufficient_evidence`）、《伤寒论》《金匮要略》100% 真实条文出处、八大金标准量化、先天五运六气大运客气 | 六经层级候选证型评分与排序 | 临床处方开具（系统仅提供文献候选证型与理法文化研究，严禁作为医疗处方） |
| **证据与冲突仲裁** | 规范证据图谱（CEG）、确定性四维置信度聚合公式、时间窗口作用域（`temporalScope`）、跨体系时空冲突检测器、Prompt Firewall 辩证防火墙、证据动态关系推断（`inferEvidenceRelations`） | 跨子图图遍历剪枝算法 | 任意自然语言 Claim 的完全自动化逻辑形式化验证 |

---

## 核心架构：四层解耦模型 (Architecture)

```mermaid
graph TD
    subgraph Layer1 [Tier A: 确定性天文历法与量化事实层]
        Ephem["高精度天文星历: UTC Instant + JDE 儒略日 + Moshier 算法 + 地方恒星时 + Lahiri 岁差"]
        Asc["精准上升点 Lagna 计算: 国际时区与地理经纬度投影 + 黄赤交角反切方程"]
        Iztro["iztro 农历干支 + 十二宫主辅四化星曜排盘"]
        TcmStd["中医八大金标准量化 + 先天五运六气大运客气"]
    end

    subgraph Layer2 [Tier B: 领域规则引擎与差分推理层]
        V_Engine["吠陀内核: 120年递归三级 Vimshottari (9MD/81AD/729PD) + D1~D60 分盘映射"]
        Z_Engine["紫微内核: 80+ 经典格局规则库 (必须/加分/破格) + 借对宫转换"]
        T_Engine["倪师经方内核: 支持/反向排除/缺失差分决策树 + 拒诊机制 (拒绝假兜底)"]
    end

    subgraph Layer3 [Tier C: 规范证据图谱与关系推断]
        CEG["Canonical Evidence Graph: 4 维确定性聚合置信度 + 时域窗口 + 语义关系边"]
        V_Engine --> CEG
        Z_Engine --> CEG
        T_Engine --> CEG
    end

    subgraph Layer4 [Tier D: 跨体系冲突仲裁与 AI 辩证综合]
        Arbitrator["CrossDomainConflictDetector: 时域交集判定 + 表本张力识别 + 关系推断"]
        CEG --> Arbitrator
        Arbitrator --> Firewall["Prompt Pipeline 辩证防火墙 (反伪共识规范)"]
        Firewall --> LLM["Google Gemini 多模态流式综合"]
    end
```

---

## 核心领域推演引擎 (Domain Engines)

### 1. 吠陀占星天文与运势内核 (Vedic Jyotish & Ephemeris Engine)
- **国际多时区与天文星历**：支持全球任意时区 UTC Instant 标准化，基于 Moshier 天文算法精准解算九曜（Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu）真实真黄道度数与逆行态。
- **恒星黄道与上升点**：采用 Chitrapaksha (Lahiri) Ayanamsa（岁差公式）与地方恒星时解算 Lagna。
- **120 年全量三级 Dasha 递归**：精准推演 9 大运 (Maha) $\to$ 81 中运 (Antar) $\to$ 729 小运 (Pratyantar) 连续无缝时间轴。
- **扩展分盘 (Vargas)**：支持 D1 (本命), D7 (子息), D9 (九分婚恋), D10 (十分事业), D12 (父母), D60 (微细因果盘)。
- **7-Chara Karaka**：按度数降序严密编排 Atmakaraka (灵魂星) 至 Darakaraka (伴侣星)。

### 2. 倪海厦经方差分辨证系统 (Ni Haixia Differential TCM Engine)
- **差分辨证协议**：引入正向支持（Positive）、反向排除（Negative Contraindications）与缺失信息追问（Missing Observations）。
- **坚决拒绝伪兜底**：彻底废除“无匹配即默认小柴胡汤”的粗糙逻辑；指征不足时明确返回 `insufficient_evidence` 并输出四诊追问清单。
- **文化文献研究定位**：直连《伤寒论》《金匮要略》100% 真实条文出处，严格声明仅作为古籍理法与文化研讨参考，严禁作医疗诊断凭据。

### 3. 紫微斗数排盘与格局引擎 (Ziwei Doushu Astrolabe Engine)
- **12 宫 108 星曜全盘解构**：基于 iztro 纯 TypeScript 算法，严密计算十二宫、身宫、三方四正、大限流年与四化互冲。
- **80+ 经典格局规则库**：覆盖君臣庆会、杀破狼、机月同梁、三奇加会、日月同宫、日照雷门等经典上中下格与破格条件判定。

### 4. 证据语义关系图谱与跨体系冲突仲裁 (Evidence Relation Graph & Dialectics)
- **确定性置信度数学模型**：
  $$\text{Weighted Mean} = 0.35 \times \text{Calc} + 0.25 \times \text{Input} + 0.25 \times \text{Rule} + 0.15 \times \text{Source}$$
  $$\text{Overall} = \min(\text{Weighted Mean}, \min(\text{Calc}, \text{Input}, \text{Rule}) + 0.15)$$
- **动态语义关系推断**：自动为证据节点建立 `corroborating`（同频印证）、`contradicting`（直接分歧）、`surface_vs_root`（表本张力）、`timing_precursor`（时机先后）等语义关系。
- **反伪共识防火墙**：强制 LLM 呈现各体系不同视角的立论依据，输出富有哲理与辩证深度的决策建议。

---

## 自动化验证与 CI 体系 (Verification & Quality Harness)

项目内置 4 层自动化质量门禁体系（接入 GitHub Actions）：
* **L1 运行健全性测试**：确保所有模块纯函数安全执行、零未捕获异常。
* **L2 结构完整性校验**：12 宫完整性、14 主星落宫无遗漏、9/81/729 Dasha 连续无重叠校验。
* **L3 领域黄金真值断言**：涵盖国际多时区（北京、新德里、伦敦、纽约）星历断言、必命中格局、古籍经方组成及缺失指征拒绝机制。
* **L4 外部引擎差分测试**：将 Mystic 适配器排盘与 `iztro` 原始底层核心进行 1:1 差分比对。

```bash
# 运行 L3 Golden 与 L4 Differential 领域测试
pnpm test

# 运行 4-Tier 全维回归测试
pnpm test:all

# 全量编译与验证
pnpm verify
```

---

## 环境要求与安装 (Installation & Setup)

* **Node.js**：`>= 22.13` (推荐 Node 22 LTS)
* **Package Manager**：`pnpm >= 11.1.2` (自带 Corepack 支持)

```bash
# 1. 克隆代码仓库
git clone https://github.com/MeiSiristhebest/mystic.git
cd mystic

# 2. 启用 Corepack 并安装依赖
corepack enable
pnpm install

# 3. 配置环境变量 (.env.local)
GEMINI_API_KEY=your_gemini_api_key

# 4. 启动本地开发服务
pnpm dev
```

---

## 许可证 (License)

本项目采用 [MIT License](LICENSE) 开源许可证。
