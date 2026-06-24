import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RotateCcw, Rotate3d, Lightbulb } from 'lucide-react';
import { ElementBlock } from '@/components/game/ElementBlock';
import { PixarChip, PixarButton, PixarOverlay } from '@/components/game/pixar';
import { ScorePopup } from '@/components/game/ScorePopup';
import ReactionParticles from '@/components/game/ReactionParticles';
import AdaptiveStage from '@/components/game/AdaptiveStage';
import { FeverMeter } from '@/components/game/FeverMeter';
import { usePhase } from '@/hooks/usePhase';
import { Cell, DraggablePiece, Position } from '@/game/types';
import {
  createEmptyGrid, createRandomPiece, canPlacePieceAt, canAnyPieceFit, resolveGrid, findHint, getComboText,
} from '@/game/engine';
import { playSound, startMusic } from '@/game/sounds';

const FACE = 6;
type ReactionType = 'burn' | 'extinguish' | 'dissolve';

// Six faces of the cube; `place` positions each face on the cube body.
const FACES = [
  { id: 0, name: 'Front',  place: 'translateZ(H)' },
  { id: 1, name: 'Right',  place: 'rotateY(90deg) translateZ(H)' },
  { id: 2, name: 'Back',   place: 'rotateY(180deg) translateZ(H)' },
  { id: 3, name: 'Left',   place: 'rotateY(-90deg) translateZ(H)' },
  { id: 4, name: 'Top',    place: 'rotateX(90deg) translateZ(H)' },
  { id: 5, name: 'Bottom', place: 'rotateX(-90deg) translateZ(H)' },
] as const;

const FEVER_MS = 9000;

const placeInto = (grid: Cell[][], piece: DraggablePiece, pos: Position): Cell[][] => {
  const ng = grid.map((r) => r.map((c) => ({ ...c })));
  piece.shape.forEach((p, i) => {
    ng[pos.y + p.y][pos.x + p.x] = { element: piece.elements[i], id: `${pos.x + p.x}-${pos.y + p.y}-${Date.now()}-${i}` };
  });
  return ng;
};

