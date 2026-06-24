import { PhaseConfig } from "./phases";

export type HazardVariant = "pit" | "cloud" | "lava" | "void";

export interface HazardConfig {
  variant: HazardVariant;
  label: string;
}

// One terrain hazard per phase. It occupies a single empty cell and blocks
// placement there (blocks would sink/melt into it) — a quiet obstacle that
// replaces the old cartoon critter.
export const HAZARDS: Record<number, HazardConfig> = {
  1: { variant: "pit", label: "Pot hole" },
  2: { variant: "pit", label: "Floor slump" },
  3: { variant: "cloud", label: "Cloud gap" },
  4: { variant: "pit", label: "Sinkhole" },
  5: { variant: "lava", label: "Lava pit" },
  6: { variant: "void", label: "Void rift" },
};

export function getHazardForPhase(phase: PhaseConfig): HazardConfig {
  return HAZARDS[phase.id] ?? HAZARDS[1];
}
