import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, Medal, Award, X, Loader2, Clock, Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDailyChallenge, DailyChallengeEntry } from '@/hooks/useDailyChallenge';
import { getTodayDateString, getDisplayDate } from '@/game/seededRandom';
import { modalStyles } from '@/game/theme';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChallenge: () => void;
  playerBestScore?: number | null;
  highlightPlayerName?: string;
}

export function DailyChallengeModal({ 
  isOpen, 
  onClose, 
  onStartChallenge,
  playerBestScore,
  highlightPlayerName
}: DailyChallengeModalProps) {
  const [scores, setScores] = useState<DailyChallengeEntry[]>([]);
  const { fetchDailyLeaderboard, isLoading, error } = useDailyChallenge();
  const today = getTodayDateString();

  useEffect(() => {
    if (isOpen) {
      fetchDailyLeaderboard(today).then(setScores);
    }
  }, [isOpen, today, fetchDailyLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-[#FFD700]" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Award className="w-5 h-5 text-[#FF9F43]" />;
      default:
        return <span className="w-5 text-center text-sm text-white/50">{rank}</span>;
    }
  };

  // Calculate time until next challenge
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pixar-navy-deep/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div 
              className="pixar-modal-shell p-4 sm:p-5"
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2.5 rounded-xl"
                    style={modalStyles.headerIconFire}
                  >
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Daily Challenge</h2>
                    <p className="text-xs text-white/50">{getDisplayDate(today)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Challenge Info */}
              <div 
                className="rounded-xl p-4 mb-4"
                style={modalStyles.infoBoxFire}
              >
                <div className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium mb-1">
                      Same pieces for everyone!
                    </p>
                    <p className="text-xs text-white/60">
                      All players get identical pieces today. Compete for the highest score!
                    </p>
                  </div>
                </div>
                
                {/* Time until reset */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#FF6B35]/20">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="text-xs text-white/50">
                    New challenge in <span className="text-[#FFD700] font-medium">{getTimeUntilReset()}</span>
                  </span>
                </div>
              </div>

              {/* Your Best Score */}
              {playerBestScore !== null && playerBestScore !== undefined && (
                <div 
                  className="rounded-xl p-3 mb-4 text-center"
                  style={modalStyles.infoBoxCyan}
                >
                  <p className="text-xs text-white/50 mb-1">Your Best Today</p>
                  <p className="text-2xl font-bold text-[#00E5FF]">
                    {playerBestScore.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Start Button */}
              <Button
                onClick={() => {
                  onStartChallenge();
                  onClose();
                }}
                className="w-full text-white font-bold py-6 rounded-xl mb-4 border-0 hover:opacity-90 transition-opacity"
                style={modalStyles.primaryButtonFire}
              >
                <Flame className="w-5 h-5 mr-2" />
                {playerBestScore ? 'Try Again' : 'Start Challenge'}
              </Button>

              {/* Leaderboard */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <h3 className="text-sm font-medium text-white/50 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FFD700]" />
                  Today's Top Players
                </h3>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-6">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                ) : scores.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="w-10 h-10 text-white/20 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">No scores yet today</p>
                    <p className="text-white/30 text-xs mt-1">Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scores.map((entry, index) => {
                      const isHighlighted = highlightPlayerName && 
                        entry.player_name.toLowerCase() === highlightPlayerName.toLowerCase();
                      
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`
                            flex items-center gap-3 py-2 px-3 rounded-xl
                            ${isHighlighted 
                              ? 'border' 
                              : index === 0 
                                ? 'border' 
                                : 'bg-white/5'
                            }
                          `}
                          style={
                            isHighlighted 
                              ? modalStyles.infoBoxCyan
                              : index === 0 
                                ? modalStyles.infoBoxFire
                                : undefined
                          }
                        >
                          <div className="w-6 flex justify-center">
                            {getRankIcon(index + 1)}
                          </div>
                          <span className={`flex-1 font-medium truncate ${
                            index === 0 ? 'text-[#FFD700]' : 'text-white'
                          }`}>
                            {entry.player_name}
                          </span>
                          <span className={`font-bold ${
                            index === 0 ? 'text-[#FFD700]' : 'text-white'
                          }`}>
                            {entry.score.toLocaleString()}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
