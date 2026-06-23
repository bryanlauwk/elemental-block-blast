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
    unlocks: "Singles, pairs & straights",
  },
  {
    id: 2,
    name: "Toy Factory",
    tagline: "Gears start turning",
    threshold: 500,
    stageFrom: "30 58% 21%",
    stageTo: "22 62% 9%",
    glow: "38 100% 55%",
    accent: "45 100% 51%",
    decoration: "gears",
    unlocks: "Corners, S-pieces & 2×2 squares",
  },
  {
    id: 3,
    name: "Cloud City",
    tagline: "Up into the open sky",
    threshold: 1500,
    stageFrom: "203 68% 40%",
    stageTo: "214 66% 15%",
    glow: "190 95% 62%",
    accent: "196 100% 60%",
    decoration: "clouds",
    unlocks: "Long bars & T-pieces",
  },
  {
    id: 4,
    name: "Crystal Caverns",
    tagline: "Deep into the glow",
    threshold: 3000,
    stageFrom: "266 56% 24%",
    stageTo: "258 66% 10%",
    glow: "286 90% 64%",
    accent: "275 90% 66%",
    decoration: "crystals",
    unlocks: "Big L's & 5-bars",
  },
  {
    id: 5,
    name: "Volcano Run",
    tagline: "Everything heats up",
    threshold: 5000,
    stageFrom: "8 60% 22%",
    stageTo: "10 66% 8%",
    glow: "8 90% 56%",
    accent: "18 92% 55%",
    decoration: "embers",
    unlocks: "The mighty 3×3 block",
  },
  {
    id: 6,
    name: "Cosmic Void",
    tagline: "Beyond the known board",
    threshold: 9000,
    stageFrom: "250 58% 16%",
    stageTo: "246 78% 5%",
    glow: "268 92% 68%",
    accent: "190 95% 62%",
    decoration: "stars",
    unlocks: "Master every shape",
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
