import { motion } from "framer-motion";
import { GRID_WIDTH, GRID_HEIGHT, Position } from "@/game/types";
import { PhaseConfig } from "@/game/phases";
import { getHazardForPhase, HazardVariant } from "@/game/hazards";

interface StageHazardProps {
  phase: PhaseConfig;
  pos: Position | null;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// Inline SVG "hole" per variant — a quiet, themed depression in the board.
function HoleSvg({
  variant,
  phase,
  reduce,
}: {
  variant: HazardVariant;
  phase: PhaseConfig;
  reduce: boolean;
}) {
  const uid = `hz${phase.id}`;
  const dark = `hsl(${phase.stageTo})`;
  const accent = `hsl(${phase.accent})`;
  const glow = `hsl(${phase.glow})`;

  if (variant === "lava") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <radialGradient id={`${uid}-lava`} cx="50%" cy="56%" r="55%">
            <stop offset="0%" stopColor="hsl(48 100% 72%)" />
            <stop offset="42%" stopColor="hsl(22 100% 52%)" />
            <stop offset="82%" stopColor="hsl(10 75% 22%)" />
            <stop offset="100%" stopColor="hsl(10 75% 18%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="55" rx="41" ry="36" fill={`url(#${uid}-lava)`} />
        <ellipse cx="50" cy="51" rx="41" ry="35" fill="none" stroke="hsl(12 45% 12%)" strokeWidth="4" />
        <motion.ellipse
          cx="50"
          cy="55"
          rx="20"
          ry="15"
          fill="hsl(50 100% 78%)"
          initial={false}
          animate={reduce ? { opacity: 0.7 } : { opacity: [0.45, 0.85, 0.45] }}
          transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }

  if (variant === "void") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <radialGradient id={`${uid}-void`} cx="50%" cy="52%" r="55%">
            <stop offset="0%" stopColor="#000" />
            <stop offset="68%" stopColor="#000" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="52" rx="42" ry="37" fill={`url(#${uid}-void)`} />
        <ellipse cx="50" cy="50" rx="36" ry="31" fill="none" stroke={accent} strokeOpacity="0.75" strokeWidth="3" />
        <ellipse cx="50" cy="49" rx="42" ry="36" fill="none" stroke={glow} strokeOpacity="0.35" strokeWidth="2" />
      </svg>
    );
  }

  if (variant === "cloud") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <radialGradient id={`${uid}-cloud`} cx="50%" cy="56%" r="58%">
            <stop offset="0%" stopColor="hsl(210 80% 50%)" stopOpacity="0.6" />
            <stop offset="58%" stopColor="hsl(0 0% 100%)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="55" rx="41" ry="35" fill={`url(#${uid}-cloud)`} />
        <ellipse cx="50" cy="52" rx="39" ry="33" fill="none" stroke="hsl(0 0% 100%)" strokeOpacity="0.5" strokeWidth="3" />
      </svg>
    );
  }

  // "pit" — dark sunken hole (pot hole / slump / sinkhole)
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id={`${uid}-pit`} cx="50%" cy="60%" r="58%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.92" />
          <stop offset="62%" stopColor={dark} stopOpacity="0.85" />
          <stop offset="100%" stopColor={dark} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="55" rx="40" ry="35" fill={`url(#${uid}-pit)`} />
      <ellipse cx="50" cy="50" rx="40" ry="34" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="3" />
      <ellipse cx="50" cy="52" rx="38" ry="32" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Visual layer for the per-phase terrain hazard. Position is controlled by
 * useStageHazard so placement validation uses the same cell. The hole simply
 * fades/forms in place when it relocates — no bouncing, no sound.
 */
export function StageHazard({ phase, pos }: StageHazardProps) {
  const reduce = prefersReducedMotion();
  const { variant } = getHazardForPhase(phase);

  if (!pos) return null;

  const leftPct = ((pos.x + 0.5) / GRID_WIDTH) * 100;
  const topPct = ((pos.y + 0.5) / GRID_HEIGHT) * 100;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div className="absolute" style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: "translate(-50%, -50%)" }}>
        <motion.div
          key={`${pos.x}-${pos.y}`}
          initial={reduce ? false : { scale: 0.55, opacity: 0 }}
          animate={reduce ? {} : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 leading-none"
        >
          <HoleSvg variant={variant} phase={phase} reduce={reduce} />
        </motion.div>
      </div>
    </div>
  );
}

export default StageHazard;
