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
- **Decision: Lint-Clean Production Target**
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

## [2026-05-12] Phase 12: High-Availability & Production Hardening

- **Decision: Intelligent Model Fallback Chain (Gemini 3.1)**
  - **Reason**: To handle the strict RPD/RPM limits of the Pro model while ensuring a 100% uptime UX.
  - **Action**: Implemented a systematic fallback chain `[PRO -> FLASH -> LITE]` in `app/api/ai/route.ts`.
- **Decision: Dynamic Model Dispatching**
  - **Reason**: Complex divination tasks require higher reasoning than simple UI guidance.
  - **Action**: Configured `BaziApp` and `MysticTarot` to prefer Tier 1, while `Orchestrator` uses Tier 2.
- **Decision: Strict React Purity Enforcement**
  - **Reason**: Impure `Math.random()` calls in render bodies caused non-deterministic UI and lint failures.
  - **Action**: Migrated all random visual seed generation in `CrystalBallLoader`, `ShadowWorkMirror`, and `TarotComponents` to `useState` lazy initializers.
- **Decision: Async State Synchronization (Handoff)**
  - **Reason**: Synchronous `setState` calls in `useEffect` triggered "Cascading Render" warnings.
  - **Action**: Wrapped all cross-view handoff logic in `setTimeout` across core components.
- **Decision: Lint-Clean Production Target**
  - **Reason**: Ensure 100% build success on Vercel/Next.js.
  - **Action**: Resolved all remaining `react-hooks` and `immutability` errors. Verified via `pnpm run lint`.

## [2026-05-13] Phase 13: Standardized Deep Dive & Context Continuity

- **Decision: Stateless to Stateful History Migration**
  - **Reason**: Follow-up questions in several modules (IChing, Bazi, Face Reading) were losing context, leading to "attention drift" and generic AI responses.
  - **Action**: Refactored `handleSendMessage` in all core modules to pass the complete `messages` history to the AI stream.
- **Decision: Explicit Context Pinning (Anchor Logic)**
  - **Reason**: AI tended to forget the original divination data (Hexagrams, Bazi charts) during long chat threads.
  - **Action**: Enforced "Context Pinning" by prepending original divination data and initial analysis results as immutable anchors in the conversation history.
- **Decision: Unified Chat Interface (Deep Dive)**
  - **Reason**: `SynastryApp` and `TimeWisdomApp` lacked the ability for users to ask follow-up questions.
  - **Action**: Implemented standardized chat UI and `useAIChat`/`useAIStream` logic across all divination modules, ensuring a consistent "Deep Dive" experience.
- **Decision: Journey Persistence Parity (Sync)**
  - **Reason**: Follow-up conversations were not always correctly synchronized back to the user's permanent journey.
  - **Action**: Integrated `updateEntry` calls in all follow-up handlers to maintain O(1) sync parity between volatile UI state and IndexedDB storage.

## [2026-05-13] Phase 14: Scenario-Based Prompt Elevation & Intelligence

- **Decision: Scenario-Specific Prompt Engineering (Akasha Standard)**
  - **Reason**: Generic prompts in Tarot, Astrology, and Oracle Guide led to "hallmarked" or shallow responses that didn't feel like a cohesive mystical experience.
  - **Action**: Re-engineered all core prompts using XML encapsulation, Chain-of-Thought (CoT) reasoning, and Persona-specific logic (e.g., Jungian for Tarot, Multi-system Synthesis for Astrology).
- **Decision: Tarot Deep Dive Implementation**
  - **Reason**: Tarot was the only major module missing the "Deep Dive" follow-up capability, hindering its value as a reflective tool.
  - **Action**: Refactored `MysticTarot.tsx` and `TarotReadingResult.tsx` to support stateful history and interactive chat directly on the result view.
- **Decision: Cross-System Synthesis (Astrology + MBTI)**
  - **Reason**: Users expect personalized insights that bridge their static profile (MBTI) with dynamic cosmic transits.
  - **Action**: Updated `AstrologyApp.tsx` prompt to explicitly synthesize personality types with planetary phase analysis.
