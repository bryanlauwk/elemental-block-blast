import { motion } from "framer-motion";
import { ReactNode } from "react";
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

const R = 22; // corner radius (matches the rounded grid cell)

/**
 * A rounded-square hole carved INTO the cell: an inverse bevel (dark top
 * edge, lit bottom lip), a top inner shadow for concavity, and a pool of
 * light at the bottom — so it reads as a 3D depression in the board, not a
 * sticker on top. `floor` is the variant-specific content at the bottom.
 */
function CarvedHole({
  uid,
  accent,
  glow,
  floor,
}: {
  uid: string;
  accent: string;
  glow: string;
  floor: ReactNode;
}) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      <defs>
        <clipPath id={`${uid}-in`}>
          <rect x="7" y="7" width="86" height="86" rx={R} />
        </clipPath>
        {/* concave top inner shadow */}
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.9" />
          <stop offset="42%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        {/* inverse rim bevel: dark at top (recessed), lit at bottom (lip) */}
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.85" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* depth base */}
      <rect x="7" y="7" width="86" height="86" rx={R} fill="#080910" />

      {/* variant floor + seating shadows, clipped to the opening */}
      <g clipPath={`url(#${uid}-in)`}>
        {floor}
        <rect x="7" y="7" width="86" height="86" fill={`url(#${uid}-top)`} />
        <ellipse cx="50" cy="90" rx="42" ry="16" fill={glow} opacity="0.22" />
      </g>

      {/* carved rim bevel + faint accent inner line */}
      <rect x="7" y="7" width="86" height="86" rx={R} fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="3.5" />
      <rect x="10" y="10" width="80" height="80" rx={R - 2} fill="none" stroke={accent} strokeOpacity="0.3" strokeWidth="1.2" />
    </svg>
  );
}

