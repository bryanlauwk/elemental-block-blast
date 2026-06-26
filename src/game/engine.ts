// Pure game logic for Elemental Block Blast — extracted from the engine hook
// so it can be unit-tested in isolation. No React, no component state: every
// function takes the grid (and pieces) it operates on and returns new data.
import {
  Cell,
  Position,
  DraggablePiece,
  ElementType,
  BLOCK_SHAPES,
  SHAPE_WEIGHTS,
  ELEMENT_WEIGHTS,
  GRID_WIDTH,
  GRID_HEIGHT,
} from '@/game/types';
import { playSound } from '@/game/sounds';
import { SeededRandom } from '@/game/seededRandom';

export interface ReactionPreview {
  pos: Position;
  type: 'burn' | 'extinguish' | 'dissolve';
  affectedPositions: Position[];
}

export interface ReactionEvent {
  id: string;
  type: 'burn' | 'extinguish' | 'dissolve';
  source: string;
  target: string;
  points: number;
  timestamp: number;
}

export interface ReactionPreviewSummary {
  type: 'burn' | 'extinguish' | 'dissolve';
  count: number;
  points: number;
}

export interface ParticleTrigger {
  type: 'burn' | 'extinguish' | 'dissolve' | 'bomb';
  positions: Position[];
  /** For 'bomb': the detonation epicenters (bomb cells). Used for fireball + flash. */
  centers?: Position[];
  timestamp: number;
}

type ReactionType = 'burn' | 'extinguish' | 'dissolve';
type AffectedGroup = { type: ReactionType; positions: Position[] };

// Elements acid cannot dissolve (inert / treasure / itself).
const ACID_IMMUNE = new Set<ElementType>(['stone', 'helium', 'acid', 'gold', 'goldCracked', 'bomb']);

export const createEmptyGrid = (width: number = GRID_WIDTH, height: number = GRID_HEIGHT): Cell[][] => {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      element: null,
      id: `${x}-${y}-${Date.now()}`,
    }))
  );
};

// Random element using optional seeded RNG
export const getRandomElement = (rng?: SeededRandom): ElementType => {
  const totalWeight = ELEMENT_WEIGHTS.reduce((sum, e) => sum + e.weight, 0);
  let random = (rng ? rng.next() : Math.random()) * totalWeight;

  for (const { element, weight } of ELEMENT_WEIGHTS) {
    random -= weight;
    if (random <= 0) return element;
  }

  return 'stone';
};

// Dynamic difficulty: adjusts shape weights based on current score
export const getRandomShape = (score: number = 0, rng?: SeededRandom): Position[] => {
  const modifiedWeights = SHAPE_WEIGHTS.map(({ shapeIndex, weight }) => {
    const shapeSize = BLOCK_SHAPES[shapeIndex].length;
    let modifier = 1;

    if (score < 500) {
      // Phase 1 — Sandbox: heavy bias toward 1-3 cell pieces, no 5+ blocks
      modifier = shapeSize === 1 ? 2.4 : shapeSize === 2 ? 2.2 : shapeSize === 3 ? 1.8 : shapeSize === 4 ? 0.35 : 0;
    } else if (score < 1500) {
      // Phase 2 — Toy Factory: still gentle, 4-cell pieces appear, 5+ very rare
      modifier = shapeSize <= 2 ? 1.5 : shapeSize === 3 ? 1.4 : shapeSize === 4 ? 0.9 : 0.25;
    } else if (score < 3000) {
      modifier = shapeSize <= 2 ? 0.7 : shapeSize <= 4 ? 1.2 : 1.5;
    } else {
      modifier = shapeSize <= 2 ? 0.4 : shapeSize <= 4 ? 1.0 : 2.0;
    }

    return { shapeIndex, weight: weight * modifier };
  });

  const totalWeight = modifiedWeights.reduce((sum, s) => sum + s.weight, 0);
  let random = (rng ? rng.next() : Math.random()) * totalWeight;

  for (const { shapeIndex, weight } of modifiedWeights) {
    random -= weight;
    if (random <= 0) return BLOCK_SHAPES[shapeIndex];
  }

  return BLOCK_SHAPES[0];
};

