import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, Medal, Award, X, Loader2, Clock, Star, Flame } from 'lucide-react';
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
            className="fixed inset-0 bg-[hsl(var(--neon-bg-deep)/0.82)] backdrop-blur-xl z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="neon-modal-shell p-4 sm:p-5">
              <div className="neon-accent-bar" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="neon-icon-chip neon-icon-chip--magenta w-10 h-10">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Daily Challenge</h2>
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
              <div className="neon-info-box neon-info-box--magenta mb-4">
                <div className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-[hsl(var(--neon-magenta))] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display text-sm text-white font-semibold tracking-wide mb-1">
                      Same pieces for everyone!
                    </p>
                    <p className="text-xs text-white/60">
                      All players get identical pieces today. Compete for the highest score!
                    </p>
                  </div>
                </div>
                
                {/* Time until reset */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[hsl(var(--neon-magenta)/0.25)]">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="text-xs text-white/50">
                    New challenge in <span className="font-display text-[hsl(var(--neon-cyan))] font-bold">{getTimeUntilReset()}</span>
                  </span>
                </div>
              </div>

              {/* Your Best Score */}
              {playerBestScore !== null && playerBestScore !== undefined && (
                <div className="neon-info-box mb-4 text-center">
                  <p className="font-display text-[10px] uppercase tracking-[0.2em] text-white/55 mb-1">Your Best Today</p>
                  <p className="font-display text-2xl font-bold text-[hsl(var(--neon-cyan))]">
                    {playerBestScore.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={() => {
                  onStartChallenge();
                  onClose();
                }}
                className="neon-cta mb-4"
              >
                <Flame className="w-5 h-5" />
                {playerBestScore ? 'Try Again' : 'Start Challenge'}
              </button>

              {/* Leaderboard */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <h3 className="font-display text-xs uppercase tracking-[0.18em] text-white/55 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[hsl(var(--neon-amber))]" />
                  Today's Top Players
                </h3>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[hsl(var(--neon-cyan))] animate-spin" />
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
                          className={`neon-row flex items-center gap-3 py-2 px-3 ${
                            isHighlighted ? 'neon-row--cyan' : index === 0 ? 'neon-row--amber' : ''
                          }`}
                        >
                          <div className="w-6 flex justify-center">
                            {getRankIcon(index + 1)}
                          </div>
                          <span className={`flex-1 font-display font-semibold truncate ${
                            index === 0 ? 'text-[hsl(var(--neon-amber))]' : 'text-white'
                          }`}>
                            {entry.player_name}
                          </span>
                          <span className={`font-display font-bold ${
                            index === 0 ? 'text-[hsl(var(--neon-amber))]' : 'text-white'
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
