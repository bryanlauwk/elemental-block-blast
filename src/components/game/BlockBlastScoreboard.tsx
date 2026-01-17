import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

interface BlockBlastScoreboardProps {
  score: number;
  topScore: number;
  isGameOver: boolean;
}

export function BlockBlastScoreboard({ score, topScore, isGameOver }: BlockBlastScoreboardProps) {
  const isNewHighScore = score > topScore && score > 0;

  return (
    <div className="w-full">
      {/* Score container */}
      <div className="bg-gradient-to-b from-game-tray to-game-tray-dark rounded-2xl p-4 shadow-lg border border-game-grid-border">
        {/* Top score indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-game-text-muted font-medium">
            BEST: {topScore.toLocaleString()}
          </span>
        </div>
        
        {/* Current score */}
        <motion.div 
          className="text-center"
          animate={isNewHighScore ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.span 
            className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent"
            key={score}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {score.toLocaleString()}
          </motion.span>
        </motion.div>
        
        {/* New high score indicator */}
        <AnimatePresence>
          {isNewHighScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1 mt-2"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">NEW RECORD!</span>
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Game over overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-4 bg-gradient-to-b from-red-500/20 to-red-600/30 rounded-xl p-4 border border-red-500/30"
          >
            <p className="text-center text-xl font-black text-red-400">GAME OVER</p>
            <p className="text-center text-sm text-game-text-muted mt-1">
              Tap "New Game" to play again
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
