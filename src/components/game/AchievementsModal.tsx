import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Lock, Trophy } from 'lucide-react';
import { Achievement } from '@/hooks/useAchievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  totalPoints: number;
}

export function AchievementsModal({ isOpen, onClose, achievements, totalPoints }: AchievementsModalProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--neon-bg-deep)/0.78)] backdrop-blur-2xl backdrop-saturate-150 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="neon-modal-shell w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="neon-accent-bar" />

            {/* Header */}
            <div className="sticky top-0 backdrop-blur-md border-b border-[hsl(var(--neon-cyan)/0.2)] px-4 sm:px-6 py-3 sm:py-4 z-10"
              style={{ background: 'hsl(var(--neon-bg-deep) / 0.7)' }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="neon-icon-chip neon-icon-chip--amber w-11 h-11">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">Achievements</h2>
                  <p className="text-sm text-white/50">
                    <span className="font-display text-[hsl(var(--neon-amber))] font-bold">{unlockedCount}/{achievements.length}</span> unlocked • <span className="font-display text-[hsl(var(--neon-cyan))] font-bold">{totalPoints}</span> pts
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements list */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto flex-1 min-h-0">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`neon-row p-4 ${achievement.unlocked ? 'neon-row--amber' : 'neon-row--locked'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      achievement.unlocked
                        ? 'neon-icon-chip neon-icon-chip--amber'
                        : 'bg-white/5 border border-white/10'
                    }`}
                    >
                      {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-white/40" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`font-display font-bold uppercase tracking-wide truncate ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                          {achievement.name}
                        </h3>
                        <span className={`font-display text-xs font-bold px-2 py-0.5 rounded-full ${
                          achievement.unlocked 
                            ? 'bg-[hsl(var(--neon-amber)/0.18)] text-[hsl(var(--neon-amber))] border border-[hsl(var(--neon-amber)/0.4)]'
                            : 'bg-white/10 text-white/40'
                        }`}>
                          +{achievement.points}
                        </span>
                      </div>
                      <p className={`text-sm ${achievement.unlocked ? 'text-white/60' : 'text-white/30'}`}>
                        {achievement.description}
                      </p>

                      {/* Progress bar for progressive achievements */}
                      {achievement.maxProgress && !achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-white/40 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background:
                                  'linear-gradient(90deg, hsl(var(--neon-cyan)) 0%, hsl(var(--neon-magenta)) 100%)',
                                boxShadow:
                                  '0 0 12px hsl(var(--neon-cyan) / 0.5)',
                              }}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` 
                              }}
                              transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Unlocked checkmark */}
                    {achievement.unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="neon-icon-chip w-8 h-8 rounded-full"
                      >
                        <span className="text-[hsl(var(--neon-cyan))]">✓</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementsModal;
