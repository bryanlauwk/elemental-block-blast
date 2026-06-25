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
import { Cell, DraggablePiece, Position, ElementType } from '@/game/types';
import {
  createEmptyGrid, createRandomPiece, canPlacePieceAt, canAnyPieceFit, resolveGrid, findHint, getComboText, getReactionPreview,
} from '@/game/engine';
import { playSound, startMusic } from '@/game/sounds';
import { trackGameEvent } from '@/game/analytics';

const FACE = 6;
type ReactionType = 'burn' | 'extinguish' | 'dissolve';
const REACTION_RING: Record<ReactionType, string> = {
  burn: 'ring-2 ring-orange-400/80',
  extinguish: 'ring-2 ring-blue-400/80',
  dissolve: 'ring-2 ring-green-400/80',
};
const REACTION_MOMENTS: Record<ReactionType, string> = {
  burn: 'WILDFIRE',
  extinguish: 'STEAM BURST',
  dissolve: 'ACID MELT',
};

const FACES = [
  { id: 0, name: 'Front', place: 'translateZ(H)' },
  { id: 1, name: 'Right', place: 'rotateY(90deg) translateZ(H)' },
  { id: 2, name: 'Back', place: 'rotateY(180deg) translateZ(H)' },
  { id: 3, name: 'Left', place: 'rotateY(-90deg) translateZ(H)' },
] as const;

const FACE_ROT: Record<number, number> = { 0: 0, 1: 270, 2: 180, 3: 90 };
const FACE_AFFINITIES: Record<number, { label: string; element: ElementType; boost: string; tone: string }> = {
  0: { label: 'Fire Lab', element: 'fire', boost: 'Heat Boost', tone: 'from-orange-400/30 to-red-500/20' },
  1: { label: 'Water Lab', element: 'water', boost: 'Tide Boost', tone: 'from-cyan-300/30 to-blue-500/20' },
  2: { label: 'Stone Lab', element: 'stone', boost: 'Core Boost', tone: 'from-slate-200/25 to-slate-600/20' },
  3: { label: 'Wind Lab', element: 'helium', boost: 'Lift Boost', tone: 'from-yellow-200/25 to-sky-300/20' },
};
const ELEMENT_LABELS: Record<ElementType, string> = {
  fire: 'Fire',
  water: 'Water',
  wood: 'Wood',
  acid: 'Acid',
  life: 'Life',
  helium: 'Helium',
  stone: 'Stone',
  ash: 'Ash',
  gold: 'Gold',
  goldCracked: 'Cracked Gold',
};

const FEVER_MS = 9000;
const FACE_AFFINITY_BONUS = 20;
const FACE_SYNC_BONUS = 500;
const FULL_CUBE_SYNC_BONUS = 2500;
const ORBIT_COMBO_BONUS = 300;
// Gentle side-view offset: keeps depth visible without skewing targets too much.
const ISO = { x: -8, y: 12 };

const placeInto = (grid: Cell[][], piece: DraggablePiece, pos: Position): Cell[][] => {
  const ng = grid.map((r) => r.map((c) => ({ ...c })));
  piece.shape.forEach((p, i) => {
    ng[pos.y + p.y][pos.x + p.x] = { element: piece.elements[i], id: `${pos.x + p.x}-${pos.y + p.y}-${Date.now()}-${i}` };
  });
  return ng;
};

