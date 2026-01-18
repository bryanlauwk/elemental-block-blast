// Block colors for the massive walls - glossy plastic style
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

const BLOCK_SIZE = 80; // Massive 80px blocks

// Single 3D glossy plastic block with enhanced shine
interface BlockProps {
  color: { bg: string; shadow: string; highlight: string };
  size?: number;
}

const Block = ({ color, size = BLOCK_SIZE }: BlockProps) => {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        borderRadius: 12,
        boxShadow: `
          0 6px 0 ${color.shadow},
          0 10px 20px rgba(0,0,0,0.5),
          inset 4px 4px 12px ${color.highlight}90,
          inset -3px -3px 10px rgba(0,0,0,0.3)
        `,
        border: '2px solid rgba(255,255,255,0.35)',
      }}
    >
      {/* Top gloss shine - plastic reflection */}
      <div 
        className="absolute rounded-full"
        style={{
          top: 6,
          left: 8,
          width: size * 0.35,
          height: size * 0.25,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 50%, transparent 70%)',
        }}
      />
      {/* Gradient overlay for depth */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, transparent 100%)',
          borderRadius: '10px 10px 0 0',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)',
          borderRadius: '0 0 10px 10px',
        }}
      />
    </div>
  );
};

// Left massive wall - tightly stacked blocks rising from bottom
const LeftBlockStack = () => {
  // Staggered heights like a skyline - no gaps
  const columns = [
    { colors: [BLOCK_COLORS.blue, BLOCK_COLORS.red, BLOCK_COLORS.cyan, BLOCK_COLORS.purple], height: 4 },
    { colors: [BLOCK_COLORS.red, BLOCK_COLORS.blue, BLOCK_COLORS.green], height: 3 },
    { colors: [BLOCK_COLORS.cyan, BLOCK_COLORS.purple], height: 2 },
  ];

  return (
    <div className="flex items-end">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col-reverse">
          {col.colors.map((color, rowIndex) => (
            <Block key={rowIndex} color={color} />
          ))}
        </div>
      ))}
    </div>
  );
};

// Right massive wall - tightly stacked blocks rising from bottom
const RightBlockStack = () => {
  // Mirror of left, staggered heights
  const columns = [
    { colors: [BLOCK_COLORS.green, BLOCK_COLORS.orange], height: 2 },
    { colors: [BLOCK_COLORS.orange, BLOCK_COLORS.green, BLOCK_COLORS.pink], height: 3 },
    { colors: [BLOCK_COLORS.pink, BLOCK_COLORS.orange, BLOCK_COLORS.green, BLOCK_COLORS.blue], height: 4 },
  ];

  return (
    <div className="flex items-end">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col-reverse">
          {col.colors.map((color, rowIndex) => (
            <Block key={rowIndex} color={color} />
          ))}
        </div>
      ))}
    </div>
  );
};

// Center floating piece - Gold/Pink glowing cluster
const CenterFloatingPiece = () => {
  const pieceSize = 60;
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
        className="absolute -inset-16"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(251,191,36,0.4) 30%, rgba(236,72,153,0.25) 50%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      {/* Speed lines / God rays */}
      <div
        className="absolute -inset-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 140% at 50% 100%, rgba(255,255,255,0.2) 0%, transparent 60%)',
        }}
      />
      {/* The piece blocks */}
      <div className="relative" style={{ width: 2 * pieceSize, height: 2 * pieceSize }}>
        {blocks.map((block, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: block.x * pieceSize,
              top: block.y * pieceSize,
            }}
          >
            <Block color={block.color} size={pieceSize} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Perspective floor grid - 3D ground effect with neon cyan glow
const PerspectiveFloor = () => {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-48 pointer-events-none overflow-hidden"
      style={{
        perspective: '400px',
        perspectiveOrigin: 'center bottom',
      }}
    >
      {/* The neon grid */}
      <div
        className="w-full h-full"
        style={{
          background: `
            linear-gradient(90deg, rgba(34, 211, 238, 0.5) 2px, transparent 2px),
            linear-gradient(rgba(34, 211, 238, 0.5) 2px, transparent 2px)
          `,
          backgroundSize: '50px 50px',
          transform: 'rotateX(70deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.5) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.5) 100%)',
          boxShadow: '0 0 40px rgba(34, 211, 238, 0.3)',
        }}
      />
      {/* Central spotlight glow */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-80 h-32"
        style={{
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.35) 0%, rgba(34, 211, 238, 0.4) 40%, transparent 70%)',
          filter: 'blur(25px)',
        }}
      />
    </div>
  );
};

// Wall grid overlay - 2D neon grid on top portion
const WallGrid = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          linear-gradient(90deg, rgba(34, 211, 238, 0.15) 2px, transparent 2px),
          linear-gradient(rgba(34, 211, 238, 0.15) 2px, transparent 2px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 75%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 75%)',
      }}
    />
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main display with massive wall blocks and floating piece */}
      <div className="relative h-[360px] w-[700px] max-w-[95vw]">
        {/* Wall grid overlay */}
        <WallGrid />
        
        {/* Perspective floor */}
        <PerspectiveFloor />

        {/* Left massive wall - positioned at bottom left */}
        <div className="absolute left-0 bottom-0">
          <LeftBlockStack />
        </div>

        {/* Center floating piece with glow */}
        <CenterFloatingPiece />

        {/* Right massive wall - positioned at bottom right */}
        <div className="absolute right-0 bottom-0">
          <RightBlockStack />
        </div>
      </div>
    </div>
  );
};

export default HeroBlockDisplay;
