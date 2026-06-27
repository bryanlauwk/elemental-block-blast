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
        <TooltipContent side="bottom" className="max-w-[260px] text-xs leading-snug">
          <p className="font-semibold mb-1 text-pixar-yellow">Bomb pressure</p>
          <p className="text-white/80">
            Bombs may drop once the board is at least <b>{thresholdPct}%</b> full,
            ramping up to peak chance at <b>{peakPct}%</b>.
          </p>
          <p className="mt-1 text-white/70">
            Current chance per refill: <b>{chancePct}%</b>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default BombMeter;