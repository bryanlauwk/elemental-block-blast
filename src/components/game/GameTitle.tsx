import { motion } from 'framer-motion';

const letterColors = [
  'from-orange-400 to-orange-500',
  'from-cyan-400 to-cyan-500',
  'from-pink-400 to-pink-500',
  'from-yellow-400 to-yellow-500',
  'from-emerald-400 to-emerald-500',
  'from-purple-400 to-purple-500',
  'from-blue-400 to-blue-500',
  'from-red-400 to-red-500',
  'from-teal-400 to-teal-500',
];

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLAST';

  return (
    <div className="flex flex-col items-center gap-1">
      {/* First word */}
      <div className="flex items-center justify-center">
        {word1.split('').map((letter, i) => (
          <motion.span
            key={`w1-${i}`}
            className={`text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-b ${letterColors[i % letterColors.length]} bg-clip-text text-transparent drop-shadow-lg`}
            style={{
              textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)',
              WebkitTextStroke: '1px rgba(255,255,255,0.1)',
            }}
            initial={{ opacity: 0, y: -30, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              rotate: (i % 2 === 0 ? 2 : -2),
            }}
            transition={{ 
              delay: i * 0.05,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{
              scale: 1.2,
              rotate: (i % 2 === 0 ? -5 : 5),
              transition: { duration: 0.2 }
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Second word - larger */}
      <div className="flex items-center justify-center">
        {word2.split('').map((letter, i) => (
          <motion.span
            key={`w2-${i}`}
            className={`text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-b ${letterColors[(i + 4) % letterColors.length]} bg-clip-text text-transparent`}
            style={{
              textShadow: '0 6px 12px rgba(0,0,0,0.5), 0 12px 24px rgba(0,0,0,0.3)',
              WebkitTextStroke: '1px rgba(255,255,255,0.15)',
            }}
            initial={{ opacity: 0, y: 30, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotate: (i % 2 === 0 ? -3 : 3),
            }}
            transition={{ 
              delay: 0.3 + i * 0.08,
              type: 'spring',
              stiffness: 180,
              damping: 12,
            }}
            whileHover={{
              scale: 1.3,
              rotate: 0,
              transition: { duration: 0.2 }
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

export default GameTitle;
