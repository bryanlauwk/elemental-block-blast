import { useEffect, useState, useCallback } from "react";
import { Cell, GRID_WIDTH, GRID_HEIGHT, Position } from "@/game/types";

function pickEmptyCell(grid: Cell[][], avoid?: Position): Position | null {
  const empty: Position[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y]?.[x]?.element) continue;
      if (avoid && avoid.x === x && avoid.y === y) continue;
      empty.push({ x, y });
    }
  }
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

/**
 * Tracks a single critter cell that hops between EMPTY cells and acts as
 * a placement blocker. Returns the current critter position (or null when
 * the board is full) and a `bump` to force a re-roll (e.g. on line clear).
 */
export function useStageCritter(grid: Cell[][], clearSignal: number) {
  const [pos, setPos] = useState<Position | null>(() => pickEmptyCell(grid));
  const [facing, setFacing] = useState<1 | -1>(1);

  // If the cell the critter sits on becomes filled (shouldn't really happen
  // since we block it, but guard anyway), hop to a fresh empty cell.
  useEffect(() => {
    if (pos && grid[pos.y]?.[pos.x]?.element) {
      const next = pickEmptyCell(grid, pos);
      if (next) {
        setFacing(next.x === pos.x ? facing : next.x > pos.x ? 1 : -1);
      }
      setPos(next);
    } else if (!pos) {
      const next = pickEmptyCell(grid);
      if (next) setPos(next);
    }
  }, [grid, pos, facing]);

  // Idle hops between empty cells every 3-4s.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setPos((prev) => {
        const next = pickEmptyCell(grid, prev ?? undefined);
        if (next && prev) {
          setFacing(next.x === prev.x ? facing : next.x > prev.x ? 1 : -1);
        }
        return next ?? prev;
      });
    }, 3000 + Math.random() * 1500);
    return () => window.clearTimeout(id);
  }, [pos, grid, facing]);

  // React to line clears: jump to a brand new empty cell.
  useEffect(() => {
    setPos((prev) => {
      const next = pickEmptyCell(grid, prev ?? undefined);
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