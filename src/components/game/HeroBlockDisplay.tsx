// Element colors - vibrant, game-style icons
const ELEMENTS = [
  { name: 'fire', bg: '#EF4444', emoji: '🔥', iconBg: 'linear-gradient(145deg, #EF4444, #DC2626)' },
  { name: 'water', bg: '#3B82F6', emoji: '💧', iconBg: 'linear-gradient(145deg, #3B82F6, #2563EB)' },
  { name: 'wood', bg: '#A1662F', emoji: '🪵', iconBg: 'linear-gradient(145deg, #A1662F, #8B5A2B)' },
  { name: 'stone', bg: '#78716C', emoji: '🪨', iconBg: 'linear-gradient(145deg, #78716C, #57534E)' },
  { name: 'helium', bg: '#22C55E', emoji: '🌿', iconBg: 'linear-gradient(145deg, #22C55E, #16A34A)' },
];

// Neon block colors for the stacks - brighter, more vivid
const BLOCK_COLORS = {
  neonBlue: { bg: '#3B9EFF', shadow: '#1565C0', highlight: '#90CAF9' },
  neonRed: { bg: '#FF4757', shadow: '#C0392B', highlight: '#FF8A80' },
  neonCyan: { bg: '#00D9FF', shadow: '#00838F', highlight: '#84FFFF' },
  neonGreen: { bg: '#00E676', shadow: '#00C853', highlight: '#B9F6CA' },
  neonOrange: { bg: '#FF9100', shadow: '#E65100', highlight: '#FFD180' },
  neonPurple: { bg: '#D500F9', shadow: '#9C27B0', highlight: '#EA80FC' },
  neonPink: { bg: '#FF4081', shadow: '#C51162', highlight: '#FF80AB' },
};

const BLOCK_SIZE = 48;

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

// Single 3D glossy plastic block - using CSS grid, no gaps
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
        boxShadow: `
          inset 4px 4px 10px ${color.highlight}90,
          inset -3px -3px 8px rgba(0,0,0,0.3)
        `,
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '6px',
      }}
    >
      {/* Top gloss shine */}
      <div 
        className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
    </div>
  );
};

// Left block stack - solid staircase shape using CSS grid
const LeftBlockStack = () => {
  // Staircase pattern: 4 rows tall on left, descending to 1 row on right
  // Grid is 3 columns x 5 rows
  const grid = [
    // Row 0 (top)
    [null, null, null],
    // Row 1
    [BLOCK_COLORS.neonCyan, null, null],
    // Row 2
    [BLOCK_COLORS.neonRed, BLOCK_COLORS.neonCyan, null],
    // Row 3
    [BLOCK_COLORS.neonRed, BLOCK_COLORS.neonPurple, BLOCK_COLORS.neonCyan],
    // Row 4 (bottom)
    [BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed],
  ];

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(3, ${BLOCK_SIZE}px)`,
        gridTemplateRows: `repeat(5, ${BLOCK_SIZE}px)`,
        gap: 0,
      }}
    >
      {grid.flatMap((row, rowIdx) =>
        row.map((color, colIdx) => (
          <div key={`${rowIdx}-${colIdx}`}>
            {color ? <Block color={color} /> : <div style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }} />}
          </div>
        ))
      )}
    </div>
  );
};

// Right block stack - solid staircase shape (mirror of left)
const RightBlockStack = () => {
  // Staircase pattern: 1 row on left, ascending to 4 rows on right
  const grid = [
    // Row 0 (top)
    [null, null, null],
    // Row 1
    [null, null, BLOCK_COLORS.neonGreen],
    // Row 2
    [null, BLOCK_COLORS.neonGreen, BLOCK_COLORS.neonGreen],
    // Row 3
    [BLOCK_COLORS.neonCyan, BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonOrange],
    // Row 4 (bottom)
    [BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonOrange],
  ];

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(3, ${BLOCK_SIZE}px)`,
        gridTemplateRows: `repeat(5, ${BLOCK_SIZE}px)`,
        gap: 0,
      }}
    >
      {grid.flatMap((row, rowIdx) =>
        row.map((color, colIdx) => (
          <div key={`${rowIdx}-${colIdx}`}>
            {color ? <Block color={color} /> : <div style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }} />}
          </div>
        ))
      )}
    </div>
  );
};

// Center floating piece - Pink glowing balloon/gem
const CenterFloatingPiece = () => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
      {/* Radial glow behind piece */}
      <div
        className="absolute -inset-12"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(236,72,153,0.4) 30%, rgba(168,85,247,0.2) 50%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      {/* The pink gem/balloon shape */}
      <div
        className="relative w-20 h-24 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
        style={{
          background: 'linear-gradient(180deg, #FF80AB 0%, #F48FB1 30%, #EC407A 70%, #AD1457 100%)',
          boxShadow: `
            0 8px 0 #880E4F,
            0 12px 30px rgba(236,64,122,0.5),
            inset 0 -10px 20px rgba(136,14,79,0.3),
            inset 8px 8px 20px rgba(255,255,255,0.5)
          `,
        }}
      >
        {/* Gloss highlight */}
        <div
          className="absolute top-3 left-4 w-6 h-8 rounded-full"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at 30% 30%, rgba(255,255,255,0.7) 0%, transparent 60%)',
          }}
        />
        {/* Bottom connector */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-4"
          style={{
            background: 'linear-gradient(180deg, #AD1457 0%, #880E4F 100%)',
            borderRadius: '0 0 4px 4px',
          }}
        />
      </div>
    </div>
  );
};

// Bottom floor blocks - center platform
const FloorBlocks = () => {
  const blocks = [
    BLOCK_COLORS.neonBlue,
    BLOCK_COLORS.neonCyan,
    BLOCK_COLORS.neonPurple,
    BLOCK_COLORS.neonCyan,
    BLOCK_COLORS.neonBlue,
  ];

  return (
    <div
      className="grid absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        gridTemplateColumns: `repeat(5, ${BLOCK_SIZE}px)`,
        gap: 0,
      }}
    >
      {blocks.map((color, i) => (
        <Block key={i} color={color} />
      ))}
    </div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Element icons row */}
      <ElementIconsRow />

      {/* Main display with blocks and floating piece */}
      <div className="relative h-[280px] w-[380px] sm:w-[420px]">
        {/* Left stack - solid staircase */}
        <div className="absolute left-0 bottom-0">
          <LeftBlockStack />
        </div>

        {/* Center floating piece with glow */}
        <CenterFloatingPiece />

        {/* Right stack - solid staircase (mirrored) */}
        <div className="absolute right-0 bottom-0">
          <RightBlockStack />
        </div>

        {/* Floor blocks connecting the stacks */}
        <FloorBlocks />
      </div>
    </div>
  );
};

export default HeroBlockDisplay;
