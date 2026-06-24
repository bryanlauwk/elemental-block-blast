import { PhaseConfig } from "./phases";

export interface CritterConfig {
  name: string;
  emoji: string;
  squeak: string; // tiny speech-bubble glyph on reactions
}

// One critter per phase. Pure flavor — they scamper across the board and
// react to line clears without ever blocking placement.
export const CRITTERS: Record<number, CritterConfig> = {
  1: { name: "Sandbox Mouse", emoji: "🐭", squeak: "!" },
  2: { name: "Wind-up Mouse", emoji: "🤖", squeak: "⚙" },
  3: { name: "Sky Chick", emoji: "🐤", squeak: "♪" },
  4: { name: "Cavern Bat", emoji: "🦇", squeak: "✦" },
  5: { name: "Lava Salamander", emoji: "🦎", squeak: "✦" },
  6: { name: "Cosmic Blob", emoji: "👾", squeak: "✺" },
};

export function getCritterForPhase(phase: PhaseConfig): CritterConfig {
  return CRITTERS[phase.id] ?? CRITTERS[1];
}