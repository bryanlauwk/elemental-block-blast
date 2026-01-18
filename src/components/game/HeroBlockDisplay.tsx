import { ReactNode } from 'react';

// Vivid neon block colors - mobile arcade style
const BLOCK_COLORS = {
  neonBlue: { bg: '#3B9EFF', shadow: '#1565C0', highlight: '#90CAF9' },
  neonRed: { bg: '#FF4757', shadow: '#C0392B', highlight: '#FF8A80' },
  neonCyan: { bg: '#00D9FF', shadow: '#00838F', highlight: '#84FFFF' },
  neonGreen: { bg: '#00E676', shadow: '#00C853', highlight: '#B9F6CA' },
  neonOrange: { bg: '#FF9100', shadow: '#E65100', highlight: '#FFD180' },
  neonPurple: { bg: '#D500F9', shadow: '#9C27B0', highlight: '#EA80FC' },
  neonPink: { bg: '#FF4081', shadow: '#C51162', highlight: '#FF80AB' },
};

// Responsive block size
const BLOCK_SIZE_MOBILE = 36;
const BLOCK_SIZE_DESKTOP = 44;

// Single 3D glossy plastic block with mobile optimization
interface BlockProps {
  color: { bg: string; shadow: string; highlight: string };
  size?: number;
}

const Block = ({ color, size = BLOCK_SIZE_MOBILE }: BlockProps) => {
  return (
    <div
      className="relative overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        boxShadow: `
          inset 3px 3px 8px ${color.highlight}90,
          inset -2px -2px 6px rgba(0,0,0,0.35)
        `,
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: '5px',
      }}
    >
      {/* Top gloss shine */}
      <div 
        className="absolute top-1 left-1 w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, transparent 70%)',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

// Left block stack - mobile-first staircase
const LeftBlockStack = ({ blockSize }: { blockSize: number }) => {
  const grid = [
    [BLOCK_COLORS.neonCyan, null, null, null],
    [BLOCK_COLORS.neonRed, BLOCK_COLORS.neonCyan, null, null],
    [BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonGreen, null],
    [BLOCK_COLORS.neonPurple, BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonCyan],
    [BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonGreen, BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed],
  ];

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(4, ${blockSize}px)`,
        gridTemplateRows: `repeat(5, ${blockSize}px)`,
        gap: 0,
      }}
    >
      {grid.flatMap((row, rowIdx) =>
        row.map((color, colIdx) => (
          <div key={`${rowIdx}-${colIdx}`}>
            {color ? <Block color={color} size={blockSize} /> : <div style={{ width: blockSize, height: blockSize }} />}
          </div>
        ))
      )}
    </div>
  );
};

// Right block stack - mirrored staircase
const RightBlockStack = ({ blockSize }: { blockSize: number }) => {
  const grid = [
    [null, null, null, BLOCK_COLORS.neonGreen],
    [null, null, BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonGreen],
    [null, BLOCK_COLORS.neonCyan, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonOrange],
    [BLOCK_COLORS.neonGreen, BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonBlue, BLOCK_COLORS.neonRed],
    [BLOCK_COLORS.neonOrange, BLOCK_COLORS.neonRed, BLOCK_COLORS.neonGreen, BLOCK_COLORS.neonBlue],
  ];

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(4, ${blockSize}px)`,
        gridTemplateRows: `repeat(5, ${blockSize}px)`,
        gap: 0,
      }}
    >
      {grid.flatMap((row, rowIdx) =>
        row.map((color, colIdx) => (
          <div key={`${rowIdx}-${colIdx}`}>
            {color ? <Block color={color} size={blockSize} /> : <div style={{ width: blockSize, height: blockSize }} />}
          </div>
        ))
      )}
    </div>
  );
};

// Center floating balloon with neon pink glow
const CenterBalloon = () => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[35%] -translate-y-1/2 z-10">
      {/* Radial glow behind balloon */}
      <div
        className="absolute -inset-10"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.6) 0%, rgba(236,72,153,0.25) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      {/* Balloon shape */}
      <div
        className="relative w-16 h-20 sm:w-20 sm:h-24 animate-bounce"
        style={{
          animationDuration: '2.5s',
        }}
      >
        {/* Main balloon body */}
        <div
          className="absolute inset-0 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]"
          style={{
            background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 40%, #DB2777 100%)',
            boxShadow: `
              inset 6px 6px 20px rgba(255,255,255,0.5),
              inset -4px -4px 15px rgba(0,0,0,0.25),
              0 8px 30px rgba(236,72,153,0.6)
            `,
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        />
        {/* Shine spot */}
        <div
          className="absolute top-3 left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
          }}
        />
        {/* Knot at bottom */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3"
          style={{
            background: 'linear-gradient(135deg, #DB2777 0%, #9D174D 100%)',
            clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
          }}
        />
        {/* String */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-5"
          style={{
            background: 'linear-gradient(180deg, #9D174D 0%, rgba(157,23,77,0.3) 100%)',
          }}
        />
      </div>
    </div>
  );
};

interface HeroBlockDisplayProps {
  children?: ReactNode;
}

export const HeroBlockDisplay = ({ children }: HeroBlockDisplayProps) => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Main display - responsive sizing */}
      <div 
        className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px]"
        style={{ height: '220px' }}
      >
        {/* Left stack */}
        <div className="absolute left-0 bottom-0 hidden sm:block">
          <LeftBlockStack blockSize={BLOCK_SIZE_DESKTOP} />
        </div>
        <div className="absolute left-0 bottom-0 sm:hidden">
          <LeftBlockStack blockSize={BLOCK_SIZE_MOBILE} />
        </div>

        {/* Center floating balloon */}
        <CenterBalloon />

        {/* Right stack */}
        <div className="absolute right-0 bottom-0 hidden sm:block">
          <RightBlockStack blockSize={BLOCK_SIZE_DESKTOP} />
        </div>
        <div className="absolute right-0 bottom-0 sm:hidden">
          <RightBlockStack blockSize={BLOCK_SIZE_MOBILE} />
        </div>

        {/* CTA buttons - positioned in center opening */}
        {children && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 flex flex-col items-center gap-2.5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBlockDisplay;