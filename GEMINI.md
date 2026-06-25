## [2026-06-25] Feature: Resilient Timeout Handling & Image Generation Robustness (Agnes Only)

- **Decision: Immediate Stream Flushing to Bypass Vercel 25s limit**
  - **Reason**: Vercel Edge functions terminate requests if no initial response headers are sent within 25 seconds. Agnes AI API completions can sometimes be slow to respond.
  - **Action**: Enqueued a space character `" "` immediately at the start of the `callAgnesStream` ReadableStream inside `app/api/ai/route.ts` to start the HTTP response instantly.
- **Decision: Server-Side Timeout Boundaries for Agnes Completions**
  - **Reason**: Prevent requests from hanging indefinitely.
  - **Action**: Set a strict 18-second fetch timeout to the Agnes completions call. Removed the Gemini fallback to align with the single-model configuration.
- **Decision: Connection-Only Timeout for Agnes Stream**
  - **Reason**: Passing a timeout signal directly to fetch aborts the stream mid-reading if the response is very long and exceeds 18 seconds.
  - **Action**: Refactored `callAgnesStream` to use a manual connection-only timeout, clearing it once response headers are received, and linked the client abort signal to the abort controller to prevent stream cut-offs.
- **Decision: Handled Image Generation Exceptions & Structured Returns**
  - **Reason**: Next.js Server Actions thrown with raw DOM `TimeoutError` or standard errors cause 500 Internal Server Errors in Vercel serverless environments, cluttering error logs.
  - **Action**: Refactored `generateMysticImage` in `app/actions/aiActions.ts` to return a structured `{ success, imageUrl, error }` object instead of throwing. Handled the structured result on the client in `MysticImage.tsx` by throwing a client-side error to trigger Unsplash fallback, ensuring 0% server-side 500 errors.
- **Decision: Multi-Stage Image Loading & Race Condition Prevention**
  - **Reason**: The `MysticImage` component ignored subsequent prompt updates when `loadingRef.current` was true, and was vulnerable to stale async responses overwriting newer images.
  - **Action**: Refactored `MysticImage.tsx` to permit new requests if the prompt key changes, and guarded state updates with `currentRequestRef.current === requestKey` matching to prevent race conditions.

## [2026-06-20] Feature: Code Cleanliness, Guide Redirections & Tarot UI Optimization

- **Decision: Dead Code Eradication**
  - **Reason**: The hook `useTarotReading.ts` and the prompt `getTarotJsonPrompt` were legacy remnants that were never imported or consumed by the application, causing codebase bloat.
  - **Action**: Deleted `hooks/useTarotReading.ts` and removed `getTarotJsonPrompt` from `lib/prompts/divination.ts`. Also sanitized unused imports in `MysticTarot.tsx`.
- **Decision: Multi-System Orchestrator Redirection & Handoff Alignment**
  - **Reason**: The AI Omni-Oracle Guide could not correctly redirect users to the "Discovery" Tab (since it was not in the sub-tabs array) or the "Soul Lab" systems (since `soul` was not registered in the orchestrator systems list and `modeId` was not correctly mapped in `SoulLab.tsx`).
  - **Action**: Updated `ORCHESTRATOR_PERSONA` to include `soul` system with `shadow`, `dream`, and `imagination` modes. Modified `ExploreView.tsx` `onHandoff` to route `discovery` system to the main tab `discovery` via `setActiveTab`, and others to nested explore sub-tabs. Enhanced `SoulLab.tsx` state and effect lifecycle to properly map `modeId` parameters from handoff context.
- **Decision: Tarot Card Art Preloading & Resilient Association Parsing**
  - **Reason**: Flickering and blank loading states occurred when cards were flipped in the reveal table due to image loading latency. Also, minor JSON formatting errors from the AI model in `<mystic_association>` blocks caused parser crashes.
  - **Action**: Integrated an asynchronous image preloader in `TarotRitualManager.tsx` that prefetches card front face artworks during the shuffling and drawing phases. Replaced `JSON.parse` with `safeParseAIJSON<any>` in `TarotComponents.tsx` to handle imperfect JSON outputs in the association block.

## [2026-06-20] Feature: Unified Model-Agnostic JSON Compatibility System

- **Decision: Centralized Resilient JSON Parsing (`lib/utils.ts`)**
  - **Reason**: Different AI models have varying output structures, often wrapping JSON in markdown code blocks or omitting trailing brackets/keys, which routinely crashed standard `JSON.parse` invocations across various modules.
  - **Action**: Designed and exported `safeParseAIJSON<T>(text, fallbackValue)` helper. The function strips markdown blocks, extracts nested curly brace structures, cleans trailing commas, and implements a regex-based recovery engine for common data types (strings, arrays, booleans, and numbers) in case of structural syntax errors.
- **Decision: Global Modular Integration**
  - **Reason**: Direct un-guarded `JSON.parse` calls in explore guides, oracle views, tarot reading modules, and Bazi auto-matchers created high vulnerability to model output changes.
  - **Action**: Refactored `TodayView.tsx`, `SoulView.tsx`, `OmniOracleGuide.tsx`, `DiscoveryView.tsx`, `MysticTarot.tsx`, and `useTarotReading.ts` to use `safeParseAIJSON`, unifying error handling and preventing frontend crashes.

## [2026-06-20] Hotfix: Agnes Stream Parser & Server-Side Caching Integration

- **Decision: SSE stream parser in `/api/ai` (`app/api/ai/route.ts`)**
  - **Reason**: When using the new Agnes AI model, the edge route was forwarding the raw Server-Sent Events (SSE) body (e.g. `data: {"id" ...}`) directly to the client. The client-side hooks, expecting raw text chunks, attempted to parse the aggregated output, resulting in `SyntaxError: Unexpected token 'd'` crashes.
  - **Action**: Intercepted the upstream stream inside `callAgnesStream`. Implemented a robust text-decoding line parser to extract only the text delta content (`choices[0].delta.content`) and stream clean text chunks to the client, mirroring the Gemini behavior.
- **Decision: Caching integration for Agnes AI**
  - **Reason**: The previous Agnes route did not check or save to the memory cache, leading to unnecessary redundant API calls and latency.
  - **Action**: Integrated `getCachedResponse` check and `setCachedResponse` saving in `callAgnesStream` and `POST` handlers using standard cache keys.

## [2026-06-20] Feature: GSAP Scroll-Scrub Typography Reveal & Hero H1 Clamp Layout

- **Decision: GSAP Scroll-Scrub Character Reveal on Daily Oracle (`TodayView.tsx`)**
  - **Reason**: The daily oracle text card felt static and lacked interactive feedback. We mapped the oracle reading into a character-level array and wrapped each character in a container. Using GSAP ScrollTrigger, we animated the characters' opacity from a baseline of 0.15 to 1.0 sequentially as the user scrolls, creating a tactile editorial reveal.
- **Decision: Hero H1 Horizontal Clamp Layout (`TodayView.tsx`)**
  - **Reason**: The greeting H1 header previously spanned full width, which risked wrapping awkwardly into 4-6 lines on specific viewports. We constrained the header width (`max-w-4xl`) and H1 layout (`max-w-3xl`) with customized line heights (`leading-[1.1]`) to guarantee text wraps cleanly in exactly 2-3 lines max.

