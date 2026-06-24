import { describe, it, expect, vi } from 'vitest';

// The engine plays sound effects; stub them so logic tests stay pure.
vi.mock('@/game/sounds', () => ({ playSound: () => {} }));

import {
  createEmptyGrid,
  canPlacePieceAt,
  canAnyPieceFit,
  clearLines,
  processReactions,
  resolveGrid,
  getComboText,
  getReactionPreview,
  findHint,
  createRandomPiece,
} from './engine';
import { Cell, ElementType, DraggablePiece, GRID_WIDTH, GRID_HEIGHT } from './types';

// Build a grid from rows of chars. '.' = empty; otherwise map the letter.
const MAP: Record<string, ElementType> = {
  F: 'fire', W: 'water', O: 'wood', A: 'acid', S: 'stone', H: 'helium', X: 'ash',
};
function gridFrom(rows: string[]): Cell[][] {
  const g = createEmptyGrid();
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      g[y][x] = { element: ch === '.' ? null : MAP[ch], id: `${x}-${y}` };
    });
  });
  return g;
}
const piece = (shape: [number, number][], element: ElementType): DraggablePiece => ({
  id: 'p',
  shape: shape.map(([x, y]) => ({ x, y })),
  elements: shape.map(() => element),
});

describe('grid basics', () => {
  it('createEmptyGrid is 8x8 and empty', () => {
    const g = createEmptyGrid();
    expect(g).toHaveLength(GRID_HEIGHT);
    expect(g[0]).toHaveLength(GRID_WIDTH);
    expect(g.every(row => row.every(c => c.element === null))).toBe(true);
  });

  it('canPlacePieceAt: fits on empty, rejects overlap and out-of-bounds', () => {
    const g = createEmptyGrid();
    const single = piece([[0, 0]], 'stone');
    expect(canPlacePieceAt(g, single, { x: 0, y: 0 })).toBe(true);
    expect(canPlacePieceAt(g, single, { x: GRID_WIDTH, y: 0 })).toBe(false); // off grid
    g[0][0] = { element: 'stone', id: 'x' };
    expect(canPlacePieceAt(g, single, { x: 0, y: 0 })).toBe(false); // occupied
  });

  it('canAnyPieceFit: true on empty, false on a full board', () => {
    const single = piece([[0, 0]], 'stone');
    expect(canAnyPieceFit(createEmptyGrid(), [single])).toBe(true);
    const full = gridFrom(Array(GRID_HEIGHT).fill('SSSSSSSS'));
    expect(canAnyPieceFit(full, [single])).toBe(false);
  });
});

describe('clearLines', () => {
  it('clears a full row', () => {
    const g = gridFrom(['SSSSSSSS']);
    const { grid, linesCleared } = clearLines(g);
    expect(linesCleared).toBe(1);
    expect(grid[0].every(c => c.element === null)).toBe(true);
  });

  it('counts a full row and full column as two clears', () => {
    const rows = ['SSSSSSSS', ...Array(GRID_HEIGHT - 1).fill('S.......')];
    const { linesCleared } = clearLines(gridFrom(rows));
    expect(linesCleared).toBe(2); // row 0 + column 0
  });

  it('does nothing when no line is full', () => {
    const { linesCleared } = clearLines(gridFrom(['SSSSSSS.']));
    expect(linesCleared).toBe(0);
  });
});

describe('processReactions', () => {
  it('fire burns adjacent wood into ash; fire remains', () => {
    const { grid, reacted, reactionCount } = processReactions(gridFrom(['FO']));
    expect(reacted).toBe(true);
    expect(reactionCount).toBe(1);
    expect(grid[0][0].element).toBe('fire');
    expect(grid[0][1].element).toBe('ash');
  });

  it('fire + water mutually destroy', () => {
    const { grid, reacted } = processReactions(gridFrom(['FW']));
    expect(reacted).toBe(true);
    expect(grid[0][0].element).toBeNull();
    expect(grid[0][1].element).toBeNull();
  });

  it('acid dissolves one neighbour and consumes itself', () => {
    const { grid } = processReactions(gridFrom(['AO']));
    expect(grid[0][0].element).toBeNull(); // acid gone
    expect(grid[0][1].element).toBeNull(); // wood gone
  });

  it('stone and helium are immune to acid', () => {
    const { reacted } = processReactions(gridFrom(['AS']));
    expect(reacted).toBe(false);
  });
});

describe('resolveGrid (scoring + chaining)', () => {
  it('scores 100 for a single line clear', () => {
    const { totalScore, linesCleared, maxCombo } = resolveGrid(gridFrom(['SSSSSSSS']));
    expect(linesCleared).toBe(1);
    expect(totalScore).toBe(100);
    expect(maxCombo).toBe(1);
  });

  it('scores 300 for clearing two lines at once', () => {
    const { totalScore, linesCleared } = resolveGrid(gridFrom(['SSSSSSSS', 'SSSSSSSS']));
    expect(linesCleared).toBe(2);
    expect(totalScore).toBe(300);
  });

  it('adds a reaction bonus when elements react', () => {
    const { totalScore, allReactionEvents } = resolveGrid(gridFrom(['FO']));
    expect(allReactionEvents.length).toBeGreaterThan(0);
    expect(totalScore).toBe(50); // one burn, no lines
  });
});

describe('getComboText', () => {
  it('escalates with combo and lines', () => {
    expect(getComboText(4, 0)).toBe('LEGENDARY!');
    expect(getComboText(2, 0)).toBe('AMAZING!');
    expect(getComboText(0, 2)).toBe('GREAT!');
    expect(getComboText(0, 1)).toBe('NICE!');
  });
});

describe('getReactionPreview', () => {
  it('previews a burn when a fire piece sits next to wood', () => {
    const g = gridFrom(['.O']);
    const previews = getReactionPreview(g, piece([[0, 0]], 'fire'), { x: 0, y: 0 });
    expect(previews.some(p => p.type === 'burn')).toBe(true);
  });
});

describe('findHint', () => {
  it('prefers a move that completes a line', () => {
    // Row 0 filled except the last cell; a single block there completes it.
    const g = gridFrom(['SSSSSSS.']);
    const hint = findHint(g, [piece([[0, 0]], 'stone')]);
    expect(hint).not.toBeNull();
    expect(hint!.pos).toEqual({ x: 7, y: 0 });
  });

  it('never points at the blocked (hazard) cell', () => {
    const g = createEmptyGrid();
    const hint = findHint(g, [piece([[0, 0]], 'stone')], { x: 0, y: 0 });
    expect(hint).not.toBeNull();
    expect(hint!.pos).not.toEqual({ x: 0, y: 0 });
  });

  it('returns null when nothing fits', () => {
    const full = gridFrom(Array(GRID_HEIGHT).fill('SSSSSSSS'));
    expect(findHint(full, [piece([[0, 0]], 'stone')])).toBeNull();
  });
});

describe('createRandomPiece', () => {
  it('produces a uniform-element piece with a valid shape', () => {
    for (let i = 0; i < 20; i++) {
      const p = createRandomPiece(0);
      expect(p.shape.length).toBeGreaterThan(0);
      expect(p.elements).toHaveLength(p.shape.length);
      expect(new Set(p.elements).size).toBe(1); // all same element
    }
  });
});
