# Neon Glass Bento — UI Restyle

Restyle (not refactor) the home page and in-game UI so the entire app reads as a frosted-glass neon-alley interface on top of the existing lo-fi backdrop. No game logic, components, or routes change — only tokens, typography, and the visual layer of shared Pixar components.

## Design lock (from your selection)

- **Typography:** Space Grotesk (display, 700, tight tracking) + DM Sans (body, 400/500/700). Retire Abril Fatface + Cabin everywhere.
- **Palette:** deep ink `#0a0510` base, magenta `#e879f9`, cyan `#22d3ff`, violet `#a78bfa`, white text at 100/80/60/40 opacity tiers.
- **Surfaces:** `bg-white/5` + `backdrop-blur-xl` + `border border-white/10`, hairline neon borders on active/highlight states, soft inner-glow on filled cells.
- **Title:** gradient-clip white → white/60 with a soft white glow drop-shadow. No 3D candy letter stacks.
- **CTA:** full-width pill, `cyan → magenta` gradient, cyan glow shadow, hover scale 1.02.

## Build steps

### 1. Tokens & fonts
- `bun add @fontsource/space-grotesk @fontsource/dm-sans`; import both in `src/main.tsx`.
- `tailwind.config.ts`: set `fontFamily.display = ['Space Grotesk', …]`, `fontFamily.sans = ['DM Sans', …]`. Add `neon: { ink, magenta, cyan, violet }` colors.
- `src/index.css`: add neon HSL tokens; rewrite `pixar-hud-panel`, `pixar-glass-chip`, `pixar-glass-tile`, `pixar-grid-frame`, `pixar-modal-shell` to the new frosted recipe (white/5 fill, 18–24px blur, white/10 hairline, optional cyan/magenta accent border variant). Keep class names so consumers don't need edits.
- Remove unused Abril Fatface / Cabin imports.

### 2. Shared Pixar components (restyle in place)
- `GameTitle.tsx`: rebuild as Space Grotesk gradient-clip headline with optional eyebrow chips ("Neo-Alley Ed.", "Lo-Fi Rhythm" style). Drop per-letter spring animation; keep a subtle fade/blur-in.
- `pixar/PixarButton.tsx`: primary = cyan→magenta gradient pill with neon glow; secondary = glass with cyan hairline; ghost = glass with white/10 hairline. Remove red/yellow 3D shadow stacks.
- `pixar/PixarChip.tsx` / `PixarStatChip.tsx` / `PixarBadge.tsx` / `PixarPanel.tsx` / `PixarOverlay.tsx`: switch fills to white/5 + blur-xl + white/10 borders; accent variants use cyan or magenta hairline + faint inner glow. Top-accent line on `PixarPanel` becomes cyan→magenta.
- `MarqueeRibbon.tsx`, `StreakBadge.tsx`, `PhasePill.tsx`: same glass recipe, neon accent text.

### 3. Board, tray, HUD
- `BlockBlastGrid.tsx`: frame becomes `pixar-grid-frame` glass; empty cells `bg-white/5 border-white/5`; filled cells keep element color but switch to `/20` fill + `/50` hairline + `inset 0 0 10px` glow.
- `PieceTray.tsx`: each slot becomes a glass tile (`bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl`), mini blocks render with neon glow shadow.
- `BlockBlastScoreboard.tsx`: rebuild as 6-col bento — Score tile col-span-4, Best tile col-span-2; cyan eyebrow for Score, magenta for Best, Space Grotesk numerics.
- `ComboDisplay.tsx`, `ScorePopup.tsx`, `FeverMeter.tsx`: swap to neon palette + Space Grotesk numerics.

### 4. Home & gameplay page
- `src/pages/Index.tsx`: landing hero uses new title, two eyebrow pill chips, stat bento (Best / Streak / XP) using `PixarStatChip`, then the gradient PLAY CTA. Floating mascot/props stay but lose Pixar-yellow accents.
- Remove the navy `bg-gradient-pixar-stage` wherever it competes with the backdrop. `AdaptiveStage` phase glows shift to magenta/cyan/violet so they harmonize with the alley.

### 5. Modals & overlays
- All six game modals already use `.pixar-modal-shell` — they pick up the new glass recipe automatically. Audit `LeaderboardModal`, `AchievementsModal`, `DailyChallengeModal`, `PlayerNameModal`, `ExitConfirmModal`, `SoundSettings` for any hard-coded Pixar red/yellow text and swap to neon tokens.
- `PhaseUpOverlay`: cyan→magenta sweep instead of red/yellow.

### 6. Cleanup
- Delete `src/game/theme.ts` fire→cyan literal usages that conflict (or repoint to neon tokens). Grep for `text-pixar-`, `bg-pixar-`, `from-pixar-` and replace with neon equivalents or `text-white/…` opacity tiers.
- Update `mem://brand/identity-and-style` to record the new Neon Glass Bento direction and retire the Pixar Toy Box guidance.

## Out of scope
- Backdrop artwork, sounds, game engine, leaderboard logic, auth, RLS, routes.
- No new components; only restyle existing ones.

## Verification
- Run Playwright: capture home and mid-gameplay; confirm Space Grotesk renders, glass panels frosted, alley backdrop visible through every surface, no red/yellow Pixar accents remain.
