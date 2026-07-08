## Goal
Make the game feel addictive by trimming easy-mode conveniences and reshaping the difficulty curve into clearer per-phase steps — challenging but fair, with early wins that get progressively tighter.

## 1. Reduce hints & conveniences

**Remove the free "Hint" button (biggest crutch)**
- `src/pages/Index.tsx`: delete the Hint button in the action row and the `handleHint`/`findHint` wiring. Keep `findHint` in the engine (unused) so tests don't break.

**Gate reroll behind a real cost, not a per-turn refill**
- `src/hooks/useBlockBlastEngine.ts`:
  - Drop the "one reroll per turn" refill (`rerollAvailable = true` on every placement).
  - Rerolls consume only from the per-run budget. Lower `REROLLS_PER_RUN` from 5 → 3.
  - `rerollAvailable` becomes derived: `rerollsRemaining > 0`.

**Trim the reaction-preview crutch by phase**
- `src/hooks/useBlockBlastEngine.ts::setDropPreview`: pass current phase into preview logic. In phase ≥ 3 (Cloud City+), stop emitting `reactionPreviewSummary` (the big "+X pts" pill). In phase ≥ 5 (Volcano Run+), also stop emitting `reactionPreviews` (the ghost highlights on the grid). Players learn to read the board instead of following hints.

**Remove desktop `KeyboardHints` overlay**
- `src/pages/Index.tsx`: remove the `<KeyboardHints />` render + import. Shortcuts still work; the always-visible hint UI goes.

## 2. Reshape the difficulty curve per phase

**Piece-size tiers (`src/game/engine.ts::getRandomShape`)** — gentler start, sharper mid-game bite, brutal late-game:

| Score band | Phase | New feel |
|---|---|---|
| 0–500 | Sandbox | Mostly 2–3 cells, occasional 4 (welcoming) |
| 500–1500 | Toy Factory | Balanced 2–4, 5+ starts to appear |
| 1500–3000 | Cloud City | 3–4 dominant, 5+ common |
| 3000–5000 | Crystal Caverns | 4–5 dominant, small pieces rare |
| 5000–9000 | Volcano Run | 5+ common, 3x3 square appears more |
| 9000+ | Cosmic Void | Awkward big pieces almost every draw |

Update `getPieceRule()` in `DifficultyPanel.tsx` to match the new bands + phase names.

**Bomb pressure per phase (`src/game/bombConfig.ts` + engine call site)**
- Turn `BOMB_CONFIG` into a phase-aware helper: return different `{minFill, rampEndFill, maxChance, minScore}` per phase id.
- Phase 1: bombs disabled entirely (`maxChance: 0`) — pure onboarding.
- Phase 2: `minFill 0.65, max 0.25`.
- Phase 3: `minFill 0.6, max 0.4`.
- Phase 4: `minFill 0.55, max 0.5`.
- Phase 5–6: `minFill 0.5, max 0.6`, shorter fuse (3s instead of 4s in `placePiece`).
- `useBlockBlastEngine.placePiece` and the live `bombChance` derivation both read the phase-aware config so the HUD stays truthful.

**Comeback assist is later & rarer**
- `placePiece`: raise `failedAttempts >= 5` threshold to `>= 8`, and only allow it in phase ≤ 3. Late game shouldn't get bailed out.

## 3. HUD sync

`src/components/game/DifficultyPanel.tsx`
- Update the "Active rules" section to read from the same phase-aware bomb config helper (so the "unlocks @ X pts" and "Max chance … @ Y% fill" numbers update per phase instead of being global constants).
- Add a small "Assists" line: shows `Rerolls: N/3` and, if applicable, `Previews: off` once phase ≥ 3 — so the player understands the training wheels came off.

## Technical section

- No schema/backend changes.
- Files edited: `src/game/engine.ts`, `src/game/bombConfig.ts`, `src/hooks/useBlockBlastEngine.ts`, `src/pages/Index.tsx`, `src/components/game/DifficultyPanel.tsx`.
- Files unchanged intentionally: `KeyboardHints.tsx` (kept on disk, just unmounted), `findHint` in engine (kept for tests).
- Existing unit tests in `src/game/engine.test.ts` should still pass — piece-size tuning is inside the same function and doesn't change public API.

## Out of scope
- No new phases, no new mechanics, no visual redesign.
- Daily challenge stays deterministic (bombs still disabled there).
