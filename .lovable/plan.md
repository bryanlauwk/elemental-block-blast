# Pixar "Cinematic 3D Toybox" — Home Page Big Lift

Rebuild the landing page (`/`) to match the approved prototype: a navy stage, an Abril Fatface 3D candy headline ("ELEMENTAL / BLOCK / BLAST"), a row of glossy rubber element tiles, and a red Pixar-style PLAY button. Locked taste: palette Toy Box Primary (`#0d1b3d`, `#e8341c`, `#ffc107`, `#1ea7ff`); type pair Abril Fatface (display) + Cabin (body); layout hero-grid.

## What changes

1. **Fonts** — Add `@fontsource/abril-fatface` and `@fontsource/cabin`, import in `src/main.tsx`, register in `tailwind.config.ts` as `font-display` (Abril) and default `font-sans` (Cabin).

2. **Design tokens** (`src/index.css`) — Add Pixar palette tokens (`--pixar-navy`, `--pixar-red`, `--pixar-yellow`, `--pixar-blue`) and a `--shadow-3d-letter-*` helper for the stacked text-shadow stack. Keep existing tokens; only the home page consumes the new ones.

3. **`GameTitle.tsx` — full rewrite** for the headline:
   - Top eyebrow "ELEMENTAL" in blue, uppercase, `tracking-[0.4em]`, Cabin bold.
   - Two stacked words "BLOCK" (yellow) and "BLAST" (red) in Abril Fatface, ~8xl, each with a 4-layer stacked `text-shadow` for chiseled 3D depth + soft drop shadow.
   - Letter-by-letter pop-in via framer-motion (spring), one-time shimmer sweep across each word, gentle `hero-bob` loop (disabled on `prefers-reduced-motion` and mobile).
   - Removes the current fire-ring background and rainbow text-shadow look.

4. **`Index.tsx` — landing layout** rebuilt around the prototype:
   - Background: solid `#0d1b3d` with two soft radial glows (blue top-left, red bottom-right) using existing `gradient-stage` token swapped to Pixar values. Removes the violet neon scanline grid for the home page only (in-game grid untouched).
   - Stat chips row (Best / Streak / XP) above the title using existing `useHighScores`, `useDailyStreak`, and XP hooks already wired in.
   - Headline (new `GameTitle`).
   - Element tile row: 5 chunky rounded-2xl tiles with `border-b-4` bottom shadow for the "rubber" feel, hover lift. Reuse existing element icons from `HeroBlockDisplay` / theme — colors map to fire/water/wood/stone/helium but in Pixar palette where they match.
   - Primary PLAY button: red pill with stacked shadow layer (separate `<div>` for the dark red drop), white gradient gloss overlay, Abril Fatface label, `active:translate-y-1` press feel. Replaces the current green PLAY.
   - Keep nav bar (logo + settings icons) but restyle chips/icons to white/10 glass on navy.

5. **Keep untouched**: in-game grid (`BlockBlastGrid`), scoreboard, modals, sound, achievements, auth, all hooks, all routes. Only landing-page presentation.

## Out of scope

- No changes to gameplay, animations inside the grid, or modals.
- No backend / schema / RLS changes.
- Mobile layout follows the same stack (chips → headline → tiles → PLAY) with smaller type ramps; no separate redesign.

## Technical notes

- Files touched: `src/main.tsx`, `tailwind.config.ts`, `src/index.css`, `src/components/game/GameTitle.tsx`, `src/pages/Index.tsx`. Possibly small tweaks to `src/components/game/HeroBlockDisplay.tsx` if its dark-stage background clashes (will restyle inline, not rewrite).
- Fonts via `@fontsource/*` packages only — no Google Fonts `<link>` and no `index.html` edits.
- All new colors come from CSS tokens, not hardcoded hex inside components (except prototype-faithful per-letter shadow stacks in `GameTitle`, which are intrinsic to the headline effect).
- Motion uses framer-motion (already in deps) + CSS keyframes; all decorative loops gated by `prefers-reduced-motion`.

## Acceptance

- Home page renders the Pixar 3D headline, navy stage, rubber tiles, and red PLAY matching the chosen prototype.
- Lighthouse/perf parity (no new heavy assets beyond two webfont families).
- In-game experience unchanged.
