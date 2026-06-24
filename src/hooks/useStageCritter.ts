import { useEffect, useState, useCallback } from "react";
import { Cell, GRID_WIDTH, GRID_HEIGHT, Position } from "@/game/types";

type CanOccupy = (pos: Position) => boolean;

function pickEmptyCell(
  grid: Cell[][],
  avoid?: Position,
  canOccupy?: CanOccupy,
): Position | null {
  const empty: Position[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y]?.[x]?.element) continue;
      if (avoid && avoid.x === x && avoid.y === y) continue;
      empty.push({ x, y });
    }
  }
  if (empty.length === 0) return null;
  // Prefer cells the critter is allowed to sit on (i.e. that don't block the
  // player's only remaining move); fall back to any empty cell if none qualify.
  const allowed = canOccupy ? empty.filter((p) => canOccupy(p)) : empty;
  const pool = allowed.length > 0 ? allowed : empty;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Tracks a single critter cell that hops between EMPTY cells and acts as
 * a placement blocker. Returns the current critter position (or null when
 * the board is full).
 *
 * `canOccupy` lets the caller veto cells, which keeps the critter from
 * parking on the player's only legal move.
 */
export function useStageCritter(
  grid: Cell[][],
  clearSignal: number,
  canOccupy?: CanOccupy,
) {
  const [pos, setPos] = useState<Position | null>(() => pickEmptyCell(grid));
  const [facing, setFacing] = useState<1 | -1>(1);

  // If the cell the critter sits on becomes filled, or it now blocks the
  // player's only move, hop to a fresh allowed cell.
  useEffect(() => {
    const sittingFilled = pos && grid[pos.y]?.[pos.x]?.element;
    const blockingOnlyMove = pos && canOccupy && !canOccupy(pos);
    if (sittingFilled || blockingOnlyMove) {
      const next = pickEmptyCell(grid, pos ?? undefined, canOccupy);
      if (next && pos) {
        setFacing(next.x === pos.x ? facing : next.x > pos.x ? 1 : -1);
      }
      if (next) setPos(next);
    } else if (!pos) {
      const next = pickEmptyCell(grid, undefined, canOccupy);
      if (next) setPos(next);
    }
  }, [grid, pos, facing, canOccupy]);

  // Idle hops between empty cells every 3-4s.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setPos((prev) => {
        const next = pickEmptyCell(grid, prev ?? undefined, canOccupy);
        if (next && prev) {
          setFacing(next.x === prev.x ? facing : next.x > prev.x ? 1 : -1);
        }
        return next ?? prev;
      });
    }, 3000 + Math.random() * 1500);
    return () => window.clearTimeout(id);
  }, [pos, grid, facing, canOccupy]);

  // React to line clears: jump to a brand new empty cell.
  useEffect(() => {
    setPos((prev) => {
      const next = pickEmptyCell(grid, prev ?? undefined, canOccupy);
      if (next && prev) {
        setFacing(next.x === prev.x ? facing : next.x > prev.x ? 1 : -1);
      }
      return next ?? prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal]);

  const isBlocked = useCallback(
    (x: number, y: number) => !!pos && pos.x === x && pos.y === y,
    [pos],
  );

  return { pos, facing, isBlocked };
}
