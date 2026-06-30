import { motion } from 'framer-motion';
import { Bomb, Gauge } from 'lucide-react';
import { PhaseConfig } from '@/game/phases';
import { BOMB_CONFIG } from '@/game/bombConfig';
import { cn } from '@/lib/utils';

interface DifficultyPanelProps {
  phase: PhaseConfig;
  next: PhaseConfig | null;
  progress: number; // 0..1 toward next phase
  fillRatio: number; // 0..1
  bombChance: number; // 0..1
  rerollsRemaining?: number;
  rerollsMax?: number;
}

/**
 * Sidebar panel that explains *why* the game feels harder right now: the
 * current difficulty phase, progress to the next one, and live bomb-spawn
 * pressure (board fill + chance + threshold reference).
 */
export function DifficultyPanel({
  phase,
  next,
  progress,
  fillRatio,
  bombChance,
  rerollsRemaining,
  rerollsMax,
}: DifficultyPanelProps) {
  const fillPct = Math.round(fillRatio * 100);
  const chancePct = Math.round(bombChance * 100);
  const thresholdPct = Math.round(BOMB_CONFIG.minFill * 100);
  const peakPct = Math.round(BOMB_CONFIG.rampEndFill * 100);
  const armed = bombChance > 0;

  // Qualitative intensity label for the bomb pressure
  const intensity =
    chancePct === 0
      ? 'Calm'
      : chancePct < 15
        ? 'Low'
        : chancePct < 30
          ? 'Building'
          : chancePct < 45
            ? 'High'
            : 'Critical';

  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Difficulty status">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="w-4 h-4 text-cyan-300" />
          <h3 className="ui-label-xs text-white/85">Difficulty</h3>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm text-pixar-navy-deep"
            style={{
              background:
                'linear-gradient(180deg, hsl(var(--pixar-yellow)), hsl(var(--pixar-yellow-deep)))',
              boxShadow:
                'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 0 hsl(var(--pixar-yellow-deep))',
            }}
          >
            {phase.id}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm text-white truncate tracking-wide">
              {phase.name}
            </div>
            <div className="ui-label-xs text-white/55 truncate">
              {next ? `Next: ${next.name}` : 'Max phase'}
            </div>
          </div>
        </div>

        <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background:
                'linear-gradient(90deg, hsl(var(--pixar-yellow)), hsl(var(--pixar-red)))',
            }}
          />
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-white/55">
          {phase.description ?? 'Pieces shift as you score higher.'}
        </p>
      </div>

      <div className="h-px bg-white/10" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <motion.span
            animate={armed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={armed ? { duration: 0.9, repeat: Infinity } : { duration: 0.2 }}
          >
            <Bomb className={cn('w-4 h-4', armed ? 'text-pixar-red' : 'text-white/60')} />
          </motion.span>
          <h3 className="ui-label-xs text-white/85">Bomb intensity</h3>
          <span
            className={cn(
              'ml-auto text-[10px] font-semibold uppercase tracking-wider',
              armed ? 'text-pixar-red' : 'text-white/50',
            )}
          >
            {intensity}
          </span>
        </div>

        <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 w-px bg-white/50"
            style={{ left: `${thresholdPct}%` }}
            aria-hidden
            title={`Bombs start at ${thresholdPct}% fill`}
          />
          <div
            className="absolute inset-y-0 w-px bg-pixar-red/70"
            style={{ left: `${peakPct}%` }}
            aria-hidden
            title={`Peak bomb chance at ${peakPct}% fill`}
          />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            animate={{ width: `${fillPct}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              background: armed
                ? 'linear-gradient(90deg, hsl(var(--pixar-yellow)), hsl(var(--pixar-red)))'
                : 'linear-gradient(90deg, hsl(var(--pixar-blue) / 0.7), hsl(var(--pixar-yellow) / 0.7))',
            }}
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center justify-between bg-white/[0.04] rounded-md px-2 py-1">
            <span className="text-white/55">Fill</span>
            <span className="text-white/90 tabular-nums font-semibold">{fillPct}%</span>
          </div>
          <div className="flex items-center justify-between bg-white/[0.04] rounded-md px-2 py-1">
            <span className="text-white/55">Chance</span>
            <span
              className={cn(
                'tabular-nums font-semibold',
                armed ? 'text-pixar-red' : 'text-white/90',
              )}
            >
              {chancePct}%
            </span>
          </div>
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-white/55">
          {fillPct < thresholdPct
            ? `Bombs begin at ${thresholdPct}% fill (${Math.max(0, thresholdPct - fillPct)}% to go).`
            : fillPct < peakPct
              ? `Ramping to peak at ${peakPct}% fill.`
              : 'Bomb chance is maxed out — clear lines fast.'}
        </p>
      </div>

      {typeof rerollsRemaining === 'number' && typeof rerollsMax === 'number' && rerollsMax > 0 && (
        <>
          <div className="h-px bg-white/10" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="ui-label-xs text-white/85">Rerolls</h3>
              <span className="text-[10px] tabular-nums text-cyan-200/90 font-semibold">
                {rerollsRemaining}/{rerollsMax}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: rerollsMax }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i < rerollsRemaining ? 'bg-cyan-300/80' : 'bg-white/10',
                  )}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-white/55">
              Limited swaps per run — use them when stuck.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default DifficultyPanel;