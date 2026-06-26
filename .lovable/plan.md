## Goal

Bring the five remaining secondary surfaces — **Leaderboard, Tutorial, Achievements, Daily Challenge, Sound Settings** — onto the same neon glass language already used by the HUD, scoreboard, sidebar (`ReactionFeed`, `ElementLegend`), and grid frame. They currently still use the older Pixar orange / gold / cyan accent palette and `modalStyles` from `src/game/theme.ts`, which feels alien against the new lo-fi neon UI.

## Scope

Visual / presentation only. No business logic, data fetching, or copy changes.

Files touched:
- `src/index.css` — add shared neon modal primitives
- `src/components/game/LeaderboardModal.tsx`
- `src/components/game/ReactionTutorial.tsx`
- `src/components/game/AchievementsModal.tsx` (+ `AchievementPopup.tsx` toast if it shares styles)
- `src/components/game/DailyChallengeModal.tsx`
- `src/components/game/SoundSettings.tsx`

## Design decisions

Reuse the existing neon tokens already in `src/index.css` (`--neon-mint`, `--neon-cyan`, `--neon-magenta`, `--neon-violet`, `--neon-amber`) and the `.neon-glass-panel` border treatment. No new colors.

1. **Shared modal shell** — add a `.neon-modal-shell` utility that extends `.pixar-modal-shell` sizing but swaps the white-glow chrome for the cyan→magenta neon edge (gradient border via `::before`, frosted navy fill, soft mint+magenta outer glow).
2. **Top accent bar** — replace the orange→gold→cyan gradient bar with a `mint → cyan → magenta` neon gradient, consistent across all five modals.
3. **Header icon chip** — single `.neon-icon-chip` class (frosted navy + cyan border + soft cyan glow). Drop `modalStyles.headerIconGold` / `headerIconCyan`.
4. **Tabs / segmented controls** (Leaderboard global vs local, time period filter) — neon segmented pill: inactive = subtle glass, active = cyan glass with magenta underglow. No orange.
5. **List rows** — base row uses `.neon-row` (translucent navy + 1px mint border on hover). Highlight states:
   - Rank #1 → amber neon accent
   - Current player → cyan neon accent
   - Default → mint hover
6. **Buttons** — route to existing `PixarButton`/`.ui-btn-*` neon variants already used on the home page, no bespoke gradients.
7. **Typography** — apply `font-display` (Space Grotesk) to titles + `ui-label-*` scale for body labels so it lines up with the HUD.
8. **Sound settings mood grid** — replace gold-tinted active state with cyan/magenta neon active tile; keep the existing 8-mood layout and scrolling behavior intact.
9. **Achievement popup toast** — match the row treatment so achievements that fire mid-game read as the same family.

## Implementation order

```text
1. Add .neon-modal-shell + .neon-icon-chip + .neon-row utilities in index.css
2. LeaderboardModal — swap shell, gradient bar, tabs, time pills, row styles
3. SoundSettings — swap shell, mood grid active state, switch/slider accent colors
4. DailyChallengeModal — swap shell, info boxes, primary CTA
5. AchievementsModal + AchievementPopup — swap shell, badge tiles, toast
6. ReactionTutorial — swap shell, step indicator dots, CTA
7. Manual pass: open each modal at mobile + desktop, verify neon edge, contrast, no leftover orange/gold accents
```

## Notes

- `src/game/theme.ts → modalStyles` is now redundant for these screens; leave it in place but stop importing it from the five updated files (other callers can be migrated in a future pass).
- Keep existing animations (`framer-motion` entrance, list stagger) — only the visual tokens change.
- No changes to `pixar-modal-shell` itself, so any other surface still using it keeps working.
