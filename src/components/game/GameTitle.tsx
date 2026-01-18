import { motion } from 'framer-motion';

// Full rainbow colors for ELEMENTAL BLAST - each letter unique
const allLetterColors = [
  // ELEMENTAL
  { bg: '#FF4D4D', shadow: '#991F1F' }, // E - Bright Red
  { bg: '#FF8C42', shadow: '#994D1F' }, // L - Orange
  { bg: '#FFD93D', shadow: '#997A1F' }, // E - Yellow
  { bg: '#6BCB77', shadow: '#2F6B3A' }, // M - Green
  { bg: '#4DD4E1', shadow: '#1F7A85' }, // E - Cyan
  { bg: '#4EA8DE', shadow: '#1F5C85' }, // N - Sky Blue
  { bg: '#7B68EE', shadow: '#3D2E99' }, // T - Purple
  { bg: '#DA70D6', shadow: '#7A3077' }, // A - Orchid
  { bg: '#FF69B4', shadow: '#993366' }, // L - Hot Pink
  // BLAST
  { bg: '#00CED1', shadow: '#006B6B' }, // B - Dark Cyan
  { bg: '#32CD32', shadow: '#1A6B1A' }, // L - Lime Green  
  { bg: '#FFD700', shadow: '#8B7500' }, // A - Gold
  { bg: '#FF6347', shadow: '#8B2500' }, // S - Tomato
  { bg: '#FF4D4D', shadow: '#991F1F' }, // T - Red
];

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string };
  index: number;
  isSecondWord?: boolean;
}

const BlockLetter = ({ letter, color, index, isSecondWord }: BlockLetterProps) => {
  // Slight random rotation for playful feel
  const rotation = (index % 2 === 0 ? 1 : -1) * (1 + (index % 3));
  
  return (
    <motion.span
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.03,
        type: 'spring',
        stiffness: 400,
        damping: 15
      }}
      className={`relative inline-block font-black ${
        isSecondWord 
          ? 'text-[2.8rem] sm:text-[3.5rem] md:text-[4.5rem]' 
          : 'text-[2.2rem] sm:text-[2.8rem] md:text-[3.5rem]'
      }`}
      style={{
        fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
        color: color.bg,
        transform: `rotate(${rotation}deg)`,
        textShadow: `
          2px 2px 0 ${color.shadow},
          3px 3px 0 ${color.shadow},
          4px 4px 0 ${color.shadow},
          5px 5px 0 ${color.shadow},
          ${isSecondWord ? '6px 6px 0' : '5px 5px 0'} ${color.shadow},
          ${isSecondWord ? '7px 7px 0' : '6px 6px 0'} rgba(0,0,0,0.3),
          0 0 30px ${color.bg}60
        `,
        WebkitTextStroke: '1px rgba(0,0,0,0.15)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}
    >
      {/* Gloss highlight overlay */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 40%, transparent 50%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }}
      />
      {letter}
    </motion.span>
  );
};

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLAST';

  return (
    <motion.div 
      className="flex flex-col items-center gap-0 relative px-2"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Glow behind title */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.3) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      
      {/* First word - ELEMENTAL */}
      <div className="flex items-center justify-center">
        {word1.split('').map((letter, i) => (
          <BlockLetter
            key={`w1-${i}`}
            letter={letter}
            color={allLetterColors[i]}
            index={i}
          />
        ))}
      </div>

      {/* Second word - BLAST - larger and bolder */}
      <div className="flex items-center justify-center -mt-2 sm:-mt-4">
        {word2.split('').map((letter, i) => (
          <BlockLetter 
            key={`w2-${i}`} 
            letter={letter} 
            color={allLetterColors[9 + i]} 
            index={9 + i}
            isSecondWord
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GameTitle;
