import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import { PixarPanel } from '@/components/game/pixar';

interface BlockBlastScoreboardProps {
  score: number;
  topScore: number;
  compact?: boolean;
}

export function BlockBlastScoreboard({ score, topScore, compact = false }: BlockBlastScoreboardProps) {
  const isNewHighScore = score > topScore && score > 0;

  if (compact) {
    return (
      <div className="classic-scoreboard w-full max-w-[420px]">
        <PixarPanel highlight={isNewHighScore} className="grid grid-cols-2 gap-px">
          {/* SCORE panel */}
          <div className="relative flex flex-col items-center justify-center px-3 py-2">
            <span className="ui-label-xs flex items-center gap-1 text-pixar-yellow/90">
              <Flame className="h-3 w-3" /> Score
            </span>
            <motion.span
              key={score}
              initial={{ y: 8, opacity: 0, scale: 1.05 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="mt-0.5 text-[clamp(2rem,8vw,3rem)] font-display leading-none pixar-text-shimmer"
            >
              {score.toLocaleString()}
            </motion.span>
          </div>

          {/* BEST panel */}
          <div className="relative flex flex-col items-center justify-center border-l border-white/10 px-3 py-2">
            <span className="ui-label-xs flex items-center gap-1 text-pixar-red/90">
              <Trophy className="h-3 w-3" /> Best
            </span>
            <span
              className={`mt-0.5 text-[clamp(1.35rem,6vw,2rem)] font-display leading-none ${
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
                  className="ui-label-xs mt-0.5 flex items-center gap-0.5 text-pixar-yellow"
                >
                  <Sparkles className="h-2.5 w-2.5" /> New!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </PixarPanel>
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
          className="font-display text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,#ffffff,rgba(255,255,255,0.6))]"
          key={score}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            textShadow: '0 0 24px hsl(190 95% 60% / 0.45), 0 0 48px hsl(320 95% 62% / 0.25)',
          }}
        >
          {score.toLocaleString()}
        </motion.span>
      </motion.div>
      
      {/* Best score indicator */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="ui-label-xs text-white/55">
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
