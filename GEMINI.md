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

