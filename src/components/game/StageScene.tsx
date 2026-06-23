import { PhaseConfig, PhaseScene } from "@/game/phases";

interface StageSceneProps {
  phase: PhaseConfig;
}

// Build a solid cog/gear path with `teeth` teeth.
function cog(cx: number, cy: number, rOuter: number, rInner: number, teeth: number): string {
  const step = (Math.PI * 2) / (teeth * 2);
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = i * step;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d + "Z";
}

// Bold, painterly CSS/SVG scenes — one per universe. Each has a clear "hero"
// element so the world reads instantly. Detail sits toward the top/bottom
// bands and sides (visible around the centered board).
const SCENE_SVG: Record<PhaseScene, () => JSX.Element> = {
  // ── Sandbox: bright dawn meadow, sun, rainbow, toy blocks ──
  sandbox: () => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="sb-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(50 100% 80%)" />
          <stop offset="55%" stopColor="hsl(45 100% 62%)" />
          <stop offset="100%" stopColor="hsl(40 100% 55%)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* sun + rays */}
      <g transform="translate(980 150)">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="-6" y="-220" width="12" height="120" rx="6" fill="hsl(48 100% 72%)" opacity="0.35" transform={`rotate(${i * 30})`} />
        ))}
        <circle r="96" fill="url(#sb-sun)" />
        <circle r="64" fill="hsl(50 100% 78%)" />
      </g>
      {/* rainbow arc */}
      <g fill="none" strokeWidth="14" opacity="0.5">
        {["0 85% 60%", "30 95% 58%", "48 100% 55%", "140 60% 50%", "205 90% 58%", "270 70% 62%"].map((c, i) => (
          <path key={i} d={`M${120 + i * 16} 760 A${480 - i * 16} ${480 - i * 16} 0 0 1 ${1080 - i * 16} 760`} stroke={`hsl(${c})`} />
        ))}
      </g>
      {/* rolling hills */}
      <path d="M0 560 Q300 470 620 540 T1200 520 V800 H0 Z" fill="hsl(150 52% 46%)" opacity="0.7" />
      <path d="M0 640 Q360 560 720 632 T1200 612 V800 H0 Z" fill="hsl(150 56% 38%)" opacity="0.85" />
      <path d="M0 724 Q300 662 640 718 T1200 700 V800 H0 Z" fill="hsl(152 60% 26%)" />
      {/* cartoon trees */}
      {[[140, 690], [300, 706], [1040, 700]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-9" y="0" width="18" height="46" rx="4" fill="hsl(28 50% 28%)" />
          <circle cx="0" cy="-10" r="46" fill="hsl(146 55% 40%)" />
          <circle cx="-26" cy="8" r="34" fill="hsl(146 58% 34%)" />
          <circle cx="26" cy="8" r="34" fill="hsl(146 58% 36%)" />
        </g>
      ))}
      {/* toy blocks resting on the hill */}
      <g>
        <rect x="470" y="612" width="56" height="56" rx="10" fill="hsl(8 82% 55%)" />
        <rect x="528" y="624" width="46" height="46" rx="9" fill="hsl(204 100% 58%)" />
        <rect x="498" y="566" width="46" height="46" rx="9" fill="hsl(45 100% 55%)" />
      </g>
    </svg>
  ),

  // ── Toy Factory: glowing furnace, big cogs, lit windows, pipes ──
  factory: () => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="tf-furnace" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="hsl(35 100% 60%)" stopOpacity="0.85" />
          <stop offset="55%" stopColor="hsl(28 100% 52%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(28 100% 52%)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect y="300" width="1200" height="500" fill="url(#tf-furnace)" />
      {/* tall buildings + lit windows */}
      <g>
        <rect x="-20" y="330" width="250" height="470" fill="hsl(24 45% 14%)" />
        <rect x="980" y="300" width="260" height="500" fill="hsl(24 48% 12%)" />
        <rect x="470" y="430" width="300" height="370" rx="8" fill="hsl(22 50% 10%)" />
      </g>
      <g fill="hsl(45 100% 62%)">
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`l${r}-${c}`} x={20 + c * 64} y={360 + r * 78} width="40" height="48" rx="4" opacity={0.5 + ((c + r) % 2) * 0.45} />
          ))
        )}
        {[0, 1, 2, 3, 4, 5].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`rr${r}-${c}`} x={1010 + c * 70} y={330 + r * 74} width="42" height="48" rx="4" opacity={0.5 + ((c + r + 1) % 2) * 0.45} />
          ))
        )}
      </g>
      {/* big glowing cogs */}
      <g opacity="0.9">
        <path d={cog(250, 660, 150, 110, 12)} fill="hsl(40 90% 48%)" />
        <circle cx="250" cy="660" r="54" fill="hsl(24 50% 12%)" />
        <path d={cog(620, 720, 120, 86, 10)} fill="hsl(45 95% 55%)" />
        <circle cx="620" cy="720" r="42" fill="hsl(24 50% 12%)" />
      </g>
      {/* pipes */}
      <g stroke="hsl(28 45% 22%)" strokeWidth="30" fill="none" opacity="0.95" strokeLinecap="round">
        <path d="M120 800 V560 H470" />
        <path d="M1080 800 V520 H770" />
      </g>
      {/* smokestacks */}
      <rect x="520" y="350" width="46" height="90" fill="hsl(22 50% 9%)" />
      <rect x="676" y="380" width="46" height="60" fill="hsl(22 50% 9%)" />
    </svg>
  ),

  // ── Cloud City: sun, big clouds, floating islands, hot-air balloon ──
  sky: () => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="sk-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(52 100% 92%)" />
          <stop offset="60%" stopColor="hsl(50 100% 80%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(50 100% 80%)" stopOpacity="0" />
        </radialGradient>
        <filter id="sk-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g transform="translate(230 150)">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="-7" y="-260" width="14" height="150" rx="7" fill="hsl(52 100% 86%)" opacity="0.3" transform={`rotate(${i * 30})`} />
        ))}
        <circle r="110" fill="url(#sk-sun)" />
        <circle r="64" fill="hsl(54 100% 90%)" />
      </g>
      {/* big fluffy clouds */}
      <g fill="hsl(0 0% 100%)" filter="url(#sk-soft)">
        <g opacity="0.92">
          <ellipse cx="300" cy="330" rx="120" ry="60" />
          <ellipse cx="220" cy="350" rx="80" ry="46" />
          <ellipse cx="390" cy="352" rx="78" ry="42" />
        </g>
        <g opacity="0.85">
          <ellipse cx="950" cy="250" rx="130" ry="58" />
          <ellipse cx="1040" cy="270" rx="80" ry="42" />
          <ellipse cx="860" cy="270" rx="78" ry="40" />
        </g>
      </g>
      {/* floating islands with grass + waterfall */}
      {[[200, 560, 1], [980, 600, 1.15]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-150 0 L-80 150 L90 140 L150 0 Z" fill="hsl(28 48% 26%)" />
          <ellipse cx="0" cy="0" rx="150" ry="40" fill="hsl(140 52% 40%)" />
          <ellipse cx="0" cy="-8" rx="150" ry="34" fill="hsl(140 58% 46%)" />
          <rect x="-14" y="20" width="28" height="120" fill="hsl(200 90% 70%)" opacity="0.6" />
        </g>
      ))}
      {/* hot-air balloon */}
      <g transform="translate(620 250)">
        <path d="M-60 10 Q-60 -110 0 -110 Q60 -110 60 10 Q30 70 0 86 Q-30 70 -60 10 Z" fill="hsl(8 82% 56%)" />
        <path d="M-20 -104 Q-36 -10 0 86 Q36 -10 20 -104 Z" fill="hsl(45 100% 60%)" />
        <line x1="-30" y1="60" x2="-18" y2="110" stroke="hsl(28 40% 30%)" strokeWidth="3" />
        <line x1="30" y1="60" x2="18" y2="110" stroke="hsl(28 40% 30%)" strokeWidth="3" />
        <rect x="-20" y="110" width="40" height="30" rx="5" fill="hsl(28 50% 30%)" />
      </g>
    </svg>
  ),

  // ── Crystal Caverns: glowing crystal clusters, pool, light shafts ──
  caverns: () => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="cv-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(286 95% 70%)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="hsl(286 95% 70%)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* rock framing */}
      <path d="M0 0 H1200 V150 L1110 70 L1030 170 L950 80 L860 190 L770 90 L680 180 L580 80 L500 190 L410 90 L330 180 L250 80 L170 170 L90 80 L0 160 Z" fill="hsl(258 38% 12%)" />
      <path d="M0 800 H1200 V680 L1110 770 L1030 660 L940 770 L850 670 L760 780 L660 680 L560 780 L470 670 L380 770 L290 680 L190 780 L100 680 L0 770 Z" fill="hsl(258 42% 9%)" />
      {/* light shafts */}
      <g opacity="0.35">
        <path d="M300 60 L240 800 L420 800 L420 60 Z" fill="hsl(286 90% 75%)" opacity="0.25" />
        <path d="M820 60 L760 800 L960 800 L940 60 Z" fill="hsl(196 95% 70%)" opacity="0.2" />
      </g>
      {/* glowing pool */}
      <ellipse cx="600" cy="720" rx="360" ry="70" fill="url(#cv-pool)" />
      {/* crystal clusters (multi-colour) */}
      {[
        { x: 210, y: 600, s: 1.2, c: ["286 95% 70%", "270 90% 62%", "196 95% 64%"] },
        { x: 600, y: 680, s: 1.0, c: ["320 90% 66%", "286 95% 72%", "260 88% 60%"] },
        { x: 980, y: 620, s: 1.25, c: ["196 95% 64%", "286 95% 72%", "270 90% 64%"] },
      ].map((cl, i) => (
        <g key={i} transform={`translate(${cl.x} ${cl.y}) scale(${cl.s})`}>
          <path d="M-6 8 L24 -150 L54 8 Z" fill={`hsl(${cl.c[0]})`} opacity="0.92" />
          <path d="M36 10 L66 -110 L96 10 Z" fill={`hsl(${cl.c[1]})`} opacity="0.85" />
          <path d="M-44 10 L-20 -96 L4 10 Z" fill={`hsl(${cl.c[2]})`} opacity="0.8" />
        </g>
      ))}
    </svg>
  ),

  // ── Volcano Run: erupting peak, bright lava river, glowing pools ──
  volcano: () => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="vl-sky" cx="60%" cy="55%" r="60%">
          <stop offset="0%" stopColor="hsl(28 100% 58%)" stopOpacity="0.7" />
          <stop offset="60%" stopColor="hsl(12 95% 50%)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(12 95% 50%)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#vl-sky)" />
      {/* distant ridges */}
      <path d="M0 540 L260 430 L470 540 L700 410 L960 540 L1200 450 V800 H0 Z" fill="hsl(8 50% 16%)" opacity="0.85" />
      {/* main volcano (offset right) */}
      <path d="M600 800 L880 330 L1170 800 Z" fill="hsl(10 52% 11%)" />
      {/* bright crater + lava river */}
      <path d="M812 460 L880 330 L948 460 Q880 496 812 460 Z" fill="hsl(48 100% 65%)" />
      <path d="M836 452 L880 360 L924 452 Q880 478 836 452 Z" fill="hsl(38 100% 58%)" />
      <path d="M872 430 Q840 600 884 760 L924 760 Q900 590 908 440 Z" fill="hsl(24 100% 55%)" opacity="0.95" />
      <g stroke="hsl(50 100% 70%)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M884 470 L862 600 L890 740" />
      </g>
      {/* glowing lava pools at base */}
      <ellipse cx="300" cy="760" rx="160" ry="26" fill="hsl(24 100% 55%)" opacity="0.7" />
      <ellipse cx="700" cy="788" rx="220" ry="24" fill="hsl(30 100% 58%)" opacity="0.6" />
      {/* foreground ridge */}
      <path d="M0 740 L240 670 L520 748 L820 668 L1200 740 V800 H0 Z" fill="hsl(10 55% 7%)" />
    </svg>
  ),

  // ── Cosmic Void: bright nebula, ringed planet, galaxy, moon ──
  cosmos: () => (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="cs-neb1" cx="30%" cy="68%" r="48%">
          <stop offset="0%" stopColor="hsl(286 95% 66%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(286 95% 66%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-neb2" cx="74%" cy="26%" r="46%">
          <stop offset="0%" stopColor="hsl(196 95% 60%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(196 95% 60%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-planet" cx="36%" cy="32%" r="75%">
          <stop offset="0%" stopColor="hsl(200 90% 70%)" />
          <stop offset="55%" stopColor="hsl(225 80% 52%)" />
          <stop offset="100%" stopColor="hsl(250 70% 22%)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#cs-neb1)" />
      <rect width="1200" height="800" fill="url(#cs-neb2)" />
      {/* big in-scene stars */}
      {[[180, 180], [420, 110], [1080, 200], [560, 90], [300, 360], [1010, 480]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 5 : 3.5} fill="hsl(0 0% 100%)" opacity="0.9" />
      ))}
      {/* ringed planet */}
      <g transform="translate(940 600)">
        <ellipse cx="0" cy="0" rx="230" ry="52" fill="none" stroke="hsl(270 90% 72%)" strokeWidth="14" opacity="0.5" transform="rotate(-18)" />
        <circle cx="0" cy="0" r="135" fill="url(#cs-planet)" />
        {/* surface bands */}
        <g clipPath="url(#cs-clip)" opacity="0.4">
          <ellipse cx="0" cy="-30" rx="135" ry="18" fill="hsl(200 90% 78%)" />
          <ellipse cx="0" cy="30" rx="120" ry="16" fill="hsl(225 80% 40%)" />
        </g>
        <clipPath id="cs-clip"><circle cx="0" cy="0" r="135" /></clipPath>
        <ellipse cx="0" cy="0" rx="230" ry="52" fill="none" stroke="hsl(270 95% 78%)" strokeWidth="8" opacity="0.85" transform="rotate(-18)" strokeDasharray="0 250 360 0" />
      </g>
      {/* small moon */}
      <g transform="translate(230 250)">
        <circle r="50" fill="hsl(220 25% 72%)" />
        <circle cx="-14" cy="-12" r="50" fill="hsl(250 60% 14%)" opacity="0.5" />
        <circle cx="16" cy="8" r="9" fill="hsl(220 20% 55%)" opacity="0.6" />
      </g>
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
