
# Make the Game Richer & the Home Page More Pixar

Two threads: (1) a **phased gameplay progression** where shapes and backdrop evolve as the player scores, and (2) a **Pixar-style hero artwork** with a character on the landing page.

---

## 1. Phased gameplay progression

Introduce 5 difficulty **phases** that unlock by score. Each phase changes which shapes appear, the background mood, and a small "phase intro" celebration.

### Phases

| Phase | Unlocks at | Theme name | Shape pool bias | Backdrop |
|-------|-----------|------------|-----------------|----------|
| 1 | 0 pts | **Sandbox** | Singles, 2- and 3-block straights (easy) | Navy stage, soft blue glow |
| 2 | 500 | **Toy Factory** | Adds L/J/S corners, 2×2 squares | Adds warm yellow glow + floating gear silhouettes |
| 3 | 1,500 | **Cloud City** | Adds 4-block straights, T pieces | Red→blue gradient, drifting cloud shapes |
| 4 | 3,500 | **Volcano Run** | Adds 5-block straights, big L's | Red-dominant, pulsing ember particles |
| 5 | 7,000 | **Cosmic Toybox** | Adds 3×3 square (rare), full chaos | Deep navy + starfield, slow parallax |

Shape pool changes by **re-weighting** `SHAPE_WEIGHTS` from `src/game/types.ts` per phase (no new shapes needed — they already exist). Element weights stay the same so reactions feel familiar.

### How phase is computed

- New hook `usePhase(score: number)` returns `{ phase, name, nextThreshold, progressToNext }`.
- `useBlockBlastEngine` reads current phase and passes the active shape-weight table into its piece generator (small refactor: extract `pickShape(weights)` so it accepts a weights arg instead of importing the constant).
- On phase change, fire a one-time event so the UI can play a "Phase Up!" celebration.

### Phase-up celebration

New `PhaseUpOverlay` (built on existing `PixarOverlay`):
- 1.2s overlay: big Abril Fatface phase name, sub-label "New shapes unlocked", thumbnail row of the 2–3 newly added shapes.
- Plays existing `playLevelUp` sound (already in `src/game/sounds.ts`).
- Auto-dismiss; gated by `prefers-reduced-motion` (instant flash + label, no scale anim).

### Phase indicator in HUD

Add a slim `PhasePill` inside the scoreboard area:
- Shows phase number + name + progress bar to next phase.
- Uses existing `PixarPanel` + yellow→red gradient bar.

---

## 2. Adaptive background

Rebuild the in-game background as a single `AdaptiveStage` component keyed by phase, replacing the current static navy stage on `/` when `hasStarted` is true.

- Base layer: CSS gradient that **transitions** (1.2s ease) between per-phase palettes defined as CSS vars (`--stage-from`, `--stage-to`, `--stage-glow`).
- Decoration layer: phase-specific lightweight SVG/CSS elements (gears, clouds, embers, stars). All pure CSS keyframes — no JS rAF loops — to keep the 60fps rule in Core memory.
- All decorative motion gated by `prefers-reduced-motion`.

Files: new `src/components/game/AdaptiveStage.tsx` and a small `src/game/phases.ts` for phase config (thresholds, palettes, shape weights, decoration kind). Used by `src/pages/Index.tsx` in place of the current inline background block during gameplay.

---

## 3. Pixar hero artwork on the landing page

Add a **character/mascot illustration** to the landing hero so it feels less empty and more "movie poster."

### Approach

- Generate one **premium-tier illustration**: a chunky 3D Pixar-style mascot built from the game's element blocks — e.g. a smiling stack-of-blocks character with a fire tuft on top, water-drop eyes, holding a glowing block. Navy/red/yellow/blue palette to match tokens. Transparent PNG so it floats on the stage.
- Saved to `src/assets/hero-mascot.png` (no externalization; standard image import).
- Placed in `src/pages/Index.tsx` landing layout to the right of the headline on desktop, below the headline on mobile.
- Subtle framer-motion: gentle bob loop + entrance scale-in.

### Supporting hero polish

- Add 3–4 **floating decorative props** behind the mascot (small CSS-only shapes: a yellow star, a blue cloud puff, a red block, a sparkle) with staggered float animations — keeps the "toybox" feel without another image.
- Tighten the existing headline + stat-chip + element-tile stack so the mascot has room without breaking the hero-grid layout.

---

## Files touched

**New**
- `src/game/phases.ts` — phase configs (thresholds, palettes, shape weights, decoration kind, intro labels).
- `src/hooks/usePhase.ts` — derive phase from score, expose change events.
- `src/components/game/AdaptiveStage.tsx` — adaptive in-game background.
- `src/components/game/PhaseUpOverlay.tsx` — phase-up celebration.
- `src/components/game/PhasePill.tsx` — HUD phase indicator.
- `src/assets/hero-mascot.png` — generated Pixar mascot (premium imagegen).

**Modified**
- `src/hooks/useBlockBlastEngine.ts` — accept phase-driven shape weights.
- `src/game/types.ts` — export `pickShape(weights)` helper (extract from current logic; keep `SHAPE_WEIGHTS` as Phase-1 default).
- `src/pages/Index.tsx` — mount `AdaptiveStage` during gameplay, mount `PhaseUpOverlay`, add mascot + floating props to landing hero.
- `src/components/game/BlockBlastScoreboard.tsx` — add `PhasePill`.
- `src/index.css` — add `--stage-*` CSS vars and phase-decoration keyframes.

## Out of scope

- No new shapes invented; we only re-weight existing ones from `BLOCK_SHAPES`.
- No backend, schema, or auth changes.
- No changes to combos, scoring math, achievements, or leaderboard.
- No changes to the in-grid block rendering — only the stage behind it and the piece pool.

## Acceptance

- Score crossing each threshold visibly changes the backdrop and the shapes the tray serves up, with a brief "Phase Up!" celebration.
- HUD shows current phase + progress to next.
- Landing page shows a Pixar-style mascot beside the headline with subtle bob, plus a couple of floating toy props.
- 60fps maintained (CSS keyframes only for decorative motion); `prefers-reduced-motion` respected throughout.