// A single-cell ticking bomb piece. Surprises the player periodically; on
// placement the engine sets a 5-second countdown on the placed cell.
export const createBombPiece = (rng?: SeededRandom): DraggablePiece => {
  const suffix = rng ? rng.nextInt(100000, 999999).toString() : Math.random().toString(36).slice(2, 9);
  return {
    id: `bomb-${Date.now()}-${suffix}`,
    shape: [{ x: 0, y: 0 }],
    elements: ['bomb'],
  };
};

// Create piece with UNIFORM element type (all blocks same element)
export const createRandomPiece = (
  score: number = 0,
  comebackMode: boolean = false,
  rng?: SeededRandom,
): DraggablePiece => {
  let shape: Position[];
  if (comebackMode) {
    const smallShapeIndices = [0, 1, 2]; // Single, H2, V2
    const idx = rng ? rng.nextInt(0, smallShapeIndices.length - 1) : Math.floor(Math.random() * smallShapeIndices.length);
    shape = BLOCK_SHAPES[smallShapeIndices[idx]];
  } else {
    shape = getRandomShape(score, rng);
  }

  const element = getRandomElement(rng);
  const elements = shape.map(() => element);

  const randomSuffix = rng
    ? rng.nextInt(100000, 999999).toString()
    : Math.random().toString(36).substr(2, 9);

  return {
    id: `piece-${Date.now()}-${randomSuffix}`,
    shape,
    elements,
  };
};

// Can a piece be placed at a position on this grid?
export const canPlacePieceAt = (grid: Cell[][], piece: DraggablePiece, pos: Position): boolean => {
  const GRID_WIDTH = grid[0].length, GRID_HEIGHT = grid.length;
  return piece.shape.every((p) => {
    const newX = pos.x + p.x;
    const newY = pos.y + p.y;
    if (newX < 0 || newX >= GRID_WIDTH) return false;
    if (newY < 0 || newY >= GRID_HEIGHT) return false;
    if (grid[newY][newX].element !== null) return false;
    return true;
  });
};

// Can any of the pieces be placed anywhere on the grid?
export const canAnyPieceFit = (grid: Cell[][], pieces: DraggablePiece[]): boolean => {
  const GRID_WIDTH = grid[0].length, GRID_HEIGHT = grid.length;
  for (const piece of pieces) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (canPlacePieceAt(grid, piece, { x, y })) return true;
      }
    }
  }
  return false;
};

// Clear full rows and columns (Block Blast style) - ALWAYS HAPPENS FIRST.
// Gold is treasure: a line clear only CRACKS gold (it survives as goldCracked);
// clearing through it again shatters it for a bonus (counted as goldCleared).
export const clearLines = (grid: Cell[][]): { grid: Cell[][]; linesCleared: number; goldCleared: number } => {
  const GRID_WIDTH = grid[0].length, GRID_HEIGHT = grid.length;
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let linesCleared = 0;
  let goldCleared = 0;

  const clearCell = (x: number, y: number) => {
    const el = newGrid[y][x].element;
    if (el === 'gold') {
      newGrid[y][x] = { element: 'goldCracked', id: `${x}-${y}-${Date.now()}-${Math.random()}` };
    } else {
      if (el === 'goldCracked') goldCleared++;
      newGrid[y][x] = { element: null, id: `${x}-${y}-${Date.now()}-${Math.random()}` };
    }
  };

  const fullRows: number[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    if (newGrid[y].every(cell => cell.element !== null)) {
      fullRows.push(y);
    }
  }

  const fullCols: number[] = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    let isFull = true;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (newGrid[y][x].element === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) fullCols.push(x);
  }

  fullRows.forEach(y => {
    for (let x = 0; x < GRID_WIDTH; x++) clearCell(x, y);
    linesCleared++;
  });

  fullCols.forEach(x => {
    for (let y = 0; y < GRID_HEIGHT; y++) clearCell(x, y);
    linesCleared++;
  });

  if (linesCleared > 0) {
    playSound('lineClear');
  }

  return { grid: newGrid, linesCleared, goldCleared };
};

