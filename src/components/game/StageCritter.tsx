import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, GRID_WIDTH, GRID_HEIGHT } from "@/game/types";
import { PhaseConfig } from "@/game/phases";
import { getCritterForPhase } from "@/game/critters";
import { playSound } from "@/game/sounds";

interface StageCritterProps {
  phase: PhaseConfig;
  grid: Cell[][];
  /** Increment to signal a line-clear / combo just happened. */
  clearSignal: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function pickTargetCell(grid: Cell[][]): { x: number; y: number } {
  const filled: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y]?.[x]?.element) filled.push({ x, y });
    }
  }
  const pool = filled.length > 0 ? filled : [];
  if (pool.length === 0) {
    return {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * A small phase-specific critter that scampers between cells inside the
 * play area. Purely cosmetic — `pointer-events: none`, never affects
 * placement or scoring.
 */
export function StageCritter({ phase, grid, clearSignal }: StageCritterProps) {
  const critter = getCritterForPhase(phase);
  const reduce = prefersReducedMotion();

  const [pos, setPos] = useState(() => pickTargetCell(grid));
  const [facing, setFacing] = useState<1 | -1>(1);
  const [reacted, setReacted] = useState(0);
  const lastClear = useRef(clearSignal);

  // Hop on a randomized cadence.
  useEffect(() => {
    const tick = () => {
      setPos((prev) => {
        const next = pickTargetCell(grid);
        setFacing(next.x === prev.x ? facing : next.x > prev.x ? 1 : -1);
        return next;
      });
    };
    const delay = reduce ? 6000 : 2500 + Math.random() * 1500;
    const id = window.setTimeout(tick, delay);
    return () => window.clearTimeout(id);
  }, [pos, grid, reduce, facing]);

  // React to line clears: jump, squeak, hop to a fresh cell.
  useEffect(() => {
    if (clearSignal === lastClear.current) return;
    lastClear.current = clearSignal;
    setReacted((r) => r + 1);
    setPos((prev) => {
      const next = pickTargetCell(grid);
      setFacing(next.x === prev.x ? facing : next.x > prev.x ? 1 : -1);
      return next;
    });
    try {
      playSound("select");
    } catch {
      /* ignore */
    }
  }, [clearSignal, grid, facing]);

  const leftPct = ((pos.x + 0.5) / GRID_WIDTH) * 100;
  const topPct = ((pos.y + 0.5) / GRID_HEIGHT) * 100;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      <motion.div
        className="absolute"
        animate={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
        }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 22 }
        }
        style={{ translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          key={`${pos.x}-${pos.y}`}
          initial={reduce ? false : { scale: 0.7, y: -6 }}
          animate={reduce ? {} : { scale: [0.85, 1.1, 1], y: [-6, 0, 0] }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            transform: `scaleX(${facing})`,
            filter: `drop-shadow(0 4px 6px hsl(${phase.accent} / 0.55))`,
          }}
          className="text-2xl sm:text-3xl select-none leading-none"
        >
          {critter.emoji}
        </motion.div>

        {/* Speech bubble on line clears */}
        <AnimatePresence>
          {reacted > 0 && (
            <motion.span
              key={reacted}
              initial={{ opacity: 0, scale: 0.6, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -18 }}
              exit={{ opacity: 0, scale: 0.6, y: -28 }}
              transition={{ duration: 0.6 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold"
              style={{
                background: `hsl(${phase.accent})`,
                color: "hsl(220 60% 10%)",
                boxShadow: `0 2px 0 hsl(${phase.stageTo})`,
              }}
            >
              {critter.squeak}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default StageCritter;