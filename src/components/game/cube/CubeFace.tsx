import { ElementBlock } from '@/components/game/ElementBlock';
import ReactionParticles from '@/components/game/ReactionParticles';
import { Cell, DraggablePiece, Position } from '@/game/types';
import {
  CUBE_ELEMENT_LABELS,
  CUBE_FACE_AFFINITIES,
  CUBE_FACE_SIZE,
  CUBE_REACTION_RING,
  type CubeReactionType,
} from '@/game/cubeConfig';

interface CubeFaceProps {
  face: { id: number; name: string; place: string };
  board: Cell[][];
  isActive: boolean;
  isSynced: boolean;
  size: number;
  half: number;
  pad: number;
  gap: number;
  cellPx: number;
  blockPx: number;
  flashKey: number;
  particle: { type: CubeReactionType; positions: Position[]; timestamp: number } | null;
  ghost: Set<string>;
  reactionMap: Map<string, CubeReactionType>;
  selected: DraggablePiece | null;
  onHover: (pos: Position) => void;
  onCellClick: (pos: Position) => void;
}

export function CubeFace({
  face,
  board,
  isActive,
  isSynced,
  size,
  half,
  pad,
  gap,
  cellPx,
  blockPx,
  flashKey,
  particle,
  ghost,
  reactionMap,
  selected,
  onHover,
  onCellClick,
}: CubeFaceProps) {
  const affinity = CUBE_FACE_AFFINITIES[face.id];

  return (
    <div
      className={`absolute left-0 top-0 rounded-[30px] border bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl pixar-grid-frame ${isActive ? 'border-white/40' : 'border-white/15'}`}
      style={{
        width: size,
        height: size,
        padding: pad,
        transform: face.place.replace(/H/g, `${half}px`),
        backfaceVisibility: 'hidden',
        pointerEvents: isActive ? 'auto' : 'none',
        opacity: isActive ? 1 : 0.32,
        transition: 'opacity 0.4s, box-shadow 0.4s, border-color 0.4s',
        boxShadow: isActive
          ? '0 30px 90px rgba(0,0,0,0.42), 0 0 34px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.28)'
          : '0 18px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.14)',
      }}
    >
      <span aria-hidden className={`pointer-events-none absolute inset-x-6 top-2 h-[2px] rounded-full bg-gradient-to-r ${affinity.tone}`} />
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
        <span>{face.name}</span>
        <span className="text-white/35">·</span>
        <span>{CUBE_ELEMENT_LABELS[affinity.element]}</span>
        {isSynced && <span className="text-pixar-yellow">SYNC</span>}
      </div>

      {isActive && flashKey > 0 && <span key={flashKey} className="neon-flash-overlay rounded-[30px]" aria-hidden />}
      {isActive && <ReactionParticles trigger={particle} cellSize={cellPx + gap} gridOffset={{ x: pad, y: pad }} />}

      <div
        id={isActive ? 'cube-active-grid' : undefined}
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `repeat(${CUBE_FACE_SIZE}, 1fr)`, gridTemplateRows: `repeat(${CUBE_FACE_SIZE}, 1fr)`, gap }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => {
            const key = `${x},${y}`;
            const isGhost = isActive && ghost.has(key);
            const reactionType = isActive ? reactionMap.get(key) : undefined;

            return (
              <div
                key={key}
                data-cube-cell={isActive ? '' : undefined}
                data-x={x}
                data-y={y}
                className={`flex items-center justify-center rounded-xl border shadow-inner backdrop-blur-sm transition-colors ${reactionType ? CUBE_REACTION_RING[reactionType] : ''} ${isActive ? 'border-white/18' : 'border-white/8'}`}
                style={{
                  background: cell.element ? 'transparent' : isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
                  boxShadow: cell.element ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
                onMouseEnter={isActive ? () => onHover({ x, y }) : undefined}
                onClick={isActive ? () => onCellClick({ x, y }) : undefined}
              >
                {cell.element && <ElementBlock element={cell.element} size={blockPx} />}
                {!cell.element && isGhost && selected && (
                  <ElementBlock element={selected.elements[0]} size={blockPx} isPreview showSymbol={false} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
