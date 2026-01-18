import { ReactNode } from 'react';

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

const BLOCK_SIZE = 44;

// Single 3D glossy plastic block
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
// Pattern: 4 cols, tallest on left (5 rows), descending to 2 rows on right
const LeftBlockStack = () => {
  // 4 columns x 5 rows grid, fill from bottom-up per column
  const grid = [
    // Row 0 (top) - only col 0 has block
    [BLOCK_COLORS.neonCyan, null, null, null],
    // Row 1 - cols 0-1 have blocks
    [BLOCK_COLORS.neonRed, BLOCK_COLORS.neonCyan, null, null],
    // Row 2 - cols 0-2 have blocks
    [BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonGreen, null],
    // Row 3 - all cols have blocks
    [BLOCK_COLORS.neonPurple, BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonCyan],
    // Row 4 (bottom) - all cols have blocks
    [BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonGreen, BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed],
  ];

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(4, ${BLOCK_SIZE}px)`,
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
// Pattern: 4 cols, 2 rows on left ascending to 5 rows (tallest) on right
const RightBlockStack = () => {
  const grid = [
    // Row 0 (top) - only col 3 has block
    [null, null, null, BLOCK_COLORS.neonGreen],
    // Row 1 - cols 2-3 have blocks
    [null, null, BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonGreen],
    // Row 2 - cols 1-3 have blocks
    [null, BLOCK_COLORS.neonCyan, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonOrange],
    // Row 3 - all cols have blocks
    [BLOCK_COLORS.neonGreen, BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed],
    // Row 4 (bottom) - all cols have blocks
    [BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonGreen, BLOCK_COLORS.neonBlue],
  ];

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(4, ${BLOCK_SIZE}px)`,
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

// Center floating piece - L-shaped game block in neon red
const CenterBlockPiece = () => {
  // L-shape: 2 blocks tall, 2 blocks wide
  const piece = [
    [BLOCK_COLORS.neonRed, null],
    [BLOCK_COLORS.neonRed, BLOCK_COLORS.neonRed],
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-1/3 -translate-y-1/2 z-10">
      {/* Radial glow behind piece */}
      <div
        className="absolute -inset-8"
        style={{
          background: 'radial-gradient(circle, rgba(255,71,87,0.5) 0%, rgba(255,71,87,0.2) 40%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />
      {/* The block piece */}
      <div
        className="relative grid animate-bounce"
        style={{
          gridTemplateColumns: `repeat(2, ${BLOCK_SIZE}px)`,
          gridTemplateRows: `repeat(2, ${BLOCK_SIZE}px)`,
          gap: 0,
          animationDuration: '2s',
        }}
      >
        {piece.flatMap((row, rowIdx) =>
          row.map((color, colIdx) => (
            <div key={`${rowIdx}-${colIdx}`}>
              {color ? <Block color={color} /> : <div style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface HeroBlockDisplayProps {
  children?: ReactNode;
}

export const HeroBlockDisplay = ({ children }: HeroBlockDisplayProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* Main display with blocks and floating piece */}
      <div className="relative h-[260px] w-[400px] sm:w-[440px]">
        {/* Left stack - solid staircase */}
        <div className="absolute left-0 bottom-0">
          <LeftBlockStack />
        </div>

        {/* Center floating piece with glow */}
        <CenterBlockPiece />

        {/* Right stack - solid staircase (mirrored) */}
        <div className="absolute right-0 bottom-0">
          <RightBlockStack />
        </div>

        {/* CTA buttons slot - positioned in center bottom of staircase opening */}
        {children && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex flex-col items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBlockDisplay;