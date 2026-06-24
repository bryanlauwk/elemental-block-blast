## 1. Restore clean per-phase backgrounds

- **Delete** `src/components/game/StageScene.tsx` and remove its import + render from `AdaptiveStage.tsx`. Stage becomes: gradient + dot pattern + vignette + existing animated decorations (`blocks`, `gears`, `clouds`, `crystals`, `embers`, `stars`) — the look from before the painterly SVGs were added.
- **Tune palettes for cohesion** in `src/game/phases.ts` so all six worlds share the same navy-rooted Pixar Toy Box family instead of jumping between brass/sky/violet/red/cosmic at full saturation. Keep each world visually distinct, but pull saturation/lightness into a unified range:
  - Sandbox — warm navy + sky-blue glow (current).
  - Toy Factory — navy + amber accent (less orange swamp).
  - Cloud City — soft daylight blue, lighter top, navy bottom.
  - Crystal Caverns — deep indigo + violet accent.
  - Volcano Run — dark plum→ember red, accent gold (not full red field).
  - Cosmic Void — deep space navy + cyan/violet stars.
- Slightly lower decoration opacity in `src/index.css` where any layer fights readability of the board.

## 2. Per-phase critter on the grid

A small animated character scampers around inside the play area, recolored/sprited per world. Purely cosmetic — never blocks placement, never affects scoring or hit detection.

**New file `src/game/critters.ts`** — maps each `PhaseConfig.id` → `{ name, emoji/svg id, accentColor, idleSound? }`:

| Phase | Critter |
|---|---|
| Sandbox | Mouse 🐭 |
| Toy Factory | Wind-up robot mouse 🤖 |
| Cloud City | Bird 🐤 |
| Crystal Caverns | Bat 🦇 |
| Volcano Run | Salamander 🦎 |
| Cosmic Void | Alien blob 👾 |

Rendered as styled emoji inside a small chunky shadowed badge (matches Pixar component look) — no new image assets needed.

**New file `src/components/game/StageCritter.tsx`**

- Absolutely positioned inside the grid container (sibling of the grid cells, `pointer-events-none`, `z-20` above cells but below overlays).
- Reads current `phase` and live `board` from `useBlockBlastEngine` (passed as props from `BlockBlastGrid` / `Index.tsx`).
- Internal state: `{ row, col, facing: 'left'|'right' }`. Every ~2.5–4s (randomized) picks a random filled cell as the next hop target and animates to it via framer-motion `animate={{ x, y }}` with a spring; if board is empty, idles in a random cell.
- On hop, briefly squashes (scaleY 0.85 → 1) and flips horizontally to face travel direction.
- Reacts to play:
  - On a line clear (subscribe to existing combo / clear event already used by `ComboDisplay` / `ScorePopup`), play a small jump + 🎵 squeak using existing `playSfx` (reuse `pop` sound), and emit a quick speech-bubble "!" via framer-motion fade.
  - When a row/column it sits on is cleared, it gets "launched" — quick arc to a new random cell.
- Honors `prefers-reduced-motion`: disables hop animation, just snaps to new cells every 6s with no squash/flip.

**Integration**

- `src/components/game/BlockBlastGrid.tsx`: add `<StageCritter phase={phase} board={board} lastClearAt={lastClearAt} />` as last child inside the grid wrapper.
- `useBlockBlastEngine.ts`: expose a `lastClearAt: number` timestamp updated whenever lines clear (or reuse the existing combo counter as a trigger). No gameplay change.

## 3. Out of scope

- No new shapes, no scoring/combo logic changes, no backend, no asset uploads.
- No changes to landing page mascot.
- No new fonts.

## Technical notes

- Critter position uses pixel offsets derived from existing grid cell size (already known in `BlockBlastGrid`); pass `cellSize` prop so the critter math matches the cells exactly.
- Framer-motion is already in the project — no new deps.
- All emoji rendered with `filter: drop-shadow(...)` using the phase's `accent` token so it pops against any background.

## Files

- **New**: `src/game/critters.ts`, `src/components/game/StageCritter.tsx`
- **Edit**: `src/components/game/AdaptiveStage.tsx`, `src/components/game/BlockBlastGrid.tsx`, `src/hooks/useBlockBlastEngine.ts`, `src/game/phases.ts`, `src/index.css`
- **Delete**: `src/components/game/StageScene.tsx`
