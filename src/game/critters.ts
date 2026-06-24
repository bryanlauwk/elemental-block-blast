import { PhaseConfig } from "./phases";
import mouseImg from "@/assets/critters/mouse.png";
import robotImg from "@/assets/critters/robot.png";
import birdImg from "@/assets/critters/bird.png";
import batImg from "@/assets/critters/bat.png";
import salamanderImg from "@/assets/critters/salamander.png";
import blobImg from "@/assets/critters/blob.png";

export interface CritterConfig {
  name: string;
  image: string;
  squeak: string;
}

// One critter per phase. Occupies a single empty cell and blocks
// placement there until it hops to another empty cell.
export const CRITTERS: Record<number, CritterConfig> = {
  1: { name: "Sandbox Mouse", image: mouseImg, squeak: "eek!" },
  2: { name: "Wind-up Mouse", image: robotImg, squeak: "tick!" },
  3: { name: "Sky Chick", image: birdImg, squeak: "tweet!" },
  4: { name: "Cavern Bat", image: batImg, squeak: "skree!" },
  5: { name: "Lava Salamander", image: salamanderImg, squeak: "hiss!" },
  6: { name: "Cosmic Blob", image: blobImg, squeak: "blorp!" },
};

export function getCritterForPhase(phase: PhaseConfig): CritterConfig {
  return CRITTERS[phase.id] ?? CRITTERS[1];
}