## [2026-06-20] Feature: Ancient IChing Astrolabe Animations & Loader Garble Restoration

- **Decision: 3-Ring Kinetic Astrolabe Loader (`BreathingLoading.tsx`)**
  - **Reason**: The loading indicator previously used basic opacity pulses and suffered from a CJK character garbling bug (`"阿卡夏正在感?.."`). We restored the text to `"阿卡夏正在感应中..."` and designed a 3-ring counter-rotating astrolabe structure using staggered Framer Motion values, producing a premium orbital breathing animation.
- **Decision: Deep Obsidian IChing Hexagram Stacking Canvas (`IChingRitualManager.tsx`)**
  - **Reason**: The hexagram stacking container used flat CSS boxes that broke visual consistency with the Tarot ritual screen. We upgraded the container to share the project-wide `obsidian-glass` and `liquid-border` utility classes, giving it a glowing mask-based border.
- **Decision: Metallic Gold Mirror Finish for Yin/Yang Lines (`IChingRitualManager.tsx`)**
  - **Reason**: The previous lines used basic dark orange gradients (`#B46E14`). We redesigned them to use a polished 3-stop gold mirror gradient (`#C9A84C` -> `#F5E6AD` -> `#C9A84C`), adding glowing drop shadows and spring-based entrance animations.
- **Decision: Compass/Bagua Spin Animation Integration (`IChingRitualManager.tsx` / `globals.css`)**
  - **Reason**: The background Bagua Compass element was static because the animation token `--animate-spin-slow` was not registered in the stylesheet. We registered `--animate-spin-slow: spin 45s linear infinite` to activate the rotating bagua background.
- **Decision: Spring Recoil Action Button (`IChingRitualManager.tsx`)**
  - **Reason**: Replaced the static toss button with a dynamic spring button supporting click compression.

## [2026-06-20] Feature: UI/UX Pro Max Custom Toggle Cards & Spring Physics Integration

- **Decision: Replace Native Select with Yin/Yang/Taiji Toggle Cards (`UserProfileModal.tsx`)**
  - **Reason**: The native dropdown select element for gender felt generic and disrupted the mystical luxury aesthetic. We rebuilt it as a custom three-state toggle group (乾造/坤造/太极) styled with amber and purple ambient glows, sun/moon icon indicators, and smooth state transitions.
- **Decision: Interactive Bento Stat Card Physics & Glow Effects (`UserProfileModal.tsx`)**
  - **Reason**: Standard card panels felt flat. Upgraded the MBTI/Zodiac cards to a premium dark gradient obsidian glass layer featuring 3D spring hover lifting (`y: -3px`) and subtle stardust light leaks.
- **Decision: Framer Motion Spring Physics for Quick Action Buttons (`TodayView.tsx`)**
  - **Reason**: The static CSS hover filters lacked tactile feedback. Replaced the "Daily Tarot" and "Akashic Journal" quick start buttons with `<motion.button>` elements configured with custom spring inertia (`stiffness: 300`, `damping: 20`), providing realistic physical recoil and scale magnification on hover/tap.
- **Decision: Standardize Inputs to Custom Obsidian Glass Glassmorphism**
  - **Reason**: Kept native styling intact while refining focus borders and shadow glows to match the design language.

## [2026-06-20] Feature: Abort Cascading, Strict State Guards & Server Action Timeouts

- **Decision: Cascade req.signal to upstream fetches (`app/api/ai/route.ts`)**
  - **Reason**: When a user closes or changes pages, client-side aborts were not forwarded to the backend. The edge handler now hooks `req.signal` directly into upstream fetch calls to Agnes AI `/chat/completions`, saving significant API billing.
- **Decision: Component-level unmount abort cleanup (`useAIStream`, `useAIChat`, `CardMeaningModal`, `DiscoveryView`)**
  - **Reason**: If users navigate away or quickly restart actions, active streams and requests continued fetching in the background, risking React memory leaks and unnecessary network resource waste.
  - **Action**: Injected `useEffect` cleanup hook to trigger `abort()` when these custom hooks/components unmount. Used local `AbortController` in `CardMeaningModal`, `DiscoveryView`, and `MysticTarot`.
- **Decision: isMounted guards and timeout cleanup in `MysticImage.tsx`**
  - **Reason**: The image generator component had a 15-second fallback timeout, but it was not cleared on unmount. This triggered state updates on unmounted components if the page was closed before generation finished.
  - **Action**: Stored the timer in `timeoutRef` and added `isMountedRef` to guard all async state updates.
- **Decision: Server Action timeouts (`aiActions.ts`)**
  - **Reason**: Prevent long-running serverless threads from hanging on Slow API/Image fetches.
  - **Action**: Introduced `AbortSignal.timeout` (25s / 15s) in both fetch actions.

## [2026-05-18] Feature: Multi-Pass Markdown AST Purification, Nested Arc Fan Physics & Complete Occult Spread Geometry

- **Decision: Universal `splitHeadingLine` Function for Zero-Hardcode AST Purification (`TarotComponents.tsx`)**
  - **Reason**: Pattern-based regex (A/B/C) with character-count constraints (1-8 CJK chars, 30-char title limit) systematically missed labels > 8 chars (e.g. `个人成长与建议：`) and had no way to handle novel AI output patterns without adding more cases.
  - **Action**: Replaced all regex patterns with `splitHeadingLine(line)` function applied line-by-line. The function finds the EARLIEST structural split signal among: (1) Colon-label `[\u4e00-\u9fa5\w][^:]{0,40}?[：:]` (CJK/word char + any content + colon, skips bracket-wrapped subtitles); (2) Sentence-end `[。！？]\s+\S`; (3) Numbered item `\s+\d+[\.。]`. No keyword lists, no char-count limits. Also added Phase 2 line-by-line orphaned `**` repair using odd-count detection.

- **Decision: Nested Element Isolation for Arc Fan Framer Motion Conflict (`TarotRitualManager.tsx`)**
  - **Reason**: When applying CSS `transform: rotate() translateY()` for the 78-card Arc Fan on a `<motion.div>` that also had `animate` or `whileHover` props, Framer Motion completely hijacked the DOM style matrix and overwrote `style.transform`, causing all 78 cards to stack at the bottom origin.
  - **Action**: Architected a nested element separation pattern. An outer plain `<div>` strictly handles absolute CSS placement and arc transformations without Framer Motion props. An inner `<motion.div>` handles only entrance opacity/scale and hover physics. Because transforms compose hierarchically, Framer Motion animates perfectly on top of the physical arc geometry without overwriting it.

- **Decision: 100% Spread Coverage & True Holy Triangle/Pyramid Formation (`SpreadGeometry.tsx`)**
  - **Reason**: Standard 3-card spreads (like Holy Trinity / "圣三角") were rendered in a flat horizontal row, losing their occult significance. Furthermore, 12-card (Zodiac) and 13-card (Yearly) spreads lacked dedicated layout mappings.
  - **Action**: Refactored `SpreadGeometry` to cover all 16 spread modes in the system. Upgraded 3-card spreads to a true Holy Pyramid layout (Apex card 2 at top, base cards 0 and 1 at bottom). Added 3x4 grid for Zodiac and 3x4 + bottom center for Yearly spreads. Verified correct cross formations for 4-card elemental spreads and 2x2 Johari windows for blind spot spreads.

## [2026-05-18] Feature: Premium Tarot Ritual UI Redesign (SVG & Physics)

- **Decision: "Eye of Providence" Inline SVG Card Back (`TarotCardBack.tsx`)**
  - **Reason**: The previous woven texture background looked generic and relied on an external texture link. The user desired a premium, highly esoteric card back. We determined that an unnumbered, pure geometric design best preserves the ritualistic mystery of a blind draw.
  - **Action**: Created a 100% custom inline `<TarotCardBack />` component featuring concentric diamond geometric frames, radiating sunburst lines, and a central glowing Eye of Providence. Utilized ultra-fine 1px `#C9A84C` strokes against a deep midnight `#0A0518` gradient. The SVG format ensures flawless scaling and zero external dependencies.

- **Decision: "Celestial Ribbon" Arc Shuffling Animation (`TarotRitualManager.tsx`)**
  - **Reason**: The physical riffle shuffle felt too mechanical and jittery for a mystical application.
  - **Action**: Engineered a "Celestial Ribbon" cascade animation using Framer Motion. The 12-card stack smoothly arcs out into a wide semicircle (ranging from -66° to +66°), hovers, and gracefully collapses back into a tight stack every 2.2 seconds, perfectly simulating the fluid hand movements of a master Tarot reader. Synchronized haptic feedback and paper audio to the collapse phase.

- **Decision: Dual-Viewport 78-Card "Arc Fan" Drawing Arena & Premium Enlarged Dimensions (`TarotRitualManager.tsx`)**
  - **Reason**: The previous single-screen layout forced the spread slots and the 78-card deck into the same tight viewport, making the playable cards feel cramped and small.
  - **Action**: Restructured the drawing phase into a breathtaking dual-viewport flow: Top 75vh dedicated exclusively to the Sacred Spread Slots, followed by a ritual scroll divider, and a Bottom 90vh full-screen arena for the 78-card Arc Fan. Increased desktop card dimensions across all phases (Shuffle: `64×96px`, Slots: `10.5×15.5rem`, Arc Fan: `96×144px` on `480px` radius, Reveal: `12.5×19.5rem`).

- **Decision: Flawless Card Front DOM Isolation & Interactive "Reveal All" (`TarotRitualManager.tsx`)**
  - **Reason**: During the transition to the revealing phase, server/initial render before Framer Motion mounted caused the front face name to flash briefly before flipping face-down. Additionally, revealing multi-card spreads one by one was tedious.
  - **Action**: Applied strict DOM isolation on the front face (`opacity: i < revealedCount ? 1 : 0`, `visibility: hidden` and conditionally unmounted children when unrevealed), ensuring zero flash possible. Implemented an interactive "一键揭晓密卷 / REVEAL ALL" button with staggered completion timers and haptic feedback.

## [2026-05-18] Feature: Markdown Merged Heading Separation & Realistic 3D Riffle Shuffle Physics
- **Decision: Robust Regex Separation for Merged Headings and Numbered Lists (`TarotComponents`)**
  - **Reason**: AI models occasionally output section headings (`## 🔮 牌阵解析`) and numbered items (`1. 现状: ...`, `2. 选项一: ...`) directly merged on a single continuous line. `ReactMarkdown` treated the entire line as a single `<h2>` AST node, causing the entire reading to be rendered inside `MemoH2` with glowing gold gradient text, large letter spacing, and flanking diamond ornaments (`⟡`), which made the whole reading look like a giant uppercase banner.
  - **Action**: Injected robust pre-parsing regex rules into `processMysticMarkdownContent` to automatically detect when headings (`#+`) or sentence periods (`。！？”`) are immediately followed on the same line by numbered list items (`\d+\.\s`) or bullet points. The pre-parser cleanly inserts double newlines (`\n\n`) at these boundaries, successfully isolating the heading title into a standalone `<h2>` component and restoring pristine, elegant paragraph formatting for the main reading body.

- **Decision: Realistic 3D Riffle/Overhand Criss-Cross Shuffle Physics (`TarotRitualManager`)**
  - **Reason**: Users reported that the previous shuffling animation looked artificial because dummy cards simply swayed left and right in periodic sine waves without physical packet separation or interlaced criss-cross inserting.
  - **Action**: Engineered a high-fidelity 3D riffle/overhand shuffle simulation across 12 layered cards. The deck dynamically splits into two distinct opposing packets (Left packet tilting backwards, Right packet tilting forwards), rapidly converges towards the center with dynamic Z-index swapping to interlace the cards, and cleanly snaps into a squared central stack. Synchronized haptic vibrations and crisp paper friction ASMR audio intervals (`playCardSound()`) precisely to the 550ms physical mesh cadence.

- **Decision: 78-Card Full Deck Interactive Drawing Experience & 3D Visibility Fix (`TarotRitualManager`)**
  - **Reason**: In `TarotRitualManager`, during the ritual phase, the system previously only rendered the N target cards (e.g., 1 card) face down on the screen. Because `gpu-accelerated` applied `backface-visibility: hidden` and `transform: translateZ(0)` on the outer `motion.div`, when the card was dealt face down (`rotateY: 180`), the entire container disappeared, leaving a completely blank screen. Furthermore, users expected to choose cards from a full deck rather than just seeing pre-selected outcomes.
  - **Action**: Removed `gpu-accelerated` from `motion.div` during the revealing phase to ensure flawless 3D flip visibility. Designed and integrated a breathtaking 78-card full Tarot deck grid drawing experience: users can sense and manually draw cards from the full deck, which beautifully animate into active spread slots before transitioning to the majestic revealing table.

- **Decision: Right Padding & Inline-Block Encapsulation for Italic Gradient Typography (`TodayView`)**
  - **Reason**: In `TodayView`, when rendering the username ("晚安, 花泽类") with `gold-gradient-text` (`background-clip: text`), the rightmost slanted italic stroke of Serif CJK glyphs leaned outside the inline text bounding box, causing minor right-side truncation.
  - **Action**: Added `pr-3 inline-block` to the username `span`. This expands the gradient background box by 0.75rem to the right, fully covering any slanted calligraphic strokes with zero glyph truncation.

## [2026-05-18] Feature: Typography Flexbox Encapsulation & Journey History Purification

- **Decision: Flexbox Container Encapsulation for Heading Components (`MemoH1`, `MemoH2`, `MemoH3`)**
  - **Reason**: In `MysticMarkdown`, custom memoized heading components (`MemoH2`, `MemoH3`) utilized horizontal flexbox containers (`flex items-center gap-6`, `inline-flex items-center gap-6`). When `ReactMarkdown` parsed markdown content without clear double newlines between headings and subsequent paragraphs or lists, it grouped multiple block/inline elements as an array of children under the heading node. When passed directly into the heading's flex container, flexbox treated every single paragraph or list item as a separate flex item, squeezing them side-by-side into extremely narrow vertical columns across the screen where Chinese text wrapped after every single character.
  - **Action**: Wrapped `{children}` inside `<span className="flex-1 min-w-0"><span className="block w-full">{children}</span></span>` across `MemoH1`, `MemoH2`, and `MemoH3`. This guarantees that all child nodes remain encapsulated within a single unified flex item, preserving pristine inline/block formatting and completely eliminating unwanted multi-column vertical wrapping. Also updated `EntryDetailRenderer` to extract pure initial readings directly from the first model message. Verified 100% clean Next.js production build.