// Process elemental reactions - mutual destruction, one-shot effects
export const processReactions = (
  grid: Cell[][],
): { grid: Cell[][]; reacted: boolean; reactionCount: number; events: ReactionEvent[]; affectedPositions: AffectedGroup[] } => {
  const GRID_WIDTH = grid[0].length, GRID_HEIGHT = grid.length;
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let reacted = false;
  let reactionCount = 0;
  const toRemove = new Set<string>();
  const toAdd: { pos: Position; element: ElementType }[] = [];
  const events: ReactionEvent[] = [];
  const affectedPositions: AffectedGroup[] = [];

  const posKey = (x: number, y: number) => `${x},${y}`;

  // Wildfire: a fire touching wood ignites the WHOLE connected wood cluster,
  // not just the adjacent cell. Flood-fill (4-connectivity) through wood,
  // burning every reachable wood cell to ash in one cascade. Each wood cell
  // burns at most once per resolution.
  const burnedWood = new Set<string>();
  const floodWood = (sx: number, sy: number): Position[] => {
    const region: Position[] = [];
    const stack: Position[] = [{ x: sx, y: sy }];
    while (stack.length) {
      const { x, y } = stack.pop()!;
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) continue;
      const k = posKey(x, y);
      if (burnedWood.has(k)) continue;
      if (newGrid[y][x].element !== 'wood') continue;
      burnedWood.add(k);
      region.push({ x, y });
      stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
    }
    return region;
  };

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = newGrid[y][x];
      if (!cell.element) continue;

      const neighbors: { pos: Position; cell: Cell }[] = [
        { pos: { x: x - 1, y }, cell: x > 0 ? newGrid[y][x - 1] : { element: null, id: '' } },
        { pos: { x: x + 1, y }, cell: x < GRID_WIDTH - 1 ? newGrid[y][x + 1] : { element: null, id: '' } },
        { pos: { x, y: y - 1 }, cell: y > 0 ? newGrid[y - 1][x] : { element: null, id: '' } },
        { pos: { x, y: y + 1 }, cell: y < GRID_HEIGHT - 1 ? newGrid[y + 1][x] : { element: null, id: '' } },
      ];

      // Fire + Wood → wildfire through the connected wood cluster (each → Ash)
      if (cell.element === 'fire') {
        const burnPositions: Position[] = [];
        neighbors.forEach(({ pos, cell: neighbor }) => {
          if (neighbor.element === 'wood') {
            floodWood(pos.x, pos.y).forEach((wp) => {
              toRemove.add(posKey(wp.x, wp.y));
              toAdd.push({ pos: wp, element: 'ash' });
              burnPositions.push(wp);
              reacted = true;
              reactionCount++;
              events.push({
                id: `burn-${Date.now()}-${Math.random()}`,
                type: 'burn',
                source: 'fire',
                target: 'wood',
                points: 50,
                timestamp: Date.now(),
              });
            });
          }
        });
        if (burnPositions.length > 0) {
          playSound('sizzle');
          affectedPositions.push({ type: 'burn', positions: burnPositions });
        }
      }

      // Fire + Water → BOTH disappear (mutual destruction)
      if (cell.element === 'fire') {
        const extinguishPositions: Position[] = [];
        neighbors.forEach(({ pos, cell: neighbor }) => {
          if (neighbor.element === 'water') {
            toRemove.add(posKey(x, y));
            toRemove.add(posKey(pos.x, pos.y));
            extinguishPositions.push({ x, y });
            extinguishPositions.push(pos);
            reacted = true;
            reactionCount++;
            events.push({
              id: `extinguish-${Date.now()}-${Math.random()}`,
              type: 'extinguish',
              source: 'water',
              target: 'fire',
              points: 50,
              timestamp: Date.now(),
            });
            playSound('splash');
          }
        });
        if (extinguishPositions.length > 0) {
          affectedPositions.push({ type: 'extinguish', positions: extinguishPositions });
        }
      }

      // Acid → Destroys ONE adjacent non-immune block, then acid disappears
      if (cell.element === 'acid') {
        for (const { pos, cell: neighbor } of neighbors) {
          if (neighbor.element && !ACID_IMMUNE.has(neighbor.element)) {
            toRemove.add(posKey(pos.x, pos.y));
            toRemove.add(posKey(x, y));
            affectedPositions.push({ type: 'dissolve', positions: [pos, { x, y }] });
            reacted = true;
            reactionCount++;
            events.push({
              id: `dissolve-${Date.now()}-${Math.random()}`,
              type: 'dissolve',
              source: 'acid',
              target: neighbor.element,
              points: 50,
              timestamp: Date.now(),
            });
            playSound('dissolve');
            break;
          }
        }
      }
    }
  }

  toRemove.forEach((key) => {
    const [xStr, yStr] = key.split(',');
    const rx = parseInt(xStr);
    const ry = parseInt(yStr);
    if (ry >= 0 && ry < GRID_HEIGHT && rx >= 0 && rx < GRID_WIDTH) {
      newGrid[ry][rx] = { element: null, id: `${rx}-${ry}-${Date.now()}` };
    }
  });

  toAdd.forEach(({ pos, element }) => {
    if (pos.y >= 0 && pos.y < GRID_HEIGHT && pos.x >= 0 && pos.x < GRID_WIDTH) {
      if (newGrid[pos.y][pos.x].element === null) {
        newGrid[pos.y][pos.x] = { element, id: `${pos.x}-${pos.y}-${Date.now()}` };
      }
    }
  });

  return { grid: newGrid, reacted, reactionCount, events, affectedPositions };
};

