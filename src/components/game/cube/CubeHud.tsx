import { Link } from 'react-router-dom';
import { Home, Lightbulb, RotateCcw } from 'lucide-react';
import { PixarChip } from '@/components/game/pixar';
import { CUBE_ELEMENT_LABELS, CUBE_FACE_AFFINITIES } from '@/game/cubeConfig';
import type { PhaseConfig } from '@/game/phases';

interface CubeHudProps {
  score: number;
  best: number;
  activeFace: number;
  phase: PhaseConfig;
  next: PhaseConfig | null;
  progress: number;
  feverMeter: number;
  feverActive: boolean;
  feverEndsAt: number;
  onHint: () => void;
  onReset: () => void;
}

export function CubeHud({ score, best, activeFace, onHint, onReset }: CubeHudProps) {
  const activeAffinity = CUBE_FACE_AFFINITIES[activeFace];

  return (
    <div className="z-20 mt-3 flex w-[calc(100%-1rem)] max-w-md flex-col gap-2">
      <div className="flex items-center justify-between rounded-full border border-white/15 bg-white/10 px-2.5 py-2 shadow-xl shadow-black/20 backdrop-blur-xl">
        <Link to="/">
          <PixarChip title="Back to classic">
            <Home className="w-5 h-5 text-white" />
          </PixarChip>
        </Link>

        <div className="flex flex-col items-center leading-none">
          <p className="rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/85 font-bold shadow-inner backdrop-blur-md">
            Cube Lab
          </p>
          <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/50">
            {activeAffinity.label} · {CUBE_ELEMENT_LABELS[activeAffinity.element]}
          </span>
        </div>

        <div className="flex gap-1.5">
          <PixarChip title="Hint" onClick={onHint}>
            <Lightbulb className="w-5 h-5 text-pixar-yellow" />
          </PixarChip>
          <PixarChip title="Restart" onClick={onReset}>
            <RotateCcw className="w-5 h-5 text-white" />
          </PixarChip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-2 shadow-lg shadow-black/10 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-pixar-yellow">Score</p>
          <p className="font-display text-3xl leading-none text-white">{score.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-2 text-right shadow-lg shadow-black/10 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-pixar-red">Best</p>
          <p className="font-display text-3xl leading-none text-white">{best.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
