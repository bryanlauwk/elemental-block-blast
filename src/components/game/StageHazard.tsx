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

// A soft white gloss arc along the top rim — gives every hole the Pixar
// "toy" highlight so it reads as a dimensional object, not a flat circle.
const Gloss = () => (
  <path
    d="M22 42 Q50 24 78 42"
    fill="none"
    stroke="hsl(0 0% 100%)"
    strokeOpacity="0.5"
    strokeWidth="4"
    strokeLinecap="round"
  />
);

// Inline animated SVG "hole" per variant. Continuous motion comes from CSS
// classes (hz-*) so it's cheap and respects prefers-reduced-motion.
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
  const a = (cls: string) => (reduce ? "hz-el" : `hz-el ${cls}`);

  if (variant === "lava") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={`${uid}-lava`} cx="50%" cy="56%" r="56%">
            <stop offset="0%" stopColor="hsl(52 100% 78%)" />
            <stop offset="40%" stopColor="hsl(28 100% 56%)" />
            <stop offset="80%" stopColor="hsl(12 90% 38%)" />
            <stop offset="100%" stopColor="hsl(10 80% 22%)" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <ellipse cx="50" cy="55" rx="40" ry="35" />
          </clipPath>
        </defs>
        {/* outer warm glow */}
        <ellipse className={a("hz-pulse")} cx="50" cy="55" rx="47" ry="42" fill={glow} opacity="0.25" />
        {/* molten pool */}
        <ellipse cx="50" cy="55" rx="40" ry="35" fill={`url(#${uid}-lava)`} />
        {/* rising bubbles, clipped to the pool */}
        <g clipPath={`url(#${uid}-clip)`}>
          {[
            { x: 38, r: 4, d: "0s" },
            { x: 56, r: 5, d: "0.9s" },
            { x: 48, r: 3, d: "1.7s" },
          ].map((b, i) => (
            <circle
              key={i}
              className={a("hz-bubble")}
              cx={b.x}
              cy="68"
              r={b.r}
              fill="hsl(52 100% 80%)"
              style={{ animationDelay: b.d }}
            />
          ))}
        </g>
        {/* rocky rim + gloss */}
        <ellipse cx="50" cy="51" rx="41" ry="35.5" fill="none" stroke="hsl(14 55% 14%)" strokeWidth="5" />
        <Gloss />
      </svg>
    );
  }

  if (variant === "void") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={`${uid}-void`} cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="#000" />
            <stop offset="70%" stopColor="#000" />
            <stop offset="100%" stopColor={dark} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className={a("hz-pulse")} cx="50" cy="50" rx="47" ry="44" fill={glow} opacity="0.3" />
        <ellipse cx="50" cy="50" rx="42" ry="39" fill={`url(#${uid}-void)`} />
        {/* swirling portal rings */}
        <g className={a("hz-spin")}>
          <ellipse cx="50" cy="50" rx="36" ry="32" fill="none" stroke={accent} strokeOpacity="0.85" strokeWidth="3" strokeDasharray="6 10 20 8" />
          <circle cx="50" cy="18" r="2.4" fill="hsl(0 0% 100%)" />
          <circle cx="84" cy="54" r="1.8" fill={glow} />
        </g>
        <g className={a("hz-spin-rev")}>
          <ellipse cx="50" cy="50" rx="26" ry="22" fill="none" stroke={glow} strokeOpacity="0.6" strokeWidth="2.5" strokeDasharray="4 12" />
        </g>
        <Gloss />
      </svg>
    );
  }

  if (variant === "cloud") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={`${uid}-cloud`} cx="50%" cy="55%" r="58%">
            <stop offset="0%" stopColor="hsl(210 85% 52%)" stopOpacity="0.7" />
            <stop offset="62%" stopColor="hsl(205 60% 75%)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* the airy gap */}
        <ellipse cx="50" cy="54" rx="40" ry="34" fill={`url(#${uid}-cloud)`} />
        {/* puffy ring of cloud lobes, gently turning */}
        <g className={a("hz-spin")} opacity="0.95">
          {Array.from({ length: 8 }).map((_, i) => {
            const ang = (i / 8) * Math.PI * 2;
            const cx = 50 + Math.cos(ang) * 38;
            const cy = 53 + Math.sin(ang) * 32;
            return <circle key={i} cx={cx} cy={cy} r={i % 2 ? 11 : 8} fill="hsl(0 0% 100%)" opacity="0.92" />;
          })}
        </g>
        {/* drifting wisps */}
        <circle className={a("hz-bob")} cx="40" cy="52" r="3" fill="hsl(0 0% 100%)" opacity="0.8" style={{ animationDelay: "0.4s" }} />
        <circle className={a("hz-bob")} cx="60" cy="58" r="2.4" fill="hsl(0 0% 100%)" opacity="0.7" style={{ animationDelay: "1.1s" }} />
      </svg>
    );
  }

  // "pit" — dark sunken hole that gently breathes, with a tumbling pebble.
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      <defs>
        <radialGradient id={`${uid}-pit`} cx="50%" cy="60%" r="58%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.95" />
          <stop offset="58%" stopColor="#000" stopOpacity="0.78" />
          <stop offset="100%" stopColor={dark} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={a("hz-breathe")}>
        {/* themed rim glow */}
        <ellipse cx="50" cy="53" rx="44" ry="38" fill={accent} opacity="0.16" />
        {/* the opening */}
        <ellipse cx="50" cy="55" rx="40" ry="34" fill={`url(#${uid}-pit)`} />
        {/* crisp dark lip + themed rim + gloss */}
        <ellipse cx="50" cy="51" rx="40" ry="34" fill="none" stroke="#000" strokeOpacity="0.55" strokeWidth="3.5" />
        <ellipse cx="50" cy="52" rx="37" ry="31" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="2.5" />
        <Gloss />
      </g>
      {/* a pebble tumbling into the hole */}
      <circle className={a("hz-fall")} cx="46" cy="50" r="2.6" fill={accent} opacity="0.8" />
    </svg>
  );
}

/**
 * Visual layer for the per-phase terrain hazard. Position is controlled by
 * useStageHazard so placement validation uses the same cell. The hole forms
 * in place when it relocates (no bouncing, no sound) and then animates idly.
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
          initial={reduce ? false : { scale: 0.4, opacity: 0, y: -4 }}
          animate={reduce ? {} : { scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 leading-none"
        >
          <HoleSvg variant={variant} phase={phase} reduce={reduce} />
        </motion.div>
      </div>
    </div>
  );
}

export default StageHazard;
