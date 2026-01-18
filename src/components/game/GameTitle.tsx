import { Crown } from 'lucide-react';

// Rainbow colors for ELEMENTAL - Red, Orange, Yellow, Green, Cyan, Blue, Purple, Violet, Pink
const letterColors = [
  { bg: '#EF4444', shadow: '#7F1D1D' }, // E - Red
  { bg: '#F97316', shadow: '#7C2D12' }, // L - Orange
  { bg: '#EAB308', shadow: '#713F12' }, // E - Yellow
  { bg: '#22C55E', shadow: '#14532D' }, // M - Green
  { bg: '#06B6D4', shadow: '#164E63' }, // E - Cyan
  { bg: '#3B82F6', shadow: '#1E3A8A' }, // N - Blue
  { bg: '#8B5CF6', shadow: '#4C1D95' }, // T - Purple
  { bg: '#A855F7', shadow: '#581C87' }, // A - Violet
  { bg: '#EC4899', shadow: '#831843' }, // L - Pink
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
          2px 2px 0 ${color.shadow},
          3px 3px 0 ${color.shadow},
          4px 4px 0 ${color.shadow},
          5px 5px 0 ${color.shadow},
          6px 6px 10px rgba(0,0,0,0.5)
        `,
        WebkitTextStroke: '1px rgba(0,0,0,0.2)',
        letterSpacing: '0.01em',
      }}
    >
      {/* Gloss highlight on each letter */}
      <span
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 40%, transparent 50%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }}
      />
      {letter}
    </span>
  );
};

// BLAST uses ice blue gradient with strong shadow
const BlastLetter = ({ letter, index }: { letter: string; index: number }) => {
  return (
    <span
      className="text-6xl sm:text-7xl md:text-8xl font-black relative inline-block"
      style={{
        fontFamily: "'Fredoka One', cursive",
        background: 'linear-gradient(180deg, #E0F7FA 0%, #4FC3F7 25%, #29B6F6 50%, #0288D1 75%, #01579B 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 5px 0 #01579B) drop-shadow(0 8px 15px rgba(2, 136, 209, 0.7))',
        letterSpacing: '0.03em',
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
      {/* Crown positioned on top center */}
      <div className="relative mb-1 z-10">
        <Crown 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" 
          fill="#FFC107"
          stroke="#FF8F00"
          strokeWidth={1.5}
          style={{
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(255, 193, 7, 0.6))',
          }}
        />
      </div>

      {/* First word - ELEMENTAL with rainbow bubble letters */}
      <div className="flex items-center justify-center -mt-2">
        {word1.split('').map((letter, i) => (
          <BlockLetter
            key={`w1-${i}`}
            letter={letter}
            color={letterColors[i % letterColors.length]}
            index={i}
          />
        ))}
      </div>

      {/* Second word - BLAST with ice blue gradient */}
      <div className="flex items-center justify-center -mt-1 sm:-mt-2">
        {word2.split('').map((letter, i) => (
          <BlastLetter key={`w2-${i}`} letter={letter} index={i} />
        ))}
      </div>
    </div>
  );
};

export default GameTitle;
