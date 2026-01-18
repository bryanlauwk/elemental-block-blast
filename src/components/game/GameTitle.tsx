import { motion } from 'framer-motion';

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
}

const BlockLetter = ({ letter, index, totalDelay, size }: BlockLetterProps) => {
  const style = letterStyles[index % letterStyles.length];
  const fontSize = size === 'large' ? 'text-5xl sm:text-6xl md:text-7xl' : 'text-4xl sm:text-5xl md:text-6xl';
  const shadowOffset = size === 'large' ? 5 : 4;
  
  return (
    <motion.span
      className={`${fontSize} font-black relative inline-block`}
      style={{
        color: style.bg,
        textShadow: `
          ${shadowOffset}px ${shadowOffset}px 0 ${style.shadow},
          ${shadowOffset * 1.5}px ${shadowOffset * 1.5}px 0 rgba(0,0,0,0.3),
          0 0 20px ${style.bg}40
        `,
        WebkitTextStroke: '1px rgba(0,0,0,0.2)',
      }}
      initial={{ opacity: 0, y: -50, scale: 0.5, rotateX: -90 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0,
      }}
      transition={{ 
        delay: totalDelay + index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
      whileHover={{
        scale: 1.15,
        y: -5,
        transition: { duration: 0.15 }
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
    <div className="flex flex-col items-center gap-1 relative">
      {/* Subtle glow behind title */}
      <motion.div
        className="absolute inset-0 blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2), transparent 60%)',
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

      {/* Second word - larger with more emphasis */}
      <div className="flex items-center justify-center tracking-tight -mt-1">
        {word2.split('').map((letter, i) => (
          <BlockLetter
            key={`w2-${i}`}
            letter={letter}
            index={i + 4}
            totalDelay={0.3}
            size="large"
          />
        ))}
      </div>
    </div>
  );
};

export default GameTitle;
