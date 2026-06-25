import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RotateCcw, Rotate3d, Lightbulb, Trophy, Award, Volume2 } from 'lucide-react';
import { ElementBlock } from '@/components/game/ElementBlock';
import { PieceTray } from '@/components/game/PieceTray';
import { BlockBlastScoreboard } from '@/components/game/BlockBlastScoreboard';
import PhasePill from '@/components/game/PhasePill';
import { PixarChip, PixarButton, PixarOverlay, PixarBadge } from '@/components/game/pixar';
import { ScorePopup } from '@/components/game/ScorePopup';
import ReactionParticles from '@/components/game/ReactionParticles';
import AdaptiveStage from '@/components/game/AdaptiveStage';
import { FeverMeter } from '@/components/game/FeverMeter';
import { LeaderboardModal } from '@/components/game/LeaderboardModal';
import { PlayerNameModal } from '@/components/game/PlayerNameModal';
import { AchievementsModal } from '@/components/game/AchievementsModal';
import { AchievementPopup } from '@/components/game/AchievementPopup';
import { SoundSettings } from '@/components/game/SoundSettings';
import { StreakBadge } from '@/components/game/StreakBadge';
import { usePhase } from '@/hooks/usePhase';
import { useHighScores } from '@/hooks/useHighScores';
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { useAchievements } from '@/hooks/useAchievements';
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
  { id: 4, name: 'Top',    place: 'rotateX(90deg) translateZ(H)' },
  { id: 5, name: 'Bottom', place: 'rotateX(-90deg) translateZ(H)' },
] as const;

