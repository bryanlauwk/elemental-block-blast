// Element types for the periodic table of chaos
export type ElementType = 'fire' | 'water' | 'wood' | 'acid' | 'life' | 'helium' | 'stone' | 'ash' | 'gold' | 'goldCracked' | 'bomb';

export interface Cell {
  element: ElementType | null;
  id: string;
  /** Ticking-bomb countdown in seconds. Only set when element === 'bomb'. */
  countdown?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface DraggablePiece {
  id: string;
  shape: Position[];
  elements: ElementType[];
}

export interface BlockBlastState {
  grid: Cell[][];
  availablePieces: DraggablePiece[];
  selectedPiece: DraggablePiece | null;
  dropPreview: Position | null;
  score: number;
  combo: number;
  isGameOver: boolean;
  lastLifeTick: number;
}

// Block Blast style shapes - various polyominoes
export const BLOCK_SHAPES: Position[][] = [
  // Single block
  [{ x: 0, y: 0 }],
  
  // 2-block pieces
  [{ x: 0, y: 0 }, { x: 1, y: 0 }], // Horizontal 2
  [{ x: 0, y: 0 }, { x: 0, y: 1 }], // Vertical 2
  
  // 3-block pieces
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // Horizontal 3
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], // Vertical 3
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }], // L corner
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }], // Reverse L
  [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], // Reverse L 2
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], // S piece
  
  // 4-block pieces
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }], // Horizontal 4
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], // Vertical 4
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], // Square
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }], // L piece
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }], // J piece
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }], // L vertical
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }], // J vertical
  [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], // T piece
  
  // 5-block pieces (rare)
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }], // Horizontal 5
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }], // Vertical 5
  
  // Large L shapes
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }], // Big L
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], // Big L rotated
  
  // 3x3 square (challenging)
  [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
  ],
];

// Shape weights for random generation (smaller pieces more common)
export const SHAPE_WEIGHTS: { shapeIndex: number; weight: number }[] = [
  { shapeIndex: 0, weight: 5 },   // Single
  { shapeIndex: 1, weight: 10 },  // H2
  { shapeIndex: 2, weight: 10 },  // V2
  { shapeIndex: 3, weight: 15 },  // H3
  { shapeIndex: 4, weight: 15 },  // V3
  { shapeIndex: 5, weight: 12 },  // L corner
  { shapeIndex: 6, weight: 12 },  // Reverse L
  { shapeIndex: 7, weight: 12 },  // Reverse L 2
  { shapeIndex: 8, weight: 12 },  // S piece
  { shapeIndex: 9, weight: 8 },   // H4
  { shapeIndex: 10, weight: 8 },  // V4
  { shapeIndex: 11, weight: 15 }, // Square
  { shapeIndex: 12, weight: 10 }, // L piece
  { shapeIndex: 13, weight: 10 }, // J piece
  { shapeIndex: 14, weight: 10 }, // L vertical
  { shapeIndex: 15, weight: 10 }, // J vertical
  { shapeIndex: 16, weight: 10 }, // T piece
  { shapeIndex: 17, weight: 3 },  // H5
  { shapeIndex: 18, weight: 3 },  // V5
  { shapeIndex: 19, weight: 4 },  // Big L
  { shapeIndex: 20, weight: 4 },  // Big L rotated
  { shapeIndex: 21, weight: 2 },  // 3x3 square
];

// Element weights for random generation - balanced for strategic play
// Stone and Wood are foundations, Fire/Water create combos, Acid/Helium are rare
export const ELEMENT_WEIGHTS: { element: ElementType; weight: number }[] = [
  { element: 'stone', weight: 35 },   // Reliable foundation
  { element: 'wood', weight: 25 },    // Creates combo opportunities
  { element: 'fire', weight: 15 },    // Offensive reaction starter
  { element: 'water', weight: 15 },   // Defensive counter
  { element: 'acid', weight: 5 },     // Rare but powerful
  { element: 'helium', weight: 5 },   // Rare "safe" block
  { element: 'gold', weight: 6 },     // Treasure - must be cleared twice for a bonus
  { element: 'life', weight: 0 },     // Disabled - too chaotic for Block Blast
];

export const GRID_WIDTH = 8;
export const GRID_HEIGHT = 8;
