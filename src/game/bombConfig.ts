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
  minFill: 0.35,
  rampEndFill: 0.7,
  maxChance: 0.6,
  minScore: 80,
};

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