const CubeGame = () => {
  const [boards, setBoards] = useState<Cell[][][]>(() => FACES.map(() => createEmptyGrid(FACE, FACE)));
  const [activeFace, setActiveFace] = useState(0);
  const [pieces, setPieces] = useState<DraggablePiece[]>(() => [createRandomPiece(0), createRandomPiece(0), createRandomPiece(0)]);
  const [selected, setSelected] = useState<DraggablePiece | null>(null);
  const [hover, setHover] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [particle, setParticle] = useState<{ type: ReactionType; positions: Position[]; timestamp: number } | null>(null);
  const [popup, setPopup] = useState<{ score: number; show: boolean; text: string; reactionType?: ReactionType }>({ score: 0, show: false, text: '' });
  const [flashKey, setFlashKey] = useState(0);
  const { phase } = usePhase(score);

  // ── Reaction Fever (mirrors the classic engine) ──
  const [feverMeter, setFeverMeter] = useState(0);
  const [feverActive, setFeverActive] = useState(false);
  const [feverEndsAt, setFeverEndsAt] = useState(0);
  const feverActiveRef = useRef(false);
  const feverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endFever = useCallback(() => {
    if (feverTimer.current) clearTimeout(feverTimer.current);
    feverTimer.current = null;
    feverActiveRef.current = false;
    setFeverActive(false);
    setFeverEndsAt(0);
    setFeverMeter(0);
  }, []);
  const activateFever = useCallback(() => {
    feverActiveRef.current = true;
    setFeverActive(true);
    setFeverEndsAt(Date.now() + FEVER_MS);
    setFeverMeter(100);
    playSound('combo');
    if (feverTimer.current) clearTimeout(feverTimer.current);
    feverTimer.current = setTimeout(endFever, FEVER_MS);
  }, [endFever]);
  useEffect(() => () => { if (feverTimer.current) clearTimeout(feverTimer.current); }, []);

  // ── Free 3D orbit ──
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [snapping, setSnapping] = useState(true);
  const rotRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const movedRef = useRef(false);

  // Responsive cube size in px.
  const [size, setSize] = useState(320);
  useEffect(() => {
    const calc = () => setSize(Math.min(window.innerWidth * 0.8, Math.min(window.innerHeight * 0.5, 360)));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  useEffect(() => { startMusic(); }, []);

  const half = size / 2;
  const pad = 8;
  const gap = 4;
  const cellPx = Math.floor((size - pad * 2 - gap * (FACE - 1)) / FACE);
  const blockPx = Math.floor(cellPx * 0.9);

  const refill = useCallback((remaining: DraggablePiece[], forScore: number) =>
    remaining.length > 0 ? remaining : [createRandomPiece(forScore), createRandomPiece(forScore), createRandomPiece(forScore)], []);

  const handleCell = useCallback((fx: number, fy: number) => {
    if (!selected || isGameOver) return;
    const board = boards[activeFace];
    if (!canPlacePieceAt(board, selected, { x: fx, y: fy })) return;
    playSound('drop');

    const r = resolveGrid(placeInto(board, selected, { x: fx, y: fy }));
    const mult = feverActiveRef.current ? 2 : 1;
    const gained = Math.floor(r.totalScore * mult) + selected.shape.length * 10;
    const nextBoards = boards.map((b, i) => (i === activeFace ? r.grid : b));
    const nextScore = score + gained;
    setBoards(nextBoards);
    setScore(nextScore);

    // Fever charge
    if (!feverActiveRef.current) {
      const gain = r.linesCleared * 10 + r.allReactionEvents.length * 6;
      if (gain > 0) setFeverMeter((m) => { const nm = m + gain; if (nm >= 100) { activateFever(); return 100; } return nm; });
    }

    if (r.allAffectedPositions.length > 0) {
      setParticle({ type: (r.primaryReactionType ?? r.allAffectedPositions[0].type) as ReactionType, positions: r.allAffectedPositions.flatMap((a) => a.positions), timestamp: Date.now() });
    }
    if (r.maxCombo > 0 || r.linesCleared > 0) {
      const text = r.perfectClear ? 'PERFECT CLEAR!' : getComboText(r.maxCombo, r.linesCleared);
      setPopup({ score: gained, show: true, text, reactionType: r.primaryReactionType as ReactionType });
      setFlashKey((k) => k + 1);
      if (r.maxCombo > 1 || r.linesCleared >= 2) playSound('combo');
      window.setTimeout(() => setPopup((p) => ({ ...p, show: false })), 1200);
    }

    const remaining = pieces.filter((p) => p.id !== selected.id);
    const nextPieces = refill(remaining, nextScore);
    setPieces(nextPieces);
    setSelected(null);
    setHover(null);

    // Game over only when NO face can fit ANY remaining piece.
    const anyMove = nextBoards.some((b) => canAnyPieceFit(b, nextPieces));
    if (!anyMove) { setIsGameOver(true); playSound('gameOver'); }
  }, [selected, isGameOver, boards, activeFace, score, pieces, refill, activateFever]);

  // ── Hint: ghost a helpful move on the active face ──
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleHint = useCallback(() => {
    const h = findHint(boards[activeFace], pieces);
    if (!h) return;
    playSound('select');
    setSelected(h.piece);
    setHover(h.pos);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHover(null), 1700);
  }, [boards, activeFace, pieces]);
  useEffect(() => () => { if (hintTimer.current) clearTimeout(hintTimer.current); }, []);

  // ── Orbit / snap ──
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
    setBoards(FACES.map(() => createEmptyGrid(FACE, FACE)));
    setPieces([createRandomPiece(0), createRandomPiece(0), createRandomPiece(0)]);
    setSelected(null);
    setScore(0);
    setActiveFace(0);
    setIsGameOver(false);
    endFever();
    rotRef.current = { x: 0, y: 0 };
    setRot({ x: 0, y: 0 });
    setSnapping(true);
  };

  const ghost = useMemo(() => {
    if (!selected || !hover) return new Set<string>();
    if (!canPlacePieceAt(boards[activeFace], selected, hover)) return new Set<string>();
    return new Set(selected.shape.map((p) => `${hover.x + p.x},${hover.y + p.y}`));
  }, [selected, hover, boards, activeFace]);

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center bg-gradient-pixar-stage text-white overflow-hidden relative"
      style={{ ['--stage-accent' as string]: phase.accent, ['--stage-glow' as string]: phase.glow } as CSSProperties}
    >
      <AdaptiveStage phase={phase} />

      <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-24">
        <ScorePopup score={popup.score} show={popup.show} text={popup.text} reactionType={popup.reactionType} />
      </div>

      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-4 pt-4 z-20">
        <Link to="/"><PixarChip title="Back to classic"><Home className="w-5 h-5 text-white" /></PixarChip></Link>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-pixar-yellow/80 font-bold">Cube Mode</p>
          <p className="font-display text-2xl leading-none bg-gradient-to-r from-pixar-yellow to-pixar-red bg-clip-text text-transparent">{score.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <PixarChip title="Hint" onClick={handleHint}><Lightbulb className="w-5 h-5 text-pixar-yellow" /></PixarChip>
          <PixarChip title="Restart" onClick={reset}><RotateCcw className="w-5 h-5 text-white" /></PixarChip>
        </div>
      </div>

      {/* Fever meter */}
      <div className="z-20 w-full max-w-[420px] px-4 mt-1">
        <FeverMeter meter={feverMeter} active={feverActive} endsAt={feverEndsAt} />
      </div>

      {/* 3D stage — drag to orbit */}
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
            width: size, height: size, transformStyle: 'preserve-3d',
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
                  width: size, height: size, padding: pad,
                  transform: face.place.replace(/H/g, `${half}px`),
                  backfaceVisibility: 'hidden',
                  pointerEvents: isActive ? 'auto' : 'none',
                  opacity: isActive ? 1 : 0.5,
                  transition: 'opacity 0.4s',
                }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-4 top-1 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--stage-accent, var(--pixar-yellow))) 30%, hsl(var(--pixar-red)) 70%, transparent)', opacity: 0.85 }} />
                {isActive && flashKey > 0 && <span key={flashKey} className="neon-flash-overlay rounded-2xl" aria-hidden />}
                {isActive && <ReactionParticles trigger={particle} cellSize={cellPx + gap} gridOffset={{ x: pad, y: pad }} />}
                <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${FACE}, 1fr)`, gridTemplateRows: `repeat(${FACE}, 1fr)`, gap }}>
                  {board.map((row, y) =>
                    row.map((cell, x) => {
                      const isGhost = isActive && ghost.has(`${x},${y}`);
                      return (
                        <div
                          key={`${x}-${y}`}
                          className="flex items-center justify-center rounded-lg"
                          style={{ background: cell.element ? 'transparent' : 'hsl(var(--game-cell) / 0.6)' }}
                          onMouseEnter={isActive ? () => setHover({ x, y }) : undefined}
                          onClick={isActive ? () => { if (!movedRef.current) handleCell(x, y); } : undefined}
                        >
                          {cell.element && <ElementBlock element={cell.element} size={blockPx} showSymbol={false} />}
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
                      const idx = piece.shape.findIndex((p) => p.x - minX === col && p.y - minY === row);
                      return (
                        <div key={`${row}-${col}`} className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
                          {idx !== -1 && <ElementBlock element={piece.elements[idx]} size={18} isPreview showSymbol={false} />}
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
          {selected ? 'Tap a square on the front face to place' : 'Pick a piece — drag the cube to play all 6 faces'}
        </p>
      </div>

      {/* Game over */}
      <AnimatePresence>
        {isGameOver && (
          <PixarOverlay>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <p className="text-3xl font-display text-white mb-1">Cube Complete!</p>
              <p className="text-5xl font-display bg-gradient-to-r from-pixar-yellow to-pixar-red bg-clip-text text-transparent mb-4">{score.toLocaleString()}</p>
              <PixarButton onClick={reset} variant="primary" size="md" shine>Play Again</PixarButton>
            </motion.div>
          </PixarOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CubeGame;
