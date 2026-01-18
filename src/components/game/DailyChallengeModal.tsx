import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, Medal, Award, X, Loader2, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDailyChallenge, DailyChallengeEntry } from '@/hooks/useDailyChallenge';
import { getTodayDateString, getDisplayDate } from '@/game/seededRandom';

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
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-sm text-game-text-muted">{rank}</span>;
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-gradient-to-b from-game-grid-dark to-game-grid-darker rounded-2xl p-5 border border-game-grid-border shadow-2xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Daily Challenge</h2>
                    <p className="text-xs text-game-text-muted">{getDisplayDate(today)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-game-text-muted hover:text-white hover:bg-white/10"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Challenge Info */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium mb-1">
                      Same pieces for everyone!
                    </p>
                    <p className="text-xs text-game-text-muted">
                      All players get identical pieces today. Compete for the highest score!
                    </p>
                  </div>
                </div>
                
                {/* Time until reset */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-500/20">
                  <Clock className="w-4 h-4 text-game-text-muted" />
                  <span className="text-xs text-game-text-muted">
                    New challenge in <span className="text-amber-400 font-medium">{getTimeUntilReset()}</span>
                  </span>
                </div>
              </div>

              {/* Your Best Score */}
              {playerBestScore !== null && playerBestScore !== undefined && (
                <div className="bg-game-accent/10 border border-game-accent/30 rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-game-text-muted mb-1">Your Best Today</p>
                  <p className="text-2xl font-bold text-game-accent">
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
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-6 rounded-xl mb-4 shadow-lg shadow-amber-500/20"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {playerBestScore ? 'Try Again' : 'Start Challenge'}
              </Button>

              {/* Leaderboard */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <h3 className="text-sm font-medium text-game-text-muted mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Today's Top Players
                </h3>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-game-accent animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-6">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                ) : scores.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="w-10 h-10 text-game-text-muted/30 mx-auto mb-2" />
                    <p className="text-game-text-muted text-sm">No scores yet today</p>
                    <p className="text-game-text-muted/60 text-xs mt-1">Be the first!</p>
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
                              ? 'bg-game-accent/20 border border-game-accent/40' 
                              : index === 0 
                                ? 'bg-yellow-500/10 border border-yellow-500/20' 
                                : 'bg-white/5'
                            }
                          `}
                        >
                          <div className="w-6 flex justify-center">
                            {getRankIcon(index + 1)}
                          </div>
                          <span className={`flex-1 font-medium truncate ${
                            index === 0 ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {entry.player_name}
                          </span>
                          <span className={`font-bold ${
                            index === 0 ? 'text-yellow-400' : 'text-white'
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
