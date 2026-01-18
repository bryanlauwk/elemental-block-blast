import { Crown } from 'lucide-react';

// Colors: Red, Blue, Green, Orange pattern repeating
const letterColors = [
  { bg: '#EF4444', shadow: '#7F1D1D' }, // E - Red
  { bg: '#3B82F6', shadow: '#1E3A8A' }, // L - Blue
  { bg: '#22C55E', shadow: '#14532D' }, // E - Green
  { bg: '#F97316', shadow: '#7C2D12' }, // M - Orange
  { bg: '#EF4444', shadow: '#7F1D1D' }, // E - Red
  { bg: '#3B82F6', shadow: '#1E3A8A' }, // N - Blue
  { bg: '#22C55E', shadow: '#14532D' }, // T - Green
  { bg: '#F97316', shadow: '#7C2D12' }, // A - Orange
  { bg: '#EF4444', shadow: '#7F1D1D' }, // L - Red
];

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string };
  index: number;
}

const BlockLetter = ({ letter, color, index }: BlockLetterProps) => {
  return (
    <span
      className="text-4xl sm:text-5xl md:text-6xl font-black relative inline-block"
      style={{
        fontFamily: "'Fredoka One', cursive",
        color: color.bg,
        textShadow: `
          3px 3px 0 ${color.shadow},
          4px 4px 0 ${color.shadow},
          5px 5px 0 ${color.shadow},
          6px 6px 0 ${color.shadow},
          7px 7px 8px rgba(0,0,0,0.6),
          0 0 20px rgba(0,0,0,0.3)
        `,
        WebkitTextStroke: '1px rgba(0,0,0,0.3)',
        letterSpacing: '0.02em',
      }}
    >
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
