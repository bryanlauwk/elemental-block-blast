import { ElementType } from './types';

export interface ElementInfo {
  name: string;
  symbol: string;
  color: string;
  glowColor: string;
  description: string;
  rules: string[];
}

export const ELEMENT_INFO: Record<ElementType, ElementInfo> = {
  fire: {
    name: 'Fire',
    symbol: '🔥',
    color: 'hsl(15, 90%, 55%)',
    glowColor: 'hsl(30, 100%, 50%)',
    description: 'The destroyer. Burns organic matter.',
    rules: [
      'Destroys WOOD blocks on contact',
      'Destroys LIFE blocks on contact',
      'Extinguished by WATER',
    ],
  },
  water: {
    name: 'Water',
    symbol: '💧',
    color: 'hsl(200, 80%, 55%)',
    glowColor: 'hsl(200, 100%, 70%)',
    description: 'The neutralizer. Calms the chaos.',
    rules: [
      'Extinguishes FIRE on contact',
      'Turns LAVA to STONE (future)',
      'Flows and settles naturally',
    ],
  },
  wood: {
    name: 'Wood',
    symbol: '🪵',
    color: 'hsl(30, 50%, 35%)',
    glowColor: 'hsl(30, 60%, 45%)',
    description: 'Organic fuel. Awaits its fate.',
    rules: [
      'Static until burned by FIRE',
      'Burns into falling ASH',
      'Can be dissolved by ACID',
    ],
  },
  acid: {
    name: 'Acid',
    symbol: '🧪',
    color: 'hsl(120, 80%, 40%)',
    glowColor: 'hsl(120, 100%, 50%)',
    description: 'The corrosive. Eats through matter.',
    rules: [
      'Destroys block directly below',
      'Then moves down to fill gap',
      'Maximum depth: 3 blocks',
    ],
  },
  life: {
    name: 'Life',
    symbol: '🦠',
    color: 'hsl(280, 70%, 50%)',
    glowColor: 'hsl(280, 100%, 60%)',
    description: 'The virus. Spreads relentlessly.',
    rules: [
      'Spawns clone every 15 seconds',
      'Spreads to adjacent empty cell',
      'Only FIRE or ACID can kill it',
    ],
  },
  helium: {
    name: 'Helium',
    symbol: '🎈',
    color: 'hsl(330, 80%, 70%)',
    glowColor: 'hsl(330, 100%, 80%)',
    description: 'The floater. Defies gravity.',
    rules: [
      'Floats UP instead of falling',
      'Only cleared by full row',
      'Cannot be destroyed by reactions',
    ],
  },
  stone: {
    name: 'Stone',
    symbol: '🪨',
    color: 'hsl(0, 0%, 45%)',
    glowColor: 'hsl(0, 0%, 55%)',
    description: 'The immovable. Endures all.',
    rules: [
      'Indestructible by all elements',
      'Only removed by line clear',
      'The most reliable block',
    ],
  },
  ash: {
    name: 'Ash',
    symbol: '💨',
    color: 'hsl(0, 0%, 30%)',
    glowColor: 'hsl(0, 0%, 40%)',
    description: 'The remnant. Falls and settles.',
    rules: [
      'Created when WOOD burns',
      'Falls with normal gravity',
      'Can be cleared by line clear',
    ],
  },
};
