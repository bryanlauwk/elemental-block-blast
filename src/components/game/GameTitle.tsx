import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

// Vibrant colors matching the reference - each letter gets a unique color
const letterColors = [
  { bg: '#EF4444', shadow: '#B91C1C' }, // E - Red
  { bg: '#F97316', shadow: '#C2410C' }, // L - Orange
  { bg: '#22C55E', shadow: '#15803D' }, // E - Green
  { bg: '#3B82F6', shadow: '#1D4ED8' }, // M - Blue
  { bg: '#8B5CF6', shadow: '#6D28D9' }, // E - Purple
  { bg: '#EC4899', shadow: '#BE185D' }, // N - Pink
  { bg: '#14B8A6', shadow: '#0D9488' }, // T - Teal
  { bg: '#F59E0B', shadow: '#B45309' }, // A - Amber
  { bg: '#6366F1', shadow: '#4338CA' }, // L - Indigo
];

const blastColors = [
  { bg: '#3B82F6', shadow: '#1D4ED8' }, // B - Blue
  { bg: '#06B6D4', shadow: '#0891B2' }, // L - Cyan
  { bg: '#22D3EE', shadow: '#06B6D4' }, // A - Light Cyan
  { bg: '#67E8F9', shadow: '#22D3EE' }, // S - Lighter Cyan
  { bg: '#A5F3FC', shadow: '#67E8F9' }, // T - Lightest Cyan
];

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string };
  delay: number;
  size: 'normal' | 'large';
}

const BlockLetter = ({ letter, color, delay, size }: BlockLetterProps) => {
  const fontSize = size === 'large' ? 'text-5xl sm:text-6xl md:text-7xl' : 'text-3xl sm:text-4xl md:text-5xl';
  const shadowOffset = size === 'large' ? 5 : 4;
  
  return (
    <motion.span
      className={`${fontSize} font-black relative inline-block`}
      style={{
        color: color.bg,
        textShadow: `
          0 ${shadowOffset}px 0 ${color.shadow},
          0 ${shadowOffset + 2}px 4px rgba(0,0,0,0.3),
          0 0 20px ${color.bg}40
        `,
        WebkitTextStroke: '1px rgba(0,0,0,0.15)',
        letterSpacing: '-0.02em',
      }}
      initial={{ opacity: 0, y: -40, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay,
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
      whileHover={{
        scale: 1.1,
        y: -4,
        transition: { duration: 0.1 }
      }}
    >
      {letter}
    </motion.span>
  );
};

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLAST';

  return (
    <motion.div 
      className="flex flex-col items-center gap-0 relative"
    >
      {/* Crown above title */}
      <motion.div
        className="mb-1"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      >
        <Crown 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" 
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth={1.5}
          style={{
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))',
          }}
        />
      </motion.div>

      {/* First word - ELEMENTAL */}
      <div className="flex items-center justify-center">
        {word1.split('').map((letter, i) => (
          <BlockLetter
            key={`w1-${i}`}
            letter={letter}
            color={letterColors[i % letterColors.length]}
            delay={0.1 + i * 0.04}
            size="normal"
          />
        ))}
      </div>

      {/* Second word - BLAST with gradient blue tones */}
      <div className="flex items-center justify-center -mt-1 sm:-mt-2">
        {word2.split('').map((letter, i) => (
          <BlockLetter
            key={`w2-${i}`}
            letter={letter}
            color={blastColors[i % blastColors.length]}
            delay={0.4 + i * 0.05}
            size="large"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GameTitle;