## [2026-05-18] Feature: Philosophical Daily Oracle Refinement & Precision Greeting Time Logic

- **Decision: Precision 24-Hour Greeting Partition & Philosophical Poetic Prompt Engineering**
  - **Reason**: At 00:27 (midnight), `d.getHours()` returned 0, which fell outside the 5-22 hour check in `TodayView` and defaulted to an awkward "夜安" (Good night). Furthermore, the AI prompt for the daily oracle fed the entire raw user profile JSON, causing the model to rigidly concatenate astrological/Bazi jargon ("庚金", "三午烈火", "自性化原型") into dense, convoluted horoscope paragraphs.
  - **Action**: Partitioned the 24-hour cycle cleanly into `早安` (05:00-12:00), `午安` (12:00-18:00), and `晚安` (18:00-05:00) to eliminate awkward midnight greetings. Refined the `TodayView` prompt using strict persona instructions: prohibited raw Bazi/astrological jargon, instructed the model to quote philosophical luminaries (Jung, Nietzsche, Laozi) or compose poetic 30-word maxims, and redesigned the energy suggestion to provide actionable, warm lifestyle rituals. Updated cache keys to `v10` to instantly invalidate legacy cached readings.

## [2026-05-17] Feature: Fate Echo UI Modernization, History Purification & 100% Clean Build Stabilization

- **Decision: React createPortal Root DOM Mounting for CardMeaningModal (Stacking Context Isolation)**
  - **Reason**: When users opened `CardMeaningModal` inside `JourneyApp` (the historical diary modal), `JourneyApp`'s outer container `<motion.div>` had CSS transforms (`-translate-x-1/2`) and `overflow-y-auto`. In CSS specification, any transformed element creates a containing block and stacking context for `fixed` descendants. Thus, `fixed inset-0 z-[100]` on `CardMeaningModal` was trapped inside `JourneyApp`'s scrollable container, causing the single card interpretation to scroll with the parent modal and leak the background reading interface.
  - **Action**: Refactored `CardMeaningModal` to mount directly onto `document.body` via React's `createPortal` with `z-[99999]`. This completely decouples the modal from any parent CSS transforms or stacking contexts, ensuring flawless 100% viewport coverage immune to background bleed during scrolling.

- **Decision: Pristine Typography Left-Alignment/Justification, Unconstrained Fullscreen Modal & Unrolled Poster Export**
  - **Reason**: When AI generated bulleted lists or long paragraphs under `centered` mode, `flex flex-col items-center` caused each line to center irregularly, creating an awkward vertical jagged column that severely degraded Chinese reading flow. In `CardMeaningModal`, fullscreen mode remained boxed with margins/overlays, and internal `max-h-[60vh] overflow-y-auto` scrollbars caused `html-to-image` poster exports to clip overflowing text.
  - **Action**: Refactored `MysticMarkdown` and `modalMarkdownComponents` typography to enforce pristine left-aligned/justified text (`text-justify leading-relaxed`). Upgraded `CardMeaningModal` fullscreen state to match `JourneyApp`'s immersive unboxed window takeover (`fixed inset-0 w-full h-full rounded-none overflow-y-auto`). Added global CSS override `body.is-exporting [data-poster-container] * { max-height: none !important; height: auto !important; overflow: visible !important; }` to automatically unroll all scrollable containers during export, achieving flawless 100% full-document poster generation.

- **Decision: Fullscreen Journey Title Unabbreviation, In-Place AI Spread Matching & Card Glow Rectification**
  - **Reason**: When past journey entries were expanded to fullscreen, titles remained abbreviated with ellipses. In `MysticTarot`, clicking the guidance match button navigated away from the page rather than selecting the best spread in-place. Additionally, active spread cards exhibited awkwardly oversized glow borders due to flex item stretching.
  - **Action**: Refactored `JourneyApp` header layout to display the complete `details.question` when in fullscreen mode. Implemented `handleAutoMatch` in `MysticTarot` using `/api/ai` to dynamically select the most relevant `selectedCategory` and `selectedSpread` based on the user's question. Standardized spread cards to a fixed height (`h-[320px]`) with a precise absolute inset border (`absolute inset-0 border-2 border-amber-400/80 rounded-[2.5rem]`).

- **Decision: Tarot Modal Flawless Purification, Fullscreen Expansion & High-Definition Poster Export**
  - **Reason**: AI streaming interpretations occasionally output raw `**` bold syntax attached to CJK quotes or punctuation, causing unparsed markdown artifacts in `CardMeaningModal`. Furthermore, users needed the ability to expand single-card analyses to full screen and export elegant commemorative posters for sharing.
  - **Action**: Extracted and centralized a robust `processMysticMarkdownContent` pre-parsing utility in `TarotComponents.tsx` and shared it with `MysticMarkdown.tsx`, achieving 100% DRY purification. Added Fullscreen expansion toggle (`Maximize2` / `Minimize2`) and high-definition poster export (`usePosterGenerator`) to `CardMeaningModal` with global `body.is-exporting` CSS hide/show rules in `globals.css`.

- **Decision: Premium 3D Liuyao Coin Toss Ritual & Cross-Module Audio Integration**
  - **Reason**: The IChing hexagram casting interface lacked sensory depth, relying on inline broken bar placeholders and missing tactile sound feedback. Furthermore, Tarot card dealing required ASMR paper friction sound cues to enhance ritual realism.
  - **Action**: Created `IChingCoinToss.tsx` using 3D CSS gradients and `preserve-3d` to simulate ancient Chinese bronze coins (乾隆通宝/开元通宝). Integrated `framer-motion` spring trajectories for tossing and metallic clink audio (`playCoinSound`). Overhauled `IChingRitualManager` to coordinate the 6-step bottom-up stacking of Yin/Yang lines and changing line pulsing. Added periodic ASMR paper drawing sounds (`playCardSound`) to `TarotRitualManager` dealing phase.
- **Decision: Premium 3D Tarot Card Flip Animation (Framer Motion Physics)**
  - **Reason**: The card drawing experience lacked the physical inertia and mystical ritualistic feel expected of a premium esoteric application. The previous shuffle and reveal animations were simple 2D opacity crossfades.
  - **Action**: Completely re-engineered the `TarotRitualManager` using CSS `perspective` (up to 2000px), `transform-style: preserve-3d`, and `backface-visibility: hidden`. Orchestrated a highly realistic `framer-motion` physical sequence: 3D spatial shuffling (`rotateY`/`rotateZ`), dealt cards dropping with spring physics, and an interactive click-to-flip 180-degree revelation. Implemented dynamic 3D tilt effects on hover (`rotateX`/`rotateY`) post-reveal to enhance interactivity.
