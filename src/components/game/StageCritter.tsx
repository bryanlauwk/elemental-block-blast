import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { GRID_WIDTH, GRID_HEIGHT, Position } from "@/game/types";
import { PhaseConfig } from "@/game/phases";
import { getCritterForPhase } from "@/game/critters";
import { playSound } from "@/game/sounds";

interface StageCritterProps {
  phase: PhaseConfig;
  pos: Position | null;
  facing: 1 | -1;
  /** Increments when a line clear happens — triggers a quick reaction. */
  clearSignal: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Visual layer for the per-phase critter. Position is controlled by
 * `useStageCritter` so placement validation can use the same cell.
 */
export function StageCritter({ phase, pos, facing, clearSignal }: StageCritterProps) {
  const critter = getCritterForPhase(phase);
  const reduce = prefersReducedMotion();
  const [reacted, setReacted] = useState(0);
  const lastClear = useRef(clearSignal);

  useEffect(() => {
    if (clearSignal === lastClear.current) return;
    lastClear.current = clearSignal;
    setReacted((r) => r + 1);
    try {
      playSound("select");
    } catch {
      /* ignore */
    }
  }, [clearSignal]);

  if (!pos) return null;

  const leftPct = ((pos.x + 0.5) / GRID_WIDTH) * 100;
  const topPct = ((pos.y + 0.5) / GRID_HEIGHT) * 100;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      <motion.div
        className="absolute"
        animate={{ left: `${leftPct}%`, top: `${topPct}%` }}
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
          className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 select-none leading-none"
        >
          <img
            src={critter.image}
            alt=""
            width={512}
            height={512}
            loading="lazy"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </motion.div>

        <AnimatePresence>
          {reacted > 0 && (
            <motion.span
              key={reacted}
              initial={{ opacity: 0, scale: 0.6, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -22 }}
              exit={{ opacity: 0, scale: 0.6, y: -32 }}
              transition={{ duration: 0.6 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold whitespace-nowrap"
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