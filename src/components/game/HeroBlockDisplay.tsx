// Element colors - vibrant, game-style
const ELEMENTS = [
  { name: 'fire', bg: '#EF4444', emoji: '🔥', iconBg: 'linear-gradient(145deg, #EF4444, #DC2626)' },
  { name: 'water', bg: '#3B82F6', emoji: '💧', iconBg: 'linear-gradient(145deg, #3B82F6, #2563EB)' },
  { name: 'wood', bg: '#A1662F', emoji: '🪵', iconBg: 'linear-gradient(145deg, #A1662F, #8B5A2B)' },
  { name: 'stone', bg: '#78716C', emoji: '🪨', iconBg: 'linear-gradient(145deg, #78716C, #57534E)' },
  { name: 'helium', bg: '#22C55E', emoji: '🌿', iconBg: 'linear-gradient(145deg, #22C55E, #16A34A)' },
];

// Block colors for the stacks
const BLOCK_COLORS = [
  { bg: '#3B82F6', shadow: '#1D4ED8' }, // Blue
  { bg: '#EF4444', shadow: '#B91C1C' }, // Red
  { bg: '#06B6D4', shadow: '#0891B2' }, // Cyan
  { bg: '#22C55E', shadow: '#15803D' }, // Green
  { bg: '#F97316', shadow: '#C2410C' }, // Orange
  { bg: '#8B5CF6', shadow: '#6D28D9' }, // Purple
  { bg: '#EC4899', shadow: '#BE185D' }, // Pink
];

const BLOCK_SIZE = 48;

// Element icons row - static
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

// Single 3D block - static
interface BlockProps {
  color: { bg: string; shadow: string };
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
          0 6px 12px rgba(0,0,0,0.35),
          inset 0 3px 6px rgba(255,255,255,0.35),
          inset -2px -2px 4px rgba(0,0,0,0.15)
        `,
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent rounded-t-md" />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent" />
    </div>
  );
};

// Left block stack - matching reference
const LeftBlockStack = () => {
  const blocks = [
    // Bottom row
    { color: BLOCK_COLORS[0], x: 0, y: 3 },
    { color: BLOCK_COLORS[0], x: 1, y: 3 },
    { color: BLOCK_COLORS[2], x: 2, y: 3 },
    // Second row
    { color: BLOCK_COLORS[1], x: 0, y: 2 },
    { color: BLOCK_COLORS[0], x: 1, y: 2 },
    // Third row
    { color: BLOCK_COLORS[1], x: 0, y: 1 },
    { color: BLOCK_COLORS[2], x: 1, y: 1 },
    // Top
    { color: BLOCK_COLORS[2], x: 0, y: 0 },
  ];

  const gap = 2;
  const width = 3 * (BLOCK_SIZE + gap);
  const height = 4 * (BLOCK_SIZE + gap);

  return (
    <div className="relative" style={{ width, height }}>
      {blocks.map((block, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + gap),
            top: block.y * (BLOCK_SIZE + gap),
          }}
        >
          <Block color={block.color} />
        </div>
      ))}
    </div>
  );
};

// Right block stack - matching reference
const RightBlockStack = () => {
  const blocks = [
    // Bottom row
    { color: BLOCK_COLORS[2], x: 0, y: 3 },
    { color: BLOCK_COLORS[4], x: 1, y: 3 },
    { color: BLOCK_COLORS[4], x: 2, y: 3 },
    // Second row
    { color: BLOCK_COLORS[4], x: 1, y: 2 },
    { color: BLOCK_COLORS[4], x: 2, y: 2 },
    // Third row
    { color: BLOCK_COLORS[3], x: 1, y: 1 },
    { color: BLOCK_COLORS[3], x: 2, y: 1 },
    // Top
    { color: BLOCK_COLORS[3], x: 2, y: 0 },
  ];

  const gap = 2;
  const width = 3 * (BLOCK_SIZE + gap);
  const height = 4 * (BLOCK_SIZE + gap);

  return (
    <div className="relative" style={{ width, height }}>
      {blocks.map((block, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + gap),
            top: block.y * (BLOCK_SIZE + gap),
          }}
        >
          <Block color={block.color} />
        </div>
      ))}
    </div>
  );
};

// Perspective floor grid - static
const PerspectiveFloor = () => {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-20 pointer-events-none"
      style={{
        perspective: '200px',
      }}
    >
      <div
        className="w-full h-full"
        style={{
          background: `
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* Floor glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8"
        style={{
          background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Element icons row */}
      <ElementIconsRow />

      {/* Main display with blocks - no balloon */}
      <div className="relative flex items-end justify-center gap-8 sm:gap-12 mt-2">
        {/* Perspective floor */}
        <PerspectiveFloor />

        {/* Left stack */}
        <LeftBlockStack />

        {/* Right stack */}
        <RightBlockStack />
      </div>
    </div>
  );
};

export default HeroBlockDisplay;
