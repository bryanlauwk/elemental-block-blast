import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

// Solid, vibrant colors for 3D block letters - Block Blast style
const letterStyles = [
  { bg: '#FF6B4A', shadow: '#CC4A2E' }, // Orange-red
  { bg: '#4ECDC4', shadow: '#3BA59E' }, // Cyan
  { bg: '#FF69B4', shadow: '#CC4A8F' }, // Pink
  { bg: '#FFE66D', shadow: '#CCB84A' }, // Yellow
  { bg: '#4ADE80', shadow: '#38B866' }, // Green
  { bg: '#A855F7', shadow: '#8644C5' }, // Purple
  { bg: '#3B82F6', shadow: '#2E68C5' }, // Blue
  { bg: '#EF4444', shadow: '#BF3636' }, // Red
  { bg: '#2DD4BF', shadow: '#24AA99' }, // Teal
];

interface BlockLetterProps {
  letter: string;
  index: number;
  totalDelay: number;
  size: 'normal' | 'large';
  hasCrown?: boolean;
}

const BlockLetter = ({ letter, index, totalDelay, size, hasCrown }: BlockLetterProps) => {
  const style = letterStyles[index % letterStyles.length];
  const fontSize = size === 'large' ? 'text-6xl sm:text-7xl md:text-8xl' : 'text-4xl sm:text-5xl md:text-6xl';
  const shadowOffset = size === 'large' ? 6 : 4;
  
  return (
    <motion.span
      className={`${fontSize} font-black relative inline-block`}
      style={{
        color: style.bg,
        textShadow: `
          ${shadowOffset}px ${shadowOffset}px 0 ${style.shadow},
          ${shadowOffset * 1.6}px ${shadowOffset * 1.6}px 0 rgba(0,0,0,0.4),
          0 0 30px ${style.bg}50
        `,
        WebkitTextStroke: '1.5px rgba(0,0,0,0.25)',
        letterSpacing: '0.02em',
      }}
      initial={{ opacity: 0, y: -60, scale: 0.4, rotateX: -90 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0,
      }}
      transition={{ 
        delay: totalDelay + index * 0.06,
        type: 'spring',
        stiffness: 280,
        damping: 14,
      }}
      whileHover={{
        scale: 1.2,
        y: -8,
        transition: { duration: 0.12 }
      }}
    >
      {/* Crown on special letter */}
      {hasCrown && (
        <motion.div
          className="absolute -top-5 sm:-top-6 md:-top-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, scale: 0, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: totalDelay + 0.5, type: 'spring', stiffness: 300 }}
        >
          <Crown 
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-400 drop-shadow-lg" 
            fill="#FBBF24"
            strokeWidth={1.5}
          />
        </motion.div>
      )}
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
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Subtle glow behind title */}
      <motion.div
        className="absolute inset-0 blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.25), transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      />

      {/* First word */}
      <div className="flex items-center justify-center tracking-tight">
        {word1.split('').map((letter, i) => (
          <BlockLetter
            key={`w1-${i}`}
            letter={letter}
            index={i}
            totalDelay={0}
            size="normal"
          />
        ))}
      </div>

      {/* Second word - larger with crown on A */}
      <div className="flex items-center justify-center tracking-tight -mt-2 sm:-mt-3">
        {word2.split('').map((letter, i) => (
          <BlockLetter
            key={`w2-${i}`}
            letter={letter}
            index={i + 4}
            totalDelay={0.3}
            size="large"
            hasCrown={letter === 'A'}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GameTitle;