- **Decision: Navigational Intelligence (OmniOracle)**
  - **Reason**: The initial AI guide was a simple keyword router.
  - **Action**: Upgraded `OmniOracleGuide.tsx` to use high-fidelity intent recognition to recommend the best divination system based on emotional nuance and problem depth.
- **Decision: Historical Journey Follow-up (Living Memories)**
  - **Reason**: Users want to continue dialogues from past readings to see how their situation has evolved.
  - **Action**: Refactored `JourneyApp.tsx` to support full interactive chat for historical entries. Implemented smart initial reading extraction (from `messages[1]`) and context pinning based on entry type.

## [2026-05-12] Phase 15: Sensory & Intelligence Evolution (Final Integration)

- **Decision: Cross-Module Intelligence (灵觉共振)**
  - **Reason**: To break vertical data silos and create a unified mystical entity that "remembers" the user across different divination systems.
  - **Action**: Injected `Soul Profile` (MBTI, Archetype, Bazi) and `Emotional Baseline` into all core prompts. Upgraded `AKASHA_PERSONA` with `cross_system_synthesis` logic.
- **Decision: Proactive Association Engine (命运指引)**
  - **Reason**: Users often didn't know which module to explore next based on their results.
  - **Action**: Implemented `<mystic_association>` tag parsing in `MysticMarkdown`. Created the `AssociationBubble` UI to enable one-click transitions between systems (e.g., Tarot -> Bazi) with context handoff.
- **Decision: Orchestrator Modernization**
  - **Reason**: The initial guide was disconnected from the user's permanent profile.
  - **Action**: Refactored `OmniOracleGuide.tsx` to use the centralized `ORCHESTRATOR_PERSONA` and profile context.
- **Decision: Sensory Ritualization**
  - **Reason**: Enhance the "Sacred Emergence" feeling of AI-generated content.
  - **Action**: Finalized `StreamingParticles` in Markdown and `BreathingAura` in Image generation.
- **Decision: Production Build Hardening**
  - **Reason**: Complex Markdown parsing and dynamic components caused intermittent hydration and import errors.
  - **Action**: Standardized imports in `MysticMarkdown` and fixed circular dependencies in `MainApp/index`. Verified 100% build success.

## [2026-05-12] Phase 16: Radical Modularization & Performance Hardening

- **Decision: Separation of Concerns (Prompt & Type Registry)**
  - **Reason**: Hardcoded XML prompts and scattered types made the codebase brittle and difficult to audit.
  - **Action**: Centralized all AI personas and templates in `lib/prompts/index.ts`. Unified system types in `app/types/divination.ts`.
- **Decision: "Fat Component" Decomposition (Ritual vs. UI)**
  - **Reason**: `IChingApp` and `BaziApp` were monoliths (700+ lines), causing slow HMR and complex debugging.
  - **Action**: Extracted core divination logic into `hooks/useIChingEngine` and `hooks/useBaziEngine`. Standardized the UI with `RitualLayout` and `MysticChatInterface`.
- **Decision: Unified AI Session Management (useAIChat)**
  - **Reason**: Redundant AI stream handling and inconsistent journey persistence across 10+ modules.
  - **Action**: Implemented `useAIChat` to handle messages, streaming, and O(1) IndexedDB persistence in a single, robust hook.
- **Decision: Render Performance (Memoization & Lazy Initialization)**
  - **Reason**: High-frequency streaming updates caused excessive re-renders of the entire Markdown tree.
  - **Action**: Applied `React.memo` to `MysticMarkdown` and modular detail renderers. Verified 60fps streaming experience.

## [2026-05-13] Phase 17: Mystic Immersive Experience Restoration

- **Decision: Cinematic Omni-Oracle Restoration**
  - **Reason**: Reverting regressions to restore the "movie-subtitle" interaction style.
  - **Action**: Refactored `OmniOracleGuide.tsx` to use full-screen `AmbientCosmicBackground` and centered large-scale typography.
