import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RotateCcw, Rotate3d, Lightbulb } from 'lucide-react';
import { ElementBlock } from '@/components/game/ElementBlock';
import { PieceTray } from '@/components/game/PieceTray';
import { BlockBlastScoreboard } from '@/components/game/BlockBlastScoreboard';
import PhasePill from '@/components/game/PhasePill';
import { PixarChip, PixarButton, PixarOverlay } from '@/components/game/pixar';
import { ScorePopup } from '@/components/game/ScorePopup';
import ReactionParticles from '@/components/game/ReactionParticles';
import AdaptiveStage from '@/components/game/AdaptiveStage';
import { FeverMeter } from '@/components/game/FeverMeter';
import { usePhase } from '@/hooks/usePhase';
import { Cell, DraggablePiece, Position } from '@/game/types';
import {
  createEmptyGrid, createRandomPiece, canPlacePieceAt, canAnyPieceFit, resolveGrid, findHint, getComboText, getReactionPreview,
} from '@/game/engine';
import { playSound, startMusic } from '@/game/sounds';

const FACE = 6;
type ReactionType = 'burn' | 'extinguish' | 'dissolve';
const REACTION_RING: Record<ReactionType, string> = {
  burn: 'ring-2 ring-orange-400/80',
  extinguish: 'ring-2 ring-blue-400/80',
  dissolve: 'ring-2 ring-green-400/80',
};

const FACES = [
  { id: 0, name: 'Front',  place: 'translateZ(H)' },
  { id: 1, name: 'Right',  place: 'rotateY(90deg) translateZ(H)' },
  { id: 2, name: 'Back',   place: 'rotateY(180deg) translateZ(H)' },
  { id: 3, name: 'Left',   place: 'rotateY(-90deg) translateZ(H)' },
] as const;