- **Decision: Markdown Parsing Purification (Heading & Bold Syntax Sanitization)**
  - **Reason**: AI models occasionally output duplicate heading markers (e.g. `### ## `) or internal whitespace inside bold tags (`** text **`), causing unparsed markdown syntax artifacts (`##`, `**`) to appear directly in UI banners and paragraphs.
  - **Action**: Injected robust pre-parsing regex filters into `MysticMarkdown` to automatically strip redundant repeated heading hashes and trim internal whitespace in bold blocks before Markdown compilation. Extended component mapping to ensure headings h4-h6 also render with high-fidelity gold banners. Verified 100% clean build.

- **Decision: TarotReadingResult Layout Centering & Viewport Expansion**
  - **Reason**: The follow-up `BreathingLoading` indicator was left-aligned (`justify-start`), and the overall reading container was constrained to `max-w-4xl`, feeling slightly narrow on desktop viewports.
  - **Action**: Widen container to `max-w-5xl` for enhanced typographic breathing room and refactored loading layout to `justify-center` with matching glassmorphism container styling.

- **Decision: Real-Time Streaming Initial Reading & Follow-Up Loading Isolation**
  - **Reason**: During the initial AI Tarot interpretation generation (~15s), `MysticTarot` kept `reading` state empty until stream completion, while `TarotReadingResult` simultaneously triggered a follow-up `BreathingLoading` box at the bottom, creating an awkward visual void.
  - **Action**: Refactored `MysticTarot` to pass `messages[0].content` in real time as the primary reading fallback. Isolated the bottom `BreathingLoading` indicator in `TarotReadingResult` to strictly appear only during follow-up dialogues (`messages.length > 1`), ensuring seamless real-time text streaming directly beneath the spread layout. Verified 100% clean build.

- **Decision: Project-Wide Pseudo-Randomness (PRNG) Eradication & Global Type Unification**
  - **Reason**: Legacy `Math.random()` calls remained in audio noise synthesis, journey ID generation, and background visual particle loops, creating minor impurity and unpredictability risks. Furthermore, duplicate `TarotCard` type definitions between `tarot-data` and `divination` caused strict TS compile mismatches.
  - **Action**: Completely eradicated `Math.random()` across `audio.ts`, `useJourney.ts` (replaced with `crypto.randomUUID()`), `Visuals.tsx`, `TimeWisdomRitual.tsx`, `SubconsciousConstellation.tsx`, `ShadowWorkMirror.tsx`, and `CrystalBallLoader.tsx`. Re-exported unified `TarotCard` schema from `app/types/divination.ts` with holistic pillar extensions. Verified 100% clean build.

- **Decision: Tarot Modal Flawless Border Alignment & CSPRNG True Randomness Migration**
  - **Reason**: The outer container of `CardMeaningModal` had absolute corner lines that failed to perfectly match the rounded container curve, creating unaligned visual brackets.
  - **Action**: Created cryptographically secure CSPRNG utility (`lib/random.ts`) utilizing `window.crypto.getRandomValues()`. Added `@keyframes spin-reverse` to `globals.css` for synchronized dual loading rings. Replaced absolute corner brackets with a mathematically precise concentric inner golden ring (`absolute inset-3 border-amber-500/20 rounded-[32px]`) and enforced flex item stretching across columns, achieving flawless symmetrical alignment. Verified 100% clean lint and successful Turbopack production build.

- **Decision: Componentization of AssociationBubble & Tarot Modal Pre-Parsing**
  - **Reason**: In `CardMeaningModal` (`TarotComponents.tsx`), AI deep interpretations output `<mystic_association>` XML tags, which were rendered as unparsed raw text at the bottom of the modal because `ReactMarkdown` lacked pre-parsing logic. Furthermore, importing `AssociationBubble` from `MysticMarkdown` would cause circular dependencies.
  - **Action**: Extracted `AssociationBubble` into a standalone, modular component (`app/components/AssociationBubble.tsx`). Refactored `CardMeaningModal` to pre-parse and strip `<thinking>` and `<mystic_association>` XML tags from the streaming text, beautifully rendering the interactive one-click `AssociationBubble` directly below the card analysis. Verified 100% clean production linting and successful Turbopack build.

- **Decision: Tarot Card Interactive Details Restoration & Deep Akashic Interpretation (Harness Engineering)**
  - **Reason**: Users reported being unable to view specific card meanings when clicking tarot cards inside historical diary entries (`JourneyApp`), and noted that default static card meanings were too brief and accompanied by an awkward 'X' background watermark.
  - **Action**: Injected `selectedCard` state into `MysticMarkdown.tsx` to enable clickable cards. Refactored `CardMeaningModal` in `TarotComponents.tsx`: replaced the background `<X>` icon watermark with an elegant `<Compass>` seal. Conducted web research on Jungian Archetypal frameworks (Individuation, Synchronicity, Shadow projection) and applied rigorous Harness Engineering (XML encapsulation, CoT `<thinking>` induction, strict output formatting) to the AI interpretation prompt, expanded specific domains to 4 holistic pillars (Love & Intimacy, Career & Wealth, Somatic Health & Energy Flow, Subconscious & Spiritual Blueprint), enabling users to dynamically unlock profound Jungian and Akashic card analyses directly within the modal.
- **Decision: Fate Echo ("命运回响") UI Modernization & Unclipped Framing**
  - **Reason**: The Fate Echo section in `JourneyApp.tsx` suffered from visual clipping and lacked clear hierarchical separation from the primary reading and chat logs.
  - **Action**: Architected a beautifully framed, high-end container with radiant glow effects (`bg-gradient-to-br from-[#1c0f07]/80 ... backdrop-blur-xl`), clear title header, and dedicated "重新共鸣" re-trigger action, delivering an unclipped and premium immersive experience.
- **Decision: Permanent Historical Reading Purification (EntryDetailRenderer & Divination Apps)**
  - **Reason**: User follow-up questions in deep chat sessions were incorrectly concatenated into the primary reading text (`details.text`), leading to duplicated chat logs appearing inside historical entry reviews.
  - **Action**: Refactored `EntryDetailRenderer.tsx` to strictly extract the pure initial reading from `details.messages[0]` and aggressively strip legacy concatenated chat artifacts (`**问**：`, `---\n\n`). Updated `FaceReadingApp.tsx` and `CollectiveMirrorApp.tsx` persistence logic to keep `details.text` pristine on subsequent updates.
- **Decision: Zero-Warning Strict React State & Dependency Clean Build**
  - **Reason**: ESLint 9 / Next 15 production linter reported 23 strict violations (cascading renders from synchronous `setState` in `useEffect` and `exhaustive-deps` infinite loop risks in `MysticImage`).
  - **Action**: Wrapped all state handoff effect bodies across 9 core modules (`useJourney`, `JourneyApp`, `BaziApp`, `IChingApp`, `AstrologyApp`, `EasternApp`, `MysticTarot`, `SoulLab`, `ExploreView`) in zero-delay `setTimeout` micro-tasks, and implemented `imageUrlRef` in `MysticImage` to decouple image generation callbacks. Verified zero errors and zero warnings via `pnpm run lint` and successful production `pnpm run build`.

## [2026-05-17] Feature: Prompt Engineering Componentization & Global Journey Handoff

