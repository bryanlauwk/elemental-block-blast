import { Crown, Flame, Droplets, TreeDeciduous, Mountain, Wind } from 'lucide-react';

// Rainbow colors for ELEMENTAL - bigger, bolder mobile-first
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

// Element icons with rich gradients and textures
const elementIcons = [
  { 
    icon: Flame, 
    bgFrom: '#FF6B35', 
    bgTo: '#DC2626',
    shadowColor: '#991B1B',
    iconColor: '#FEF08A',
  },
  { 
    icon: Droplets, 
    bgFrom: '#38BDF8', 
    bgTo: '#0284C7',
    shadowColor: '#075985',
    iconColor: '#E0F2FE',
  },
  { 
    icon: TreeDeciduous, 
    bgFrom: '#A16207', 
    bgTo: '#78350F',
    shadowColor: '#451A03',
    iconColor: '#FEF3C7',
  },
  { 
    icon: Mountain, 
    bgFrom: '#92400E', 
    bgTo: '#57534E',
    shadowColor: '#292524',
    iconColor: '#D6D3D1',
  },
  { 
    icon: Wind, 
    bgFrom: '#4ADE80', 
    bgTo: '#16A34A',
    shadowColor: '#14532D',
    iconColor: '#DCFCE7',
  },
];

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string };
  index: number;
}

const BlockLetter = ({ letter, color, index }: BlockLetterProps) => {
  return (
    <span
      className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-black relative inline-block"
      style={{
        fontFamily: "'Fredoka One', cursive",
        color: color.bg,
        textShadow: `
          1px 1px 0 ${color.shadow},
          2px 2px 0 ${color.shadow},
          3px 3px 0 ${color.shadow},
          4px 4px 0 ${color.shadow},
          5px 5px 10px rgba(0,0,0,0.6)
        `,
        WebkitTextStroke: '0.5px rgba(0,0,0,0.15)',
        letterSpacing: '-0.02em',
      }}
    >
      {/* Gloss highlight on each letter */}
      <span
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 35%, transparent 50%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }}
      />
      {letter}
    </span>
  );
};

// BLAST - bigger ice blue 3D text
const BlastLetter = ({ letter, index }: { letter: string; index: number }) => {
  return (
    <span
      className="text-[3rem] sm:text-6xl md:text-7xl lg:text-8xl font-black relative inline-block"
      style={{
        fontFamily: "'Fredoka One', cursive",
        color: '#4FC3F7',
        textShadow: `
          2px 2px 0 #01579B,
          3px 3px 0 #01579B,
          4px 4px 0 #01579B,
          5px 5px 0 #0277BD,
          6px 6px 0 #0277BD,
          7px 7px 15px rgba(2, 136, 209, 0.8)
        `,
        WebkitTextStroke: '1px #0288D1',
        letterSpacing: '0.02em',
      }}
    >
      {/* Highlight overlay */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 45%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }}
      />
      {letter}
    </span>
  );
};

// Polished Element Icons Row with rich 3D appearance
const ElementIcons = () => {
  return (
    <div className="flex gap-2.5 sm:gap-3 mt-4 sm:mt-5">
      {elementIcons.map((el, i) => (
        <div
          key={i}
          className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transform hover:scale-110 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${el.bgFrom} 0%, ${el.bgTo} 100%)`,
            boxShadow: `
              0 4px 0 ${el.shadowColor}, 
              0 6px 12px rgba(0,0,0,0.4), 
              inset 0 2px 4px rgba(255,255,255,0.35),
              inset 0 -2px 4px rgba(0,0,0,0.2)
            `,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {/* Inner glow */}
          <div 
            className="absolute inset-1 rounded-lg pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
            }}
          />
          {/* Shine spot */}
          <div 
            className="absolute top-1.5 left-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
            }}
          />
          <el.icon 
            className="w-5 h-5 sm:w-7 sm:h-7 relative z-10" 
            style={{ 
              color: el.iconColor,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
            }} 
          />
        </div>
      ))}
    </div>
  );
};

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLAST';

  return (
    <div className="flex flex-col items-center gap-0 relative px-2">
      {/* Crown positioned on top center - bigger */}
      <div className="relative mb-0 z-10">
        <Crown 
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" 
          fill="#FFC107"
          stroke="#FF8F00"
          strokeWidth={1.5}
          style={{
            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5)) drop-shadow(0 0 15px rgba(255, 193, 7, 0.7))',
          }}
        />
      </div>

      {/* First word - ELEMENTAL with rainbow bubble letters */}
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

      {/* Second word - BLAST with ice blue 3D text */}
      <div className="flex items-center justify-center -mt-2 sm:-mt-3">
        {word2.split('').map((letter, i) => (
          <BlastLetter key={`w2-${i}`} letter={letter} index={i} />
        ))}
      </div>

      {/* Element Icons Row */}
      <ElementIcons />
    </div>
  );
};

export default GameTitle;
