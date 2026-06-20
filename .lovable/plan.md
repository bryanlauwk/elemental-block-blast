## Goal

Push Elemental Block Blast to a maximalist **Neon Arcade** experience: deep violet stage, neon mint + hot magenta accents, glassy chrome HUD, and arcade-grade "juice" on every action. Touches three areas you picked: **In-game visuals**, **HUD & scoreboard**, **Landing/menu screen**.

---

## 1. Neon Arcade design tokens

Introduce new HSL tokens in `src/index.css` so components stay theme-driven (no hardcoded colors):

- `--neon-bg-deep: 245 70% 6%`, `--neon-bg-mid: 258 60% 12%`, `--neon-bg-glow: 285 65% 18%`
- `--neon-mint: 165 80% 55%` (primary accent), `--neon-magenta: 325 95% 62%` (secondary), `--neon-cyan: 190 95% 60%`, `--neon-violet: 268 85% 65%`
- Gradients: `--gradient-neon` (mint→cyan→magenta), `--gradient-stage` (deep violet radial)
- Shadows: `--shadow-neon-mint`, `--shadow-neon-magenta`, `--shadow-hud-glass`

Mirror these into `tailwind.config.ts` as `neon-*` colors + `bg-gradient-neon`. Extend `src/game/theme.ts` with a `NEON` palette so `BlockBlastGrid`, `PieceTray`, `ElementBlock`, modals can opt in via tokens.

---

## 2. Background stage upgrade (`src/pages/Index.tsx`)

Replace the current blue radial + plain grid with a layered arcade stage:

- Deep violet radial gradient using new tokens.
- **Animated scanlines** (CSS-only `@keyframes scanline-drift`) sliding very slowly across.
- **Perspective neon floor**: keep the perspective grid but switch lines to magenta→mint gradient with stronger horizon glow bar.
- **Magic UI–style Particles / floating embers** (lightweight canvas, ~25 particles, paused on mobile + when `prefers-reduced-motion`) drifting upward — only when no modal is open.
- Soft vignette so the grid + HUD pop.

---

## 3. In-game visual juice

### Grid (`BlockBlastGrid.tsx`, `ElementBlock.tsx`)
- Cells get a subtle inner neon grid line + corner highlights.
- Hover/preview cells: neon mint outline pulse using existing CSS keyframes (already perf-tuned).
- Placed blocks: glossy gradient face + thin chromatic-aberration outline glow tinted to the element color; tiny **place stamp** (scale 1.15→1, 120ms spring) using framer-motion `initial/animate` only (no infinite loops).
- **Screen shake** on clears scales with combo: extend existing `shakeIntensity` to drive a CSS transform on a wrapper around grid + HUD (not the whole page) so backgrounds stay steady.
- **Slow-mo flash**: on combo ≥3, a 200ms full-grid white-flash overlay + chromatic split, then radial shock-ring expanding from the clear's centroid (single CSS-animated div, removed on end).

### Reactions (`ReactionParticles.tsx`)
- Add a **shockwave ring** (one absolutely-positioned div animating scale 0→2 + opacity 1→0, 350ms) per reaction source — cheap, single element per reaction.
- Particle palette retuned to neon mint / magenta / cyan per reaction type.
- Confetti burst on `clearedLines ≥ 2` (10 particles max, one-shot, CSS keyframes, respects reduced motion).

### Combo & score popups (`ComboDisplay.tsx`, `ScorePopup.tsx`)
- Combo: chrome-gradient text with magenta glow + 1 "thock" scale bounce per combo level; current infinite CSS pulse stays for the visible window only.
- Score popup: rises with motion blur (CSS `filter: blur` keyframe), color-shifts mint→magenta by point value tier.

---

## 4. HUD & Scoreboard upgrade

### Top bar (`Index.tsx`)
- Re-skin icon buttons with **glassmorphic chips** (`backdrop-blur`, neon mint border, mint glow on hover) using token-driven styles. No layout changes (mobile MobileMenu kept).
- `BRYANLAUWK.FUN` logo gets a subtle gradient sweep on hover (CSS only).

