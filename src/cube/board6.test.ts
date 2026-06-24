import { describe, it, expect, vi } from 'vitest';

vi.mock('@/game/sounds', () => ({ playSound: () => {} }));

import { CBoard, FACE, emptyBoard, canPlace, place, resolve6 } from './board6';
import { ElementType, Position } from '@/game/types';

const MAP: Record<string, ElementType> = {
  F: 'fire', W: 'water', O: 'wood', A: 'acid', S: 'stone', G: 'gold', C: 'goldCracked', X: 'ash',
};
// rows are 6 chars wide; '.' = empty
function boardFrom(rows: string[]): CBoard {
  const b = emptyBoard();
  rows.forEach((row, y) => [...row].forEach((ch, x) => { b[y][x] = ch === '.' ? null : MAP[ch]; }));
  return b;
}
const piece = (shape: [number, number][], element: ElementType) => ({
  id: 'p', shape: shape.map(([x, y]) => ({ x, y } as Position)), element,
});

describe('board6 basics', () => {
  it('is 6x6', () => {
    const b = emptyBoard();
    expect(b.length).toBe(FACE);
    expect(b[0].length).toBe(FACE);
  });
  it('canPlace respects bounds and occupancy', () => {
    const b = boardFrom(['S.....']);
    expect(canPlace(b, piece([[0, 0]], 'fire'), 0, 0)).toBe(false); // occupied
    expect(canPlace(b, piece([[0, 0]], 'fire'), 1, 0)).toBe(true);
    expect(canPlace(b, piece([[0, 0]], 'fire'), 6, 0)).toBe(false); // off-grid
  });
});

describe('resolve6', () => {
  it('clears a full row and awards the perfect-clear bonus on an empty board', () => {
    const { lines, perfectClear, gained } = resolve6(boardFrom(['SSSSSS']));
    expect(lines).toBe(1);
    expect(perfectClear).toBe(true);
    expect(gained).toBe(1100); // 100 line + 1000 perfect clear
  });

  it('wildfire burns a connected wood cluster to ash', () => {
    const { board, reactions } = resolve6(boardFrom(['FOO', '.O.']));
    expect(reactions).toBe(3);
    expect(board[0][1]).toBe('ash');
    expect(board[0][2]).toBe('ash');
    expect(board[1][1]).toBe('ash');
    expect(board[0][0]).toBe('fire');
  });

  it('fire + water mutually destroy', () => {
    const { board } = resolve6(boardFrom(['FW']));
    expect(board[0][0]).toBeNull();
    expect(board[0][1]).toBeNull();
  });

  it('gold only cracks on the first line clear', () => {
    const { board, perfectClear } = resolve6(boardFrom(['GSSSSS', 'S.....']));
    expect(board[0][0]).toBe('goldCracked');
    expect(perfectClear).toBe(false);
  });
});

describe('place', () => {
  it('writes the piece element into the board', () => {
    const b = place(emptyBoard(), piece([[0, 0], [1, 0]], 'stone'), 2, 3);
    expect(b[3][2]).toBe('stone');
    expect(b[3][3]).toBe('stone');
  });
});