// Resolve grid - LINE CLEARS FIRST, then reactions (strategic order)
export const PERFECT_CLEAR_BONUS = 1000;
export const GOLD_TREASURE_BONUS = 250;

export const resolveGrid = (
  grid: Cell[][],
): { grid: Cell[][]; totalScore: number; maxCombo: number; linesCleared: number; allReactionEvents: ReactionEvent[]; primaryReactionType?: ReactionType; allAffectedPositions: AffectedGroup[]; perfectClear: boolean } => {
  let currentGrid = grid;
  let totalScore = 0;
  let combo = 0;
  let totalLinesCleared = 0;
  let hasChanges = true;
  const allReactionEvents: ReactionEvent[] = [];
  const allAffectedPositions: AffectedGroup[] = [];
  let primaryReactionType: ReactionType | undefined;

  while (hasChanges) {
    hasChanges = false;

    const { grid: clearedGrid, linesCleared, goldCleared } = clearLines(currentGrid);
    if (linesCleared > 0) {
      currentGrid = clearedGrid;
      hasChanges = true;
      totalLinesCleared += linesCleared;
      combo++;
      const lineBonus = linesCleared === 1 ? 100 : linesCleared === 2 ? 300 : linesCleared * 200;
      totalScore += lineBonus * (combo > 1 ? combo : 1);
      // Treasure: each cracked-open gold pays a bonus.
      totalScore += goldCleared * GOLD_TREASURE_BONUS;
    }

    const { grid: reactedGrid, reacted, reactionCount, events, affectedPositions } = processReactions(currentGrid);
    if (reacted) {
      currentGrid = reactedGrid;
      hasChanges = true;
      allReactionEvents.push(...events);
      allAffectedPositions.push(...affectedPositions);
      if (!primaryReactionType && events.length > 0) {
        primaryReactionType = events[0].type;
      }
      const reactionBonus = reactionCount * 50 * Math.pow(1.5, combo);
      totalScore += Math.floor(reactionBonus);
      combo++;
    }
  }

  // Perfect Clear: a clear emptied the entire board → big bonus.
  const perfectClear =
    totalLinesCleared > 0 && currentGrid.every((row) => row.every((c) => c.element === null));
  if (perfectClear) {
    totalScore += PERFECT_CLEAR_BONUS;
  }

  return { grid: currentGrid, totalScore, maxCombo: combo, linesCleared: totalLinesCleared, allReactionEvents, primaryReactionType, allAffectedPositions, perfectClear };
};

export const getComboText = (combo: number, linesCleared: number): string => {
  if (combo >= 4) return 'LEGENDARY!';
  if (combo >= 3) return 'INCREDIBLE!';
  if (combo >= 2) return 'AMAZING!';
  if (linesCleared >= 3) return 'FANTASTIC!';
  if (linesCleared >= 2) return 'GREAT!';
  return 'NICE!';
};

