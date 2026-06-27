import { motion } from 'framer-motion';
import { Bomb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BOMB_CONFIG } from '@/game/bombConfig';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BombMeterProps {
  /** Board fill ratio 0..1. */
  fillRatio: number;
  /** Current per-refill bomb spawn chance 0..1. */
  chance: number;
}

/**
 * Visualises the bomb-spawn pressure: a filling bar that crosses a marked
 * threshold (`BOMB_CONFIG.minFill`) at which bombs may start dropping, then
 * ramps the chance up to peak at `rampEndFill`. Hover for a plain-language
 * explanation of the ramp.
 */
export function BombMeter({ fillRatio, chance }: BombMeterProps) {
  const fillPct = Math.round(fillRatio * 100);
  const armed = chance > 0;
  const thresholdPct = Math.round(BOMB_CONFIG.minFill * 100);
  const peakPct = Math.round(BOMB_CONFIG.rampEndFill * 100);
  const chancePct = Math.round(chance * 100);

  // How many % points until the next threshold
  const toThreshold = Math.max(0, thresholdPct - fillPct);
  const toPeak = Math.max(0, peakPct - fillPct);

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'w-full max-w-[420px] mt-2 flex items-center gap-2 rounded-2xl px-3 py-1.5 border transition-colors cursor-help',
              armed ? 'border-pixar-red/55' : 'border-white/15',
            )}
            style={{
              background:
                'linear-gradient(155deg, hsl(0 0% 100% / 0.10), hsl(var(--pixar-navy) / 0.52), hsl(var(--pixar-navy-deep) / 0.78))',
              boxShadow: armed
                ? '0 0 18px hsl(var(--pixar-red) / 0.35), 0 1px 0 hsl(0 0% 100% / 0.18) inset'
                : '0 1px 0 hsl(0 0% 100% / 0.22) inset',
              backdropFilter: 'blur(18px) saturate(160%)',
            }}
            role="status"
            aria-label={`Board ${fillPct}% full. Bomb chance ${chancePct}%`}
          >
            <motion.span
              animate={armed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={armed ? { duration: 0.9, repeat: Infinity } : { duration: 0.2 }}
            >
              <Bomb
                className={cn('w-4 h-4 shrink-0', armed ? 'text-pixar-red' : 'text-white/55')}
              />
            </motion.span>

            <span className={cn('ui-label-xs shrink-0 w-14', armed ? 'text-pixar-red' : 'text-white/55')}>
              {armed ? 'Bomb!' : 'Bomb'}
            </span>

            <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              {/* Threshold tick — where bombs start being possible */}
              <div
                className="absolute inset-y-0 w-px bg-white/50"
                style={{ left: `${thresholdPct}%` }}
                aria-hidden
              />
              {/* Peak tick — where chance is maxed */}
              <div
                className="absolute inset-y-0 w-px bg-pixar-red/70"
                style={{ left: `${peakPct}%` }}
                aria-hidden
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

            <span className="ui-label-xs shrink-0 tabular-nums text-white/70 w-10 text-right">
              {fillPct}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[280px] text-xs leading-snug p-3">
          <div className="flex items-center gap-2 mb-2">
            <Bomb className={cn('w-4 h-4', armed ? 'text-pixar-red' : 'text-white/60')} />
            <span className="font-semibold text-pixar-yellow">Bomb pressure</span>
          </div>

          <div className="space-y-1.5 text-white/80">
            <div className="flex justify-between">
              <span className="text-white/60">Board fill</span>
              <span className="font-semibold tabular-nums">{fillPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Bomb chance</span>
              <span className={cn('font-semibold tabular-nums', armed ? 'text-pixar-red' : 'text-white/80')}>
                {chancePct}%
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-white/10 space-y-1 text-white/70">
            {fillPct < thresholdPct ? (
              <p>
                Bombs start dropping at <b className="text-white/90">{thresholdPct}%</b>
                <span className="text-white/50"> — {toThreshold}% to go</span>
              </p>
            ) : fillPct < peakPct ? (
              <p>
                Chance ramps to peak at <b className="text-white/90">{peakPct}%</b>
                <span className="text-white/50"> — {toPeak}% until max</span>
              </p>
            ) : (
              <p>
                Peak chance reached at <b className="text-white/90">{peakPct}%</b>
                <span className="text-white/50"> — maxed out</span>
              </p>
            )}
            <p className="text-white/50">
              Ramps linearly from {thresholdPct}% → {peakPct}% fill.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default BombMeter;