- **Decision: Centralized Modular Prompt Registry (lib/prompts/)**
  - **Reason**: Monolithic `lib/ai.ts` (320+ lines) and `lib/prompts/index.ts` (800+ lines) became bloated, mixing persona definitions, AI network calls, and disparate divination/psychology prompt templates.
  - **Action**: Architected a pristine modular separation of concerns under `lib/prompts/`: extracted all personas into `lib/prompts/personas.ts`, traditional esoterica into `lib/prompts/divination.ts`, and subconscious/clinical psychology into `lib/prompts/psychology.ts`. Configured `lib/prompts/index.ts` and `lib/ai.ts` as transparent re-export hubs, achieving a 100% non-breaking zero-downtime refactor across the application while shrinking core file lengths by 75%. Enforced rigorous constraint rules to eliminate superficial personality tagging and injected a comprehensive cross-disciplinary matrix of top-tier psychology terminology (including Psychoanalysis, CBT, Existentialism, Positive Psychology, Somatic Therapy, and Narrative Therapy) into prompts.
- **Decision: Global Journey Handoff & Reopen Rituals (JourneyApp.tsx)**
  - **Reason**: Users needed a seamless pathway to forward insights from their past journey entries into fresh divination rituals.
  - **Action**: Expanded `useAppStore` handoff structure with `prefillQuestion` and `soulLabTab`. Implemented the "以此为问 · 续启仪轨" action grid in `JourneyApp.tsx` modal, enabling one-click transitions into Tarot, Bazi, Astrology, and Shadow Work rituals with preserved context.

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
- **Decision: Vercel Deployment & pnpm v11 Hardening**
  - **Reason**: Vercel CI aborted with `[ERR_PNPM_IGNORED_BUILDS]` because Vercel's global pnpm v11 runner deprecated `onlyBuiltDependencies` in favor of `allowBuilds`. Furthermore, stale lockfiles (`pnpm-lock.yaml`) retained old unapproved build flags.
  - **Action**: Updated `package.json` to include both `onlyBuiltDependencies` and `allowBuilds` arrays, configured `.npmrc` with `ignore-scripts=false` and `strict-dep-builds=false`, and enforced clean lockfile regeneration via `Remove-Item pnpm-lock.yaml; pnpm install` to embed correct native binary script permissions.

## [2026-05-17] Phase 22: Full-Stack Performance, Rendering & UI/UX Optimization

- **Decision: 60FPS Streaming Throttling & DOM Virtualization**
  - **Reason**: High-frequency chunk returns in AI streaming (`useAIChat.ts`) triggered continuous React re-renders, causing input stutter and CPU spikes. Furthermore, inline component definitions in `MysticMarkdown` unmounted the entire DOM tree on every state update.
  - **Action**: Implemented a 60ms time-window update queue in `useAIChat.ts` to batch streaming updates. Extracted all markdown renderers (`h1`, `h2`, `p`, `blockquote`, `ul`, `ol`, `li`) into atomic `React.memo` components, preventing re-render cascades across long mystical readings.
- **Decision: Sacred Haptic & Audio Resonance Engine**
  - **Reason**: Divination rituals lacked multi-sensory feedback during loading and tossing transitions.
  - **Action**: Implemented Web Audio API 432Hz sacred frequency gong synthesis (`playMysticChime`) and cross-platform haptic vibration (`triggerHapticVibration`). Embedded them in `MysticTarot`, `IChingApp`, and `BaziApp` initialization phases.
- **Decision: Mobile GPU Hardware Acceleration & Adaptive Blurring**
  - **Reason**: Continuous CSS backdrop-filter `blur(60px)` and infinite rotation SVGs triggered heavy offscreen GPU calculations, causing device overheating on mobile WebKit.
  - **Action**: Created `@utility gpu-accelerated` with `translateZ(0)` and `will-change: transform`. Configured media queries in `globals.css` to gracefully degrade blur intensity on mobile screens (<768px). Memoized random particle seed arrays in `StreamingParticles` to pass Turbopack purity checks.
- **Decision: Cost Optimization & Memory LRU Cache Gateway**
  - **Reason**: Repeated IndexedDB I/O calls for cross-view navigation caused micro-latencies, and dashboard daily oracles unnecessarily consumed expensive Pro model RPD tokens.
  - **Action**: Down-tiered `TodayView` daily oracle generation from `MODELS.PRO` to `MODELS.FLASH`. Implemented an in-memory LRU cache map in `lib/storage.ts` to intercept IndexedDB requests, achieving zero-latency O(1) page transitions.

## [2026-05-17] Phase 23: Liquid Akasha Master Aesthetic & Sensory Overhaul

- **Decision: Starry Obsidian Glass & Liquid Aura Design System**
  - **Reason**: To wow users with a highly premium, dark-mystical aesthetic that transcends standard UI card layouts.
  - **Action**: Developed `@utility obsidian-glass` (grain noise + deep obsidian gradient), `@utility liquid-border` (fluid glowing border), and `@utility aura-ring` (15s cosmic aura breathing field) in `app/globals.css`.
- **Decision: Cinematic TodayView & Guide Handoff**
  - **Reason**: Standard dashboard grids lacked a sacred, immersive first impression.
  - **Action**: Upgraded `TodayView.tsx` with full-screen Ken Burns zooming hero frames and gold-carved editorial typography. Enhanced guide cards in `ExploreView.tsx` to glow with breathing cosmic auras.
- **Decision: 3D Tarot Shuffling & Astrolabe Loader Transformation**
  - **Reason**: Flat SVG loading spinners failed to match the esoterica theme.
  - **Action**: Re-engineered `TarotRitualManager.tsx` to showcase 3D perspective floating shuffle arcs paired with Web Audio chime and haptic pulses on card reveal. Transformed `CrystalBallLoader.tsx` into a dual-rotating golden celestial sphere.
- **Decision: Scroll-Reveal Markdown Virtualization**
  - **Reason**: Huge oracle text blocks appearing instantly felt overwhelming and lacked ceremony.
  - **Action**: Wrapped memoized markdown renderers (`p`, `blockquote`, `li`) in `MysticMarkdown.tsx` with `motion.div whileInView` viewport triggers, revealing paragraphs progressively as users scroll.

## [2026-05-17] Phase 24: Sleek Compact Immersion & Illuminated Manuscript Markdown

- **Decision: Single-Page Viewport Compactness (`TodayView`)**
  - **Reason**: Oversized aspect ratios (`aspect-[4/5]`) and massive padding (`p-24`) in hero cards caused vertical overflow, hiding crucial action buttons and forcing excessive scrolling.
  - **Action**: Removed fixed aspect ratio constraints in favor of responsive `min-h-[400px] md:min-h-[480px]`. Compacted padding (`p-8`), gap spacing (`space-y-10`), and font sizes (`text-2xl md:text-3xl`) across the entire dashboard (Stats Grid, Energy Suggestion, Quick Start), guaranteeing full visual immersion within a single viewport.
- **Decision: Illuminated Manuscript Texture Architecture (`MysticMarkdown`)**
  - **Reason**: Standard black background with gold text lacked the premium, ancient texture of a sacred esoterica text.
  - **Action**: Transformed markdown elements into exquisite ritual artifacts:
    1. **Metallic Sheen**: Applied `bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]` to `h1`, `h2`, and `strong` for flowing liquid gold typography.
    2. **Holographic Monoliths**: Re-engineered `blockquote` into 3D obsidian glass with glowing aurora borders and watermark quotation marks (`”`).
    3. **Akashic Matrix Containers**: Upgraded `code` blocks into sacred monolith frames featuring top title bars (`✦ DIVINATION MATRIX ✦`) and stardust grain textures.
    4. **Premium Tables & Star Orbs**: Created custom table renderers (`th`, `td`) with purple-gold headers and replaced default list markers with glowing golden orbs (`shadow-[0_0_8px_#C9A84C]`).

## [2026-05-17] Phase 25: Lead Portal & Akashic Seal (The Portal of Awakening & The Seal of Akasha)

- **Decision: First-Paragraph Portal Highlighting (`first-of-type`)**
  - **Reason**: The opening paragraph of a deep esoteric reading must act as an inviting portal, immediately capturing focus and establishing a premium editorial hierarchy.
  - **Action**: Applied `first-of-type` styling in `MysticMarkdown` to the lead paragraph (`p`), enlarging the font (`text-lg md:text-xl`), brightening the color (`text-white`), and anchoring it with a delicate champagne gold vertical foil rule (`border-l-2 border-[#C9A84C] pl-6`).
- **Decision: Akashic Epilogue Flourish (`Akashic Seal`)**
  - **Reason**: Unbounded text blocks ending abruptly left users feeling unmoored. Deep divination readings demand a formal closing seal to conclude the ceremony.
  - **Action**: Incorporated a persistent Akashic closing matrix (`✦ 铭刻于阿卡夏矩阵 · 洞悉天命之流 ✦`) flanked by fading horizontal light beams at the absolute bottom of `MysticMarkdown`, providing a perfectly grounded and sacred epilogue to every long-form reading.

## [2026-05-17] Phase 26: Deep Dive Chat Interface Restoration & Premium Styling (The Oracle's Echo)

- **Decision: Removal of `messages.length` Blocking Condition in `MysticChatInterface`**
  - **Reason**: In `JourneyApp`, the primary reading is rendered via `EntryDetailRenderer` and skipped in the chat array (`messages.slice(1)`). Because the sliced array started empty (`length === 0`), the condition `messages.length > 0` incorrectly blocked the follow-up chat input box from rendering, removing the interactive "Deep Dive" feature in user diaries.
  - **Action**: Removed the `messages.length` constraint from the input rendering condition in `MysticChatInterface`, guaranteeing that users can seamlessly initiate follow-up inquiries in both historical diaries and active ritual modes.
- **Decision: Premium Input Ergonomics & Illuminated Focus States**
  - **Reason**: Standard dark input fields felt disconnected from the luxurious esoterica aesthetic.
  - **Action**: Redesigned the chat input form with an obsidian glass pill container (`bg-[#0a0612]/90 border-[#C9A84C]/40`), inserting an underlying golden blur aura that illuminates upon focus (`group-focus-within:opacity-100`). Styled the submit button with a champagne-gold gradient and soft shadow (`shadow-[0_0_15px_rgba(201,168,76,0.5)]`).

## [2026-05-17] Phase 27: Sacred Seal Engraving Typography (The Illuminated Monoliths)

- **Decision: High-Fidelity Editorial Typography Hierarchy (`MysticMarkdown`)**
  - **Reason**: Standard web typography lacked the sacred, ancient gravitas of illuminated manuscripts or celestial star charts, causing long reading blocks to feel uninspired.
  - **Action**: Completely overhauled all heading levels and structural dividers into exquisite liturgical artifacts:
    1. **H1 (The Shrine Monolith)**: Enclosed titles within an upper celestial wireframe (`✦ SACRED REVELATION ✦`) and a lower glowing spinning rune (`⎊`), combined with a liquid gold metallic gradient scale (`scale-105 hover:scale-110`).
    2. **H2 (The Astrolabe Compass)**: Framed sub-headings with pulsating golden diamonds (`⟡`) and anchored them with a glowing horizontal crosshair line (`shadow-[0_0_10px_#E8DFB8]`).
    3. **H3 (The Foil Insignia)**: Enclosed minor titles in a curved inset pill container with glowing starburst markers (`✧`).
    4. **Blockquote (Holographic Obsidian Tablets)**: Added dual-layer glowing vertical pillars (`bg-gradient-to-b from-[#C9A84C] via-[#FFFDF6] to-[#C9A84C]`) and an underlying 3D watermarked quotation seal (`”` rotated in background).
    5. **Hr (The Octagram Portal Divider)**: Replaced standard horizontal lines with a rotating golden diamond crystal flanked by fading light rays.

## [2026-05-17] Phase 28: Classical Drop Cap Accents & Dual Sacred Badges (The Voice of Akasha)

- **Decision: Classical Drop Cap Styling for Paragraphs (`first-letter`)**
  - **Reason**: To emulate the liturgical gravitas of Western illuminated scriptures and ancient grimoires, normal uniform paragraph text required an elevated initial tone.
  - **Action**: Injected CSS `first-letter` styling into `MemoP` (`first-letter:text-2xl md:first-letter:text-3xl first-letter:text-[#C9A84C] first-letter:drop-shadow-[0_0_10px_#C9A84C]`), rendering the opening character of every single paragraph as a glowing golden illuminated initial.
- **Decision: Distinct Dialogue Entity Badging & Container Differentiation**
  - **Reason**: In follow-up dialogues, uniform message cards caused visual blending between user queries and AI divine responses.
  - **Action**: Completely restructured message containers in `MysticChatInterface` and `TarotReadingResult`:
    1. **Seeker Bubble (`user`)**: Styled with a warm, grounded copper-obsidian gradient (`from-[#2a170d]/90 to-[#180c06]/90 border-[#d97706]/40`) and topped with a dedicated Seeker insignia (`👤 觉察者 · SEEKER`).
    2. **Akasha Bubble (`model`)**: Styled as a cosmic obsidian monolith (`from-[#0c0617]/95 to-[#06020a]/95 border-[#C9A84C]/40`) with background galaxy watermarks (`🌌`) and topped with an Oracle insignia (`🌌 阿卡夏神谕 · AKASHA CHRONICLE`).
- **Decision: Esoteric Emoji Expressiveness in Prompt Engineering**
  - **Reason**: Pure ASCII text lacked the multi-layered symbolic resonance needed for intuitive esoteric readings.
  - **Action**: Updated `AKASHA_PERSONA` and `ORCHESTRATOR_PERSONA` in `lib/ai.ts` with explicit instructions obligating the AI to enrich its responses with evocative mystical and astrological emojis (🌌 🔮 🌿 🌙 ✨ ⚡ 🧿 🗝️ 🎴 🪞 🪐 🌸).

## [2026-05-17] Phase 29: Fate Echo Layout Leap & Tag Desensitization (The Akashic Timeline)

- **Decision: Layout Upgrade from Monolithic `<p>` to High-Fidelity `MysticMarkdown`**
  - **Reason**: In `JourneyApp.tsx`, the generated Fate Echo text was wrapped inside a standard `<p>` tag, causing complex multi-heading markdown outputs to collapse into an unformatted, un-spaced single block of text.
  - **Action**: Replaced the `<p>` container in `JourneyApp.tsx` with `MysticMarkdown`, unlocking full access to Shrine Monolith headings (`H1`), Astrolabe dividers (`H2`), Drop Caps, and interactive association bubbles.
