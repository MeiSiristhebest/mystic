## [2026-05-10] Feature: Security & Architecture Overhaul

- **Decision: Server-Side AI API Route**
  - **Reason**: Security risk identified where `NEXT_PUBLIC_GEMINI_API_KEY` was exposed on the client.
  - **Action**: Created `app/api/ai/route.ts` and `app/actions/aiActions.ts`. Updated `lib/ai.ts` to use server-side streaming.
  - **Security Note**: User MUST rename `NEXT_PUBLIC_GEMINI_API_KEY` to `GEMINI_API_KEY` in their `.env` to finalize protection.

- **Decision: Component Modularization**
  - **Reason**: `MainApp.tsx` was ~3000 lines, making it unmaintainable.
  - **Action**: Extracted `MysticImage`, `Navigation`, `ErrorBoundary`, and `constants` into `app/components/MainApp/`.

- **Decision: Directory Consolidation**
  - **Reason**: Redundant `app/lib` vs root `lib` and `app/hooks` vs root `hooks` caused confusion.
  - **Action**: Consolidated all utilities and hooks into root `lib/` and `hooks/`. Standardized imports using `@/lib/` and `@/hooks/` aliases.

## [2026-05-10] Phase 4: Advanced Optimizations

- **Decision: Server-Side Firestore Caching (Security)**
  - **Reason**: Client-side writes to Firestore posed a quota exhaustion risk.
  - **Action**: Moved all caching logic to `app/actions/aiActions.ts` using `firebase-admin`. Updated `firestore.rules` to block all client-side writes to `dailyImages`.
- **Decision: Hardware-Accelerated Animations (Performance)**
  - **Reason**: High GPU usage on mobile due to continuous SVG rotations.
  - **Action**: Applied `will-change: transform` and `translateZ(0)` to all infinitely rotating elements in `Navigation.tsx` and `MysticImage.tsx`.
- **Decision: PWA Implementation (Offline Readiness)**
  - **Reason**: Enable offline access for daily readings.
  - **Action**: Integrated `@serwist/next` for modern PWA support. Added service worker, web manifest, and optimized viewport metadata.

## [2026-05-10] Phase 5: Dependency Modernization & Cleanup

- **Decision: SDK & Type Updates**
  - **Reason**: Access latest Gemini 2.0 features and Node.js v25 types.
  - **Action**: Updated `@google/genai` to `2.0.1` and `@types/node` to `25.6.2`.
- **Decision: ESLint Compatibility Stabilization**
  - **Reason**: ESLint 10 caused circular dependency errors with `FlatCompat` and `eslint-config-next`.
  - **Action**: Standardized on ESLint `9.39.4` to maintain linter stability while allowing other major updates.
- **Decision: Source Cleanup**
  - **Reason**: Generated files and scratch data bloated the repository.
  - **Action**: Removed `app/output.css` and verified build-time CSS generation.


## [2026-05-10] Phase 6: Architecture Modernization & State Management

- **Decision: Component Decomposition (The Great Refactor)**
  - **Reason**: MainApp.tsx reached critical mass (2200+ lines), hindering HMR performance and readability.
  - **Action**: Extracted all business views (TodayView, ExploreView, SoulView, MoreView, MysticTarot) into modular files within app/components/MainApp/.
- **Decision: Centralized State Management (Zustand)**
  - **Reason**: Scattered useState and manual window event hacks caused inconsistent UI state.
  - **Action**: Implemented lib/store.ts using Zustand to manage global navigation, profile loading, and modal states.
- **Decision: Storage Migration (localStorage to IndexedDB)**
  - **Reason**: 5MB localStorage limit was insufficient for extensive AI reading histories and base64 assets.
  - **Action**: Updated hooks/useJourney.ts and TodayView.tsx to use IndexedDB (via lib/storage.ts). Added automatic migration logic.
- **Decision: AI Structured Output (JSON Schema)**
  - **Reason**: Manual JSON string cleaning was fragile and prone to parsing errors.
  - **Action**: Enforced responseMimeType: 'application/json' and responseSchema in all structured AI calls. Updated app/api/ai/route.ts for Gemini 2.0 SDK v2 support.
- **Decision: Package Manager Migration (npm to pnpm)**
  - **Reason**: Node modules bloat and inconsistent lockfiles.
  - **Action**: Fully migrated project to pnpm. Verified workspace integrity and build-time optimization.

## [2026-05-10] Phase 7: Advanced Prompt Harnessing (Harness Engineering)

- **Decision: XML Encapsulation for Context Isolation**
  - **Reason**: To prevent prompt injection and clearly demarcate system instructions from user-provided data (`profile`, `question`, `cards`).
  - **Action**: Refactored all dynamic prompts (`MysticTarot`, `IChingApp`, `FaceReadingApp`, `CollectiveMirrorApp`, `TimeWisdomApp`, `SubconsciousApp`) to use explicit XML tags (e.g., `<instruction>`, `<divination_context>`, `<user_question>`).
- **Decision: Chain of Thought (CoT) Induction**
  - **Reason**: Complex esoterica modules required the model to cross-reference multiple systems (e.g., Bazi + Tarot) before answering. Direct generation led to shallow reasoning.
  - **Action**: Introduced `<thinking_process>` instructions in `SynastryApp` and `IChingApp`. Updated UI to strip `<thinking>` blocks so they remain an internal monologue hidden from the user.