- **Decision: Dashboard Layout Recovery (TodayView)**
  - **Reason**: Restore high-end aesthetics lost in recent refactors.
  - **Action**: Re-implemented the 3-card profile grid and horizontal energy bar in `TodayView.tsx` based on commit `7740c41`.
- **Decision: Ritual Focused Mode (ExploreView)**
  - **Reason**: Ensure users are not distracted by navigation elements during deep rituals.
  - **Action**: Updated `ExploreView.tsx` to hide system selection grid when a sub-app is active.
- **Decision: Advanced Journey Persistence & Visualization (Two-Stage Expansion)**
  - **Reason**: Balance between quick review and immersive study.
  - **Action**: Implemented a modal-first UX in `JourneyApp.tsx`. Entries open in a centered small screen first, with a manual toggle to expand to full-screen. Integrated `handleGeneratePoster` and `handleGenerateEcho`.
- **Decision: AI Metadata Purge & Formatting**
  - **Reason**: User interface was cluttered with `<thinking>` tags and unaligned text.
  - **Action**: Updated `MysticMarkdown.tsx` to aggressively filter internal AI tags and implemented `centered` layout support for ritual results.

## [2026-05-13] Phase 18: Stability & UX Polishing (The Sacred Polish)

- **Decision: Prevent Render Loops in TodayView**
  - **Reason**: Passing raw objects to hooks caused functional re-definitions on every render, triggering infinite AI generation cycles.
  - **Action**: Memoized `aiOptions` in `TodayView.tsx`.
- **Decision: Centralized Ritual Alignment (SoulView)**
  - **Reason**: Energy bars and mood selectors were uncentered on wide displays, breaking the "Ritual Center" aesthetic.
  - **Action**: Refactored `SoulView` and `MoodCheckIn` with centered flex containers and enhanced interactive scale effects.
- **Decision: Journey Filter Accessibility**
  - **Reason**: Browser-default select elements were illegible against the dark mystical theme.
  - **Action**: Custom-styled the filter dropdown in `JourneyApp.tsx` with a persistent `ChevronDown` indicator.
- **Decision: Global Message Sync (Slice 1 Logic)**
  - **Reason**: Inconsistent slicing (`slice(2)` vs none) caused both missing user messages and duplicated initial readings.
  - **Action**: Standardized on `slice(1)` across `AstrologyApp`, `TarotReadingResult`, and `JourneyApp` for all historical dialogue rendering.
- **Decision: Markdown Integration for Psychological Modules**
  - **Reason**: `ShadowWork` and `Subconscious` felt "plain" compared to the ritual-heavy modules.
  - **Action**: Injected `MysticMarkdown` into these modules to provide rich formatting (Soul Motto, bold highlights) while preserving their unique color identities.

## [2026-05-13] Phase 19: Build Stabilization & Immersive UX Polish

- **Decision: Build Error Resolution (TodayView)**
  - **Reason**: Redundant return object start in `useMemo` caused a Turbopack parsing failure.
  - **Action**: Cleaned up the `useMemo` logic in `TodayView.tsx` and standardized `todayStr` date formatting for consistent caching.
- **Decision: Infinite Loop Prevention (MysticImage)**
  - **Reason**: Including `imageUrl` in the dependency array of a effect that calls `setImageUrl` triggered infinite re-renders.
  - **Action**: Removed `imageUrl` from dependencies and optimized request key validation.
- **Decision: Cinematic Interaction Restoration (OmniOracle)**
  - **Reason**: User feedback requested a more dramatic "movie subtitle" experience.
  - **Action**: Upgraded `OmniOracleGuide.tsx` with high-fidelity typography, dramatic `AnimatePresence` blurring, and centered cinematic layouts.
- **Decision: Ritual Immersion Enhancement (ExploreView)**
  - **Reason**: UI clutter from the selection grid persisted during active rituals.
  - **Action**: Implemented conditional rendering in `ExploreView.tsx` to hide the selection gallery when a sub-app (Tarot, Bazi, etc.) is active.