const FEVER_MS = 9000;
// Fixed isometric viewing offset so the playing face is always seen at an
// angle (depth + edges of adjacent faces) instead of flat like the 2D board.
const ISO = { x: -9, y: 11 };

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
  const { phase, next, progress } = usePhase(score);

  // ── Meta features (shared with the classic game) ──
  const { highScores, topScore, saveScore, clearScores } = useHighScores();
  const { submitScore, getStoredPlayerName, storePlayerName } = useGlobalLeaderboard();
  const { currentStreak, recordPlay, isStreakAtRisk } = useDailyStreak();
  const { achievements, totalPoints, justUnlocked, checkAchievements, clearJustUnlocked } = useAchievements();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [submittedPlayerName, setSubmittedPlayerName] = useState<string | null>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const hasEnded = useRef(false);

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

  // ── Free 3D orbit ──
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
    // Achievements: combos + reactions
    if (r.maxCombo >= 2) checkAchievements({ combo: r.maxCombo });
    if (r.allReactionEvents.length > 0) {
      const last = r.allReactionEvents[r.allReactionEvents.length - 1];
      checkAchievements({ reactionType: last.type, reactionCount: 1 });
    }

    const nextPieces = refill(pieces.filter((p) => p.id !== piece.id), nextScore);
    setPieces(nextPieces);
    setSelected(null);
    setHover(null);
    if (!nextBoards.some((b) => canAnyPieceFit(b, nextPieces))) setIsGameOver(true);
  }, [isGameOver, boards, activeFace, score, pieces, refill, activateFever, checkAchievements]);

  // Game-over meta: high score, streak, achievements, score submission.
  useEffect(() => {
    if (isGameOver && score > 0 && !hasEnded.current) {
      hasEnded.current = true;
      const isHigh = score > topScore;
      setIsNewHighScore(isHigh);
      playSound(isHigh ? 'highScore' : 'gameOver');
      recordPlay();
      checkAchievements({ score, streak: currentStreak });
      saveScore(score);
      if (score >= 100) setShowPlayerNameModal(true);
    }
    if (!isGameOver) {
      hasEnded.current = false;
      setIsNewHighScore(false);
      setSubmittedPlayerName(null);
      setGlobalRank(null);
    }
  }, [isGameOver, score, topScore, recordPlay, checkAchievements, currentStreak, saveScore]);

  const handleSubmitScore = useCallback(async (playerName: string) => {
    setIsSubmittingScore(true);
    try {
      storePlayerName(playerName);
      const result = await submitScore(playerName, score);
      if (result.success) {
        setSubmittedPlayerName(playerName);
        setGlobalRank(result.rank || null);
        setShowPlayerNameModal(false);
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setIsSubmittingScore(false);
    }
  }, [score, submitScore, storePlayerName]);

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

      <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-28">
        <ScorePopup score={popup.score} show={popup.show} text={popup.text} reactionType={popup.reactionType} />
      </div>

      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-4 pt-4 z-20">
        <Link to="/classic"><PixarChip title="Classic mode"><Home className="w-5 h-5 text-white" /></PixarChip></Link>
        <div className="flex gap-2 items-center">
          {currentStreak > 0 && <StreakBadge streak={currentStreak} isAtRisk={isStreakAtRisk} size="md" />}
          <PixarChip title="Hint" onClick={handleHint}><Lightbulb className="w-5 h-5 text-pixar-yellow" /></PixarChip>
          <PixarChip title="Sound" onClick={() => setShowSoundSettings(true)}><Volume2 className="w-5 h-5 text-white" /></PixarChip>
          <PixarChip title="Achievements" onClick={() => setShowAchievements(true)}><Award className="w-5 h-5 text-pixar-yellow" /></PixarChip>
          <PixarChip title="Leaderboard" onClick={() => setShowLeaderboard(true)}><Trophy className="w-5 h-5" fill="hsl(var(--pixar-yellow))" stroke="hsl(var(--pixar-yellow-deep))" /></PixarChip>
          <PixarChip title="Restart" onClick={reset}><RotateCcw className="w-5 h-5 text-white" /></PixarChip>
        </div>
      </div>

      {/* Classic HUD: scoreboard + phase pill + fever */}
      <div className="z-20 w-full max-w-[420px] px-4 flex flex-col items-center mt-1">
        <BlockBlastScoreboard score={score} topScore={topScore} compact />
        <PhasePill phase={phase} next={next} progress={progress} />
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
                          className={`flex items-center justify-center rounded-lg ${rType ? REACTION_RING[rType] : ''}`}
                          style={{ background: cell.element ? 'transparent' : 'hsl(var(--game-cell) / 0.6)' }}
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

      {/* Orbit hint + current face */}
      <div className="z-20 flex items-center gap-2 pb-1 text-white/70">
        <Rotate3d className="w-4 h-4 text-pixar-yellow" />
        <span className="text-xs uppercase tracking-widest font-bold">Drag to rotate</span>
        <span className="text-white/30">·</span>
        <span className="text-xs uppercase tracking-widest font-bold text-white/90">{FACES[activeFace].name}</span>
      </div>

      {/* Full classic piece tray (tap-to-select or drag onto the front face) */}
      <div className="z-20 w-full max-w-md px-4 pb-6">
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
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              {isNewHighScore && (
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="mb-3">
                  <PixarBadge tone="yellow" className="text-sm animate-pulse">🏆 New High Score! 🏆</PixarBadge>
                </motion.div>
              )}
              <p className="text-3xl font-display text-white mb-1">{isNewHighScore ? 'Amazing!' : 'Cube Complete!'}</p>
              <p className="text-5xl font-display bg-gradient-to-r from-pixar-yellow to-pixar-red bg-clip-text text-transparent mb-2">{score.toLocaleString()}</p>
              {globalRank && submittedPlayerName && (
                <div className="mb-3"><PixarBadge tone="blue" icon={<Trophy className="w-4 h-4" />}>Global Rank: #{globalRank}</PixarBadge></div>
              )}
              {!submittedPlayerName && score >= 100 && (
                <div className="mb-3"><PixarButton onClick={() => setShowPlayerNameModal(true)} variant="ghost" size="sm">Submit Score</PixarButton></div>
              )}
              <PixarButton onClick={reset} variant="primary" size="md" shine>Play Again</PixarButton>
            </motion.div>
          </PixarOverlay>
        )}
      </AnimatePresence>

      {/* Meta modals */}
      <PlayerNameModal isOpen={showPlayerNameModal} onClose={() => setShowPlayerNameModal(false)} onSubmit={handleSubmitScore} score={score} defaultName={getStoredPlayerName()} isSubmitting={isSubmittingScore} />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} highScores={highScores} currentScore={isGameOver ? score : undefined} onClear={clearScores} highlightPlayerName={submittedPlayerName || undefined} />
      <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} achievements={achievements} totalPoints={totalPoints} />
      <SoundSettings isOpen={showSoundSettings} onClose={() => setShowSoundSettings(false)} />
      <AchievementPopup achievement={justUnlocked} onDismiss={clearJustUnlocked} />
    </div>
  );
};

export default CubeGame;
