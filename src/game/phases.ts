export type PhaseDecoration = "blocks" | "gears" | "clouds" | "embers";

export interface PhaseConfig {
  id: number;
  name: string;
  tagline: string;
  threshold: number; // score at which this phase unlocks
  stageFrom: string; // hsl values (no hsl())
  stageTo: string;
  glow: string;
  accent: string;
  decoration: PhaseDecoration;
  unlocks: string; // short label for the phase-up overlay
}

// Thresholds aligned with shape-weight modifiers in useBlockBlastEngine.
export const PHASES: PhaseConfig[] = [
  {
    id: 1,
    name: "Sandbox",
    tagline: "Warm up the toy box",
    threshold: 0,
    stageFrom: "222 65% 14%",
    stageTo: "224 70% 8%",
    glow: "204 100% 56%",
    accent: "204 100% 56%",
    decoration: "blocks",
    unlocks: "Singles, pairs & straights",
  },
  {
    id: 2,
    name: "Toy Factory",
    tagline: "Gears start turning",
    threshold: 500,
    stageFrom: "222 65% 14%",
    stageTo: "224 70% 8%",
    glow: "45 100% 51%",
    accent: "45 100% 51%",
    decoration: "gears",
    unlocks: "Corners, S-pieces & 2×2 squares",
  },
  {
    id: 3,
    name: "Cloud City",
    tagline: "Up into the sky",
    threshold: 1500,
    stageFrom: "215 60% 22%",
    stageTo: "224 70% 10%",
    glow: "204 100% 56%",
    accent: "204 100% 56%",
    decoration: "clouds",
    unlocks: "Long bars & T-pieces",
  },
  {
    id: 4,
    name: "Volcano Run",
    tagline: "Things heat up",
    threshold: 3000,
    stageFrom: "8 50% 18%",
    stageTo: "224 70% 8%",
    glow: "8 82% 51%",
    accent: "8 82% 51%",
    decoration: "embers",
    unlocks: "Big L's, 5-bars & the 3×3",
  },
];

export function getPhaseForScore(score: number): PhaseConfig {
  let current = PHASES[0];
  for (const p of PHASES) {
    if (score >= p.threshold) current = p;
  }
  return current;
}

export function getNextPhase(currentId: number): PhaseConfig | null {
  return PHASES.find((p) => p.id === currentId + 1) ?? null;
}

export function getPhaseProgress(score: number): {
  phase: PhaseConfig;
  next: PhaseConfig | null;
  progress: number; // 0..1
} {
  const phase = getPhaseForScore(score);
  const next = getNextPhase(phase.id);
  if (!next) return { phase, next: null, progress: 1 };
  const span = next.threshold - phase.threshold;
  const into = Math.max(0, score - phase.threshold);
  return { phase, next, progress: Math.min(1, into / span) };
}