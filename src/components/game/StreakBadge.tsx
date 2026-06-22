import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  isAtRisk?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, isAtRisk = false, size = 'md' }: StreakBadgeProps) {
  if (streak === 0) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center font-bold font-sans rounded-full border-b-2
        ${sizeClasses[size]}
        ${isAtRisk
          ? 'bg-pixar-yellow text-pixar-navy-deep border-pixar-yellow-deep'
          : 'bg-pixar-red text-white border-pixar-red-deep'
        }
      `}
    >
      <motion.div
        animate={isAtRisk ? { 
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1]
        } : {
          scale: [1, 1.15, 1],
        }}
        transition={{ 
          duration: isAtRisk ? 0.8 : 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Flame className={iconSizes[size]} fill="currentColor" />
      </motion.div>
      <span>{streak}</span>
      {isAtRisk && size !== 'sm' && (
        <span className="text-pixar-navy-deep/70 text-[0.7em] ml-0.5">!</span>
      )}
    </motion.div>
  );
}

export default StreakBadge;
