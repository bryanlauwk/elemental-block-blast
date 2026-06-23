import { PhaseConfig, PhaseScene } from "@/game/phases";

interface StageSceneProps {
  phase: PhaseConfig;
}

// Painterly, fully CSS/SVG scenic backdrops — one per universe. Detail is
// concentrated toward the edges and lower half so the centered board and the
// top HUD stay readable. The animated decorations (gears, clouds, embers,
// crystals, stars) live on a separate layer above this.
const SCENE_SVG: Record<PhaseScene, (p: PhaseConfig) => JSX.Element> = {
  // ── Sandbox: soft dawn meadow of rolling toy-box hills ──
  sandbox: (p) => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="sb-sun" cx="72%" cy="22%" r="40%">
          <stop offset="0%" stopColor={`hsl(${p.glow})`} stopOpacity="0.55" />
          <stop offset="100%" stopColor={`hsl(${p.glow})`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill={`hsl(${p.glow})`} opacity="0" />
      <rect width="1200" height="800" fill="url(#sb-sun)" />
      <circle cx="864" cy="176" r="70" fill="hsl(48 100% 75%)" opacity="0.7" />
      {/* layered rolling hills */}
      <path d="M0 560 Q300 470 620 540 T1200 520 V800 H0 Z" fill={`hsl(${p.accent})`} opacity="0.18" />
      <path d="M0 640 Q360 560 720 630 T1200 610 V800 H0 Z" fill={`hsl(${p.accent})`} opacity="0.28" />
      <path d="M0 720 Q300 660 640 716 T1200 700 V800 H0 Z" fill="hsl(220 50% 14%)" opacity="0.6" />
    </svg>
  ),

  // ── Toy Factory: warm machinery silhouette with glowing windows ──
  factory: (p) => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="tf-haze" cx="50%" cy="92%" r="65%">
          <stop offset="0%" stopColor={`hsl(${p.glow})`} stopOpacity="0.5" />
          <stop offset="100%" stopColor={`hsl(${p.glow})`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#tf-haze)" />
      {/* back machinery blocks */}
      <g fill="hsl(24 45% 12%)" opacity="0.85">
        <rect x="-20" y="430" width="240" height="370" rx="8" />
        <rect x="250" y="500" width="180" height="300" rx="8" />
        <rect x="980" y="450" width="240" height="350" rx="8" />
      </g>
      {/* pipes */}
      <g stroke="hsl(28 40% 18%)" strokeWidth="26" fill="none" opacity="0.8" strokeLinecap="round">
        <path d="M120 800 V560 H470" />
        <path d="M1080 800 V520 H760" />
      </g>
      {/* foreground building + glowing windows */}
      <rect x="430" y="560" width="360" height="240" rx="10" fill="hsl(22 50% 9%)" />
      <g fill={`hsl(${p.accent})`}>
        {[0, 1, 2, 3].map((c) =>
          [0, 1].map((r) => (
            <rect
              key={`${c}-${r}`}
              x={460 + c * 80}
              y={596 + r * 84}
              width="44"
              height="52"
              rx="4"
              opacity={0.55 + ((c + r) % 2) * 0.35}
            />
          ))
        )}
      </g>
      {/* smokestacks */}
      <rect x="540" y="470" width="40" height="100" fill="hsl(22 50% 9%)" />
      <rect x="660" y="500" width="40" height="70" fill="hsl(22 50% 9%)" />
    </svg>
  ),

  // ── Cloud City: bright sky with floating islands and cloud banks ──
  sky: (p) => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="sk-sun" cx="26%" cy="20%" r="42%">
          <stop offset="0%" stopColor="hsl(55 100% 88%)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="hsl(55 100% 88%)" stopOpacity="0" />
        </radialGradient>
        <filter id="sk-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect width="1200" height="800" fill="url(#sk-sun)" />
      {/* cloud banks */}
      <g fill="hsl(0 0% 100%)" opacity="0.5" filter="url(#sk-soft)">
        <ellipse cx="240" cy="300" rx="220" ry="56" />
        <ellipse cx="980" cy="220" rx="260" ry="60" />
        <ellipse cx="600" cy="700" rx="420" ry="90" />
      </g>
      {/* floating islands */}
      <g>
        <g transform="translate(180 470)">
          <ellipse cx="0" cy="0" rx="130" ry="34" fill="hsl(140 45% 32%)" opacity="0.55" />
          <path d="M-120 0 L-60 120 L70 110 L120 0 Z" fill="hsl(28 45% 22%)" opacity="0.55" />
        </g>
        <g transform="translate(960 540)">
          <ellipse cx="0" cy="0" rx="150" ry="38" fill="hsl(140 45% 32%)" opacity="0.6" />
          <path d="M-140 0 L-70 140 L80 130 L140 0 Z" fill="hsl(28 45% 22%)" opacity="0.6" />
        </g>
      </g>
    </svg>
  ),

  // ── Crystal Caverns: cave framing with glowing crystal clusters ──
  caverns: (p) => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="cv-glow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor={`hsl(${p.accent})`} stopOpacity="0.35" />
          <stop offset="100%" stopColor={`hsl(${p.accent})`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#cv-glow)" />
      {/* rock framing — top stalactites */}
      <path
        d="M0 0 H1200 V120 L1120 60 L1040 150 L960 70 L880 170 L780 80 L700 160 L600 70 L520 170 L430 80 L350 160 L260 70 L180 150 L90 70 L0 140 Z"
        fill="hsl(258 40% 8%)"
      />
      {/* bottom stalagmites */}
      <path
        d="M0 800 H1200 V690 L1110 760 L1030 660 L940 760 L850 670 L760 770 L660 680 L560 770 L470 670 L380 760 L290 680 L190 770 L100 680 L0 760 Z"
        fill="hsl(258 42% 7%)"
      />
      {/* glowing crystal clusters */}
      <g>
        <g transform="translate(220 560)">
          <path d="M0 0 L26 -90 L52 0 Z" fill={`hsl(${p.accent})`} opacity="0.75" />
          <path d="M34 6 L60 -120 L86 6 Z" fill={`hsl(${p.glow})`} opacity="0.8" />
          <path d="M66 0 L86 -70 L106 0 Z" fill={`hsl(${p.accent})`} opacity="0.6" />
        </g>
        <g transform="translate(900 600)">
          <path d="M0 0 L30 -110 L60 0 Z" fill={`hsl(${p.glow})`} opacity="0.8" />
          <path d="M44 6 L70 -150 L96 6 Z" fill={`hsl(${p.accent})`} opacity="0.7" />
          <path d="M84 0 L108 -84 L132 0 Z" fill={`hsl(${p.glow})`} opacity="0.6" />
        </g>
      </g>
    </svg>
  ),

  // ── Volcano Run: erupting peak, lava cracks and layered ridges ──
  volcano: (p) => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="vl-sky" cx="50%" cy="78%" r="60%">
          <stop offset="0%" stopColor={`hsl(${p.glow})`} stopOpacity="0.55" />
          <stop offset="100%" stopColor={`hsl(${p.glow})`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#vl-sky)" />
      {/* distant ridges */}
      <path d="M0 540 L260 430 L470 540 L700 410 L960 540 L1200 450 V800 H0 Z" fill="hsl(8 45% 14%)" opacity="0.7" />
      {/* volcano — offset right so its glowing crater reads beside the board */}
      <path d="M600 800 L880 360 L1160 800 Z" fill="hsl(10 50% 10%)" />
      {/* lava at crater + flows */}
      <path d="M820 470 L880 360 L940 470 Q880 500 820 470 Z" fill="hsl(38 100% 60%)" opacity="0.95" />
      <g stroke="hsl(20 100% 55%)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M880 430 L852 560 L880 690" />
        <path d="M880 470 L928 600 L908 760" />
      </g>
      {/* foreground ridge */}
      <path d="M0 720 L240 650 L520 730 L820 650 L1200 720 V800 H0 Z" fill="hsl(10 55% 7%)" />
    </svg>
  ),

  // ── Cosmic Void: nebula clouds, ringed planet and a moon ──
  cosmos: (p) => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="cs-neb1" cx="28%" cy="70%" r="45%">
          <stop offset="0%" stopColor={`hsl(${p.glow})`} stopOpacity="0.5" />
          <stop offset="100%" stopColor={`hsl(${p.glow})`} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-neb2" cx="78%" cy="30%" r="42%">
          <stop offset="0%" stopColor={`hsl(${p.accent})`} stopOpacity="0.45" />
          <stop offset="100%" stopColor={`hsl(${p.accent})`} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-planet" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor={`hsl(${p.accent})`} />
          <stop offset="100%" stopColor="hsl(250 70% 12%)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#cs-neb1)" />
      <rect width="1200" height="800" fill="url(#cs-neb2)" />
      {/* ringed planet */}
      <g transform="translate(940 600)">
        <ellipse cx="0" cy="0" rx="210" ry="46" fill="none" stroke={`hsl(${p.glow})`} strokeWidth="10" opacity="0.45" transform="rotate(-18)" />
        <circle cx="0" cy="0" r="120" fill="url(#cs-planet)" />
        <ellipse cx="0" cy="0" rx="210" ry="46" fill="none" stroke={`hsl(${p.glow})`} strokeWidth="6" opacity="0.8" transform="rotate(-18)" strokeDasharray="0 220 320 0" />
      </g>
      {/* small moon */}
      <circle cx="220" cy="240" r="46" fill="hsl(220 25% 70%)" opacity="0.7" />
      <circle cx="206" cy="226" r="46" fill="hsl(250 60% 12%)" opacity="0.5" />
    </svg>
  ),
};

export function StageScene({ phase }: StageSceneProps) {
  const render = SCENE_SVG[phase.scene];
  return (
    <div
      aria-hidden
      key={phase.scene}
      className="stage-scene absolute inset-0 pointer-events-none"
    >
      {render(phase)}
    </div>
  );
}

export default StageScene;
