import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Trash2 } from 'lucide-react';
import { HighScoreEntry } from '@/hooks/useHighScores';
import { Button } from '@/components/ui/button';

interface LeaderboardProps {
  highScores: HighScoreEntry[];
  currentScore?: number;
  onClear?: () => void;
}

export function Leaderboard({ highScores, currentScore, onClear }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <Medal className="w-4 h-4 text-slate-300" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 text-center text-xs text-slate-500">{rank}</span>;
    }
  };

  const formatScore = (score: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(score);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Hall of Fines
          </h3>
        </div>
        {onClear && highScores.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
            onClick={onClear}
            title="Clear leaderboard"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {highScores.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4 italic">
          No experiments conducted yet
        </p>
      ) : (
        <div className="space-y-1">
          {highScores.slice(0, 5).map((entry, index) => {
            const isCurrentScore = currentScore !== undefined && entry.score === currentScore;
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-2 py-1.5 px-2 rounded text-xs ${
                  isCurrentScore
                    ? 'bg-green-900/30 border border-green-700'
                    : index === 0
                    ? 'bg-yellow-900/20'
                    : 'bg-slate-700/30'
                }`}
              >
                <div className="w-5 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <span className={`flex-1 font-mono font-bold ${
                  index === 0 ? 'text-yellow-400' : 'text-slate-300'
                }`}>
                  {formatScore(entry.score)}
                </span>
                <span className="text-slate-500 text-[10px]">
                  {entry.date}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {highScores.length > 5 && (
        <p className="text-[10px] text-slate-600 text-center mt-2">
          +{highScores.length - 5} more records
        </p>
      )}
    </div>
  );
}
