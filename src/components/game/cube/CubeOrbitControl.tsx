import { Rotate3d } from 'lucide-react';
import { CUBE_FACES } from '@/game/cubeConfig';

interface CubeOrbitControlProps {
  activeFace: number;
  syncedFaces: Set<number>;
  syncedCount: number;
  currentFaceHasFit: boolean;
  suggestedFace: typeof CUBE_FACES[number] | null;
  onJumpToFace: (faceId: number) => void;
}

export function CubeOrbitControl(props: CubeOrbitControlProps) {
  const { activeFace, syncedFaces, syncedCount, currentFaceHasFit, suggestedFace, onJumpToFace } = props;

  return (
    <div className="z-20 mb-2 flex flex-col items-center gap-2 rounded-[26px] border border-white/15 bg-white/10 px-4 py-3 text-white/75 shadow-xl shadow-black/20 backdrop-blur-xl">
      {!currentFaceHasFit && suggestedFace && (
        <button
          onClick={() => onJumpToFace(suggestedFace.id)}
          className="mb-1 rounded-full border border-pixar-yellow/50 bg-pixar-yellow/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-pixar-yellow animate-pulse"
        >
          {suggestedFace.name} face has space
        </button>
      )}

      <div className="flex items-center gap-2">
        <Rotate3d className="w-4 h-4 text-pixar-yellow" />
        <span className="text-xs uppercase tracking-widest font-bold">Drag sideways</span>
        <span className="text-white/30">·</span>
        <span className="text-xs uppercase tracking-widest font-bold text-white/90">{CUBE_FACES[activeFace].name}</span>
      </div>

      <div className="flex items-center gap-2">
        {CUBE_FACES.map((face) => (
          <button
            key={face.id}
            onClick={() => onJumpToFace(face.id)}
            className={`h-2.5 rounded-full transition-all ${activeFace === face.id ? 'w-8 bg-pixar-yellow' : syncedFaces.has(face.id) ? 'w-4 bg-white/70' : suggestedFace?.id === face.id ? 'w-6 bg-pixar-yellow/80 animate-pulse' : 'w-4 bg-white/25'}`}
            aria-label={`Jump to ${face.name} face`}
          />
        ))}
      </div>

      <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
        Synced faces {syncedCount}/{CUBE_FACES.length}
      </p>
    </div>
  );
}