const FEVER_MS = 9000;
// Gentle side-view offset: keeps depth visible without skewing targets too much.
const ISO = { x: -8, y: 12 };

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
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem('cube-best') || 0));
  const [isGameOver, setIsGameOver] = useState(false);
  const [particle, setParticle] = useState<{ type: ReactionType; positions: Position[]; timestamp: number } | null>(null);
  const [popup, setPopup] = useState<{ score: number; show: boolean; text: string; reactionType?: ReactionType }>({ score: 0, show: false, text: '' });
  const [flashKey, setFlashKey] = useState(0);
  const { phase, next, progress } = usePhase(score);

  useEffect(() => {
    if (score > best) { setBest(score); localStorage.setItem('cube-best', String(score)); }
  }, [score, best]);

  // ── Reaction Fever ──
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

  // ── Side-only 3D orbit ──
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [snapping, setSnapping] = useState(true);
  const rotRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const movedRef = useRef(false);

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

  const placePieceAt = useCallback((piece: DraggablePiece, pos: Position) => {
    if (isGameOver) return;
    const board = boards[activeFace];
    if (!canPlacePieceAt(board, piece, pos)) return;
    playSound('drop');

    const r = resolveGrid(placeInto(board, piece, pos));
    const mult = feverActiveRef.current ? 2 : 1;
    const gained = Math.floor(r.totalScore * mult) + piece.shape.length * 10;
    const nextBoards = boards.map((b, i) => (i === activeFace ? r.grid : b));
    const nextScore = score + gained;
    setBoards(nextBoards);
    setScore(nextScore);

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

    const nextPieces = refill(pieces.filter((p) => p.id !== piece.id), nextScore);
    setPieces(nextPieces);
    setSelected(null);
    setHover(null);
    if (!nextBoards.some((b) => canAnyPieceFit(b, nextPieces))) { setIsGameOver(true); playSound('gameOver'); }
  }, [isGameOver, boards, activeFace, score, pieces, refill, activateFever]);

  // Map a screen point to a board cell using the browser's real 3D hit-testing
  // (works at any cube angle, unlike flat-rect math). On touch, sample a little
  // above the finger so the target cell isn't hidden under it.
  const cellFromPoint = useCallback((clientX: number, clientY: number, pointerType: string): Position | null => {
    const sy = pointerType === 'mouse' ? clientY : clientY - cellPx;
    const el = document.elementFromPoint(clientX, sy) as HTMLElement | null;
    const cellEl = el?.closest('[data-cube-cell]') as HTMLElement | null;
    if (!cellEl) return null;
    return { x: Number(cellEl.dataset.x), y: Number(cellEl.dataset.y) };
  }, [cellPx]);

  const handleDragHover = useCallback((piece: DraggablePiece, cx: number, cy: number, pt: string) => {
    setSelected(piece);
    setHover(cellFromPoint(cx, cy, pt));
  }, [cellFromPoint]);
  const handleDragDrop = useCallback((piece: DraggablePiece, cx: number, cy: number, pt: string) => {
    const cell = cellFromPoint(cx, cy, pt);
    if (cell) placePieceAt(piece, cell);
    setHover(null);
  }, [cellFromPoint, placePieceAt]);

  const handleHint = useCallback(() => {
    const h = findHint(boards[activeFace], pieces);
    if (!h) return;
    playSound('select');
    setSelected(h.piece);
    setHover(h.pos);
  }, [boards, activeFace, pieces]);

  // ── Side orbit / snap ──
  const faceFromRot = (_rx: number, ry: number) => {
    const rys = (((Math.round(ry / 90) * 90) % 360) + 360) % 360;
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
    if (!movedRef.current && Math.abs(dx) > 6) movedRef.current = true;
    if (!movedRef.current) return;
    const ny = d.ry + dx * 0.4;
    rotRef.current = { x: 0, y: ny };
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
    setHover(null);
    setScore(0);
    setActiveFace(0);
    setIsGameOver(false);
    endFever();
    rotRef.current = { x: 0, y: 0 };
    setRot({ x: 0, y: 0 });
    setSnapping(true);
  };

  // Placement ghost + reaction preview on the active face.
  const ghost = useMemo(() => {
    if (!selected || !hover || !canPlacePieceAt(boards[activeFace], selected, hover)) return new Set<string>();
    return new Set(selected.shape.map((p) => `${hover.x + p.x},${hover.y + p.y}`));
  }, [selected, hover, boards, activeFace]);

  const reactionMap = useMemo(() => {
    const m = new Map<string, ReactionType>();
    if (!selected || !hover || !canPlacePieceAt(boards[activeFace], selected, hover)) return m;
    getReactionPreview(boards[activeFace], selected, hover).forEach((pv) => {
      pv.affectedPositions.forEach((ap) => m.set(`${ap.x},${ap.y}`, pv.type));
    });
    return m;
  }, [selected, hover, boards, activeFace]);

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center bg-gradient-pixar-stage text-white overflow-hidden relative"
      style={{ ['--stage-accent' as string]: phase.accent, ['--stage-glow' as string]: phase.glow } as CSSProperties}
    >
      <AdaptiveStage phase={phase} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_36%)]" />

      <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-28">
        <ScorePopup score={popup.score} show={popup.show} text={popup.text} reactionType={popup.reactionType} />
      </div>

      {/* Glass top bar */}
      <div className="z-20 mt-4 flex w-[calc(100%-2rem)] max-w-md items-center justify-between rounded-full border border-white/15 bg-white/10 px-3 py-2 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <Link to="/"><PixarChip title="Back to classic"><Home className="w-5 h-5 text-white" /></PixarChip></Link>
        <p className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/85 font-bold shadow-inner backdrop-blur-md">Cube Mode</p>
        <div className="flex gap-2">
          <PixarChip title="Hint" onClick={handleHint}><Lightbulb className="w-5 h-5 text-pixar-yellow" /></PixarChip>
          <PixarChip title="Restart" onClick={reset}><RotateCcw className="w-5 h-5 text-white" /></PixarChip>
        </div>
      </div>

      {/* Glass HUD: scoreboard + phase pill + fever */}
      <div className="z-20 mt-3 flex w-[calc(100%-2rem)] max-w-[420px] flex-col items-center rounded-[28px] border border-white/15 bg-white/10 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <BlockBlastScoreboard score={score} topScore={best} compact />
        <PhasePill phase={phase} next={next} progress={progress} />
        <FeverMeter meter={feverMeter} active={feverActive} endsAt={feverEndsAt} />
      </div>

      {/* Glass 3D stage — horizontal drag rotates the four side faces only */}
      <div
        className="relative z-10 flex-1 w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1100px', touchAction: 'none' }}
        onPointerDown={onScenePointerDown}
        onPointerMove={onScenePointerMove}
        onPointerUp={onScenePointerUp}
        onPointerCancel={onScenePointerUp}
      >
        <div className="pointer-events-none absolute h-[78vw] max-h-[420px] w-[78vw] max-w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div
          className="relative"
          style={{
            width: size, height: size, transformStyle: 'preserve-3d',
            transform: `rotateX(${rot.x + ISO.x}deg) rotateY(${rot.y + ISO.y}deg)`,
            transition: snapping ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {FACES.map((face) => {
            const isActive = face.id === activeFace;
            const board = boards[face.id];
            return (
              <div
                key={face.id}
                className="absolute left-0 top-0 rounded-[30px] border border-white/20 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl pixar-grid-frame"
                style={{
                  width: size, height: size, padding: pad,
                  transform: face.place.replace(/H/g, `${half}px`),
                  backfaceVisibility: 'hidden',
                  pointerEvents: isActive ? 'auto' : 'none',
                  opacity: isActive ? 1 : 0.38,
                  transition: 'opacity 0.4s, box-shadow 0.4s',
                  boxShadow: isActive
                    ? '0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)'
                    : '0 18px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.14)',
                }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-6 top-2 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85) 30%, hsl(var(--stage-accent, var(--pixar-yellow))) 70%, transparent)', opacity: 0.9 }} />
                {isActive && flashKey > 0 && <span key={flashKey} className="neon-flash-overlay rounded-[30px]" aria-hidden />}
                {isActive && <ReactionParticles trigger={particle} cellSize={cellPx + gap} gridOffset={{ x: pad, y: pad }} />}
                <div id={isActive ? 'cube-active-grid' : undefined} className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${FACE}, 1fr)`, gridTemplateRows: `repeat(${FACE}, 1fr)`, gap }}>
                  {board.map((row, y) =>
                    row.map((cell, x) => {
                      const k = `${x},${y}`;
                      const isGhost = isActive && ghost.has(k);
                      const rType = isActive ? reactionMap.get(k) : undefined;
                      return (
                        <div
                          key={k}
                          data-cube-cell={isActive ? '' : undefined}
                          data-x={x}
                          data-y={y}
                          className={`flex items-center justify-center rounded-xl border border-white/10 shadow-inner backdrop-blur-sm transition-colors ${rType ? REACTION_RING[rType] : ''}`}
                          style={{
                            background: cell.element ? 'transparent' : 'rgba(255,255,255,0.08)',
                            boxShadow: cell.element ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.16)',
                          }}
                          onMouseEnter={isActive ? () => setHover({ x, y }) : undefined}
                          onClick={isActive ? () => { if (!movedRef.current && selected) placePieceAt(selected, { x, y }); } : undefined}
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
          })}
        </div>
      </div>

      {/* Glass orbit hint + current face */}
      <div className="z-20 mb-2 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/75 shadow-xl shadow-black/20 backdrop-blur-xl">
        <Rotate3d className="w-4 h-4 text-pixar-yellow" />
        <span className="text-xs uppercase tracking-widest font-bold">Drag left / right</span>
        <span className="text-white/30">·</span>
        <span className="text-xs uppercase tracking-widest font-bold text-white/90">{FACES[activeFace].name}</span>
      </div>

      {/* Glass piece tray (tap-to-select or drag onto the active side face) */}
      <div className="z-20 w-[calc(100%-2rem)] max-w-md rounded-[30px] border border-white/15 bg-white/10 px-4 pb-4 pt-3 shadow-2xl shadow-black/20 backdrop-blur-xl mb-5">
        <PieceTray
          pieces={pieces}
          selectedPiece={selected}
          onSelectPiece={setSelected}
          onDragHover={handleDragHover}
          onDragDrop={handleDragDrop}
          disabled={isGameOver}
        />
      </div>

      {/* Game over */}
      <AnimatePresence>
        {isGameOver && (
          <PixarOverlay>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[32px] border border-white/20 bg-white/10 px-8 py-7 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl">
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
