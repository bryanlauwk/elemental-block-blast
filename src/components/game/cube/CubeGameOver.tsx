import { motion } from 'framer-motion';
import { PixarButton, PixarOverlay } from '@/components/game/pixar';
import { CUBE_FACES } from '@/game/cubeConfig';

interface CubeGameOverProps {
  score: number;
  best: number;
  syncedCount: number;
  biggestCombo: number;
  feverActivations: number;
  bestReaction: { label: string; count: number } | null;
  onReset: () => void;
}

export function CubeGameOver({
  score,
  best,
  syncedCount,
  biggestCombo,
  feverActivations,
  bestReaction,
  onReset,
}: CubeGameOverProps) {
  return (
    <PixarOverlay>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-[32px] border border-white/20 bg-white/10 px-8 py-7 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pixar-yellow">Lab Results</p>
        <p className="mt-2 text-3xl font-display text-white mb-1">Cube Experiment Complete!</p>
        <p className="text-5xl font-display bg-gradient-to-r from-pixar-yellow to-pixar-red bg-clip-text text-transparent mb-3">
          {score.toLocaleString()}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-2 text-xs font-bold text-white/75">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Best<br /><span className="text-white">{best.toLocaleString()}</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Faces Synced<br /><span className="text-white">{syncedCount}/{CUBE_FACES.length}</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Biggest Combo<br /><span className="text-white">{biggestCombo || 0} Chain</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Fever Runs<br /><span className="text-white">{feverActivations}</span></div>
        </div>

        {bestReaction && (
          <p className="mb-4 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/80">
            Best Reaction: {bestReaction.label} x{bestReaction.count}
          </p>
        )}

        <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
          Next goal: sync {Math.min(syncedCount + 1, CUBE_FACES.length)}/{CUBE_FACES.length} faces
        </p>
        <PixarButton onClick={onReset} variant="primary" size="md" shine>Run It Again</PixarButton>
      </motion.div>
    </PixarOverlay>
  );
}
