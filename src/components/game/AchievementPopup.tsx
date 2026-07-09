import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import { Achievement } from '@/hooks/useAchievements';
import { useEffect } from 'react';
import { playSound } from '@/game/sounds';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementPopup({ achievement, onDismiss }: AchievementPopupProps) {
  useEffect(() => {
    if (achievement) {
      playSound('highScore');
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          data-non-modal
          role="status"
          aria-live="polite"
          className="fixed top-20 sm:top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 mx-auto max-w-sm sm:max-w-none sm:w-auto"
          onClick={onDismiss}
        >
          <motion.div
            className="relative neon-row neon-row--cyan rounded-2xl px-4 sm:px-6 py-3 sm:py-4 cursor-pointer backdrop-blur-xl"
            animate={{ 
              boxShadow: [
                '0 0 24px hsl(190 95% 60% / 0.35)',
                '0 0 48px hsl(325 95% 62% / 0.45)',
                '0 0 24px hsl(190 95% 60% / 0.35)',
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {/* Sparkle effects - CSS animations instead of Framer Motion infinite loops */}
            <div className="absolute -top-2 -left-2 w-4 h-4 text-[hsl(var(--neon-cyan))] hidden sm:block animate-sparkle">
              ✦
            </div>
            <div className="absolute -top-1 -right-3 w-3 h-3 text-[hsl(var(--neon-mint))] hidden sm:block animate-sparkle-delayed-1">
              ✦
            </div>
            <div className="absolute -bottom-2 right-4 w-3 h-3 text-[hsl(var(--neon-magenta))] hidden sm:block animate-sparkle-delayed-2">
              ✦
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full neon-icon-chip flex items-center justify-center text-2xl sm:text-3xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {achievement.icon}
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)))',
                    boxShadow: '0 0 12px hsl(var(--neon-cyan) / 0.65)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-[hsl(245_70%_8%)]" />
                </motion.div>
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="font-display text-[10px] sm:text-xs font-bold text-[hsl(var(--neon-cyan))] uppercase tracking-[0.18em] mb-0.5">
                  Achievement Unlocked!
                </p>
                <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-wide text-white mb-0.5 truncate">
                  {achievement.name}
                </h3>
                <p className="text-xs sm:text-sm text-white/65">
                  +{achievement.points} points
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementPopup;
