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
  // Prefer cells the hazard is allowed to sit on (i.e. that don't block the
  // player's only remaining move); fall back to any empty cell if none qualify.
  const allowed = canOccupy ? empty.filter((p) => canOccupy(p)) : empty;
  const pool = allowed.length > 0 ? allowed : empty;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Tracks a single terrain-hazard cell that blocks placement. It stays put
 * (terrain-like) and only relocates when a line clears, when its cell gets
 * filled, or when it would otherwise block the player's only legal move.
 *
 * `canOccupy` lets the caller veto cells, which keeps the hazard from sitting
 * on the player's only move.
 */
export function useStageHazard(
  grid: Cell[][],
  clearSignal: number,
  canOccupy?: CanOccupy,
) {
  const [pos, setPos] = useState<Position | null>(() => pickEmptyCell(grid));

  // If the hazard's cell becomes filled, or it now blocks the only move,
  // relocate to a fresh allowed cell.
  useEffect(() => {
    const sittingFilled = pos && grid[pos.y]?.[pos.x]?.element;
    const blockingOnlyMove = pos && canOccupy && !canOccupy(pos);
    if (sittingFilled || blockingOnlyMove) {
      const next = pickEmptyCell(grid, pos ?? undefined, canOccupy);
      if (next) setPos(next);
    } else if (!pos) {
      const next = pickEmptyCell(grid, undefined, canOccupy);
      if (next) setPos(next);
    }
  }, [grid, pos, canOccupy]);

  // Reshape the terrain on line clears: move to a brand new empty cell.
  useEffect(() => {
    setPos((prev) => pickEmptyCell(grid, prev ?? undefined, canOccupy) ?? prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal]);

  const isBlocked = useCallback(
    (x: number, y: number) => !!pos && pos.x === x && pos.y === y,
    [pos],
  );

  return { pos, isBlocked };
}
