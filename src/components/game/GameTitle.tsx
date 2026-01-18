import { Crown } from 'lucide-react';

// Exact colors from reference - each letter gets a unique vibrant color
const letterColors = [
  { bg: '#EF4444', shadow: '#B91C1C', glow: '#EF4444' }, // E - Red
  { bg: '#3B82F6', shadow: '#1D4ED8', glow: '#3B82F6' }, // L - Blue
  { bg: '#22C55E', shadow: '#15803D', glow: '#22C55E' }, // E - Green
  { bg: '#F97316', shadow: '#C2410C', glow: '#F97316' }, // M - Orange
  { bg: '#8B5CF6', shadow: '#6D28D9', glow: '#8B5CF6' }, // E - Purple
  { bg: '#EAB308', shadow: '#A16207', glow: '#EAB308' }, // N - Yellow
  { bg: '#06B6D4', shadow: '#0891B2', glow: '#06B6D4' }, // T - Cyan
  { bg: '#EC4899', shadow: '#BE185D', glow: '#EC4899' }, // A - Pink
  { bg: '#EF4444', shadow: '#B91C1C', glow: '#EF4444' }, // L - Red
];

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string; glow: string };
  size: 'normal' | 'large';
  index: number;
}

const BlockLetter = ({ letter, color, size, index }: BlockLetterProps) => {
  const fontSize = size === 'large' ? 'text-5xl sm:text-6xl md:text-7xl' : 'text-3xl sm:text-4xl md:text-5xl';
  const shadowOffset = size === 'large' ? 5 : 4;
  
  return (
    <span
      className={`${fontSize} font-black relative inline-block`}
      style={{
        fontFamily: "'Fredoka One', 'Nunito', 'Baloo 2', sans-serif",
        color: color.bg,
        textShadow: `
          0 ${shadowOffset}px 0 ${color.shadow},
          0 ${shadowOffset + 2}px 4px rgba(0,0,0,0.4),
          0 0 25px ${color.glow}60,
          0 0 50px ${color.glow}30
        `,
        WebkitTextStroke: '1.5px rgba(255,255,255,0.4)',
        letterSpacing: '-0.02em',
        transform: `rotate(${(index % 3 - 1) * 2}deg)`,
      }}
    >
      {/* White gloss highlight on each letter */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 30%, transparent 50%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          opacity: 0.6,
        }}
      />
      {letter}
    </span>
  );
};

// BLAST uses ice blue gradient
const BlastLetter = ({ letter, index }: { letter: string; index: number }) => {
  return (
    <span
      className="text-5xl sm:text-6xl md:text-7xl font-black relative inline-block italic"
      style={{
        fontFamily: "'Fredoka One', 'Nunito', 'Baloo 2', sans-serif",
        background: 'linear-gradient(180deg, #E0F7FF 0%, #67E8F9 30%, #22D3EE 70%, #0891B2 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: 'none',
        filter: 'drop-shadow(0 5px 0 #0369A1) drop-shadow(0 8px 15px rgba(6, 182, 212, 0.5))',
        letterSpacing: '-0.01em',
        transform: `skewX(-5deg)`,
      }}
    >
      {letter}
    </span>
  );
};

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLAST';

  return (
    <div className="flex flex-col items-center gap-0 relative">
      {/* Crown positioned on top of the title */}
      <div className="relative mb-0">
        <Crown 
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" 
          fill="#FBBF24"
          stroke="#B45309"
          strokeWidth={1.5}
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 15px rgba(251, 191, 36, 0.5))',
            transform: 'rotate(-5deg)',
          }}
        />
      </div>

      {/* First word - ELEMENTAL with colorful bubble letters */}
      <div className="flex items-center justify-center -mt-1">
        {word1.split('').map((letter, i) => (
          <BlockLetter
            key={`w1-${i}`}
            letter={letter}
            color={letterColors[i % letterColors.length]}
            size="normal"
            index={i}
          />
        ))}
      </div>

      {/* Second word - BLAST with ice blue gradient, italic */}
      <div className="flex items-center justify-center -mt-2 sm:-mt-3">
        {word2.split('').map((letter, i) => (
          <BlastLetter key={`w2-${i}`} letter={letter} index={i} />
        ))}
      </div>
    </div>
  );
};

export default GameTitle;