### Scoreboard (`BlockBlastScoreboard.tsx`)
- Convert into a **neon HUD bar**: three glass panels (Score / Best / Combo-or-Streak) with thin neon mint top-border and bottom shadow.
- Score uses a **rolling odometer** (framer-motion `animate` on each digit, swaps in <200ms when score changes) — instead of plain text mounts.
- "Best" panel glows magenta when current score surpasses it (one-shot pulse).
- Compact responsive layout: stacks to a single neon bar on mobile.

### Next-piece preview
- Add a faint mint glow around the next-piece slot when a tray piece is selected, signaling "ready".

---

## 5. Landing / menu screen (`GameTitle.tsx`, `HeroBlockDisplay.tsx`, Index pre-start state)

- Title `ELEMENTAL BLOCK BLAST` re-mastered: Bangers italic kept, but recolored with a chrome-mint-to-magenta gradient + thicker neon outer glow and a one-time **shimmer sweep** on mount (mask-image gradient animating left→right, 1.4s ease-out).
- Crown on the "A" stays gold but gets a magenta rim light.
- Hero block icons get a slow floating bob (CSS keyframe, 4s alternate) and a soft mint floor reflection.
- **PLAY button**: keep green, add a perpetual but cheap shimmer (single linear-gradient overlay animating `background-position`) + magenta secondary shadow; on hover scale 1.04 and floor shadow grows; on press, the floor "shockwave" ring fires.
- Below the PLAY button add three tiny **stat chips** (Best · Streak · Total points) so the landing already feels like a game HUD.
- A subtle **arcade marquee** ribbon across the top horizon line ("INSERT COIN — DAILY CHALLENGE LIVE") that auto-scrolls right→left (CSS marquee), pauses on hover.

---

## 6. Motion & performance guardrails

- All new looping animations are **CSS keyframes with `will-change`**; no new `repeat: Infinity` framer loops.
- Every effect checks `@media (prefers-reduced-motion: reduce)` and degrades to a static state.
- Particles / scanlines / marquee disabled on mobile if `useIsMobile()` returns true (keeps the recent perf gains).
- New shockwave / flash overlays are mounted only for their animation duration and cleaned up.
- No changes to game logic, hooks, or backend.

---

## Files to touch

| File | Change |
|------|--------|
| `src/index.css` | New neon tokens, keyframes (scanline-drift, shockwave, marquee, shimmer, odometer-tick), reduced-motion guards |
| `tailwind.config.ts` | Register `neon-*` colors + gradient utilities |
| `src/game/theme.ts` | Add `NEON` palette + glass HUD style presets |
| `src/pages/Index.tsx` | New layered stage background, glass icon buttons, mount marquee + particles, shake wrapper |
| `src/components/game/GameTitle.tsx` | Chrome-neon gradient + shimmer sweep |
| `src/components/game/HeroBlockDisplay.tsx` | Bob animation + mint floor reflection |
| `src/components/game/BlockBlastScoreboard.tsx` | Neon HUD panels + odometer score |
| `src/components/game/BlockBlastGrid.tsx` | Cell highlights, flash overlay, shockwave ring on clears |
| `src/components/game/ElementBlock.tsx` | Glossy face + element-tinted outline glow + place stamp |
| `src/components/game/ReactionParticles.tsx` | Neon palette + per-source shockwave ring + reduced confetti burst |
| `src/components/game/ComboDisplay.tsx` | Chrome gradient + level-tier scale bounce |
| `src/components/game/ScorePopup.tsx` | Motion-blur rise + tier color shift |
| New: `src/components/game/NeonParticles.tsx` | Tiny canvas/CSS particle layer for the stage |
| New: `src/components/game/MarqueeRibbon.tsx` | Auto-scrolling arcade marquee |

No backend, no routing, no schema changes.

---

## Out of scope

- Modal redesigns (leaderboard / achievements / daily) — you didn't pick that focus area, so they keep their current look this round.
- New sound design.
- Asset generation (no new images unless you ask).
