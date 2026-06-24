// Self-contained 6x6 board logic for the Cube prototype. Kept separate from the
// classic 8x8 engine so it can't destabilize the main game. Reuses element
// colours but keeps the rules simple (line clears + score) for v1.
import { ElementType, BLOCK_SHAPES, Position } from '@/game/types';
import { getRandomElement } from '@/game/engine';

export const FACE = 6;

export type CCell = ElementType | null;
export type CBoard = CCell[][]; // [y][x]

export interface CPiece {
  id: string;
  shape: Position[];
  element: ElementType;
}

export const emptyBoard = (): CBoard =>
  Array.from({ length: FACE }, () => Array.from({ length: FACE }, () => null as CCell));

// Only shapes that fit within a 6x6 face.
const FIT_SHAPES = BLOCK_SHAPES.filter((s) => {
  const maxX = Math.max(...s.map((p) => p.x));
  const maxY = Math.max(...s.map((p) => p.y));
  return maxX < FACE && maxY < FACE;
});

export const randomPiece = (): CPiece => {
  const shape = FIT_SHAPES[Math.floor(Math.random() * FIT_SHAPES.length)];
  return {
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    shape,
    element: getRandomElement(),
  };
};

export const canPlace = (b: CBoard, piece: CPiece, ox: number, oy: number): boolean =>
  piece.shape.every((p) => {
    const x = ox + p.x;
    const y = oy + p.y;
    return x >= 0 && x < FACE && y >= 0 && y < FACE && b[y][x] === null;
  });

export const place = (b: CBoard, piece: CPiece, ox: number, oy: number): CBoard => {
  const nb = b.map((r) => r.slice());
  piece.shape.forEach((p) => {
    nb[oy + p.y][ox + p.x] = piece.element;
  });
  return nb;
};

export const clearLines = (b: CBoard): { board: CBoard; cleared: number } => {
  const nb = b.map((r) => r.slice());
  const fullRows: number[] = [];
  const fullCols: number[] = [];
  for (let y = 0; y < FACE; y++) if (nb[y].every((c) => c !== null)) fullRows.push(y);
  for (let x = 0; x < FACE; x++) {
    let full = true;
    for (let y = 0; y < FACE; y++) if (nb[y][x] === null) { full = false; break; }
    if (full) fullCols.push(x);
  }
  fullRows.forEach((y) => { for (let x = 0; x < FACE; x++) nb[y][x] = null; });
  fullCols.forEach((x) => { for (let y = 0; y < FACE; y++) nb[y][x] = null; });
  return { board: nb, cleared: fullRows.length + fullCols.length };
};

export const canAnyFit = (b: CBoard, pieces: CPiece[]): boolean =>
  pieces.some((pc) => {
    for (let y = 0; y < FACE; y++)
      for (let x = 0; x < FACE; x++)
        if (canPlace(b, pc, x, y)) return true;
    return false;
  });
