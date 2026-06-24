import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Rotate3d } from 'lucide-react';
import { ElementBlock } from '@/components/game/ElementBlock';
import { PixarChip } from '@/components/game/pixar';
import { ScorePopup } from '@/components/game/ScorePopup';
import ReactionParticles from '@/components/game/ReactionParticles';
import AdaptiveStage from '@/components/game/AdaptiveStage';
import { usePhase } from '@/hooks/usePhase';
import { Position } from '@/game/types';
import {
  CBoard, CPiece, FACE, emptyBoard, randomPiece, canPlace, place, resolve6, canAnyFit, ReactionType,
} from '@/cube/board6';
import { playSound, startMusic } from '@/game/sounds';

// 6 faces of the cube. `view` is the cube rotation that brings the face to
// the front; `place` positions the face on the cube body.
const FACES = [
  { id: 0, name: 'Front',  place: 'translateZ(H)',                 view: 'rotateX(0deg) rotateY(0deg)' },
  { id: 1, name: 'Right',  place: 'rotateY(90deg) translateZ(H)',  view: 'rotateY(-90deg)' },
  { id: 2, name: 'Back',   place: 'rotateY(180deg) translateZ(H)', view: 'rotateY(-180deg)' },
  { id: 3, name: 'Left',   place: 'rotateY(-90deg) translateZ(H)', view: 'rotateY(90deg)' },
  { id: 4, name: 'Top',    place: 'rotateX(90deg) translateZ(H)',  view: 'rotateX(-90deg)' },
  { id: 5, name: 'Bottom', place: 'rotateX(-90deg) translateZ(H)', view: 'rotateX(90deg)' },
] as const;