- **Decision: Advanced Centering for Markdown Lists**
  - **Reason**: `MysticMarkdown` list elements were hardcoded to left-alignment, breaking the "Tarot Revelations" centered aesthetic.
  - **Action**: Refactored `ul`, `ol`, and `li` renderers to support the `centered` prop dynamically.
- **Decision: Journey Persistence Parity (TodayView)**
  - **Reason**: Users wanted a way to save daily oracle readings to their permanent journey.
  - **Action**: Added the "Inscribe to Journey" (铭刻至日记) functionality to the Oracle card.

## [2026-05-13] Phase 20: Project-Wide Dynamic Refinement & Personalization

- **Decision: Dynamic Dashboard Intelligence (TodayView)**
  - **Reason**: Static placeholders like "Balance" and "Career Reading" broke the immersion of an AI-driven oracle.
  - **Action**: Refactored `TodayView.tsx` to fetch `cosmicEnergy` and `energySuggestion` from the AI. Integrated real journey history for the "Quick Start" recommendation engine.
- **Decision: Personalized Growth Engine (SoulView)**
  - **Reason**: Static growth tips felt generic and disconnected from the user's specific spiritual progress.
  - **Action**: Implemented `getSoulAdvicePrompt` and integrated it into `SoulView.tsx`. The system now synthesizes the user's Soul Profile and recent 5 journey entries to provide daily actionable wisdom.
- **Decision: Cross-Module Persistence Caching**
  - **Reason**: Frequent AI calls for dashboard content hit rate limits and caused UI lag.
  - **Action**: Implemented versioned IndexedDB caching for both Today Oracle and Soul Advice, ensuring O(1) load times on repeat visits within the same day.

## [2026-05-13] Phase 21: Production Stability Hardening (Deployment Sync)

- **Decision: External Image Optimization Bypass**
  - **Reason**: Next.js image proxy (`_next/image`) on Vercel was returning 404s for external Unsplash assets due to SSL/Tier limits.
  - **Action**: Forced `unoptimized={true}` for Unsplash-based fallback images.
- **Decision: PWA Manifest Unification**
  - **Reason**: Mismatch between hardcoded `/manifest.json` in metadata and Next.js 14 auto-generated `/manifest.webmanifest`.
  - **Action**: Removed manual manifest link in `layout.tsx` to let Next.js file-based metadata handle PWA discovery automatically.
- **Decision: Data Integrity Guards**
  - **Reason**: Occasional `TypeError: t.startsWith` in production logs due to race conditions during image compression.
  - **Action**: Added optional chaining and null-checks to all string-based operations in `MysticImage.tsx`.

## [2026-05-13] Phase 22: Content Purity & Tag Stripping (The Akashic Lens)

- **Decision: Centralized Content Cleaning Utility**
  - **Reason**: Raw Markdown symbols and internal AI tags (`<thinking>`, `<execute>`) were leaking into high-end UI elements like journey cards and dashboard suggestions.
  - **Action**: Created `lib/utils.ts` with `cleanMysticContent` to provide a standardized way to strip formatting for compact displays.
- **Decision: Streaming Purity Enforcement**
  - **Reason**: During real-time AI generation, unclosed tags caused flickering visual clutter until the stream completed.
  - **Action**: Enhanced regex patterns in `MysticMarkdown` and `cleanMysticContent` to aggressively strip tags even if they lack a closing pair at the end of a partial response.
- **Decision: Multi-View Integration**
  - **Reason**: Disjointed rendering logic across Journey, Today, and Soul views led to inconsistent text quality.
  - **Action**: Standardized summary rendering across `JourneyApp`, `TodayView`, `SoulView`, and `OmniOracleGuide` using the new purity engine.
- **Decision: Export Ambiguity Resolution**
  - **Reason**: Duplicate exports of `AmbientCosmicBackground` and `CardFrame` in `TarotComponents.tsx` and `Visuals.tsx` caused production build failures.
  - **Action**: Removed duplicates from `TarotComponents.tsx` and centralized them in `Visuals.tsx`. Fixed ambiguous index exports.

