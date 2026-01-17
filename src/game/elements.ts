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
      'Burns adjacent WOOD → creates ASH',
      'Both Fire and Water disappear on contact',
      'Place strategically for bonus points',
    ],
  },
  water: {
    name: 'Water',
    symbol: '💧',
    color: 'hsl(200, 80%, 55%)',
    glowColor: 'hsl(200, 100%, 70%)',
    description: 'The neutralizer. Counters fire.',
    rules: [
      'Extinguishes adjacent FIRE',
      'Both Water and Fire disappear',
      'Defensive counter element',
    ],
  },
  wood: {
    name: 'Wood',
    symbol: '🪵',
    color: 'hsl(30, 50%, 35%)',
    glowColor: 'hsl(30, 60%, 45%)',
    description: 'Fuel for combos. Burns into ash.',
    rules: [
      'Burns when FIRE touches it',
      'Transforms into ASH when burned',
      'Common and reliable block',
    ],
  },
  acid: {
    name: 'Acid',
    symbol: '🧪',
    color: 'hsl(120, 80%, 40%)',
    glowColor: 'hsl(120, 100%, 50%)',
    description: 'One-shot dissolver. Rare but powerful.',
    rules: [
      'Destroys ONE adjacent block',
      'Then acid disappears too',
      'Cannot destroy Stone or Helium',
    ],
  },
  life: {
    name: 'Life',
    symbol: '🦠',
    color: 'hsl(280, 70%, 50%)',
    glowColor: 'hsl(280, 100%, 60%)',
    description: 'Disabled in Block Blast mode.',
    rules: [
      'Does not appear naturally',
      'Was too chaotic for strategic play',
      'May return in a future mode',
    ],
  },
  helium: {
    name: 'Helium',
    symbol: '🎈',
    color: 'hsl(330, 80%, 70%)',
    glowColor: 'hsl(330, 100%, 80%)',
    description: 'The safe block. Immune to reactions.',
    rules: [
      'Cannot be destroyed by reactions',
      'Only removed by line clear',
      'Rare but reliable for combos',
    ],
  },
  stone: {
    name: 'Stone',
    symbol: '🪨',
    color: 'hsl(0, 0%, 45%)',
    glowColor: 'hsl(0, 0%, 55%)',
    description: 'The foundation. No reactions.',
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
    description: 'The remnant. Created from burned wood.',
    rules: [
      'Created when WOOD burns',
      'Behaves like a normal block',
      'Can be cleared by line clear',
    ],
  },
};
