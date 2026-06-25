## Full restyle: Pop-Art Neon District

Pivot the game's identity from cozy nighttime lo-fi to a vibrant, saturated, ink-outlined pop-art alley world. The Pixar component architecture stays — we re-skin the tokens, not the structure.

## Visual direction

- **Palette shift**: from navy-dominant → magenta/violet/coral/teal-dominant, with deep ink-black for outlines and panel borders.
- **Outlines everywhere**: 2–3px ink-black borders on tiles, chips, panels, buttons — the defining pop-art move.
- **Flat-shaded blocks**: element tiles get the comic flat-shade treatment (solid fill + single highlight stripe + ink outline) instead of glossy 3D rubber.
- **Backdrop as star**: the artwork is bright, so the board itself becomes a darker "stage card" with a thick ink frame to hold attention.

## Artwork to generate

1. `popart-alley-bg.jpg` (1536×1024) — wide pop-art alley environment, **no character**, generous empty center for gameplay UI, saturated magenta/purple/coral/teal, thick ink outlines, no text.
2. `popart-alley-hero.jpg` (1024×1280) — landing hero with the hooded explorer figure, same style, character lower-left, alley receding right.
3. `popart-mascot.png` (transparent) — chunky pop-art block-creature mascot replacing the current Pixar mascot on the landing page.

## Token + theme changes (`src/index.css`, `src/styles/classic-glass.css`)

New HSL tokens:
- `--popart-magenta` `322 92% 58%`
- `--popart-violet` `268 78% 56%`
- `--popart-coral` `12 92% 64%`
- `--popart-teal` `172 70% 48%`
- `--popart-cream` `42 96% 88%`
- `--popart-ink` `258 60% 10%` (replaces navy as default text/border color)
- `--popart-panel` `258 50% 14% / 0.78` (board/panel fill — dark, so the bright bg pops around it)

Rewrites:
- `pixar-hud-panel`, `pixar-glass-chip`, `pixar-glass-tile`, `pixar-grid-frame`, `pixar-modal-shell` → swap navy gradients for the dark plum panel fill, add 2px `--popart-ink` outlines, raise saturation, drop blur slightly (the artwork shouldn't be over-frosted).
- `bg-gradient-pixar-stage` → remove the navy gradient; the page background is now transparent and the `LofiAlleyBackdrop` (renamed) renders the pop-art art directly.

## Backdrop component (`src/components/game/LofiAlleyBackdrop.tsx` → rename `PopArtBackdrop.tsx`)

- Default art: `popart-alley-bg.jpg`.
- Overlays tuned for a bright source:
  - Idle (landing): ink overlay **18%**, no blur, full saturation — let it shine.
  - Active gameplay: ink overlay **62%**, blur **8px**, saturation **0.9**, vignette **strong** so corners go near-black around the board.
  - Phase-up pulse (900ms): overlay drops to **20%**, blur to 0, brightness +18% — the world "comes alive."
- Update all imports (`AdaptiveStage.tsx`, `Index.tsx`).

## Element tiles (`src/components/game/ElementBlock.tsx`)

Re-skin the 5 elements in pop-art palette with flat shade + ink outline:
- Fire → coral red
- Water → teal
- Wood → lime/teal-green
- Stone → violet
- Wind/Helium → magenta-pink

Replace glossy rubber gradient with: solid fill + 30% top highlight band + 2px ink outline + chunky offset shadow (no blur). Keep all animation hooks intact.

## HUD components

- `PixarPanel`, `PixarChip`, `PixarButton`, `PixarStatChip`, `PixarBadge`, `PixarOverlay` — same APIs, restyled:
  - Dark plum fill, ink outlines, accent text in magenta/coral.
  - `PixarButton` primary → coral with ink border + offset shadow (comic-book button). Secondary → teal. Ghost → plum glass.
- `BlockBlastScoreboard`, `MobileMenu`, `StreakBadge`, `PhasePill`, `ComboDisplay`, `ScorePopup`, `MarqueeRibbon` consume the updated tokens automatically — verify each visually, tweak text colors only where contrast fails.
- `GameTitle` — keep the 3D chiseled letters but recolor the shadow stack to ink-black + magenta rim glow so it reads against the bright artwork.

## Landing page (`src/pages/Index.tsx`)

- Replace the existing Pixar mascot with `popart-mascot.png`.
- Hero stage uses `popart-alley-hero.jpg` as a framed illustration card behind the title and PLAY button (heavy ink frame, slight tilt).
- Element tile row, stat chips, and PLAY button picked up automatically via the restyled Pixar components.

## Phase backdrops (`src/components/game/AdaptiveStage.tsx`)

Keep the 4 phases but re-tint each with a pop-art accent overlay on top of the same `popart-alley-bg.jpg`:
- Sandbox → teal wash
- Toy Factory → coral wash
- Cloud City → magenta wash
- Volcano Run → violet+coral wash with embers
Critter illustrations stay as-is (already hand-painted).

## What stays untouched

- Game logic, scoring, phase thresholds, critter blocking, daily challenge, leaderboard, auth.
- Component file paths and APIs — no consumer rewrites needed, just token swaps inside each component.
- Pixar typography (Abril Fatface + Cabin) stays — fits pop-art surprisingly well; we only recolor.

## Build order

1. Generate the 3 artworks.
2. Add pop-art HSL tokens + rewrite shared utility classes.
3. Restyle the 6 Pixar shared components.
4. Restyle `ElementBlock` and `GameTitle`.
5. Rename + retune `LofiAlleyBackdrop` → `PopArtBackdrop`, update imports.
6. Swap landing-page mascot and hero illustration card.
7. Tint phase overlays in `AdaptiveStage`.
8. Visual QA pass across landing, gameplay, modals, mobile.