const isBoardEmpty = (board: Cell[][]) => board.every((row) => row.every((cell) => cell.element === null));

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
  const [syncedFaces, setSyncedFaces] = useState<Set<number>>(() => new Set());
  const [lastCubeMoment, setLastCubeMoment] = useState<{ label: string; timestamp: number } | null>(null);
  const [showCubeOnboarding, setShowCubeOnboarding] = useState(() => localStorage.getItem('cube-side-lab-seen') !== '1');
  const [pendingOrbit, setPendingOrbit] = useState(false);
  const [biggestCombo, setBiggestCombo] = useState(0);
  const [bestReaction, setBestReaction] = useState<{ label: string; count: number } | null>(null);
  const [feverActivations, setFeverActivations] = useState(0);
  const [fullSyncFlash, setFullSyncFlash] = useState(0);
  const { phase, next, progress } = usePhase(score);
  const activeAffinity = FACE_AFFINITIES[activeFace];

  useEffect(() => {
    trackGameEvent('game_started', { mode: 'cube' });
  }, []);

  useEffect(() => {
    if (score > best) { setBest(score); localStorage.setItem('cube-best', String(score)); }
  }, [score, best]);

  useEffect(() => {
    if (!fullSyncFlash) return;
    const timer = window.setTimeout(() => setFullSyncFlash(0), 1700);
    return () => window.clearTimeout(timer);
  }, [fullSyncFlash]);

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
    setFeverActivations((count) => count + 1);
    trackGameEvent('fever_activated', { mode: 'cube', score });
    playSound('combo');
    if (feverTimer.current) clearTimeout(feverTimer.current);
    feverTimer.current = setTimeout(endFever, FEVER_MS);
  }, [endFever, score]);
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

  const syncedCount = syncedFaces.size;
  const refill = useCallback((remaining: DraggablePiece[], forScore: number) =>
    remaining.length > 0 ? remaining : [createRandomPiece(forScore), createRandomPiece(forScore), createRandomPiece(forScore)], []);

  const currentFaceHasFit = useMemo(() => pieces.length === 0 || canAnyPieceFit(boards[activeFace], pieces), [boards, activeFace, pieces]);
  const suggestedFace = useMemo(
    () => currentFaceHasFit ? null : FACES.find((face) => face.id !== activeFace && canAnyPieceFit(boards[face.id], pieces)) ?? null,
    [currentFaceHasFit, boards, activeFace, pieces],
  );

  const placePieceAt = useCallback((piece: DraggablePiece, pos: Position) => {
    if (isGameOver) return;
    const board = boards[activeFace];
    if (!canPlacePieceAt(board, piece, pos)) return;
    playSound('drop');

    const r = resolveGrid(placeInto(board, piece, pos));
    const affinity = FACE_AFFINITIES[activeFace];
    const affinityHits = piece.elements.filter((el) => el === affinity.element).length;
    const affinityBonus = affinityHits * FACE_AFFINITY_BONUS;
    const hasReactionOrClear = r.linesCleared > 0 || r.allReactionEvents.length > 0 || r.maxCombo > 0;
    const orbitBonus = pendingOrbit && hasReactionOrClear ? ORBIT_COMBO_BONUS : 0;
    const faceSynced = !isBoardEmpty(board) && isBoardEmpty(r.grid);
    const nextSynced = new Set(syncedFaces);
    if (faceSynced) nextSynced.add(activeFace);
    const fullSyncAchieved = faceSynced && nextSynced.size === FACES.length && !syncedFaces.has(activeFace);
    const syncBonus = faceSynced ? FACE_SYNC_BONUS : 0;
    const fullSyncBonus = fullSyncAchieved ? FULL_CUBE_SYNC_BONUS : 0;
    const mult = feverActiveRef.current ? 2 : 1;
    const gained = Math.floor(r.totalScore * mult) + piece.shape.length * 10 + affinityBonus + orbitBonus + syncBonus + fullSyncBonus;
    const nextBoards = boards.map((b, i) => (i === activeFace ? r.grid : b));
    const nextScore = score + gained;

    setBoards(nextBoards);
    setScore(nextScore);
    setPendingOrbit(false);
    if (r.maxCombo > biggestCombo) setBiggestCombo(r.maxCombo);

    if (r.allAffectedPositions.length > 0) {
      const byType = r.allAffectedPositions.reduce<Record<ReactionType, number>>((acc, group) => {
        acc[group.type] += group.positions.length;
        return acc;
      }, { burn: 0, extinguish: 0, dissolve: 0 });
      const [type, count] = (Object.entries(byType) as [ReactionType, number][]).sort((a, b) => b[1] - a[1])[0];
      if (count > 0) {
        setBestReaction((prev) => (!prev || count > prev.count ? { label: REACTION_MOMENTS[type], count } : prev));
      }
    }

    if (faceSynced) {
      setSyncedFaces(nextSynced);
      const label = fullSyncAchieved
        ? `FULL CUBE SYNC +${FULL_CUBE_SYNC_BONUS}`
        : `${FACES[activeFace].name.toUpperCase()} FACE SYNC +${FACE_SYNC_BONUS}`;
      setLastCubeMoment({ label, timestamp: Date.now() });
      if (fullSyncAchieved) setFullSyncFlash(Date.now());
      playSound('highScore');
      trackGameEvent(fullSyncAchieved ? 'cube_full_sync' : 'cube_face_synced', {
        face: FACES[activeFace].name,
        synced_faces: nextSynced.size,
        score: nextScore,
      });
    } else if (orbitBonus > 0) {
      setLastCubeMoment({ label: `ORBIT COMBO +${ORBIT_COMBO_BONUS}`, timestamp: Date.now() });
    } else if (affinityBonus > 0) {
      setLastCubeMoment({ label: `${affinity.boost} +${affinityBonus}`, timestamp: Date.now() });
    }

    if (!feverActiveRef.current) {
      const gain = r.linesCleared * 10 + r.allReactionEvents.length * 6 + affinityHits * 4;
      if (gain > 0) setFeverMeter((m) => { const nm = m + gain; if (nm >= 100) { activateFever(); return 100; } return nm; });
    }
    if (r.allAffectedPositions.length > 0) {
      setParticle({ type: (r.primaryReactionType ?? r.allAffectedPositions[0].type) as ReactionType, positions: r.allAffectedPositions.flatMap((a) => a.positions), timestamp: Date.now() });
    }
    if (r.maxCombo > 0 || r.linesCleared > 0 || affinityBonus > 0 || orbitBonus > 0 || syncBonus > 0) {
      const baseText = r.perfectClear ? 'PERFECT CLEAR!' : r.maxCombo > 0 || r.linesCleared > 0 ? getComboText(r.maxCombo, r.linesCleared) : 'FACE BOOST!';
      const text = orbitBonus > 0
        ? `${baseText} · ORBIT COMBO!`
        : affinityBonus > 0
          ? `${baseText} · ${affinity.boost}`
          : baseText;
      setPopup({ score: gained, show: true, text, reactionType: r.primaryReactionType as ReactionType });
      setFlashKey((k) => k + 1);
      if (r.maxCombo > 1 || r.linesCleared >= 2 || affinityBonus > 0 || orbitBonus > 0 || syncBonus > 0) playSound('combo');
      window.setTimeout(() => setPopup((p) => ({ ...p, show: false })), 1200);
    }

    const nextPieces = refill(pieces.filter((p) => p.id !== piece.id), nextScore);
    setPieces(nextPieces);
    setSelected(null);
    setHover(null);
    trackGameEvent('piece_placed', {
      mode: 'cube',
      face: FACES[activeFace].name,
      score: nextScore,
      gained,
      affinity_bonus: affinityBonus,
      orbit_bonus: orbitBonus,
      sync_bonus: syncBonus + fullSyncBonus,
      combo: r.maxCombo,
      reactions: r.allReactionEvents.length,
    });
    if (!nextBoards.some((b) => canAnyPieceFit(b, nextPieces))) {
      setIsGameOver(true);
      trackGameEvent('game_over', {
        mode: 'cube',
        score: nextScore,
        synced_faces: nextSynced.size,
        biggest_combo: Math.max(biggestCombo, r.maxCombo),
        fever_activations: feverActivations,
      });
      playSound('gameOver');
    }
  }, [isGameOver, boards, activeFace, score, pieces, refill, activateFever, syncedFaces, pendingOrbit, biggestCombo, feverActivations]);

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

  const jumpToFace = useCallback((faceId: number) => {
    const y = FACE_ROT[faceId] ?? 0;
    if (faceId !== activeFace) {
      setPendingOrbit(true);
      trackGameEvent('cube_face_rotated', { from_face: FACES[activeFace].name, to_face: FACES[faceId].name, method: 'compass' });
    }
    rotRef.current = { x: 0, y };
    setRot(rotRef.current);
    setActiveFace(faceId);
    setSnapping(true);
  }, [activeFace]);

  const handleHint = useCallback(() => {
    const h = findHint(boards[activeFace], pieces);
    trackGameEvent('hint_used', { mode: 'cube', face: FACES[activeFace].name });
    if (h) {
      playSound('select');
      setSelected(h.piece);
      setHover(h.pos);
      return;
    }
    const alternate = FACES.find((face) => face.id !== activeFace && findHint(boards[face.id], pieces));
    if (!alternate) return;
    jumpToFace(alternate.id);
    setLastCubeMoment({ label: `${alternate.name} face has space`, timestamp: Date.now() });
    playSound('select');
  }, [boards, activeFace, pieces, jumpToFace]);

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
      if (s.face !== activeFace) {
        setPendingOrbit(true);
        trackGameEvent('cube_face_rotated', { from_face: FACES[activeFace].name, to_face: FACES[s.face].name, method: 'drag' });
      }
      rotRef.current = { x: s.x, y: s.y };
      setRot(rotRef.current);
      setActiveFace(s.face);
      setSnapping(true);
    }
    dragRef.current = null;
  };

  const reset = () => {
    trackGameEvent('game_restarted', { mode: 'cube', previous_score: score });
    setBoards(FACES.map(() => createEmptyGrid(FACE, FACE)));
    setPieces([createRandomPiece(0), createRandomPiece(0), createRandomPiece(0)]);
    setSelected(null);
    setHover(null);
    setScore(0);
    setActiveFace(0);
    setSyncedFaces(new Set());
    setLastCubeMoment(null);
    setPendingOrbit(false);
    setBiggestCombo(0);
    setBestReaction(null);
    setFeverActivations(0);
    setFullSyncFlash(0);
    setIsGameOver(false);
    endFever();
    rotRef.current = { x: 0, y: 0 };
    setRot({ x: 0, y: 0 });
    setSnapping(true);
  };

  const dismissOnboarding = () => {
    localStorage.setItem('cube-side-lab-seen', '1');
    setShowCubeOnboarding(false);
    trackGameEvent('tutorial_completed', { mode: 'cube' });
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
        <div className="flex flex-col items-center leading-none">
          <p className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/85 font-bold shadow-inner backdrop-blur-md">Cube Lab</p>
          <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/50">4-side sync</span>
        </div>
        <div className="flex gap-2">
          <PixarChip title="Hint" onClick={handleHint}><Lightbulb className="w-5 h-5 text-pixar-yellow" /></PixarChip>
          <PixarChip title="Restart" onClick={reset}><RotateCcw className="w-5 h-5 text-white" /></PixarChip>
        </div>
      </div>

      {/* Glass HUD: scoreboard + phase pill + fever */}
      <div className="z-20 mt-3 flex w-[calc(100%-2rem)] max-w-[420px] flex-col items-center rounded-[28px] border border-white/15 bg-white/10 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <BlockBlastScoreboard score={score} topScore={best} compact />
        <div className="mb-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
          <span>{activeAffinity.label}</span>
          <span className="text-white/35">·</span>
          <span>{ELEMENT_LABELS[activeAffinity.element]} +{FACE_AFFINITY_BONUS}/block</span>
        </div>
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
            width: size, height: size, transformStyle: 'preserve-3d',
            transform: `rotateX(${rot.x + ISO.x}deg) rotateY(${rot.y + ISO.y}deg)`,
            transition: snapping ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {FACES.map((face) => {
            const isActive = face.id === activeFace;
            const board = boards[face.id];
            const affinity = FACE_AFFINITIES[face.id];
            const isSynced = syncedFaces.has(face.id);
            return (
              <div
                key={face.id}
                className={`absolute left-0 top-0 rounded-[30px] border bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl pixar-grid-frame ${isActive ? 'border-white/40' : 'border-white/15'}`}
                style={{
                  width: size, height: size, padding: pad,
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
                  <span>{ELEMENT_LABELS[affinity.element]}</span>
                  {isSynced && <span className="text-pixar-yellow">SYNC</span>}
                </div>
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
                          className={`flex items-center justify-center rounded-xl border shadow-inner backdrop-blur-sm transition-colors ${rType ? REACTION_RING[rType] : ''} ${isActive ? 'border-white/18' : 'border-white/8'}`}
                          style={{
                            background: cell.element ? 'transparent' : isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
                            boxShadow: cell.element ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.18)',
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
      <div className="z-20 mb-2 flex flex-col items-center gap-2 rounded-[26px] border border-white/15 bg-white/10 px-4 py-3 text-white/75 shadow-xl shadow-black/20 backdrop-blur-xl">
        {!currentFaceHasFit && suggestedFace && (
          <button
            onClick={() => jumpToFace(suggestedFace.id)}
            className="mb-1 rounded-full border border-pixar-yellow/50 bg-pixar-yellow/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-pixar-yellow animate-pulse"
          >
            Rotate to {suggestedFace.name} — space found
          </button>
        )}
        <div className="flex items-center gap-2">
          <Rotate3d className="w-4 h-4 text-pixar-yellow" />
          <span className="text-xs uppercase tracking-widest font-bold">Drag left / right</span>
          <span className="text-white/30">·</span>
          <span className="text-xs uppercase tracking-widest font-bold text-white/90">{FACES[activeFace].name}</span>
        </div>
        <div className="flex items-center gap-2">
          {FACES.map((face) => (
            <button
              key={face.id}
              onClick={() => jumpToFace(face.id)}
              className={`h-2.5 rounded-full transition-all ${activeFace === face.id ? 'w-8 bg-pixar-yellow' : syncedFaces.has(face.id) ? 'w-4 bg-white/70' : suggestedFace?.id === face.id ? 'w-6 bg-pixar-yellow/80 animate-pulse' : 'w-4 bg-white/25'}`}
              aria-label={`Jump to ${face.name} face`}
            />
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Synced faces {syncedCount}/{FACES.length}</p>
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

      {/* First-run Cube Lab tutorial */}
      <AnimatePresence>
        {showCubeOnboarding && !isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.98 }}
              className="max-w-sm rounded-[32px] border border-white/20 bg-white/12 p-6 text-center shadow-2xl shadow-black/35 backdrop-blur-2xl"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-pixar-yellow">Cube Lab</p>
              <h2 className="mt-2 text-3xl font-display text-white">Sync all 4 faces</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Each side has an elemental affinity. Match the face element for bonus Fever, rotate when space runs out, and clear faces to complete a Full Cube Sync.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
                {FACES.map((face) => (
                  <div key={face.id} className="rounded-2xl border border-white/12 bg-white/10 px-3 py-2">
                    {face.name}: {ELEMENT_LABELS[FACE_AFFINITIES[face.id].element]}
                  </div>
                ))}
              </div>
              <PixarButton onClick={dismissOnboarding} variant="primary" size="md" shine className="mt-6">Start Experiment</PixarButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over */}
      <AnimatePresence>
        {isGameOver && (
          <PixarOverlay>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[32px] border border-white/20 bg-white/10 px-8 py-7 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pixar-yellow">Lab Results</p>
              <p className="mt-2 text-3xl font-display text-white mb-1">Cube Experiment Complete!</p>
              <p className="text-5xl font-display bg-gradient-to-r from-pixar-yellow to-pixar-red bg-clip-text text-transparent mb-3">{score.toLocaleString()}</p>
              <div className="mb-5 grid grid-cols-2 gap-2 text-xs font-bold text-white/75">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Best<br /><span className="text-white">{best.toLocaleString()}</span></div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Faces Synced<br /><span className="text-white">{syncedCount}/{FACES.length}</span></div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Biggest Combo<br /><span className="text-white">{biggestCombo || 0} Chain</span></div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">Fever Runs<br /><span className="text-white">{feverActivations}</span></div>
              </div>
              {bestReaction && (
                <p className="mb-4 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/80">
                  Best Reaction: {bestReaction.label} x{bestReaction.count}
                </p>
              )}
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                Next goal: sync {Math.min(syncedCount + 1, FACES.length)}/{FACES.length} faces
              </p>
              <PixarButton onClick={reset} variant="primary" size="md" shine>Run It Again</PixarButton>
            </motion.div>
          </PixarOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CubeGame;
