// Element colors - vibrant, game-style icons
const ELEMENTS = [
  { name: 'fire', bg: '#EF4444', emoji: '🔥', iconBg: 'linear-gradient(145deg, #EF4444, #DC2626)' },
  { name: 'water', bg: '#3B82F6', emoji: '💧', iconBg: 'linear-gradient(145deg, #3B82F6, #2563EB)' },
  { name: 'wood', bg: '#A1662F', emoji: '🪵', iconBg: 'linear-gradient(145deg, #A1662F, #8B5A2B)' },
  { name: 'stone', bg: '#78716C', emoji: '🪨', iconBg: 'linear-gradient(145deg, #78716C, #57534E)' },
  { name: 'helium', bg: '#22C55E', emoji: '🌿', iconBg: 'linear-gradient(145deg, #22C55E, #16A34A)' },
];

// Block colors for the stacks - glossy plastic style
const BLOCK_COLORS = {
  blue: { bg: '#3B82F6', shadow: '#1D4ED8', highlight: '#93C5FD' },
  red: { bg: '#EF4444', shadow: '#B91C1C', highlight: '#FCA5A5' },
  cyan: { bg: '#06B6D4', shadow: '#0891B2', highlight: '#67E8F9' },
  green: { bg: '#22C55E', shadow: '#15803D', highlight: '#86EFAC' },
  orange: { bg: '#F97316', shadow: '#C2410C', highlight: '#FDBA74' },
  purple: { bg: '#8B5CF6', shadow: '#6D28D9', highlight: '#C4B5FD' },
  pink: { bg: '#EC4899', shadow: '#BE185D', highlight: '#F9A8D4' },
  gold: { bg: '#EAB308', shadow: '#A16207', highlight: '#FDE68A' },
};

const BLOCK_SIZE = 40;
const GAP = 2;

// Element icons row - glossy 3D buttons
const ElementIconsRow = () => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {ELEMENTS.map((element) => (
        <div
          key={element.name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: element.iconBg,
            boxShadow: `0 4px 0 ${element.bg}99, 0 6px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)`,
            border: '2px solid rgba(255,255,255,0.25)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
          <span className="text-xl sm:text-2xl relative z-10">{element.emoji}</span>
        </div>
      ))}
    </div>
  );
};

// Single 3D glossy plastic block
interface BlockProps {
  color: { bg: string; shadow: string; highlight: string };
  size?: number;
}

