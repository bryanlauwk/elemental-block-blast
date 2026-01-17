import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign } from 'lucide-react';

interface ScoreboardProps {
  score: number;
  isGameOver: boolean;
}

export function Scoreboard({ score, isGameOver }: ScoreboardProps) {
  const formattedScore = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(score);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Lab Safety Fines
        </h3>
      </div>
      
      <motion.div
        key={score}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="flex items-center justify-center gap-1 py-3"
      >
        <DollarSign className="w-6 h-6 text-green-400" />
        <span className="text-3xl font-mono font-bold text-green-400">
          {formattedScore.replace('$', '')}
        </span>
      </motion.div>

      <div className="text-xs text-slate-500 text-center space-y-1">
        <p>+$500 per reaction</p>
        <p>+$1,000 per line clear</p>
      </div>

      {isGameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-2 bg-red-900/50 rounded border border-red-700 text-center"
        >
          <span className="text-red-400 font-bold text-sm">🚨 LAB MELTDOWN 🚨</span>
        </motion.div>
      )}
    </div>
  );
}