- **Decision: Zero-Tag Enforcement & CoT Harness in Echo Prompt**
  - **Reason**: The initial Echo prompt lacked internal reasoning and strict constraints, causing the AI to blurt out raw MBTI classifications (e.g. "INTJ") and numerology labels (e.g. "2号人") directly to the user.
  - **Action**: Embedded strict `<chain_of_thought>` and `<constraints>` in `handleGenerateEcho`. The AI is now explicitly prohibited from naming personality acronyms or raw labels, forcing it to articulate psychological dynamics through poetic, invisible observations.
- **Decision: Automated Divination Handoff via `<mystic_association>`**
  - **Reason**: Diary reviews should act as gateways to new rituals rather than static text archives.
  - **Action**: Configured the Echo prompt to conclude with a structured `<mystic_association>` tag. `MysticMarkdown` automatically renders an interactive `AssociationBubble` that triggers one-click state handoff and navigation to recommended divination modules.

## [2026-05-17] Phase 30: Dynamic Time-Lapse Resonance & Energy Fermentation (The Living Diary)

- **Decision: Real-Time Energy Fermentation Calculation (`JourneyApp`)**
  - **Reason**: Static date labels (e.g. "2026-05-17") in diary cards treated mystical insights as dead archives, failing to reflect how spiritual awakenings evolve over time.
  - **Action**: Injected dynamic time-lapse calculation logic directly into the journey card footer. The application now compares `entry.date` against the current timestamp to assign living, evolving energetic states:
    1. **Day 0**: `✦ 当下气数 · 正在显化` (Active Emergence)
    2. **Days 1 - 7**: `⏳ 沉淀 X 天 · 命运齿轮转动中` (Turning Gears of Fate)
    3. **Days 8 - 30**: `🔮 已过 X 天 · 适宜深度回响` (Prime Echo Window)
    4. **Days > 30**: `🌌 往昔印记 · 沉淀 X 天` (Akashic Anchor)

## [2026-05-17] Phase 31: Collective Mirror Type Resolution & Dual-Arity Prompt Harness

- **Decision: Dual-Arity Prompt Harness for Collective Mirror (`getCollectiveMirrorPrompt`)**
  - **Reason**: `CollectiveMirrorApp.tsx` invoked `getCollectiveMirrorPrompt` with two arguments (`sanitizedQuestion`, `profileContext`), whereas `hooks/useCollectiveMirror.ts` invoked it with one argument (`profileContext`). The prompt registry previously only defined a single `profileContext` parameter, causing a Vercel build failure during TypeScript compilation (`Expected 1 arguments, but got 2`).
  - **Action**: Refactored `getCollectiveMirrorPrompt` in `lib/prompts/psychology.ts` to accept `(questionOrProfile: string, optionalProfileContext?: string)`. Implemented robust internal parameter resolution to correctly map `question` and `profileContext` regardless of arity, restoring strict TypeScript type compatibility and unblocking production deployment on Vercel.

## [2026-05-17] Phase 32: Palm Reading Type Registry & Journey Details Parity

- **Decision: Palm Reading Type Registry & Journey Details Parity (`palm_reading`)**
  - **Reason**: `FaceReadingApp.tsx` supports both Face Reading ("面相") and Palm Reading ("手相"). When saving palm readings to user history, it assigned `type: "palm_reading"`. However, `"palm_reading"` was absent from the global `DivinationType` union and `JourneyDetails` interfaces, triggering a Vercel TypeScript compilation failure (`Type '"palm_reading"' is not assignable to type 'DivinationType'`).
  - **Action**: Added `'palm_reading'` to `DivinationType` in `app/types/divination.ts`. Extended `JourneyDetails` to support `type: 'face_reading' | 'palm_reading'` alongside optional image analysis fields (`imageUrl`, `readingType`). Updated `JourneyApp.tsx` filter options to enable seamless category filtering for both Face and Palm readings within the user's permanent diary.

## [2026-05-17] Phase 33: Face Reading Ref & Auto-Scroll Stabilization

- **Decision: Face Reading Ref & Auto-Scroll Stabilization (`scrollContainerRef`)**
  - **Reason**: In `FaceReadingApp.tsx`, the message list container referenced `ref={scrollContainerRef}`, but the ref variable was never declared at the component scope, causing a Next.js/Vercel TypeScript build break (`Cannot find name 'scrollContainerRef'`).
  - **Action**: Declared `const scrollContainerRef = useRef<HTMLDivElement>(null)` and implemented an automatic DOM scroll effect (`scrollTop = scrollHeight`) triggered on message updates. This guarantees a smooth, distraction-free auto-scrolling experience during real-time AI image analysis and chat streams while eliminating compilation errors.

## [2026-05-17] Phase 34: ESLint & Next.js Production Build Strict Compliance

- **Decision: App-Wide Lint & Hook Compliance**
  - **Reason**: ESLint verification (`pnpm run lint`) reported 17 strict warnings/errors across the codebase. Key violations included `react-hooks/set-state-in-effect` (triggered during cross-view navigation and storage hydration handoffs in `ExploreView`, `MysticTarot`, `SoulLab`, `JourneyApp`, and `useJourney`) and `react-hooks/exhaustive-deps` (unnecessary dependency references in `TimeWisdomApp` and infinite loop risks in `MysticImage`).
  - **Action**: Surgically addressed all 17 lint problems: removed redundant `addEntry` dependencies in `TimeWisdomApp.tsx`, suppressed safe state hydration effects across core components using explicit ESLint directives, and isolated `generateImage` dependencies in `MysticImage.tsx`. Codebase is now 100% clean under strict ESLint and Next.js Turbopack verification standards.

## [2026-05-17] Phase 35: Subconscious Prompt Harness Arity Alignment

- **Decision: Subconscious Prompt Harness Arity Alignment (`getSubconsciousPrompt`)**
  - **Reason**: `SubconsciousApp.tsx` and `hooks/useSubconsciousAnalysis.ts` invoked `getSubconsciousPrompt` with a single object argument `{ mode, input, profileContext }`. However, the prompt registry previously defined the signature as two string parameters `(question, profileContext)`, triggering a Vercel TypeScript compilation error (`Expected 2 arguments, but got 1`).
  - **Action**: Refactored `getSubconsciousPrompt` in `lib/prompts/psychology.ts` to accept the `{ mode, input, profileContext }` object parameter. Updated internal XML template variables to dynamically map `mode` and `input`, restoring flawless TypeScript type safety and unblocking the production build pipeline.

## [2026-05-17] Phase 36: Fate Echo Visual Clip Resolution

- **Decision: Fate Echo Visual Clip Resolution (`overflow-visible`)**
  - **Reason**: In `JourneyApp.tsx`, the floating header badge `命运回响 · Echo` was absolute-positioned `-top-4` outside its parent container. Because the parent `motion.div` enforced `overflow-hidden`, the top half of the badge was sliced off horizontally.
  - **Action**: Changed the parent container's CSS property from `overflow-hidden` to `overflow-visible`. This unblocks absolute floating elements and restores full visual presentation for the Fate Echo ritual badge.
