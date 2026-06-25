import { AnimatePresence, motion } from 'framer-motion';
import { Cell, DraggablePiece, Position } from '@/game/types';
import { CubeFace } from './CubeFace';
import {
  CUBE_FACES,
  CUBE_ISO_ROTATION,
  type CubeReactionType,
} from '@/game/cubeConfig';

interface CubeSceneProps {
  boards: Cell[][][];
  activeFace: number;
  syncedFaces: Set<number>;
  size: number;
  half: number;
  pad: number;
  gap: number;
  cellPx: number;
  blockPx: number;
  rot: { x: number; y: number };
  snapping: boolean;
  lastCubeMoment: { label: string; timestamp: number } | null;
  fullSyncFlash: number;
  flashKey: number;
  particle: { type: CubeReactionType; positions: Position[]; timestamp: number } | null;
  ghost: Set<string>;
  reactionMap: Map<string, CubeReactionType>;
  selected: DraggablePiece | null;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onHover: (pos: Position) => void;
  onCellClick: (pos: Position) => void;
}

export function CubeScene({
  boards,
  activeFace,
  syncedFaces,
  size,
  half,
  pad,
  gap,
  cellPx,
  blockPx,
  rot,
  snapping,
  lastCubeMoment,
  fullSyncFlash,
  flashKey,
  particle,
  ghost,
  reactionMap,
  selected,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onHover,
  onCellClick,
}: CubeSceneProps) {
  return (
    <div
      className="relative z-10 flex-1 w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      style={{ perspective: '1100px', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="pointer-events-none absolute h-[78vw] max-h-[420px] w-[78vw] max-w-[420px] rounded-full bg-white/10 blur-3xl" />

      <AnimatePresence>
        {lastCubeMoment && (
          <motion.div
            key={lastCubeMoment.timestamp}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-none absolute top-4 z-20 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-xl backdrop-blur-xl"
          >
            {lastCubeMoment.label}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fullSyncFlash > 0 && (
          <motion.div
            key={fullSyncFlash}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.82, 1.08, 1, 1.16] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="pointer-events-none absolute z-30 flex h-[82vw] max-h-[450px] w-[82vw] max-w-[450px] items-center justify-center rounded-full border border-pixar-yellow/60 bg-pixar-yellow/10 text-center shadow-[0_0_80px_rgba(250,204,21,0.45)] backdrop-blur-sm"
          >
            <span className="text-3xl font-display uppercase tracking-widest text-white drop-shadow-xl">Full Cube Sync!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x + CUBE_ISO_ROTATION.x}deg) rotateY(${rot.y + CUBE_ISO_ROTATION.y}deg)`,
          transition: snapping ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        {CUBE_FACES.map((face) => (
          <CubeFace
            key={face.id}
            face={face}
            board={boards[face.id]}
            isActive={face.id === activeFace}
            isSynced={syncedFaces.has(face.id)}
            size={size}
            half={half}
            pad={pad}
            gap={gap}
            cellPx={cellPx}
            blockPx={blockPx}
            flashKey={flashKey}
            particle={particle}
            ghost={ghost}
            reactionMap={reactionMap}
            selected={selected}
            onHover={onHover}
            onCellClick={onCellClick}
          />
        ))}
      </div>
    </div>
  );
}
