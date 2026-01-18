// Element colors - vibrant, game-style
const ELEMENTS = [
  { name: 'fire', bg: '#EF4444', emoji: '🔥', iconBg: 'linear-gradient(145deg, #EF4444, #DC2626)' },
  { name: 'water', bg: '#3B82F6', emoji: '💧', iconBg: 'linear-gradient(145deg, #3B82F6, #2563EB)' },
  { name: 'wood', bg: '#A1662F', emoji: '🪵', iconBg: 'linear-gradient(145deg, #A1662F, #8B5A2B)' },
  { name: 'stone', bg: '#78716C', emoji: '🪨', iconBg: 'linear-gradient(145deg, #78716C, #57534E)' },
  { name: 'helium', bg: '#22C55E', emoji: '🌿', iconBg: 'linear-gradient(145deg, #22C55E, #16A34A)' },
];

// Block colors for the stacks
const BLOCK_COLORS = {
  blue: { bg: '#3B82F6', shadow: '#1D4ED8' },
  red: { bg: '#EF4444', shadow: '#B91C1C' },
  cyan: { bg: '#06B6D4', shadow: '#0891B2' },
  green: { bg: '#22C55E', shadow: '#15803D' },
  orange: { bg: '#F97316', shadow: '#C2410C' },
  purple: { bg: '#8B5CF6', shadow: '#6D28D9' },
  pink: { bg: '#EC4899', shadow: '#BE185D' },
};

const BLOCK_SIZE = 44;
const GAP = 2;

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

// Left block stack - matching reference exactly
const LeftBlockStack = () => {
  // From the reference image, left stack arrangement:
  // Top: Cyan
  // Row 2: Red, Cyan
  // Row 3: Red, Blue
  // Row 4 (bottom): Blue, Blue, Cyan
  const blocks = [
    // Bottom row (y=3)
    { color: BLOCK_COLORS.blue, x: 0, y: 3 },
    { color: BLOCK_COLORS.blue, x: 1, y: 3 },
    { color: BLOCK_COLORS.cyan, x: 2, y: 3 },
    // Row 2 (y=2)
    { color: BLOCK_COLORS.red, x: 0, y: 2 },
    { color: BLOCK_COLORS.blue, x: 1, y: 2 },
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

// Right block stack - matching reference exactly
const RightBlockStack = () => {
  // From the reference image, right stack arrangement:
  // Top: Green
  // Row 2: Green, Green  
  // Row 3: Orange, Orange
  // Row 4 (bottom): Cyan, Orange, Orange
  const blocks = [
    // Bottom row (y=3)
    { color: BLOCK_COLORS.cyan, x: 0, y: 3 },
    { color: BLOCK_COLORS.orange, x: 1, y: 3 },
    { color: BLOCK_COLORS.orange, x: 2, y: 3 },
    // Row 2 (y=2)
    { color: BLOCK_COLORS.orange, x: 1, y: 2 },
    { color: BLOCK_COLORS.orange, x: 2, y: 2 },
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

// Center balloon with glow - matching reference
const CenterBalloon = () => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
      {/* Glow behind balloon */}
      <div
        className="absolute w-28 h-28 -top-2"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(168, 85, 247, 0.3) 40%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />
      
      {/* Balloon */}
      <div
        className="relative w-16 h-20 rounded-full"
        style={{
          background: 'linear-gradient(145deg, #F472B6 0%, #EC4899 30%, #DB2777 70%, #BE185D 100%)',
          boxShadow: `
            0 6px 0 #9D174D,
            0 10px 20px rgba(236, 72, 153, 0.4),
            inset 4px 4px 12px rgba(255,255,255,0.4),
            inset -3px -3px 8px rgba(0,0,0,0.1)
          `,
          borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
        }}
      >
        {/* Shine */}
        <div
          className="absolute top-2 left-3 w-5 h-6 rounded-full"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.6), transparent)',
            transform: 'rotate(-20deg)',
          }}
        />
      </div>
      
      {/* String */}
      <div
        className="w-0.5 h-8 mt-1"
        style={{
          background: 'linear-gradient(to bottom, #DB2777, #9D174D)',
        }}
      />
    </div>
  );
};

// Bottom floor blocks - extending horizontally
const BottomFloorBlocks = () => {
  // Floor blocks matching the reference - cyan, purple, blue blocks at bottom
  const leftBlocks = [
    { color: BLOCK_COLORS.cyan, x: 0 },
    { color: BLOCK_COLORS.purple, x: 1 },
  ];
  
  const rightBlocks = [
    { color: BLOCK_COLORS.cyan, x: 0 },
    { color: BLOCK_COLORS.cyan, x: 1 },
  ];

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-24">
      {/* Left floor section */}
      <div className="flex">
        {leftBlocks.map((block, i) => (
          <div key={`left-${i}`} style={{ marginRight: GAP }}>
            <Block color={block.color} />
          </div>
        ))}
      </div>
      
      {/* Right floor section */}
      <div className="flex">
        {rightBlocks.map((block, i) => (
          <div key={`right-${i}`} style={{ marginRight: GAP }}>
            <Block color={block.color} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Perspective floor grid - static
const PerspectiveFloor = () => {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-32 pointer-events-none"
      style={{
        perspective: '300px',
      }}
    >
      <div
        className="w-full h-full"
        style={{
          background: `
            linear-gradient(90deg, rgba(59, 130, 246, 0.25) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '35px 35px',
          transform: 'rotateX(65deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.3) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.3) 100%)',
        }}
      />
      {/* Floor glow */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-12"
        style={{
          background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
          filter: 'blur(12px)',
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

      {/* Main display with blocks and balloon */}
      <div className="relative h-[220px] w-[350px] sm:w-[400px]">
        {/* Perspective floor */}
        <PerspectiveFloor />

        {/* Left stack - positioned left */}
        <div className="absolute left-0 bottom-12">
          <LeftBlockStack />
        </div>

        {/* Center balloon */}
        <CenterBalloon />

        {/* Right stack - positioned right */}
        <div className="absolute right-0 bottom-12">
          <RightBlockStack />
        </div>

        {/* Bottom floor blocks */}
        <BottomFloorBlocks />
      </div>
    </div>
  );
};

export default HeroBlockDisplay;