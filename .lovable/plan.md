## Goal
Open up the gameplay screen so the score, fever meter, grid, piece tray, and (on tablets) legend no longer sit flush against each other. Same treatment for the sidebar panels on desktop.

## Changes — all in `src/pages/Index.tsx`

Currently the gameplay column is:
```tsx
<div className="flex flex-col items-center w-full max-w-[400px] h-full">
  {/* Scoreboard */}
  {/* FeverMeter */}
  {/* Grid wrapper */}
  {/* PieceTray */}
  {/* ElementLegend (tablet) */}
</div>
```
…with no `gap`, so children touch.

**1. Vertical rhythm in the gameplay column**
- Add `gap-3 sm:gap-5` to the game column wrapper (`div` around Scoreboard/FeverMeter/Grid/PieceTray).
- Remove the ad-hoc `mt-2` on the tablet-only ElementLegend so the parent `gap` alone controls spacing.

**2. Breathing room around the Daily-Challenge / score-header block**
- The `hasStarted` fragment renders a header `<motion.div className="text-center">` that only contains an optional Daily-Challenge badge. When it's empty it leaves an invisible gap; when it's shown the badge hugs the scoreboard. Wrap the badge in a `min-h-0` container and let the column `gap` handle spacing (drop inline `mt-1`).

**3. Sidebar spacing (desktop)**
- Right sidebar already has `lg:gap-4`; bump to `lg:gap-5` so the Reaction Feed and Element Legend panels feel less stacked.
- Keep panel inner padding (`p-4`) as-is — the fix is between panels, not inside them.

**4. Outer game area padding**
- The `<main>` uses `py-2 sm:py-6`. Bump the bottom padding so the piece tray isn't jammed against the viewport edge on short screens: change to `py-3 sm:py-6 pb-6 sm:pb-8`.
- Bump the column container's horizontal gap from `gap-4 sm:gap-6` to `gap-5 sm:gap-8` on desktop so the game board and sidebar aren't visually glued.

## Out of scope
- No changes to landing/start screen spacing (already uses `gap-5 sm:gap-7`).
- No changes to modal internals, grid cell size, or piece tray internals.
- No new components, no design tokens introduced.

## Technical section
- Single file touched: `src/pages/Index.tsx`.
- Pure Tailwind spacing edits (`gap-*`, `py-*`, remove stray `mt-*`). No logic changes, no prop changes, no CSS file edits.
