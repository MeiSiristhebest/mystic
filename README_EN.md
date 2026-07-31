# 🔮 Mystic - Gemini Multimodal AI Wisdom & Astrology Suite

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?style=for-the-badge)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_Stream_%26_Vision_API-8E44AD.svg?style=for-the-badge)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Database-Firebase_Firestore-FFCA28.svg?style=for-the-badge)](https://firebase.google.com/)

[🇨🇳 中文](README.md) | [🇺🇸 English](README_EN.md)

---

## 🎬 Screenshots

<p align="center">

  <img width="1262" height="694" alt="image" src="https://github.com/user-attachments/assets/64f63a5e-c24d-414b-ac60-d86552c7c563" />

</p>
---

## 📖 Introduction

**Mystic** is a modern, high-performance multimodal AI-powered Eastern wisdom, astrology, and spiritual exploration platform built with **Next.js 14 App Router**.

Integrating the **Gemini Stream API** and **Gemini Vision API**, Mystic orchestrates eight wisdom domain engines—including Western Astrology, Eastern BaZi (Four Pillars), Vision-based Face Reading, I-Ching Hexagram divination, ZiWei DouShu, AI Tarot readings, Dream Analysis, and a Firebase-backed Collective Mirror—guarded by a zero-hallucination **Prompt Context Pipeline**.

Key highlights include **Prompt Context Pipeline Control**, **Real-Time SSE Streaming Response Rendering**, **Multimodal Image Feature Extraction**, and complete **Progressive Web App (PWA)** mobile install support.

---

## 🛠️ Microservice Core Architecture & Engineering Design

All architectural components below are fully implemented in this repository. Click any source code link to inspect exact implementation details:

### 1. Multimodal AI & Context Control Pipeline 🌌

*   **Architectural Evolution**: Addressing LLM hallucinations in complex reasoning tasks, Mystic features a backend Context Control Pipeline. Each request dynamically concatenates structured System Instructions, domain knowledge rules, and user-supplied spatio-temporal/facial parameters before calling Gemini, ensuring deterministic, structured output.
*   **Multimodal Reasoning Topology Diagram**:

```mermaid
graph TD
    subgraph ClientLayer["Client Interaction Layer - Next.js 14 PWA"]
        UI["App Entry - DiscoveryView"]
        Astrology["AstrologyApp - Western Chart"]
        Bazi["BaziApp - BaZi Four Pillars"]
        Face["FaceReadingApp - Vision Face Reading"]
        IChing["IChingApp - I-Ching Hexagrams"]
        Tarot["TarotApp - AI Tarot Spreads"]
    end

    subgraph ContextPipeline["Context Control Pipeline - Prompt Scaffolding"]
        SysPrompt["System Prompt & Role Directives"]
        KnowledgeBase["Astrological & I-Ching Knowledge Scaffolding"]
        Sanitizer["Output Structuring & Constraint Guard"]
    end

    subgraph GeminiEngine["Google Gemini AI Engine"]
        StreamAPI["Gemini Stream API"]
        VisionAPI["Gemini Multimodal Vision API"]
    end

    subgraph FirebaseSync["Cloud Persistence & Broadcasting"]
        Firestore[("Firebase Firestore - Collective Mirror")]
    end

    ClientLayer --> ContextPipeline
    ContextPipeline --> GeminiEngine
    GeminiEngine -- "SSE Real-time Streaming" --> ClientLayer
    ClientLayer --> FirebaseSync
```

*   **📂 Direct Source Code Links**:
    - [app/components/DiscoveryView.tsx (Multimodal Navigation & Module Router)](app/components/DiscoveryView.tsx)
    - [app/components/AstrologyApp.tsx (Astrology Calculations & Gemini Engine)](app/components/AstrologyApp.tsx)
    - [app/components/BaziApp.tsx (Four Pillars Calculation & Gemini Engine)](app/components/BaziApp.tsx)
    - [app/components/FaceReadingApp.tsx (Gemini Multimodal Vision Face Analysis)](app/components/FaceReadingApp.tsx)
    - [app/components/IChingApp.tsx (I-Ching Coin Tossing & Hexagram Transforms)](app/components/IChingApp.tsx)
    - [app/components/TarotApp.tsx (Tarot Spread & Dynamic Idea Bubbles)](app/components/TarotApp.tsx)

---

### 2. Eight Core Wisdom Modules & Execution Sequences ☯️

The system harmonizes ancient Eastern & Western traditions with modern AI:

1.  **🌌 Western Astrology (AstrologyApp)**: Calculates planetary aspects, house positions, and birth charts using birth date/time and geographic coordinates for synastry and forecast readings.
2.  **🎋 Eastern BaZi (BaziApp)**: Computes Year, Month, Day, and Hour Pillars (GanZhi) with Five Elements strength evaluation.
3.  **👁️ Vision Face Reading (FaceReadingApp)**: Uses Gemini Vision API to analyze face photos, identifying three divisions, five features, and facial marks.
4.  **☯️ I-Ching Divination (IChingApp)**: Simulates 6 coin tosses to compute Main and Transformed Hexagrams with line transform interpretations.
5.  **🎴 AI Tarot (TarotApp)**: Features single-card and 3-card spreads with card flip animations and real-time idea bubbles.
6.  **🌙 Dream Analysis (DreamApp)**: Parses dream narratives to construct psychological metaphor maps based on symbol libraries.
7.  **✨ Zi Wei Dou Shu (ZiWeiApp)**: Plots 12 palaces and star positions for birth charts.
8.  **🪞 Collective Mirror (CollectiveMirrorApp)**: Connects to Firebase Firestore for real-time global user insight sharing and word cloud resonance.

*   **I-Ching Sequence Flow Diagram**:

```mermaid
sequenceDiagram
    actor User as User
    participant App as "IChingApp UI"
    participant Engine as "Coin Toss Simulator"
    participant Gemini as "Gemini Stream API Provider"

    User->>App: Click to toss coins (6 iterations)
    App->>Engine: Calculate Yin/Yang lines & Old Yin/Old Yang transforms
    Engine-->>App: "Generate Main & Transformed Hexagrams"
    App->>Gemini: Inject hexagram names, line transforms & System Prompts
    Gemini-->>App: "Stream SSE incremental interpretation text"
    App-->>User: "Typewriter effect text rendering + AssociationBubble"
```

*   **📂 Direct Source Code Links**:
    - [app/components/CollectiveMirrorApp.tsx (Firebase Collective Mirror Component)](app/components/CollectiveMirrorApp.tsx)
    - [app/components/AssociationBubble.tsx (Real-time SSE Streaming Bubble Component)](app/components/AssociationBubble.tsx)
    - [firestore.rules (Firebase Security Rules Policy)](firestore.rules)

---

## 📂 Project Structure

```text
mystic/
├── app/                            # Next.js 14 App Router Pages & Components
│   ├── actions/                    # Next.js Server Actions (AI API Proxies)
│   ├── api/                        # SSE Streaming Endpoints
│   ├── components/                 # Core Module Components
│   │   ├── AstrologyApp.tsx        # Astrology Module
│   │   ├── BaziApp.tsx             # BaZi Module
│   │   ├── FaceReadingApp.tsx      # Vision Face Reading Module
│   │   ├── IChingApp.tsx           # I-Ching Module
│   │   ├── TarotApp.tsx            # Tarot Module
│   │   ├── CollectiveMirrorApp.tsx # Collective Mirror Module
│   │   ├── AssociationBubble.tsx   # Streaming Idea Bubbles
│   │   └── DiscoveryView.tsx       # Home Navigation Router
│   ├── globals.css                 # Glassmorphism & Gradient Styles
│   ├── layout.tsx                  # PWA Manifest & Root Layout
│   └── page.tsx                    # View Entry Point
├── firebase-applet-config.json     # Firebase Realtime Cloud Config
├── firestore.rules                 # Firestore Security Rules
├── GEMINI.md                       # Architecture & Prompt Specs
└── README.md                       # Main Documentation
```

---

## 📊 Technology Stack Matrix

| Layer | Core Technology | Role |
|:------|:-----------|:--------|
| **Frontend Framework** | Next.js 14 (App Router) + React 18 | Modern React Fullstack Framework |
| **Core AI Engine** | Google Gemini API (Stream & Vision) | SSE Real-time Streaming & Multimodal Vision |
| **Realtime Cloud DB** | Firebase Firestore | Anonymous Collective Insight Sync |
| **Styling & UI** | TailwindCSS + Glassmorphism UI | Futuristic Dark Crystal Visual System |
| **PWA Experience** | Service Worker + PwaInstallPrompt | Add to Home Screen Native Mobile Support |

---

## 🏃 Local Quick Start Guide

### 1. Prerequisites
- **Node.js**: 18.0 or higher
- **Gemini API Key**: Obtain API Key

### 2. Installation
```bash
git clone https://github.com/MeiSiristhebest/mystic.git
cd mystic
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🤝 Contributing

Contributions welcome. Quick flow:

```bash
# 1. Fork → Clone → Branch
git checkout -b feat/your-feature

# 2. Local build passes
npm run build

# 3. Commit and open a PR
git commit -m "feat: your change"
git push origin feat/your-feature
```

**Welcome contribution directions**:
- 🌐 Add new wisdom modules (e.g., Plum Blossom Numerology, synastry comparison, etc.)
- 🧪 Add Server Action and component unit tests
- 🎨 Polish visual details or new theme styles
- 📱 Enhance PWA offline experience

---

## 🔒 Security

| Risk Scenario | Mitigation |
|---------|---------|
| **Gemini API Key Leak** | `.env.local` is in `.gitignore`; Server Action acts as the sole API proxy exit; the key is only used server-side and never exposed to the browser |
| **Firestore Unauthorized R/W** | `firestore.rules` strictly controls read/write permissions; anonymous collective mirror only allows writing anonymous fields, read permissions based on document ID |
| **Prompt Injection Attack** | Context Control Pipeline multi-layer System Prompt constraints; Output Sanitizer guardrail validates structured format |
| **PWA Service Worker Cache Poisoning** | Production build hashes static assets; Service Worker update strategy uses `skipWaiting` + `clientsClaim` for gradual replacement |

**Vulnerability disclosure**: Report security issues directly to **`mystic-security [at] googlegroups [dot] com`** — do not file a public issue. We commit to a **first response within 24 hours**.

---

## 📜 License

Licensed under the [MIT License](LICENSE).