// Inline animated SVG floor per variant.
function HoleSvg({ variant, phase, reduce }: { variant: HazardVariant; phase: PhaseConfig; reduce: boolean }) {
  const uid = `hz${phase.id}`;
  const accent = `hsl(${phase.accent})`;
  const glow = `hsl(${phase.glow})`;
  const a = (cls: string) => (reduce ? "hz-el" : `hz-el ${cls}`);

  if (variant === "lava") {
    return (
      <CarvedHole
        uid={uid}
        accent="hsl(20 90% 45%)"
        glow="hsl(30 100% 55%)"
        floor={
          <>
            <defs>
              <radialGradient id={`${uid}-lava`} cx="50%" cy="72%" r="62%">
                <stop offset="0%" stopColor="hsl(52 100% 80%)" />
                <stop offset="38%" stopColor="hsl(30 100% 56%)" />
                <stop offset="74%" stopColor="hsl(12 92% 40%)" />
                <stop offset="100%" stopColor="hsl(8 85% 20%)" />
              </radialGradient>
            </defs>
            <rect x="7" y="7" width="86" height="86" fill={`url(#${uid}-lava)`} />
            {/* churning molten surface */}
            <ellipse className={a("hz-churn")} cx="50" cy="60" rx="34" ry="12" fill="hsl(45 100% 68%)" opacity="0.4" />
            {/* boiling bubbles */}
            {[
              { x: 34, r: 4, d: "0s" },
              { x: 46, r: 5.5, d: "0.7s" },
              { x: 58, r: 3.5, d: "1.3s" },
              { x: 66, r: 4.5, d: "1.9s" },
              { x: 40, r: 3, d: "2.4s" },
            ].map((b, i) => (
              <circle key={i} className={a("hz-bubble")} cx={b.x} cy="78" r={b.r} fill="hsl(52 100% 82%)" style={{ animationDelay: b.d }} />
            ))}
          </>
        }
      />
    );
  }

  if (variant === "void") {
    return (
      <CarvedHole
        uid={uid}
        accent={accent}
        glow={glow}
        floor={
          <>
            {/* infinite-depth tunnel: rings receding inward */}
            {[0, 1, 2].map((i) => (
              <ellipse
                key={i}
                className={a("hz-recede")}
                cx="50"
                cy="50"
                rx="40"
                ry="36"
                fill="none"
                stroke={i % 2 ? glow : accent}
                strokeWidth="3"
                strokeOpacity="0.8"
                style={{ animationDelay: `${i}s` }}
              />
            ))}
            {/* slow swirl */}
            <g className={a("hz-spin")}>
              <ellipse cx="50" cy="50" rx="30" ry="26" fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="2.5" strokeDasharray="5 12 18 6" />
              <circle cx="50" cy="22" r="2" fill="#fff" />
            </g>
            <circle className={a("hz-pulse")} cx="50" cy="50" r="8" fill={glow} opacity="0.7" />
          </>
        }
      />
    );
  }

  if (variant === "cloud") {
    return (
      <CarvedHole
        uid={uid}
        accent="hsl(205 90% 70%)"
        glow="hsl(205 90% 78%)"
        floor={
          <>
            <defs>
              <radialGradient id={`${uid}-cloud`} cx="50%" cy="64%" r="62%">
                <stop offset="0%" stopColor="hsl(210 85% 58%)" />
                <stop offset="60%" stopColor="hsl(205 70% 78%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0.15" />
              </radialGradient>
            </defs>
            <rect x="7" y="7" width="86" height="86" fill={`url(#${uid}-cloud)`} />
            {/* downdraft swirl of wisps */}
            <g className={a("hz-spin")}>
              {Array.from({ length: 6 }).map((_, i) => {
                const ang = (i / 6) * Math.PI * 2;
                const cx = 50 + Math.cos(ang) * 24;
                const cy = 52 + Math.sin(ang) * 20;
                return <circle key={i} cx={cx} cy={cy} r={i % 2 ? 7 : 5} fill="hsl(0 0% 100%)" opacity="0.8" />;
              })}
            </g>
            {[0, 1, 2].map((i) => (
              <ellipse key={i} className={a("hz-recede")} cx="50" cy="52" rx="30" ry="26" fill="none" stroke="hsl(0 0% 100%)" strokeOpacity="0.5" strokeWidth="2" style={{ animationDelay: `${i}s` }} />
            ))}
          </>
        }
      />
    );
  }

  // "pit" — dark hollow with tumbling pebbles and a faint earthy floor.
  return (
    <CarvedHole
      uid={uid}
      accent={accent}
      glow={accent}
      floor={
        <>
          <defs>
            <radialGradient id={`${uid}-pit`} cx="50%" cy="74%" r="60%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
              <stop offset="55%" stopColor="#0b0c14" />
              <stop offset="100%" stopColor="#050609" />
            </radialGradient>
          </defs>
          <rect x="7" y="7" width="86" height="86" fill={`url(#${uid}-pit)`} />
          {/* pebbles tumbling in */}
          <circle className={a("hz-fall")} cx="42" cy="40" r="2.6" fill={accent} opacity="0.85" style={{ animationDelay: "0s" }} />
          <circle className={a("hz-fall")} cx="58" cy="40" r="2" fill={accent} opacity="0.6" style={{ animationDelay: "1.4s" }} />
          {/* faint dust pulse near the floor */}
          <ellipse className={a("hz-pulse")} cx="50" cy="74" rx="22" ry="7" fill={accent} opacity="0.18" />
        </>
      }
    />
  );
}

/**
 * Visual layer for the per-phase terrain hazard. Position is controlled by
 * useStageHazard so placement validation uses the same cell. The hole sinks
 * into place when it relocates (no bouncing, no sound) and animates idly.
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
          initial={reduce ? false : { scale: 0.3, opacity: 0 }}
          animate={reduce ? {} : { scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11 leading-none"
        >
          <HoleSvg variant={variant} phase={phase} reduce={reduce} />
        </motion.div>
      </div>
    </div>
  );
}

export default StageHazard;