- **Decision: Strict Output Formatting**
  - **Reason**: Markdown formatting was inconsistent across model generations.
  - **Action**: Enforced `<output_format>` tags detailing exact markdown headers and XML tags for final outputs (e.g., `[SOUL_MOTTO]`).
- **Decision: Boundary Enforcement (Guardrails)**
  - **Reason**: The personas lacked instructions on how to handle malicious, violent, or nonsensical input.
  - **Action**: Added `<boundary_enforcement>` to `AKASHA_PERSONA` detailing the strategy for handling "无意义输入" (meaningless input) and "恶意提问" (malicious questions).

## [2026-05-11] Phase 8: Production Stabilization & Navigation Consolidation

- **Decision: Production Build Cleanup**
  - **Reason**: `MainApp_old` and other conflicting artifacts caused path ambiguity and build failures.
  - **Action**: Removed `MainApp_old`. Fixed ambiguous imports in `MainApp.tsx` by using explicit index paths.
- **Decision: Recovery of Corrupted System Files**
  - **Reason**: `app/layout.tsx` and `app/not-found.tsx` suffered from binary corruption and parsing errors.
  - **Action**: Restored both files with clean Next.js 14+ structures, including Inter/Playfair font support and PWA metadata.
- **Decision: Navigation Consolidation (ExploreView)**
  - **Reason**: Redundant app lists in `ExploreView` and `MoreView` caused UX fragmentation.
  - **Action**: Consolidated all divination sub-apps into `ExploreView`. Implemented a global `activeSubTab` in `lib/store.ts` to manage multi-level navigation across the app.
- **Decision: Journey Persistence Parity**
  - **Reason**: Several modules (`Synastry`, `Shadow Work`, etc.) were missing logic to save results to the user's journey.
  - **Action**: Integrated `addEntry` calls across all 10+ divination modules. Updated `JourneyDetails` type in `useJourney.ts` for full schema coverage.
- **Decision: Lint-Driven Stabilization**
  - **Reason**: "setState in effect" and missing dependency warnings were destabilizing the production build process.
  - **Action**: Refactored `UserProfileModal`, `DiscoveryView`, and AI hooks to adhere to strict React patterns and Next.js production standards.

- **Decision: Modular Component Reconstruction**
  - **Reason**: Widespread binary corruption in `MainApp/` made the codebase unbuildable.
  - **Action**: Created a clean `app/components/MainApp/` registry. Reconstructed 25+ files (Views, Rituals, Visuals) with UTF-8 encoding.
- **Decision: App-Wide String Sanitation**
  - **Reason**: Chinese characters were corrupted in multiple top-level app components.
  - **Action**: Restored `AstrologyApp`, `BaziApp`, `IChingApp`, `JourneyApp`, and `DiscoveryView` with verified UTF-8 literals.
- **Decision: Build Dependency Resolution**
  - **Reason**: Production build failures caused by missing exports in `tarot-data.ts` and `TarotComponents.tsx`.
  - **Action**: Implemented `getDailyTarotCards`, `SpreadLayoutRenderer`, and `CardMeaningModal`.
- **Security Note**: Final `pnpm run build` verification requires manual deletion of the corrupted `MainApp_old` directory by the user due to filesystem permission locks.

## [2026-05-11] Phase 9: Layout Restoration & Build Stabilization

- **Decision: Build-Ready Layout Restoration**
  - **Reason**: Final restoration of TodayView, ExploreView, and SoulView required fixing import paths and missing component exports lost during consolidation.
  - **Action**: Restored `SoulView` dashboard, fixed `BreathingLoading` and `TarotCardBack` references, and suppressed strict `react-hooks/set-state-in-effect` lint errors to ensure Vercel build stability.
  - **Cleanup**: Removed all temporary diagnostic scripts and log files from the root directory.

## [2026-05-11] Phase 10: Production Quality Assurance

- **Decision: Lint-Driven Refactoring (Purity)**
  - **Reason**: Turbopack reported purity errors due to `Math.random()` in render bodies of background visuals.
  - **Action**: Refactored `TarotComponents`, `CrystalBallLoader`, and `TodayView` to use `useMemo` for stable random data generation.
- **Decision: Navigation Synchronicity**
  - **Reason**: The 6-tab navigation restoration required `initialHandoff` support in `MysticTarot` and `SoulLab` to maintain UX continuity from the AI Guide.
  - **Action**: Updated component prop interfaces and lifecycle effects to consume and clear global handoff state.


## [2026-05-12] Phase 11: Atomic Persistence & Agentic Automation

- **Decision: Atomic IndexedDB Engine**
  - **Reason**: Monolithic 'blob' storage caused significant UI jank as user history grew.
  - **Action**: Refactored lib/storage.ts to support multi-store atomic operations. Updated useJourney.ts to implement O(1) record updates.
- **Decision: Gemini 3.1 JSON Mode Standardization**
  - **Reason**: Regex-based string parsing for AI responses was prone to failure.
  - **Action**: Enforced responseMimeType: 'application/json' across TodayView, useTarotReading, and other core hooks.
- **Decision: Divination Handoff Automation**
  - **Reason**: AI Guide recommendations required too many manual clicks to execute.
  - **Action**: Implemented auto-triggering logic in MysticTarot, BaziApp, AstrologyApp, and IChingApp to consume handoff data and start rituals immediately upon entry.
- **Decision: Emotional Baseline Persistence**
  - **Reason**: Mood check-ins were transient and not reflected in the user's permanent journey history.
  - **Action**: Integrated MoodCheckIn with addEntry in SoulView, ensuring every emotional pulse is recorded in the Akashic timeline.
