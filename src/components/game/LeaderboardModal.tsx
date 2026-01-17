import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, X, Trash2 } from 'lucide-react';
import { HighScoreEntry } from '@/hooks/useHighScores';
import { Button } from '@/components/ui/button';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  highScores: HighScoreEntry[];
  currentScore?: number;
  onClear?: () => void;
}

export function LeaderboardModal({ isOpen, onClose, highScores, currentScore, onClear }: LeaderboardModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div className="bg-gradient-to-b from-game-grid-dark to-game-grid-darker rounded-2xl p-5 border border-game-grid-border shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-bold text-white">High Scores</h2>
                </div>
                <div className="flex items-center gap-2">
                  {onClear && highScores.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-game-text-muted hover:text-red-400 hover:bg-red-400/10"
                      onClick={onClear}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-game-text-muted hover:text-white hover:bg-white/10"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Scores list */}
              {highScores.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-game-text-muted/30 mx-auto mb-3" />
                  <p className="text-game-text-muted text-sm">No scores yet</p>
                  <p className="text-game-text-muted/60 text-xs mt-1">Play a game to set a record!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {highScores.slice(0, 10).map((entry, index) => {
                    const isCurrentScore = currentScore !== undefined && entry.score === currentScore;
                    
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`
                          flex items-center gap-3 py-2.5 px-3 rounded-xl
                          ${isCurrentScore 
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
                        <span className={`flex-1 font-bold text-lg ${
                          index === 0 ? 'text-yellow-400' : 'text-white'
                        }`}>
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="text-game-text-muted text-xs">
                          {entry.date}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
