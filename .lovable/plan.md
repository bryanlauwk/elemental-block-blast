# Lo-fi Alley Backdrop — Reference-Match Pass

## Goal
Make the gameplay screen look like the attached reference: a crisp, vivid neon-alley scene framing the board, with the gameplay UI sitting on glass panels in front. Today the in-game backdrop is blurred and heavily darkened, which hides the artwork. We want the art to be the star.

## Reference read
- Background is sharp (not blurred), saturated purples/pinks/blues.
- A soft navy darkening sits only around the edges (vignette), keeping the center vivid.
- The board, scoreboard, and tray are dark glass panels that float on top.
- Side neon signs / lanterns are visible — not washed out.

## Changes

### 1. New artwork pass — `src/assets/lofi-neon-alley.jpg`
Regenerate at premium quality with a wider 16:9 composition, stronger neon saturation, and a clearly empty vertical center column so the board has a clean negative space. Prompt tuned for: anime lo-fi alley at night, neon signage flanking both sides, lanterns + plants, wet pavement reflections, painterly, no characters, no text, no logos, empty center for UI.

### 2. `src/components/game/LofiAlleyBackdrop.tsx` — let the art breathe
- Default (in-game) state: **no blur**, slight saturation boost only. Was `blur(6px) brightness(0.95)`.
- Overlay: drop the flat navy wash from 60–68% to ~22–28%. Replace the heavy radial vignette with a soft edge-only vignette (transparent through ~70% of the frame, navy only in the outer corners) so the center stays vivid like the reference.
- `pulse` state (phase-up): brief saturation/brightness lift + 1.02 scale, ~700ms. No blur transitions.
- `blurred` prop kept but defaults to `false` and now means "slightly dim" (overlay ~35%, no blur) — used only for modal/menu states if needed.
- Respect `prefers-reduced-motion` (no scale/pulse).

### 3. `src/pages/Index.tsx` — wiring
- Pass `blurred={false}` during gameplay (was `hasStarted`), so the alley reads crisp behind the board.
- Keep `pulse={backdropPulse}` on phase-up.
- Landing screen continues to render the unblurred backdrop.

### 4. `src/styles/classic-glass.css` — let the backdrop show through
- `.bg-gradient-pixar-stage` currently paints a solid navy gradient that fully covers the backdrop. Change its background to `transparent` (keep the `::before` / `::after` decorative glows but lower their opacity to ~0.35 so they don't fight the artwork).
- Ensure the stage container does not set `background-color` that occludes the fixed `-z-10` backdrop.

### 5. Board/HUD contrast guard
- Nudge `pixar-grid-frame` and `pixar-hud-panel` inner fill slightly darker (+~6% navy) so panels stay legible over the now-vivid backdrop. No structural changes.

## Out of scope
- No game logic, scoring, engine, or layout changes.
- No new components.
- Landing page hero composition unchanged (only the backdrop layer behind it gets crisper).

## Files touched
- regenerate: `src/assets/lofi-neon-alley.jpg`
- edit: `src/components/game/LofiAlleyBackdrop.tsx`, `src/pages/Index.tsx`, `src/styles/classic-glass.css`
