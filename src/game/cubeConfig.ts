import { ElementType } from '@/game/types';

export const CUBE_FACE_SIZE = 6;
export type CubeReactionType = 'burn' | 'extinguish' | 'dissolve';

export const CUBE_REACTION_RING: Record<CubeReactionType, string> = {
  burn: 'ring-2 ring-orange-400/80',
  extinguish: 'ring-2 ring-blue-400/80',
  dissolve: 'ring-2 ring-green-400/80',
};

export const CUBE_REACTION_MOMENTS: Record<CubeReactionType, string> = {
  burn: 'WILDFIRE',
  extinguish: 'STEAM BURST',
  dissolve: 'ACID MELT',
};

export const CUBE_FACES = [
  { id: 0, name: 'Front', place: 'translateZ(H)' },
  { id: 1, name: 'Right', place: 'rotateY(90deg) translateZ(H)' },
  { id: 2, name: 'Back', place: 'rotateY(180deg) translateZ(H)' },
  { id: 3, name: 'Left', place: 'rotateY(-90deg) translateZ(H)' },
] as const;

export type CubeFaceId = typeof CUBE_FACES[number]['id'];

export const CUBE_FACE_ROT: Record<number, number> = {
  0: 0,
  1: 270,
  2: 180,
  3: 90,
};

export const CUBE_FACE_BY_YAW: Record<number, number> = {
  0: 0,
  90: 3,
  180: 2,
  270: 1,
};

export const CUBE_FACE_AFFINITIES: Record<number, { label: string; element: ElementType; boost: string; tone: string }> = {
  0: { label: 'Fire Lab', element: 'fire', boost: 'Heat Boost', tone: 'from-orange-400/30 to-red-500/20' },
  1: { label: 'Water Lab', element: 'water', boost: 'Tide Boost', tone: 'from-cyan-300/30 to-blue-500/20' },
  2: { label: 'Stone Lab', element: 'stone', boost: 'Core Boost', tone: 'from-slate-200/25 to-slate-600/20' },
  3: { label: 'Wind Lab', element: 'helium', boost: 'Lift Boost', tone: 'from-yellow-200/25 to-sky-300/20' },
};

export const CUBE_ELEMENT_LABELS: Record<ElementType, string> = {
  fire: 'Fire',
  water: 'Water',
  wood: 'Wood',
  acid: 'Acid',
  life: 'Life',
  helium: 'Helium',
  stone: 'Stone',
  ash: 'Ash',
  gold: 'Gold',
  goldCracked: 'Cracked Gold',
};

export const CUBE_FEVER_MS = 9000;
export const CUBE_FACE_AFFINITY_BONUS = 20;
export const CUBE_FACE_SYNC_BONUS = 500;
export const CUBE_FULL_SYNC_BONUS = 2500;
export const CUBE_ORBIT_COMBO_BONUS = 300;

// Gentle side-view offset: keeps depth visible without skewing targets too much.
export const CUBE_ISO_ROTATION = { x: -8, y: 12 };

export const getCubeBoardSize = () => {
  if (typeof window === 'undefined') return 300;

  const widthCap = window.innerWidth <= 640 ? window.innerWidth * 0.62 : window.innerWidth * 0.8;
  const heightCap = window.innerWidth <= 640 ? window.innerHeight * 0.34 : window.innerHeight * 0.5;
  const maxSize = window.innerWidth <= 640 ? 280 : 360;

  return Math.round(Math.min(widthCap, heightCap, maxSize));
};