// Reaction preview when hovering a piece over a position.
export const getReactionPreview = (grid: Cell[][], piece: DraggablePiece, pos: Position): ReactionPreview[] => {
  const GRID_WIDTH = grid[0].length, GRID_HEIGHT = grid.length;
  const previews: ReactionPreview[] = [];

  piece.shape.forEach((p, i) => {
    const x = pos.x + p.x;
    const y = pos.y + p.y;
    const element = piece.elements[i];

    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;

    const neighbors = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ].filter(n => n.x >= 0 && n.x < GRID_WIDTH && n.y >= 0 && n.y < GRID_HEIGHT);

    if (element === 'fire') {
      // Preview the full wildfire: the whole connected wood cluster that
      // would catch, not just the directly-adjacent cells.
      const woodNeighbors = neighbors.filter(n => grid[n.y][n.x].element === 'wood');
      if (woodNeighbors.length > 0) {
        const seen = new Set<string>();
        const burnTargets: Position[] = [];
        const stack = [...woodNeighbors];
        while (stack.length) {
          const n = stack.pop()!;
          const k = `${n.x},${n.y}`;
          if (seen.has(k)) continue;
          if (n.x < 0 || n.x >= GRID_WIDTH || n.y < 0 || n.y >= GRID_HEIGHT) continue;
          if (grid[n.y][n.x].element !== 'wood') continue;
          seen.add(k);
          burnTargets.push({ x: n.x, y: n.y });
          stack.push({ x: n.x - 1, y: n.y }, { x: n.x + 1, y: n.y }, { x: n.x, y: n.y - 1 }, { x: n.x, y: n.y + 1 });
        }
        previews.push({ pos: { x, y }, type: 'burn', affectedPositions: burnTargets });
      }
      const extinguishTargets = neighbors.filter(n => grid[n.y][n.x].element === 'water');
      if (extinguishTargets.length > 0) previews.push({ pos: { x, y }, type: 'extinguish', affectedPositions: extinguishTargets });
    }

    if (element === 'water') {
      const extinguishTargets = neighbors.filter(n => grid[n.y][n.x].element === 'fire');
      if (extinguishTargets.length > 0) previews.push({ pos: { x, y }, type: 'extinguish', affectedPositions: extinguishTargets });
    }

    if (element === 'acid') {
      const dissolveTargets = neighbors.filter(n => {
        const el = grid[n.y][n.x].element;
        return el && !ACID_IMMUNE.has(el);
      }).slice(0, 1);
      if (dissolveTargets.length > 0) previews.push({ pos: { x, y }, type: 'dissolve', affectedPositions: dissolveTargets });
    }
  });

  return previews;
};

// Find a helpful placement for the "Hint" button. Prefers a move that
// completes at least one line; otherwise the first valid placement. `blocked`
// (the hazard cell) is treated as occupied. Returns null when stuck.
export const findHint = (
  grid: Cell[][],
  pieces: DraggablePiece[],
  blocked?: Position | null,
): { piece: DraggablePiece; pos: Position } | null => {
  const GRID_WIDTH = grid[0].length, GRID_HEIGHT = grid.length;
  const isBlocked = (x: number, y: number) => !!blocked && blocked.x === x && blocked.y === y;
  let firstValid: { piece: DraggablePiece; pos: Position } | null = null;

  for (const piece of pieces) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const fits = piece.shape.every((p) => {
          const nx = x + p.x;
          const ny = y + p.y;
          return (
            nx >= 0 && nx < GRID_WIDTH &&
            ny >= 0 && ny < GRID_HEIGHT &&
            grid[ny][nx].element === null &&
            !isBlocked(nx, ny)
          );
        });
        if (!fits) continue;

        if (!firstValid) firstValid = { piece, pos: { x, y } };

        const filled = new Set(piece.shape.map((p) => `${x + p.x},${y + p.y}`));
        const occupied = (cx: number, cy: number) =>
          grid[cy][cx].element !== null || filled.has(`${cx},${cy}`);

        for (const p of piece.shape) {
          const ny = y + p.y;
          const nx = x + p.x;
          let rowFull = true;
          for (let c = 0; c < GRID_WIDTH; c++) if (!occupied(c, ny)) { rowFull = false; break; }
          let colFull = true;
          for (let r = 0; r < GRID_HEIGHT; r++) if (!occupied(nx, r)) { colFull = false; break; }
          if (rowFull || colFull) return { piece, pos: { x, y } };
        }
      }
    }
  }

  return firstValid;
};