const Block = ({ color, size = BLOCK_SIZE }: BlockProps) => {
  return (
    <div
      className="rounded-lg relative overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        boxShadow: `
          0 4px 0 ${color.shadow},
          0 6px 12px rgba(0,0,0,0.4),
          inset 3px 3px 8px ${color.highlight}80,
          inset -2px -2px 6px rgba(0,0,0,0.2)
        `,
        border: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      {/* Top gloss shine */}
      <div 
        className="absolute top-1 left-1 w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-md" />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
};

// Left block stack - staggered heights like Block Blast
const LeftBlockStack = () => {
  const blocks = [
    // Bottom row (y=3)
    { color: BLOCK_COLORS.blue, x: 0, y: 3 },
    { color: BLOCK_COLORS.blue, x: 1, y: 3 },
    { color: BLOCK_COLORS.cyan, x: 2, y: 3 },
    // Row 2 (y=2)
    { color: BLOCK_COLORS.red, x: 0, y: 2 },
    { color: BLOCK_COLORS.purple, x: 1, y: 2 },
    // Row 3 (y=1)
    { color: BLOCK_COLORS.red, x: 0, y: 1 },
    { color: BLOCK_COLORS.cyan, x: 1, y: 1 },
    // Top (y=0)
    { color: BLOCK_COLORS.cyan, x: 0, y: 0 },
  ];

  const width = 3 * (BLOCK_SIZE + GAP);
  const height = 4 * (BLOCK_SIZE + GAP);

  return (
    <div className="relative" style={{ width, height }}>
      {blocks.map((block, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + GAP),
            top: block.y * (BLOCK_SIZE + GAP),
          }}
        >
          <Block color={block.color} />
        </div>
      ))}
    </div>
  );
};

// Right block stack - staggered heights like Block Blast
const RightBlockStack = () => {
  const blocks = [
    // Bottom row (y=3)
    { color: BLOCK_COLORS.cyan, x: 0, y: 3 },
    { color: BLOCK_COLORS.orange, x: 1, y: 3 },
    { color: BLOCK_COLORS.orange, x: 2, y: 3 },
    // Row 2 (y=2)
    { color: BLOCK_COLORS.orange, x: 1, y: 2 },
    { color: BLOCK_COLORS.green, x: 2, y: 2 },
    // Row 3 (y=1)
    { color: BLOCK_COLORS.green, x: 1, y: 1 },
    { color: BLOCK_COLORS.green, x: 2, y: 1 },
    // Top (y=0)
    { color: BLOCK_COLORS.green, x: 2, y: 0 },
  ];

  const width = 3 * (BLOCK_SIZE + GAP);
  const height = 4 * (BLOCK_SIZE + GAP);

  return (
    <div className="relative" style={{ width, height }}>
      {blocks.map((block, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + GAP),
            top: block.y * (BLOCK_SIZE + GAP),
          }}
        >
          <Block color={block.color} />
        </div>
      ))}
    </div>
  );
};

// Center floating piece - Gold/Pink glowing cluster
const CenterFloatingPiece = () => {
  // L-shaped or T-shaped piece in gold/pink
  const blocks = [
    { color: BLOCK_COLORS.gold, x: 0, y: 0 },
    { color: BLOCK_COLORS.gold, x: 1, y: 0 },
    { color: BLOCK_COLORS.pink, x: 0, y: 1 },
    { color: BLOCK_COLORS.gold, x: 1, y: 1 },
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
      {/* Radial glow behind piece */}
      <div
        className="absolute -inset-8"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(251,191,36,0.3) 30%, rgba(236,72,153,0.2) 50%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />
      {/* Speed lines / God rays */}
      <div
        className="absolute -inset-12 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 120% at 50% 100%, rgba(255,255,255,0.15) 0%, transparent 60%)',
        }}
      />
      {/* The piece blocks */}
      <div className="relative" style={{ width: 2 * (BLOCK_SIZE + GAP), height: 2 * (BLOCK_SIZE + GAP) }}>
        {blocks.map((block, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: block.x * (BLOCK_SIZE + GAP),
              top: block.y * (BLOCK_SIZE + GAP),
            }}
          >
            <Block color={block.color} size={BLOCK_SIZE} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Perspective floor grid - 3D ground effect
const PerspectiveFloor = () => {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-36 pointer-events-none overflow-hidden"
      style={{
        perspective: '300px',
      }}
    >
      {/* The grid */}
      <div
        className="w-full h-full"
        style={{
          background: `
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'rotateX(65deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* Central spotlight glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24"
        style={{
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.25) 0%, rgba(34, 211, 238, 0.3) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
    </div>
  );
};

// Wall grid overlay - 2D vertical/horizontal grid on top portion
const WallGrid = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          linear-gradient(90deg, rgba(34, 211, 238, 0.08) 1px, transparent 1px),
          linear-gradient(rgba(34, 211, 238, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 80%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 80%)',
      }}
    />
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Element icons row */}
      <ElementIconsRow />

      {/* Main display with blocks and floating piece */}
      <div className="relative h-[220px] w-[350px] sm:w-[400px]">
        {/* Wall grid overlay */}
        <WallGrid />
        
        {/* Perspective floor */}
        <PerspectiveFloor />

        {/* Left stack - positioned left */}
        <div className="absolute left-0 bottom-12">
          <LeftBlockStack />
        </div>

        {/* Center floating piece with glow */}
        <CenterFloatingPiece />

        {/* Right stack - positioned right */}
        <div className="absolute right-0 bottom-12">
          <RightBlockStack />
        </div>
      </div>
    </div>
  );
};

export default HeroBlockDisplay;
