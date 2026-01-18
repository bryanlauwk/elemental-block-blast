import { motion } from 'framer-motion';

const letterColors = [
  'from-orange-400 to-orange-600',
  'from-cyan-400 to-cyan-600',
  'from-pink-400 to-pink-600',
  'from-yellow-400 to-yellow-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-blue-400 to-blue-600',
  'from-red-400 to-red-600',
  'from-teal-400 to-teal-600',
];

const glowColors = [
  'rgba(251, 146, 60, 0.8)',
  'rgba(34, 211, 238, 0.8)',
  'rgba(244, 114, 182, 0.8)',
  'rgba(250, 204, 21, 0.8)',
  'rgba(52, 211, 153, 0.8)',
  'rgba(168, 85, 247, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(45, 212, 191, 0.8)',
];

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLAST';

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.2), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* First word */}
      <div className="flex items-center justify-center">
        {word1.split('').map((letter, i) => (
          <motion.span
            key={`w1-${i}`}
            className={`text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-b ${letterColors[i % letterColors.length]} bg-clip-text text-transparent relative`}
            style={{
              filter: `drop-shadow(0 0 10px ${glowColors[i % glowColors.length]})`,
              WebkitTextStroke: '1px rgba(255,255,255,0.15)',
            }}
            initial={{ opacity: 0, y: -40, rotate: -15, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              rotate: (i % 2 === 0 ? 3 : -3),
              scale: 1,
            }}
            transition={{ 
              delay: i * 0.06,
              type: 'spring',
              stiffness: 250,
              damping: 12,
            }}
            whileHover={{
              scale: 1.3,
              rotate: (i % 2 === 0 ? -8 : 8),
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            {letter}
            {/* Letter shadow layers for 3D effect */}
            <span 
              className={`absolute inset-0 bg-gradient-to-b ${letterColors[i % letterColors.length]} bg-clip-text text-transparent opacity-50 blur-[1px]`}
              style={{ transform: 'translate(2px, 2px)', zIndex: -1 }}
            >
              {letter}
            </span>
          </motion.span>
        ))}
      </div>

      {/* Second word - larger with bounce */}
      <div className="flex items-center justify-center">
        {word2.split('').map((letter, i) => (
          <motion.span
            key={`w2-${i}`}
            className={`text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-b ${letterColors[(i + 4) % letterColors.length]} bg-clip-text text-transparent relative`}
            style={{
              filter: `drop-shadow(0 0 15px ${glowColors[(i + 4) % glowColors.length]}) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`,
              WebkitTextStroke: '2px rgba(255,255,255,0.2)',
            }}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotate: (i % 2 === 0 ? -4 : 4),
            }}
            transition={{ 
              delay: 0.4 + i * 0.1,
              type: 'spring',
              stiffness: 200,
              damping: 10,
            }}
            whileHover={{
              scale: 1.4,
              rotate: 0,
              y: -8,
              transition: { duration: 0.2 }
            }}
          >
            {letter}
            {/* Deep shadow for 3D pop */}
            <span 
              className={`absolute inset-0 bg-gradient-to-b ${letterColors[(i + 4) % letterColors.length]} bg-clip-text text-transparent opacity-40 blur-[2px]`}
              style={{ transform: 'translate(3px, 3px)', zIndex: -1 }}
            >
              {letter}
            </span>
            <span 
              className={`absolute inset-0 bg-gradient-to-b ${letterColors[(i + 4) % letterColors.length]} bg-clip-text text-transparent opacity-20 blur-[3px]`}
              style={{ transform: 'translate(5px, 5px)', zIndex: -2 }}
            >
              {letter}
            </span>
          </motion.span>
        ))}
      </div>

      {/* Floating sparkle accents around title */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2"
          style={{
            left: `${10 + i * 18}%`,
            top: `${20 + (i % 2) * 60}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            delay: 0.8 + i * 0.3,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        >
          <svg viewBox="0 0 24 24" fill={glowColors[i % glowColors.length]}>
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default GameTitle;
