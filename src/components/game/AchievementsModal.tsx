import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Lock } from 'lucide-react';
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md max-h-[80vh] bg-game-grid-dark border border-game-grid-border/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.15), 0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-game-grid-dark/95 backdrop-blur-sm border-b border-game-grid-border/30 px-6 py-4 z-10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-900" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Achievements</h2>
                  <p className="text-sm text-game-text-muted">
                    {unlockedCount}/{achievements.length} unlocked • {totalPoints} pts
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements list */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-100px)]">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative p-4 rounded-xl border transition-all
                    ${achievement.unlocked 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-white/5 border-white/10 opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${achievement.unlocked 
                        ? 'bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-500/30' 
                        : 'bg-white/10 border border-white/10'
                      }
                    `}>
                      {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-white/40" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`font-bold truncate ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                          {achievement.name}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          achievement.unlocked 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-white/10 text-white/40'
                        }`}>
                          +{achievement.points}
                        </span>
                      </div>
                      <p className={`text-sm ${achievement.unlocked ? 'text-game-text-muted' : 'text-white/30'}`}>
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
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
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
                        className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center"
                      >
                        <span className="text-green-400">✓</span>
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
