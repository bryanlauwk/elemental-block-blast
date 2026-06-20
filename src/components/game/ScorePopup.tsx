import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScorePopupProps {
  score: number;
  show: boolean;
  text: string;
  reactionType?: 'burn' | 'extinguish' | 'dissolve';
}

const reactionConfig = {
  burn: { icon: Flame, color: 'text-orange-400', label: 'BURN!' },
  extinguish: { icon: Droplets, color: 'text-blue-400', label: 'SPLASH!' },
  dissolve: { icon: FlaskConical, color: 'text-green-400', label: 'DISSOLVE!' },
};

export function ScorePopup({ score, show, text, reactionType }: ScorePopupProps) {
  const config = reactionType ? reactionConfig[reactionType] : null;
  const Icon = config?.icon;

  return (
    <AnimatePresence>
      {show && score > 0 && (
        <motion.div
          initial={{ scale: 0, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -50, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50"
        >
          {/* Reaction type indicator */}
          {config && Icon && (
            <motion.div
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className={cn('flex items-center gap-2 mb-1', config.color)}
            >
              <Icon className="w-6 h-6" />
              <span className="text-lg font-bold">{config.label}</span>
            </motion.div>
          )}

          {/* Score value — neon tier-tinted, motion-blur rise */}
          <motion.div
            initial={{ scale: 0.7, y: 20, filter: 'blur(6px)' }}
            animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ scale: 0.9, y: -40, filter: 'blur(8px)', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="text-center"
          >
            <span
              className={cn(
                'text-5xl sm:text-6xl font-black bg-clip-text text-transparent drop-shadow-[0_4px_24px_hsl(var(--neon-magenta)/0.55)]',
                score >= 500
                  ? 'bg-gradient-to-r from-neon-magenta via-neon-violet to-neon-cyan'
                  : score >= 200
                    ? 'bg-gradient-to-r from-neon-amber via-neon-magenta to-neon-violet'
                    : 'bg-gradient-to-r from-neon-mint via-neon-cyan to-neon-magenta',
              )}
              style={{ textShadow: '0 0 18px hsl(var(--neon-mint) / 0.45)' }}
            >
              +{score}
            </span>
          </motion.div>
          
          {/* Combo text */}
          {text && !reactionType && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mt-2"
            >
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
                {text}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
