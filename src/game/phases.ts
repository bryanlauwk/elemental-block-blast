export type PhaseDecoration =
  | "blocks"
  | "gears"
  | "clouds"
  | "crystals"
  | "embers"
  | "stars";

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

// Each phase is a distinct "universe" the puzzle travels through as the
// score climbs. Palettes are intentionally varied (warm brass, bright sky,
// crystal violet, volcanic red, deep cosmos) so the world visibly changes
// from start to end instead of staying the same.
export const PHASES: PhaseConfig[] = [
  {
    id: 1,
    name: "Sandbox",
    tagline: "Warm up the toy box",
    threshold: 0,
    stageFrom: "222 62% 17%",
    stageTo: "224 70% 8%",
    glow: "204 100% 56%",
    accent: "204 100% 56%",
    decoration: "blocks",
    unlocks: "Find your rhythm",
  },
  {
    id: 2,
    name: "Toy Factory",
    tagline: "Gears start turning",
    threshold: 500,
    stageFrom: "220 55% 18%",
    stageTo: "224 68% 8%",
    glow: "38 95% 58%",
    accent: "45 100% 58%",
    decoration: "gears",
    unlocks: "Pieces start to twist",
  },
  {
    id: 3,
    name: "Cloud City",
    tagline: "Up into the open sky",
    threshold: 1500,
    stageFrom: "204 65% 28%",
    stageTo: "218 70% 10%",
    glow: "190 95% 65%",
    accent: "196 100% 65%",
    decoration: "clouds",
    unlocks: "Long bars & T-pieces arrive",
  },
  {
    id: 4,
    name: "Crystal Caverns",
    tagline: "Deep into the glow",
    threshold: 3000,
    stageFrom: "256 50% 20%",
    stageTo: "248 65% 9%",
    glow: "286 88% 68%",
    accent: "275 88% 70%",
    decoration: "crystals",
    unlocks: "Big, awkward shapes",
  },
  {
    id: 5,
    name: "Volcano Run",
    tagline: "Everything heats up",
    threshold: 5000,
    stageFrom: "350 45% 18%",
    stageTo: "340 60% 8%",
    glow: "12 92% 60%",
    accent: "38 100% 60%",
    decoration: "embers",
    unlocks: "The board runs hot",
  },
  {
    id: 6,
    name: "Cosmic Void",
    tagline: "Beyond the known board",
    threshold: 9000,
    stageFrom: "246 60% 14%",
    stageTo: "244 80% 5%",
    glow: "268 92% 72%",
    accent: "190 95% 68%",
    decoration: "stars",
    unlocks: "Master of every shape",
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
