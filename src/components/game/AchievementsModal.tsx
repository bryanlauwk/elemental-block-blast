import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Lock, Trophy } from 'lucide-react';
import { Achievement } from '@/hooks/useAchievements';
import { modalStyles } from '@/game/theme';

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
            className="relative w-full max-w-md max-h-[80vh] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={modalStyles.container}
          >
            {/* Decorative top gradient bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: 'linear-gradient(90deg, #FF6B35 0%, #FFD700 50%, #00E5FF 100%)',
              }}
            />

            {/* Header */}
            <div className="sticky top-0 backdrop-blur-sm border-b border-white/10 px-6 py-4 z-10"
              style={{ background: 'rgba(15,23,42,0.95)' }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={modalStyles.headerIconGold}
                >
                  <Trophy className="w-6 h-6 text-amber-900" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Achievements</h2>
                  <p className="text-sm text-white/50">
                    <span className="text-[#FFD700] font-medium">{unlockedCount}/{achievements.length}</span> unlocked • <span className="text-[#00E5FF] font-medium">{totalPoints}</span> pts
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
                      ? 'border-[#FFD700]/30' 
                      : 'bg-white/5 border-white/10 opacity-60'
                    }
                  `}
                  style={achievement.unlocked ? modalStyles.infoBoxFire : undefined}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${achievement.unlocked 
                        ? '' 
                        : 'bg-white/10 border border-white/10'
                      }
                    `}
                    style={achievement.unlocked ? {
                      background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,159,67,0.15) 100%)',
                      border: '1px solid rgba(255,215,0,0.4)',
                    } : undefined}
                    >
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
                            ? 'bg-[#FFD700]/20 text-[#FFD700]' 
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
                                background: 'linear-gradient(90deg, #FF6B35 0%, #FFD700 100%)',
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
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(0,180,216,0.15) 100%)',
                          border: '1px solid rgba(0,229,255,0.5)',
                        }}
                      >
                        <span className="text-[#00E5FF]">✓</span>
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
