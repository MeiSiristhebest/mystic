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
