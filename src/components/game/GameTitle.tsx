import { Crown } from 'lucide-react';

// Rainbow colors for ELEMENTAL - Red, Orange, Yellow, Green, Blue, Purple cycling
const letterColors = [
  { bg: '#EF4444', shadow: '#991B1B', glow: '#EF4444' }, // E - Red
  { bg: '#F97316', shadow: '#C2410C', glow: '#F97316' }, // L - Orange
  { bg: '#FACC15', shadow: '#A16207', glow: '#FACC15' }, // E - Yellow
  { bg: '#22C55E', shadow: '#166534', glow: '#22C55E' }, // M - Green
  { bg: '#3B82F6', shadow: '#1E40AF', glow: '#3B82F6' }, // E - Blue
  { bg: '#A855F7', shadow: '#7C3AED', glow: '#A855F7' }, // N - Purple
  { bg: '#EF4444', shadow: '#991B1B', glow: '#EF4444' }, // T - Red
  { bg: '#F97316', shadow: '#C2410C', glow: '#F97316' }, // A - Orange
  { bg: '#FACC15', shadow: '#A16207', glow: '#FACC15' }, // L - Yellow
];

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string; glow: string };
  index: number;
}

const BlockLetter = ({ letter, color, index }: BlockLetterProps) => {
  return (
    <span
      className="text-6xl sm:text-7xl md:text-8xl font-black relative inline-block"
      style={{
        fontFamily: "'Fredoka One', 'Nunito', sans-serif",
        color: color.bg,
        textShadow: `
          0 6px 0 ${color.shadow},
          0 8px 0 ${color.shadow}99,
          0 12px 25px rgba(0,0,0,0.5),
          0 0 40px ${color.glow}50,
          0 0 80px ${color.glow}30
        `,
        WebkitTextStroke: '2px rgba(255,255,255,0.5)',
        letterSpacing: '-0.03em',
        transform: `rotate(${(index % 3 - 1) * 1.5}deg)`,
      }}
    >
      {/* White gloss highlight oval on each letter */}
      <span
        className="absolute pointer-events-none"
        style={{
          top: '8%',
          left: '15%',
          width: '50%',
          height: '25%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)',
          borderRadius: '50%',
          transform: 'rotate(-5deg)',
        }}
      />
      {letter}
    </span>
  );
};

// BLAST uses ice blue gradient with italic style
const BlastLetter = ({ letter, index }: { letter: string; index: number }) => {
  return (
    <span
      className="text-7xl sm:text-8xl md:text-9xl font-black relative inline-block italic"
      style={{
        fontFamily: "'Fredoka One', 'Nunito', sans-serif",
        background: 'linear-gradient(180deg, #E0F7FF 0%, #67E8F9 25%, #22D3EE 60%, #0891B2 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: 'none',
        filter: 'drop-shadow(0 6px 0 #0369A1) drop-shadow(0 10px 20px rgba(6, 182, 212, 0.6))',
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
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20" 
          fill="#FBBF24"
          stroke="#B45309"
          strokeWidth={1.5}
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))',
            transform: 'rotate(-5deg)',
          }}
        />
      </div>

      {/* First word - ELEMENTAL with colorful bubble letters 3x larger */}
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

      {/* Second word - BLAST with ice blue gradient, italic */}
      <div className="flex items-center justify-center -mt-4 sm:-mt-6">
        {word2.split('').map((letter, i) => (
          <BlastLetter key={`w2-${i}`} letter={letter} index={i} />
        ))}
      </div>
    </div>
  );
};

export default GameTitle;
