import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const sparkleColors = [
  '#FFD700', // Gold
  '#FF69B4', // Hot Pink
  '#00FFFF', // Cyan
  '#FF6B35', // Orange
  '#9B59B6', // Purple
  '#FFFFFF', // White
];

export const Sparkles = ({ count = 30 }: { count?: number }) => {
  const sparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 1,
      color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1.2, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2 + 1,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 24 24" fill={sparkle.color}>
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default Sparkles;
