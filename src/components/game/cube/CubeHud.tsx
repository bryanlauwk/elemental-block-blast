import { Link } from 'react-router-dom';
import { Home, Lightbulb, RotateCcw } from 'lucide-react';
import { PixarChip } from '@/components/game/pixar';
import { BlockBlastScoreboard } from '@/components/game/BlockBlastScoreboard';
import PhasePill from '@/components/game/PhasePill';
import { FeverMeter } from '@/components/game/FeverMeter';
import { CUBE_ELEMENT_LABELS, CUBE_FACE_AFFINITIES, CUBE_FACE_AFFINITY_BONUS } from '@/game/cubeConfig';
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

export function CubeHud({
  score,
  best,
  activeFace,
  phase,
  next,
  progress,
  feverMeter,
  feverActive,
  feverEndsAt,
  onHint,
  onReset,
}: CubeHudProps) {
  const activeAffinity = CUBE_FACE_AFFINITIES[activeFace];

  return (
    <>
      <div className="z-20 mt-4 flex w-[calc(100%-2rem)] max-w-md items-center justify-between rounded-full border border-white/15 bg-white/10 px-3 py-2 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <Link to="/">
          <PixarChip title="Back to classic">
            <Home className="w-5 h-5 text-white" />
          </PixarChip>
        </Link>

        <div className="flex flex-col items-center leading-none">
          <p className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/85 font-bold shadow-inner backdrop-blur-md">
            Cube Lab
          </p>
          <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/50">4-side sync</span>
        </div>

        <div className="flex gap-2">
          <PixarChip title="Hint" onClick={onHint}>
            <Lightbulb className="w-5 h-5 text-pixar-yellow" />
          </PixarChip>
          <PixarChip title="Restart" onClick={onReset}>
            <RotateCcw className="w-5 h-5 text-white" />
          </PixarChip>
        </div>
      </div>

      <div className="z-20 mt-3 flex w-[calc(100%-2rem)] max-w-[420px] flex-col items-center rounded-[28px] border border-white/15 bg-white/10 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <BlockBlastScoreboard score={score} topScore={best} compact />
        <div className="mb-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
          <span>{activeAffinity.label}</span>
          <span className="text-white/35">·</span>
          <span>{CUBE_ELEMENT_LABELS[activeAffinity.element]} +{CUBE_FACE_AFFINITY_BONUS}/block</span>
        </div>
        <PhasePill phase={phase} next={next} progress={progress} />
        <FeverMeter meter={feverMeter} active={feverActive} endsAt={feverEndsAt} />
      </div>
    </>
  );
}
