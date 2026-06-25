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
    stageFrom: "172 60% 18%",
    stageTo: "258 60% 8%",
    glow: "172 80% 55%",
    accent: "172 80% 55%",
    decoration: "blocks",
    unlocks: "Find your rhythm",
  },
  {
    id: 2,
    name: "Toy Factory",
    tagline: "Gears start turning",
    threshold: 500,
    stageFrom: "12 70% 22%",
    stageTo: "258 60% 8%",
    glow: "12 92% 64%",
    accent: "42 96% 62%",
    decoration: "gears",
    unlocks: "Pieces start to twist",
  },
  {
    id: 3,
    name: "Cloud City",
    tagline: "Up into the open sky",
    threshold: 1500,
    stageFrom: "322 70% 28%",
    stageTo: "258 60% 10%",
    glow: "322 92% 70%",
    accent: "322 92% 65%",
    decoration: "clouds",
    unlocks: "Long bars & T-pieces arrive",
  },
  {
    id: 4,
    name: "Crystal Caverns",
    tagline: "Deep into the glow",
    threshold: 3000,
    stageFrom: "268 70% 22%",
    stageTo: "258 70% 8%",
    glow: "268 90% 72%",
    accent: "268 90% 68%",
    decoration: "crystals",
    unlocks: "Big, awkward shapes",
  },
  {
    id: 5,
    name: "Volcano Run",
    tagline: "Everything heats up",
    threshold: 5000,
    stageFrom: "12 80% 22%",
    stageTo: "322 70% 8%",
    glow: "12 92% 64%",
    accent: "322 92% 60%",
    decoration: "embers",
    unlocks: "The board runs hot",
  },
  {
    id: 6,
    name: "Cosmic Void",
    tagline: "Beyond the known board",
    threshold: 9000,
    stageFrom: "268 80% 18%",
    stageTo: "258 80% 5%",
    glow: "268 92% 72%",
    accent: "172 80% 65%",
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
