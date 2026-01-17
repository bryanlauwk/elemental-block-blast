import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface BlockBlastScoreboardProps {
  score: number;
  topScore: number;
  compact?: boolean;
}

export function BlockBlastScoreboard({ score, topScore, compact = false }: BlockBlastScoreboardProps) {
  const isNewHighScore = score > topScore && score > 0;

  if (compact) {
    return (
      <div className="text-center">
        <motion.div 
          className="relative inline-block"
          animate={isNewHighScore ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.span 
            className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent drop-shadow-lg"
            key={score}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {score.toLocaleString()}
          </motion.span>
        </motion.div>
        
        {/* Best score - subtle below */}
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="text-xs text-game-text-muted/70 font-medium tracking-wide">
            BEST: {topScore.toLocaleString()}
          </span>
          <AnimatePresence>
            {isNewHighScore && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-2">
      <motion.div 
        className="relative inline-block"
        animate={isNewHighScore ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <motion.span 
          className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent"
          key={score}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            textShadow: '0 4px 30px rgba(255, 180, 50, 0.3)',
          }}
        >
          {score.toLocaleString()}
        </motion.span>
      </motion.div>
      
      {/* Best score indicator */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="text-sm text-game-text-muted font-medium tracking-wider">
          BEST: {topScore.toLocaleString()}
        </span>
        <AnimatePresence>
          {isNewHighScore && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400 tracking-wide">NEW!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
