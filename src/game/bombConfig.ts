/**
 * Bomb spawn tuning. Exposed as configurable constants + a smooth
 * `computeBombChance(fillRatio)` ramp so the HUD meter and the engine stay
 * in agreement about when a bomb is allowed to appear.
 *
 * The chance ramps linearly from 0 at `minFill` to `maxChance` at `rampEndFill`.
 * Below `minFill` the chance is 0 (no surprise bombs on an empty board);
 * at or above `rampEndFill` it stays clamped at `maxChance`.
 */
export interface BombConfig {
  /** Board fill ratio at which bombs MAY start dropping. */
  minFill: number;
  /** Board fill ratio at which bomb chance reaches its peak. */
  rampEndFill: number;
  /** Peak per-refill probability of swapping in a bomb. */
  maxChance: number;
  /** Minimum score before bombs can appear (early-game grace). */
  minScore: number;
}

export const BOMB_CONFIG: BombConfig = {
  // Bombs stay out of the way until the board is genuinely cramped, then
  // ramp up sharply. Keeps early-game clears clean and reserves bombs for
  // pressure situations where they actually matter.
  minFill: 0.6,
  rampEndFill: 0.85,
  maxChance: 0.5,
  minScore: 300,
};

/**
 * Per-phase bomb tuning. Phase 1 is bomb-free onboarding; pressure grows
 * phase by phase so the difficulty curve is visible, not surprising.
 */
const PHASE_BOMB_CONFIG: Record<number, BombConfig> = {
  1: { minFill: 1.0, rampEndFill: 1.0, maxChance: 0.0, minScore: 999999 },
  2: { minFill: 0.65, rampEndFill: 0.9, maxChance: 0.25, minScore: 300 },
  3: { minFill: 0.6, rampEndFill: 0.85, maxChance: 0.4, minScore: 300 },
  4: { minFill: 0.55, rampEndFill: 0.8, maxChance: 0.5, minScore: 300 },
  5: { minFill: 0.5, rampEndFill: 0.75, maxChance: 0.6, minScore: 300 },
  6: { minFill: 0.5, rampEndFill: 0.75, maxChance: 0.6, minScore: 300 },
};

/** Resolve the active bomb config for a given phase id (1..6). */
export function getBombConfigForPhase(phaseId: number): BombConfig {
  return PHASE_BOMB_CONFIG[phaseId] ?? BOMB_CONFIG;
}

/** Bomb-fuse length (in seconds) for the phase. Late phases fuse faster. */
export function getBombFuseForPhase(phaseId: number): number {
  return phaseId >= 5 ? 3 : 4;
}

/** Smooth (linear) ramp from 0 → maxChance based on board fill. */
export function computeBombChance(
  fillRatio: number,
  config: BombConfig = BOMB_CONFIG,
): number {
  if (fillRatio <= config.minFill) return 0;
  if (fillRatio >= config.rampEndFill) return config.maxChance;
  const t = (fillRatio - config.minFill) / (config.rampEndFill - config.minFill);
  return t * config.maxChance;
}