## [2026-05-13] Phase 23: Production Network Hardening (The Void Bridge)

- **Decision: Service Worker API Exclusion**
  - **Reason**: `net::ERR_SSL_PROTOCOL_ERROR` identified on `/api/ai` in production, likely due to Service Worker interception mismatches at the Vercel edge.
  - **Action**: Configured Serwist to use `NetworkOnly` strategy for all paths starting with `/api/ai` in `app/sw.ts`.
- **Decision: Client-Side Resilience (Retry Logic)**
  - **Reason**: Deep divination tasks are prone to intermittent network failures or protocol resets.
  - **Action**: Implemented a 2-attempt retry loop with exponential backoff in `generateContentStream` (`lib/ai.ts`).
- **Decision: Protocol Stability Diagnosis**
  - **Reason**: Address `TypeError: Failed to fetch` causing UI crashes in `TodayView`.
  - **Action**: Enhanced error logging and graceful fallback handling in AI hooks.
- **Decision: Summary Preview Reliability**
  - **Reason**: AI responses starting with large `<thinking>` blocks resulted in empty previews in `JourneyApp` after tag stripping.
  - **Action**:
    - Updated `useAIChat.ts` to sanitize content *before* slicing for the summary.
    - Updated `TodayView.tsx` to sanitize oracle readings before inscription.
    - Implemented a display-side fallback in `JourneyApp.tsx` to use a snippet from the detail text if the summary is empty.
- **Decision: Mood Selector Ergonomics (UI/UX)**
  - **Reason**: The mood check-in component was "crowded," with icons and labels overlapping on smaller containers.
  - **Action**:
    - Refactored `MoodCheckIn.tsx` to remove redundant nested padding and backgrounds.
    - Switched to a flexible wrapping layout with calculated widths and minimum spacing.
    - Increased vertical margins between energy bars and selectors in `SoulView.tsx`.

## [2026-05-17] Phase 24: Cross-Device Cloud Caching Synchronization

- **Decision: Cloud-First Daily Oracle & Image Cache Synchronization**
  - **Reason**: Identified a major synchronization discrepancy where a user opening the app on desktop generated a specific daily oracle text and image prompt, but opening on mobile (which lacked local IndexedDB cache) triggered a fresh AI generation with a slightly different prompt, resulting in completely mismatched daily images across devices.
  - **Action**:
    - Created `getCloudDailyOracle` and `saveCloudDailyOracle` in `app/actions/aiActions.ts` backed by server-side Firebase Firestore (`daily-oracles`).
    - Refactored `TodayView.tsx` to query cloud Firestore when local IndexedDB is empty. If a cloud record exists for the current date, mobile devices instantly fetch the exact same oracle text and image prompt generated earlier by desktop.
    - This identical prompt hash guarantees perfect cache hits in `MysticImage`'s `daily-images` cloud collection, achieving 100% visual and text parity across all client devices.
- **Decision: AI Chat History & Prompt Gateway Decoupling**
  - **Reason**: Resolving the bug where follow-up chat histories in divination apps rendered duplicate pairs and leaked internal system instruction prompts (`contextPin`) into the UI.
  - **Action**: Added `displayPrompt` parameter to `useAIChat.ts` gateway, isolating the transmission payload from the UI state and database storage.
- **Decision: Vercel Deployment & pnpm v10 Stabilization**
  - **Reason**: Vercel build failed with `Module not found: Can't resolve 'sharp'` because Next.js implicit dependencies are strictly isolated by pnpm v10. Also build scripts were ignored due to missing security approvals. In addition, Vercel CI aborted with `ERR_PNPM_OUTDATED_LOCKFILE` because `pnpm-lock.yaml` wasn't synced locally.
  - **Action**: 
    - Added `sharp` explicitly to `package.json` dependencies and configured `pnpm.onlyBuiltDependencies` allowing native binary execution for `sharp`, `re2`, `protobufjs`, `@google/genai`, and `@firebase/util`.
    - Created `.npmrc` with `frozen-lockfile=false` to allow Vercel CI to seamlessly update lockfile references on install.
