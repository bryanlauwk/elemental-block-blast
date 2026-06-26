/**
 * Bomb detonation animation phases (ms from the detonation tick at t=0).
 * Shared by the engine (cleanup + shake timing) and ReactionParticles (visuals)
 * so countdown -> explosion -> dissipation stays in lockstep.
 */
export const BOMB_TIMINGS = {
  /** Player-visible countdown tick interval. Matches the 5,4,3,2,1 cadence. */
  tickMs: 1000,
  /** Pre-detonation yellow charge ring pop. */
  chargeMs: 220,
  /** White ignition flash. */
  flashMs: 450,
  /** Orange/red fireball core. */
  fireballMs: 650,
  /** Amber shockwave ring. */
  shockwaveMs: 700,
  /** Smoke ring follow-up (offset start, fades over). */
  smokeRingDelayMs: 100,
  smokeRingMs: 850,
  /** Rising dark plume (dissipation tail). */
  smokePlumeDelayMs: 250,
  smokePlumeMs: 1300,
  /** Debris shards (gravity-affected). */
  debrisMs: 800,
} as const;

/** Total duration from detonation tick until all visuals have fully dissipated. */
export const BOMB_TOTAL_MS =
  BOMB_TIMINGS.smokePlumeDelayMs + BOMB_TIMINGS.smokePlumeMs; // 1550ms

/** How long the screen-shake + score popup remain visible during a detonation. */
export const BOMB_SHAKE_MS = BOMB_TIMINGS.shockwaveMs; // 700ms — ends with shockwave