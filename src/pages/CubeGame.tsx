import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Home, RotateCcw } from 'lucide-react';
import { ElementBlock } from '@/components/game/ElementBlock';
import { PixarChip } from '@/components/game/pixar';
import { Position } from '@/game/types';
import {
  CBoard, CPiece, FACE, emptyBoard, randomPiece, canPlace, place, clearLines, canAnyFit,
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

const lineBonus = (n: number) => (n === 1 ? 100 : n === 2 ? 300 : n >= 3 ? n * 200 : 0);

const CubeGame = () => {
  const [boards, setBoards] = useState<CBoard[]>(() => FACES.map(() => emptyBoard()));
  const [activeFace, setActiveFace] = useState(0);
  const [pieces, setPieces] = useState<CPiece[]>(() => [randomPiece(), randomPiece(), randomPiece()]);
  const [selected, setSelected] = useState<CPiece | null>(null);
  const [hover, setHover] = useState<Position | null>(null);
  const [score, setScore] = useState(0);

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

  const viewTransform = FACES[activeFace].view;

  const refill = useCallback((remaining: CPiece[]) =>
    remaining.length > 0 ? remaining : [randomPiece(), randomPiece(), randomPiece()], []);

  const handleCell = useCallback((fx: number, fy: number) => {
    if (!selected) return;
    const board = boards[activeFace];
    if (!canPlace(board, selected, fx, fy)) return;
    playSound('drop');
    const placed = place(board, selected, fx, fy);
    const { board: cleared, cleared: lines } = clearLines(placed);
    if (lines > 0) playSound('lineClear');
    setBoards((prev) => prev.map((b, i) => (i === activeFace ? cleared : b)));
    setScore((s) => s + selected.shape.length * 5 + lineBonus(lines));
    setPieces((prev) => refill(prev.filter((p) => p.id !== selected.id)));
    setSelected(null);
    setHover(null);
  }, [selected, boards, activeFace, refill]);

  const rotateSide = (dir: 1 | -1) => {
    setActiveFace((f) => {
      const ring = [0, 1, 2, 3];
      const idx = ring.indexOf(f);
      if (idx === -1) return 0; // from top/bottom return to front
      return ring[(idx + dir + ring.length) % ring.length];
    });
    setHover(null);
  };
  const toggleFace = (face: number) => { setActiveFace((f) => (f === face ? 0 : face)); setHover(null); };

  const reset = () => {
    setBoards(FACES.map(() => emptyBoard()));
    setPieces([randomPiece(), randomPiece(), randomPiece()]);
    setSelected(null);
    setScore(0);
    setActiveFace(0);
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
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-gradient-pixar-stage text-white overflow-hidden">
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

      {/* 3D stage */}
      <div className="flex-1 w-full flex items-center justify-center" style={{ perspective: '1100px' }}>
        <div
          className="relative"
          style={{
            width: size,
            height: size,
            transformStyle: 'preserve-3d',
            transform: viewTransform,
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
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
                          onClick={isActive ? () => handleCell(x, y) : undefined}
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

      {/* Rotation controls */}
      <div className="z-20 flex items-center gap-3 pb-1">
        <PixarChip onClick={() => rotateSide(-1)} title="Rotate left"><ChevronLeft className="w-5 h-5 text-white" /></PixarChip>
        <PixarChip onClick={() => toggleFace(4)} active={activeFace === 4} title="Top face"><ChevronUp className="w-5 h-5 text-white" /></PixarChip>
        <span className="w-16 text-center text-xs uppercase tracking-widest text-white/70 font-bold">{FACES[activeFace].name}</span>
        <PixarChip onClick={() => toggleFace(5)} active={activeFace === 5} title="Bottom face"><ChevronDown className="w-5 h-5 text-white" /></PixarChip>
        <PixarChip onClick={() => rotateSide(1)} title="Rotate right"><ChevronRight className="w-5 h-5 text-white" /></PixarChip>
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