const CubeGame = () => {
  const [boards, setBoards] = useState<CBoard[]>(() => FACES.map(() => emptyBoard()));
  const [activeFace, setActiveFace] = useState(0);
  const [pieces, setPieces] = useState<CPiece[]>(() => [randomPiece(), randomPiece(), randomPiece()]);
  const [selected, setSelected] = useState<CPiece | null>(null);
  const [hover, setHover] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [particle, setParticle] = useState<{ type: ReactionType; positions: Position[]; timestamp: number } | null>(null);
  const [popup, setPopup] = useState<{ score: number; show: boolean; text: string; reactionType?: ReactionType }>({ score: 0, show: false, text: '' });
  const [flashKey, setFlashKey] = useState(0);
  const { phase } = usePhase(score);

  // Free 3D orbit: drag to spin the cube; on release it snaps to the nearest
  // face (which becomes the playable face).
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [snapping, setSnapping] = useState(true);
  const rotRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const movedRef = useRef(false);

  // Responsive cube size in px (so ElementBlock cells get a concrete size).
  const [size, setSize] = useState(320);
  useEffect(() => {
    const calc = () => setSize(Math.min(window.innerWidth * 0.8, Math.min(window.innerHeight * 0.5, 360)));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const half = size / 2;
  const pad = 8;
  const gap = 4;
  const cellPx = Math.floor((size - pad * 2 - gap * (FACE - 1)) / FACE);
  const blockPx = Math.floor(cellPx * 0.9);

  const refill = useCallback((remaining: CPiece[]) =>
    remaining.length > 0 ? remaining : [randomPiece(), randomPiece(), randomPiece()], []);

  const handleCell = useCallback((fx: number, fy: number) => {
    if (!selected) return;
    const board = boards[activeFace];
    if (!canPlace(board, selected, fx, fy)) return;
    playSound('drop');
    const r = resolve6(place(board, selected, fx, fy));
    const gained = selected.shape.length * 5 + r.gained;
    setBoards((prev) => prev.map((b, i) => (i === activeFace ? r.board : b)));
    setScore((s) => s + gained);
    if (r.lines > 0) playSound('lineClear');
    if (r.affected.length > 0) {
      playSound(r.affected[0].type === 'extinguish' ? 'splash' : r.affected[0].type === 'dissolve' ? 'dissolve' : 'sizzle');
      setParticle({ type: r.affected[0].type, positions: r.affected.flatMap((a) => a.positions), timestamp: Date.now() });
    }
    if (r.lines > 0 || r.reactions > 0) {
      const text = r.perfectClear ? 'PERFECT CLEAR!' : r.combo >= 3 ? 'INCREDIBLE!' : r.combo >= 2 ? 'AMAZING!' : r.lines >= 2 ? 'GREAT!' : 'NICE!';
      setPopup({ score: gained, show: true, text, reactionType: r.affected[0]?.type });
      setFlashKey((k) => k + 1);
      if (r.combo > 1 || r.lines >= 2) playSound('combo');
      window.setTimeout(() => setPopup((p) => ({ ...p, show: false })), 1200);
    }
    setPieces((prev) => refill(prev.filter((p) => p.id !== selected.id)));
    setSelected(null);
    setHover(null);
  }, [selected, boards, activeFace, refill]);

  // Snap a free orbit to the nearest face and report which face is now front.
  const faceFromRot = (rx: number, ry: number) => {
    const rxs = Math.max(-90, Math.min(90, Math.round(rx / 90) * 90));
    const rys = (((Math.round(ry / 90) * 90) % 360) + 360) % 360;
    if (rxs === -90) return { face: 4, x: -90, y: 0 };
    if (rxs === 90) return { face: 5, x: 90, y: 0 };
    const sideByYaw: Record<number, number> = { 0: 0, 90: 3, 180: 2, 270: 1 };
    return { face: sideByYaw[rys], x: 0, y: rys };
  };

  const onScenePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, rx: rotRef.current.x, ry: rotRef.current.y };
    movedRef.current = false;
    setSnapping(false);
  };
  const onScenePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!movedRef.current && Math.hypot(dx, dy) > 6) movedRef.current = true;
    if (!movedRef.current) return;
    const nx = Math.max(-90, Math.min(90, d.rx - dy * 0.4));
    const ny = d.ry + dx * 0.4;
    rotRef.current = { x: nx, y: ny };
    setRot(rotRef.current);
    setHover(null);
  };
  const onScenePointerUp = () => {
    if (dragRef.current && movedRef.current) {
      const s = faceFromRot(rotRef.current.x, rotRef.current.y);
      rotRef.current = { x: s.x, y: s.y };
      setRot(rotRef.current);
      setActiveFace(s.face);
      setSnapping(true);
    }
    dragRef.current = null;
  };

  const reset = () => {
    setBoards(FACES.map(() => emptyBoard()));
    setPieces([randomPiece(), randomPiece(), randomPiece()]);
    setSelected(null);
    setScore(0);
    setActiveFace(0);
    rotRef.current = { x: 0, y: 0 };
    setRot({ x: 0, y: 0 });
    setSnapping(true);
  };

  useEffect(() => { startMusic(); }, []);

  const activeBoard = boards[activeFace];
  const stuckHere = selected && !canAnyFit(activeBoard, [selected]);

  // Ghost footprint for the hovered placement on the active face.
  const ghost = useMemo(() => {
    if (!selected || !hover) return new Set<string>();
    if (!canPlace(activeBoard, selected, hover.x, hover.y)) return new Set<string>();
    return new Set(selected.shape.map((p) => `${hover.x + p.x},${hover.y + p.y}`));
  }, [selected, hover, activeBoard]);

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center bg-gradient-pixar-stage text-white overflow-hidden relative"
      style={{ ['--stage-accent' as string]: phase.accent, ['--stage-glow' as string]: phase.glow } as CSSProperties}
    >
      {/* Animated per-universe backdrop (same as the classic game) */}
      <AdaptiveStage phase={phase} />

      {/* Combo / score popup */}
      <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-24">
        <ScorePopup score={popup.score} show={popup.show} text={popup.text} reactionType={popup.reactionType} />
      </div>

      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-4 pt-4 z-20">
        <Link to="/">
          <PixarChip title="Back to classic"><Home className="w-5 h-5 text-white" /></PixarChip>
        </Link>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-pixar-yellow/80 font-bold">Cube Mode</p>
          <p className="font-display text-2xl leading-none bg-gradient-to-r from-pixar-yellow to-pixar-red bg-clip-text text-transparent">
            {score.toLocaleString()}
          </p>
        </div>
        <PixarChip title="Restart" onClick={reset}><RotateCcw className="w-5 h-5 text-white" /></PixarChip>
      </div>

      {/* 3D stage — drag anywhere here to orbit the cube */}
      <div
        className="relative z-10 flex-1 w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1100px', touchAction: 'none' }}
        onPointerDown={onScenePointerDown}
        onPointerMove={onScenePointerMove}
        onPointerUp={onScenePointerUp}
        onPointerCancel={onScenePointerUp}
      >
        <div
          className="relative"
          style={{
            width: size,
            height: size,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: snapping ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {FACES.map((face) => {
            const isActive = face.id === activeFace;
            const board = boards[face.id];
            return (
              <div
                key={face.id}
                className="absolute left-0 top-0 rounded-2xl pixar-grid-frame"
                style={{
                  width: size,
                  height: size,
                  padding: pad,
                  transform: face.place.replace(/H/g, `${half}px`),
                  backfaceVisibility: 'hidden',
                  pointerEvents: isActive ? 'auto' : 'none',
                  opacity: isActive ? 1 : 0.5,
                  transition: 'opacity 0.4s',
                }}
              >
                {/* Top accent line (matches the classic board frame) */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-4 top-1 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--stage-accent, var(--pixar-yellow))) 30%, hsl(var(--pixar-red)) 70%, transparent)', opacity: 0.85 }}
                />
                {/* Line-clear flash + reaction particles on the active face */}
                {isActive && flashKey > 0 && <span key={flashKey} className="neon-flash-overlay rounded-2xl" aria-hidden />}
                {isActive && (
                  <ReactionParticles trigger={particle} cellSize={cellPx + gap} gridOffset={{ x: pad, y: pad }} />
                )}
                <div
                  className="grid h-full w-full"
                  style={{ gridTemplateColumns: `repeat(${FACE}, 1fr)`, gridTemplateRows: `repeat(${FACE}, 1fr)`, gap }}
                >
                  {board.map((row, y) =>
                    row.map((cell, x) => {
                      const isGhost = isActive && ghost.has(`${x},${y}`);
                      return (
                        <div
                          key={`${x}-${y}`}
                          className="flex items-center justify-center rounded-lg"
                          style={{ background: cell ? 'transparent' : 'hsl(var(--game-cell) / 0.6)' }}
                          onMouseEnter={isActive ? () => setHover({ x, y }) : undefined}
                          onClick={isActive ? () => { if (!movedRef.current) handleCell(x, y); } : undefined}
                        >
                          {cell && <ElementBlock element={cell} size={blockPx} showSymbol={false} />}
                          {!cell && isGhost && selected && (
                            <ElementBlock element={selected.element} size={blockPx} isPreview showSymbol={false} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orbit hint + current face */}
      <div className="z-20 flex items-center gap-2 pb-1 text-white/70">
        <Rotate3d className="w-4 h-4 text-pixar-yellow" />
        <span className="text-xs uppercase tracking-widest font-bold">Drag to rotate</span>
        <span className="text-white/30">·</span>
        <span className="text-xs uppercase tracking-widest font-bold text-white/90">{FACES[activeFace].name}</span>
      </div>

      {/* Piece tray */}
      <div className="z-20 w-full max-w-md px-4 pb-6">
        {stuckHere && (
          <p className="text-center text-xs text-pixar-yellow mb-2">No room on this face — rotate the cube! ↻</p>
        )}
        <div className="flex justify-center items-center gap-4">
          {pieces.map((piece) => {
            const isSel = selected?.id === piece.id;
            const minX = Math.min(...piece.shape.map((p) => p.x));
            const minY = Math.min(...piece.shape.map((p) => p.y));
            const w = Math.max(...piece.shape.map((p) => p.x)) - minX + 1;
            const h = Math.max(...piece.shape.map((p) => p.y)) - minY + 1;
            return (
              <motion.button
                key={piece.id}
                onClick={() => { playSound('select'); setSelected(isSel ? null : piece); }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: isSel ? 1.08 : 1 }}
                className={`relative p-2 rounded-xl border bg-game-tray/50 ${isSel ? 'border-pixar-yellow ring-2 ring-pixar-yellow/60' : 'border-game-grid-border/30'}`}
              >
                <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${w}, 20px)`, gridTemplateRows: `repeat(${h}, 20px)` }}>
                  {Array.from({ length: h }, (_, row) =>
                    Array.from({ length: w }, (_, col) => {
                      const has = piece.shape.some((p) => p.x - minX === col && p.y - minY === row);
                      return (
                        <div key={`${row}-${col}`} className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
                          {has && <ElementBlock element={piece.element} size={18} isPreview showSymbol={false} />}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
        <p className="text-center text-xs text-game-text-muted/60 mt-3">
          {selected ? 'Tap a square on the front face to place' : 'Pick a piece — rotate the cube to play all 6 faces'}
        </p>
      </div>
    </div>
  );
};

export default CubeGame;
