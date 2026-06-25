## Goal
Add a cozy lo-fi neon-alley artwork as the game's atmosphere layer — used behind the landing screen and the gameplay board — with a navy overlay, blur during play, and a brief "sharpen/brighten" pulse on phase-up.

## Asset
- Generate a single high-quality background image via `imagegen` (premium quality, 1536x1024, no text, empty center) and save to `src/assets/lofi-neon-alley.jpg`.
- Prompt: "Cozy neon city alley at night, anime-inspired lo-fi game background, vibrant pink/purple/blue buildings, lanterns, plants on the sides, wet pavement reflections, soft bloom, clear empty center space for gameplay UI, no text, no characters, no logos, polished mobile game background, painterly."
- Retire the placeholder `src/assets/lofi-neon-alley.svg` (replaced by the new JPG).

## New component
`src/components/game/LofiAlleyBackdrop.tsx`
- Fixed full-viewport layer (`fixed inset-0 -z-10`, `pointer-events-none`).
- Three stacked layers:
  1. The artwork (`bg-cover bg-center`).
  2. Navy overlay (`bg-[hsl(224_70%_8%)]/65`) — tunable 55–70%.
  3. Subtle radial vignette to push focus to the center.
- Props: `blurred?: boolean` (default false → 0px; true → ~6px blur + slightly higher overlay), `pulse?: boolean` (when true, briefly drop overlay to ~25% + blur to 0 + scale 1.02 for ~900ms via Framer Motion).
- Uses GPU-friendly `transform`/`filter` transitions only (per perf rule).

## Wiring
- **Landing (`src/pages/Index.tsx` pre-game view)**: render `<LofiAlleyBackdrop />` (unblurred) behind hero content. Keep existing block towers/CTA on top.
- **In-game (`AdaptiveStage.tsx`)**: render `<LofiAlleyBackdrop blurred pulse={phasePulse} />` as the stage background instead of (or layered behind) the current solid stage gradient. Keep the existing phase-tinted stage gradient as a thin overlay at low opacity so phase color shifts still read.
- **Phase-up pulse**: in `AdaptiveStage`, subscribe to `usePhase().justAdvanced`. When it fires, set `phasePulse=true` for ~900ms, then clear. The existing `PhaseUpOverlay` continues to play on top.

## Guardrails
- Pure presentation change — no game logic, scoring, or engine edits.
- No new colors hardcoded in components beyond the overlay tint expressed via existing HSL tokens.
- Image loaded once, cached; `loading="eager"` for landing, decoded async.
- Respect `prefers-reduced-motion`: skip pulse animation, keep static blurred backdrop.

## Files touched
- add: `src/assets/lofi-neon-alley.jpg`, `src/components/game/LofiAlleyBackdrop.tsx`
- edit: `src/pages/Index.tsx`, `src/components/game/AdaptiveStage.tsx`
- delete: `src/assets/lofi-neon-alley.svg`
