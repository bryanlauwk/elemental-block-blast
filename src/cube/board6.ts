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

// ── Reactions (ported from the 8x8 engine, sized to the 6x6 face) ──
export type ReactionType = 'burn' | 'extinguish' | 'dissolve';
export interface Affected { type: ReactionType; positions: Position[] }

const ACID_IMMUNE = new Set<ElementType>(['stone', 'helium', 'acid', 'gold', 'goldCracked']);
const key = (x: number, y: number) => `${x},${y}`;

// Line clears: gold only cracks the first time; cracked gold shatters (treasure).
const clearLinesG = (b: CBoard): { board: CBoard; lines: number; gold: number } => {
  const nb = b.map((r) => r.slice());
  let gold = 0;
  const clearCell = (x: number, y: number) => {
    const el = nb[y][x];
    if (el === 'gold') nb[y][x] = 'goldCracked';
    else { if (el === 'goldCracked') gold++; nb[y][x] = null; }
  };
  const rows: number[] = [];
  const cols: number[] = [];
  for (let y = 0; y < FACE; y++) if (nb[y].every((c) => c !== null)) rows.push(y);
  for (let x = 0; x < FACE; x++) { let f = true; for (let y = 0; y < FACE; y++) if (nb[y][x] === null) { f = false; break; } if (f) cols.push(x); }
  rows.forEach((y) => { for (let x = 0; x < FACE; x++) clearCell(x, y); });
  cols.forEach((x) => { for (let y = 0; y < FACE; y++) clearCell(x, y); });
  return { board: nb, lines: rows.length + cols.length, gold };
};

const react = (b: CBoard): { board: CBoard; reacted: boolean; count: number; affected: Affected[] } => {
  const nb = b.map((r) => r.slice());
  const remove = new Set<string>();
  const add: { x: number; y: number; el: ElementType }[] = [];
  const affected: Affected[] = [];
  let count = 0;
  const burned = new Set<string>();
  const flood = (sx: number, sy: number): Position[] => {
    const region: Position[] = [];
    const stack: Position[] = [{ x: sx, y: sy }];
    while (stack.length) {
      const { x, y } = stack.pop()!;
      if (x < 0 || x >= FACE || y < 0 || y >= FACE) continue;
      const k = key(x, y);
      if (burned.has(k) || nb[y][x] !== 'wood') continue;
      burned.add(k);
      region.push({ x, y });
      stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
    }
    return region;
  };
  for (let y = 0; y < FACE; y++) {
    for (let x = 0; x < FACE; x++) {
      const el = nb[y][x];
      if (!el) continue;
      const nbrs = [{ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 }]
        .filter((n) => n.x >= 0 && n.x < FACE && n.y >= 0 && n.y < FACE);
      if (el === 'fire') {
        const burn: Position[] = [];
        nbrs.forEach((n) => {
          if (nb[n.y][n.x] === 'wood') flood(n.x, n.y).forEach((w) => { remove.add(key(w.x, w.y)); add.push({ ...w, el: 'ash' }); burn.push(w); count++; });
          if (nb[n.y][n.x] === 'water') { remove.add(key(x, y)); remove.add(key(n.x, n.y)); affected.push({ type: 'extinguish', positions: [{ x, y }, n] }); count++; }
        });
        if (burn.length) affected.push({ type: 'burn', positions: burn });
      }
      if (el === 'acid') {
        for (const n of nbrs) {
          const t = nb[n.y][n.x];
          if (t && !ACID_IMMUNE.has(t)) { remove.add(key(n.x, n.y)); remove.add(key(x, y)); affected.push({ type: 'dissolve', positions: [n, { x, y }] }); count++; break; }
        }
      }
    }
  }
  remove.forEach((k) => { const [x, y] = k.split(',').map(Number); nb[y][x] = null; });
  add.forEach(({ x, y, el }) => { if (nb[y][x] === null) nb[y][x] = el; });
  return { board: nb, reacted: count > 0, count, affected };
};

export interface Resolve6 {
  board: CBoard;
  gained: number;
  lines: number;
  reactions: number;
  combo: number;
  affected: Affected[];
  perfectClear: boolean;
}

const lineBonus = (n: number) => (n === 1 ? 100 : n === 2 ? 300 : n >= 3 ? n * 200 : 0);

// Line clears first, then reactions — looped, with combo + bonuses (mirrors the
// classic engine so the cube plays the same).
export const resolve6 = (start: CBoard): Resolve6 => {
  let board = start;
  let gained = 0;
  let combo = 0;
  let lines = 0;
  let reactions = 0;
  const affected: Affected[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    const cl = clearLinesG(board);
    if (cl.lines > 0) {
      board = cl.board;
      changed = true;
      lines += cl.lines;
      combo++;
      gained += lineBonus(cl.lines) * (combo > 1 ? combo : 1) + cl.gold * 250;
    }
    const rx = react(board);
    if (rx.reacted) {
      board = rx.board;
      changed = true;
      reactions += rx.count;
      affected.push(...rx.affected);
      gained += Math.floor(rx.count * 50 * Math.pow(1.5, combo));
      combo++;
    }
  }
  const perfectClear = lines > 0 && board.every((r) => r.every((c) => c === null));
  if (perfectClear) gained += 1000;
  return { board, gained, lines, reactions, combo, affected, perfectClear };
};
