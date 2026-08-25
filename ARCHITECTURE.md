# 🔮 Mystic Architecture Blueprint

This document explains the 4-tier decoupled AI reasoning engine and Canonical Evidence Graph (CEG) architecture powering **Mystic**.

```mermaid
graph TD
    User[Client / Next.js 16 UI] -->|Query| Router[Domain Dispatcher]

    subgraph "Tier 1: Deterministic Domain Layer"
        Router --> Ephemeris[Moshier Ephemeris Engine]
        Router --> AstroRules[Astronomical / Chronological Algorithms]
    end

    subgraph "Tier 2: Canonical Evidence Graph (CEG)"
        Ephemeris --> EvidenceGen[Deterministic Evidence Synthesizer]
        AstroRules --> EvidenceGen
        EvidenceGen --> Arbiter[Cross-Domain Temporal Conflict Arbiter]
        Arbiter --> ScoredGraph[(Canonical Evidence Graph)]
    end

    subgraph "Tier 3: Reasoning & LLM Grounding"
        ScoredGraph --> ContextPacker[Constraint & Fact Extractor]
        ContextPacker --> LLM[Google Gemini API v2 / Flash 2.0]
    end

    subgraph "Tier 4: Verification & Audit"
        LLM --> FactValidator[Zero-Hallucination Fact Consistency Gate]
        FactValidator --> User
    end
```

---

## 📐 1. 4-Tier Strict Decoupling
To eliminate LLM hallucinations, Mystic strictly separates **computation of facts** from **natural language generation**:
- **Rules & Coordinates**: 100% computed via C/Wasm-compiled deterministic astronomical ephemeris.
- **LLMs**: Used purely for semantic interpretation and stylistic narrative generation based on verifiable evidence nodes.

---

## 📊 2. Canonical Evidence Graph (CEG)
- Represents multi-domain symbolic rules as a directed acyclic evidence graph.
- Every interpretation node carries a deterministic confidence score and provenance trail back to mathematical computations.

---

<sub>© 2026 Mystic. Licensed under the MIT License.</sub>
