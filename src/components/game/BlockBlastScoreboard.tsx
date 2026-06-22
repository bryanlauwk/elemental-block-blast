import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Flame } from 'lucide-react';

interface BlockBlastScoreboardProps {
  score: number;
  topScore: number;
  compact?: boolean;
}

export function BlockBlastScoreboard({ score, topScore, compact = false }: BlockBlastScoreboardProps) {
  const isNewHighScore = score > topScore && score > 0;

  if (compact) {
    return (
      <div className="w-full max-w-[420px]">
        <div
          className={`pixar-hud-panel relative grid grid-cols-2 gap-px overflow-hidden rounded-3xl ${
            isNewHighScore ? 'neon-hud-panel--best-pop' : ''
          }`}
        >
          {/* Top accent line — Pixar yellow→red */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--pixar-yellow)) 0%, hsl(var(--pixar-red)) 100%)',
            }}
          />

          {/* SCORE panel */}
          <div className="relative flex flex-col items-center justify-center px-3 py-2">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] font-sans text-pixar-yellow/90">
              <Flame className="h-3 w-3" /> Score
            </span>
            <motion.span
              key={score}
              initial={{ y: 8, opacity: 0, scale: 1.05 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="mt-0.5 text-4xl sm:text-5xl font-display leading-none pixar-text-shimmer"
            >
              {score.toLocaleString()}
            </motion.span>
          </div>

          {/* BEST panel */}
          <div className="relative flex flex-col items-center justify-center border-l border-pixar-blue/25 px-3 py-2">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] font-sans text-pixar-red/90">
              <Trophy className="h-3 w-3" /> Best
            </span>
            <span
              className={`mt-0.5 text-2xl sm:text-3xl font-display leading-none ${
                isNewHighScore
                  ? 'bg-gradient-to-r from-pixar-yellow via-white to-pixar-red bg-clip-text text-transparent'
                  : 'text-white/90'
              }`}
            >
              {Math.max(topScore, score).toLocaleString()}
            </span>
            <AnimatePresence>
              {isNewHighScore && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="mt-0.5 flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.3em] text-pixar-yellow"
                >
                  <Sparkles className="h-2.5 w-2.5" /> New!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
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
