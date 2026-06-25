import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixarButton } from '@/components/game/pixar';
import { ScorePopup } from '@/components/game/ScorePopup';
import AdaptiveStage from '@/components/game/AdaptiveStage';
import { usePhase } from '@/hooks/usePhase';
import { Cell, DraggablePiece, Position } from '@/game/types';
import {
  createEmptyGrid,
  createRandomPiece,
  canPlacePieceAt,
  canAnyPieceFit,
  resolveGrid,
  findHint,
  getComboText,
  getReactionPreview,
} from '@/game/engine';
import { playSound, startMusic } from '@/game/sounds';
import { trackGameEvent } from '@/game/analytics';
import { CubeHud } from '@/components/game/cube/CubeHud';
import { CubeScene } from '@/components/game/cube/CubeScene';
import { CubeOrbitControl } from '@/components/game/cube/CubeOrbitControl';
import { CubeTrayDock } from '@/components/game/cube/CubeTrayDock';
import { CubeGameOver } from '@/components/game/cube/CubeGameOver';
import {
  CUBE_FACE_SIZE,
  CUBE_FACES,
  CUBE_FACE_ROT,
  CUBE_FACE_BY_YAW,
  CUBE_FACE_AFFINITIES,
  CUBE_ELEMENT_LABELS,
  CUBE_REACTION_MOMENTS,
  CUBE_FEVER_MS,
  CUBE_FACE_AFFINITY_BONUS,
  CUBE_FACE_SYNC_BONUS,
  CUBE_FULL_SYNC_BONUS,
  CUBE_ORBIT_COMBO_BONUS,
  getCubeBoardSize,
  type CubeReactionType,
} from '@/game/cubeConfig';

const placeInto = (grid: Cell[][], piece: DraggablePiece, pos: Position): Cell[][] => {
  const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  piece.shape.forEach((shapePoint, index) => {
    nextGrid[pos.y + shapePoint.y][pos.x + shapePoint.x] = {
      element: piece.elements[index],
      id: `${pos.x + shapePoint.x}-${pos.y + shapePoint.y}-${Date.now()}-${index}`,
    };
  });
  return nextGrid;
};

const isBoardEmpty = (board: Cell[][]) => board.every((row) => row.every((cell) => cell.element === null));

const CubeGame = () => {
  const [boards, setBoards] = useState<Cell[][][]>(() => CUBE_FACES.map(() => createEmptyGrid(CUBE_FACE_SIZE, CUBE_FACE_SIZE)));
  const [activeFace, setActiveFace] = useState(0);
  const [pieces, setPieces] = useState<DraggablePiece[]>(() => [createRandomPiece(0), createRandomPiece(0), createRandomPiece(0)]);
  const [selected, setSelected] = useState<DraggablePiece | null>(null);
  const [hover, setHover] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem('cube-best') || 0));
  const [isGameOver, setIsGameOver] = useState(false);
  const [particle, setParticle] = useState<{ type: CubeReactionType; positions: Position[]; timestamp: number } | null>(null);
  const [popup, setPopup] = useState<{ score: number; show: boolean; text: string; reactionType?: CubeReactionType }>({ score: 0, show: false, text: '' });
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

  const [feverMeter, setFeverMeter] = useState(0);
  const [feverActive, setFeverActive] = useState(false);
  const [feverEndsAt, setFeverEndsAt] = useState(0);
  const feverActiveRef = useRef(false);
  const feverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [snapping, setSnapping] = useState(true);
  const rotRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const movedRef = useRef(false);

  const [size, setSize] = useState(() => getCubeBoardSize());

  useEffect(() => {
    trackGameEvent('game_started', { mode: 'cube' });
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem('cube-best', String(score));
    }
  }, [score, best]);

  useEffect(() => {
    if (!fullSyncFlash) return;
    const timer = window.setTimeout(() => setFullSyncFlash(0), 1700);
    return () => window.clearTimeout(timer);
  }, [fullSyncFlash]);

  useEffect(() => {
    const calc = () => setSize(getCubeBoardSize());
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    startMusic();
  }, []);

  useEffect(() => () => {
    if (feverTimer.current) clearTimeout(feverTimer.current);
  }, []);

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
    setFeverEndsAt(Date.now() + CUBE_FEVER_MS);
    setFeverMeter(100);
    setFeverActivations((count) => count + 1);
    trackGameEvent('fever_activated', { mode: 'cube', score });
    playSound('combo');
    if (feverTimer.current) clearTimeout(feverTimer.current);
    feverTimer.current = setTimeout(endFever, CUBE_FEVER_MS);
  }, [endFever, score]);

  const half = size / 2;
  const pad = 8;
  const gap = 4;
  const cellPx = Math.floor((size - pad * 2 - gap * (CUBE_FACE_SIZE - 1)) / CUBE_FACE_SIZE);
  const blockPx = Math.floor(cellPx * 0.9);
  const syncedCount = syncedFaces.size;

  const refill = useCallback((remaining: DraggablePiece[], forScore: number) => (
    remaining.length > 0 ? remaining : [createRandomPiece(forScore), createRandomPiece(forScore), createRandomPiece(forScore)]
  ), []);

  const currentFaceHasFit = useMemo(() => (
    pieces.length === 0 || canAnyPieceFit(boards[activeFace], pieces)
  ), [boards, activeFace, pieces]);

  const suggestedFace = useMemo(() => (
    currentFaceHasFit
      ? null
      : CUBE_FACES.find((face) => face.id !== activeFace && canAnyPieceFit(boards[face.id], pieces)) ?? null
  ), [currentFaceHasFit, boards, activeFace, pieces]);

  const placePieceAt = useCallback((piece: DraggablePiece, pos: Position) => {
    if (isGameOver) return;
    const board = boards[activeFace];
    if (!canPlacePieceAt(board, piece, pos)) return;
    playSound('drop');

    const resolved = resolveGrid(placeInto(board, piece, pos));
    const affinity = CUBE_FACE_AFFINITIES[activeFace];
    const affinityHits = piece.elements.filter((element) => element === affinity.element).length;
    const affinityBonus = affinityHits * CUBE_FACE_AFFINITY_BONUS;
    const hasReactionOrClear = resolved.linesCleared > 0 || resolved.allReactionEvents.length > 0 || resolved.maxCombo > 0;
    const orbitBonus = pendingOrbit && hasReactionOrClear ? CUBE_ORBIT_COMBO_BONUS : 0;
    const faceSynced = !isBoardEmpty(board) && isBoardEmpty(resolved.grid);
    const nextSynced = new Set(syncedFaces);
    if (faceSynced) nextSynced.add(activeFace);
    const fullSyncAchieved = faceSynced && nextSynced.size === CUBE_FACES.length && !syncedFaces.has(activeFace);
    const syncBonus = faceSynced ? CUBE_FACE_SYNC_BONUS : 0;
    const fullSyncBonus = fullSyncAchieved ? CUBE_FULL_SYNC_BONUS : 0;
    const multiplier = feverActiveRef.current ? 2 : 1;
    const gained = Math.floor(resolved.totalScore * multiplier) + piece.shape.length * 10 + affinityBonus + orbitBonus + syncBonus + fullSyncBonus;
    const nextBoards = boards.map((candidateBoard, index) => (index === activeFace ? resolved.grid : candidateBoard));
    const nextScore = score + gained;

    setBoards(nextBoards);
    setScore(nextScore);
    setPendingOrbit(false);
    if (resolved.maxCombo > biggestCombo) setBiggestCombo(resolved.maxCombo);

    if (resolved.allAffectedPositions.length > 0) {
      const byType = resolved.allAffectedPositions.reduce<Record<CubeReactionType, number>>((acc, group) => {
        acc[group.type] += group.positions.length;
        return acc;
      }, { burn: 0, extinguish: 0, dissolve: 0 });
      const [type, count] = (Object.entries(byType) as [CubeReactionType, number][]).sort((a, b) => b[1] - a[1])[0];
      if (count > 0) {
        setBestReaction((prev) => (!prev || count > prev.count ? { label: CUBE_REACTION_MOMENTS[type], count } : prev));
      }
    }

    if (faceSynced) {
      setSyncedFaces(nextSynced);
      const label = fullSyncAchieved
        ? `FULL CUBE SYNC +${CUBE_FULL_SYNC_BONUS}`
        : `${CUBE_FACES[activeFace].name.toUpperCase()} FACE SYNC +${CUBE_FACE_SYNC_BONUS}`;
      setLastCubeMoment({ label, timestamp: Date.now() });
      if (fullSyncAchieved) setFullSyncFlash(Date.now());
      playSound('highScore');
      trackGameEvent(fullSyncAchieved ? 'cube_full_sync' : 'cube_face_synced', {
        face: CUBE_FACES[activeFace].name,
        synced_faces: nextSynced.size,
        score: nextScore,
      });
    } else if (orbitBonus > 0) {
      setLastCubeMoment({ label: `ORBIT COMBO +${CUBE_ORBIT_COMBO_BONUS}`, timestamp: Date.now() });
    } else if (affinityBonus > 0) {
      setLastCubeMoment({ label: `${affinity.boost} +${affinityBonus}`, timestamp: Date.now() });
    }

    if (!feverActiveRef.current) {
      const gain = resolved.linesCleared * 10 + resolved.allReactionEvents.length * 6 + affinityHits * 4;
      if (gain > 0) {
        setFeverMeter((meter) => {
          const nextMeter = meter + gain;
          if (nextMeter >= 100) {
            activateFever();
            return 100;
          }
          return nextMeter;
        });
      }
    }

    if (resolved.allAffectedPositions.length > 0) {
      setParticle({
        type: (resolved.primaryReactionType ?? resolved.allAffectedPositions[0].type) as CubeReactionType,
        positions: resolved.allAffectedPositions.flatMap((affected) => affected.positions),
        timestamp: Date.now(),
      });
    }

    if (resolved.maxCombo > 0 || resolved.linesCleared > 0 || affinityBonus > 0 || orbitBonus > 0 || syncBonus > 0) {
      const baseText = resolved.perfectClear
        ? 'PERFECT CLEAR!'
        : resolved.maxCombo > 0 || resolved.linesCleared > 0
          ? getComboText(resolved.maxCombo, resolved.linesCleared)
          : 'FACE BOOST!';
      const text = orbitBonus > 0
        ? `${baseText} · ORBIT COMBO!`
        : affinityBonus > 0
          ? `${baseText} · ${affinity.boost}`
          : baseText;
      setPopup({ score: gained, show: true, text, reactionType: resolved.primaryReactionType as CubeReactionType });
      setFlashKey((key) => key + 1);
      if (resolved.maxCombo > 1 || resolved.linesCleared >= 2 || affinityBonus > 0 || orbitBonus > 0 || syncBonus > 0) playSound('combo');
      window.setTimeout(() => setPopup((current) => ({ ...current, show: false })), 1200);
    }

    const nextPieces = refill(pieces.filter((candidate) => candidate.id !== piece.id), nextScore);
    setPieces(nextPieces);
    setSelected(null);
    setHover(null);

    trackGameEvent('piece_placed', {
      mode: 'cube',
      face: CUBE_FACES[activeFace].name,
      score: nextScore,
      gained,
      affinity_bonus: affinityBonus,
      orbit_bonus: orbitBonus,
      sync_bonus: syncBonus + fullSyncBonus,
      combo: resolved.maxCombo,
      reactions: resolved.allReactionEvents.length,
    });

    if (!nextBoards.some((candidateBoard) => canAnyPieceFit(candidateBoard, nextPieces))) {
      setIsGameOver(true);
      trackGameEvent('game_over', {
        mode: 'cube',
        score: nextScore,
        synced_faces: nextSynced.size,
        biggest_combo: Math.max(biggestCombo, resolved.maxCombo),
        fever_activations: feverActivations,
      });
      playSound('gameOver');
    }
  }, [isGameOver, boards, activeFace, score, pieces, refill, activateFever, syncedFaces, pendingOrbit, biggestCombo, feverActivations]);

  const cellFromPoint = useCallback((clientX: number, clientY: number, pointerType: string): Position | null => {
    const sampleY = pointerType === 'mouse' ? clientY : clientY - cellPx;
    const element = document.elementFromPoint(clientX, sampleY) as HTMLElement | null;
    const cellElement = element?.closest('[data-cube-cell]') as HTMLElement | null;
    if (!cellElement) return null;
    return { x: Number(cellElement.dataset.x), y: Number(cellElement.dataset.y) };
  }, [cellPx]);

  const handleDragHover = useCallback((piece: DraggablePiece, clientX: number, clientY: number, pointerType: string) => {
    setSelected(piece);
    setHover(cellFromPoint(clientX, clientY, pointerType));
  }, [cellFromPoint]);

  const handleDragDrop = useCallback((piece: DraggablePiece, clientX: number, clientY: number, pointerType: string) => {
    const cell = cellFromPoint(clientX, clientY, pointerType);
    if (cell) placePieceAt(piece, cell);
    setHover(null);
  }, [cellFromPoint, placePieceAt]);

  const jumpToFace = useCallback((faceId: number) => {
    const y = CUBE_FACE_ROT[faceId] ?? 0;
    if (faceId !== activeFace) {
      setPendingOrbit(true);
      trackGameEvent('cube_face_rotated', { from_face: CUBE_FACES[activeFace].name, to_face: CUBE_FACES[faceId].name, method: 'compass' });
    }
    rotRef.current = { x: 0, y };
    setRot(rotRef.current);
    setActiveFace(faceId);
    setSnapping(true);
  }, [activeFace]);

  const handleHint = useCallback(() => {
    const hint = findHint(boards[activeFace], pieces);
    trackGameEvent('hint_used', { mode: 'cube', face: CUBE_FACES[activeFace].name });
    if (hint) {
      playSound('select');
      setSelected(hint.piece);
      setHover(hint.pos);
      return;
    }

    const alternate = CUBE_FACES.find((face) => face.id !== activeFace && findHint(boards[face.id], pieces));
    if (!alternate) return;
    jumpToFace(alternate.id);
    setLastCubeMoment({ label: `${alternate.name} face has space`, timestamp: Date.now() });
    playSound('select');
  }, [boards, activeFace, pieces, jumpToFace]);

  const faceFromRot = (_rx: number, ry: number) => {
    const snappedYaw = (((Math.round(ry / 90) * 90) % 360) + 360) % 360;
    return { face: CUBE_FACE_BY_YAW[snappedYaw] ?? 0, x: 0, y: snappedYaw };
  };

  const onScenePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, rx: rotRef.current.x, ry: rotRef.current.y };
    movedRef.current = false;
    setSnapping(false);
  };

  const onScenePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!movedRef.current && Math.abs(dx) > 6) movedRef.current = true;
    if (!movedRef.current) return;
    const y = drag.ry + dx * 0.4;
    rotRef.current = { x: 0, y };
    setRot(rotRef.current);
    setHover(null);
  };

  const onScenePointerUp = () => {
    if (dragRef.current && movedRef.current) {
      const snapped = faceFromRot(rotRef.current.x, rotRef.current.y);
      if (snapped.face !== activeFace) {
        setPendingOrbit(true);
        trackGameEvent('cube_face_rotated', { from_face: CUBE_FACES[activeFace].name, to_face: CUBE_FACES[snapped.face].name, method: 'drag' });
      }
      rotRef.current = { x: snapped.x, y: snapped.y };
      setRot(rotRef.current);
      setActiveFace(snapped.face);
      setSnapping(true);
    }
    dragRef.current = null;
  };

  const reset = () => {
    trackGameEvent('game_restarted', { mode: 'cube', previous_score: score });
    setBoards(CUBE_FACES.map(() => createEmptyGrid(CUBE_FACE_SIZE, CUBE_FACE_SIZE)));
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

  const handleCubeCellClick = useCallback((pos: Position) => {
    if (!movedRef.current && selected) placePieceAt(selected, pos);
  }, [selected, placePieceAt]);

  const ghost = useMemo(() => {
    if (!selected || !hover || !canPlacePieceAt(boards[activeFace], selected, hover)) return new Set<string>();
    return new Set(selected.shape.map((point) => `${hover.x + point.x},${hover.y + point.y}`));
  }, [selected, hover, boards, activeFace]);

  const reactionMap = useMemo(() => {
    const map = new Map<string, CubeReactionType>();
    if (!selected || !hover || !canPlacePieceAt(boards[activeFace], selected, hover)) return map;
    getReactionPreview(boards[activeFace], selected, hover).forEach((preview) => {
      preview.affectedPositions.forEach((affectedPosition) => map.set(`${affectedPosition.x},${affectedPosition.y}`, preview.type));
    });
    return map;
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

      <CubeHud
        score={score}
        best={best}
        activeFace={activeFace}
        phase={phase}
        next={next}
        progress={progress}
        feverMeter={feverMeter}
        feverActive={feverActive}
        feverEndsAt={feverEndsAt}
        onHint={handleHint}
        onReset={reset}
      />

      <CubeScene
        boards={boards}
        activeFace={activeFace}
        syncedFaces={syncedFaces}
        size={size}
        half={half}
        pad={pad}
        gap={gap}
        cellPx={cellPx}
        blockPx={blockPx}
        rot={rot}
        snapping={snapping}
        lastCubeMoment={lastCubeMoment}
        fullSyncFlash={fullSyncFlash}
        flashKey={flashKey}
        particle={particle}
        ghost={ghost}
        reactionMap={reactionMap}
        selected={selected}
        onPointerDown={onScenePointerDown}
        onPointerMove={onScenePointerMove}
        onPointerUp={onScenePointerUp}
        onHover={setHover}
        onCellClick={handleCubeCellClick}
      />

      <CubeOrbitControl
        activeFace={activeFace}
        syncedFaces={syncedFaces}
        syncedCount={syncedCount}
        currentFaceHasFit={currentFaceHasFit}
        suggestedFace={suggestedFace}
        onJumpToFace={jumpToFace}
      />

      <CubeTrayDock
        pieces={pieces}
        selectedPiece={selected}
        onSelectPiece={setSelected}
        onDragHover={handleDragHover}
        onDragDrop={handleDragDrop}
        disabled={isGameOver}
      />

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
                {CUBE_FACES.map((face) => (
                  <div key={face.id} className="rounded-2xl border border-white/12 bg-white/10 px-3 py-2">
                    {face.name}: {CUBE_ELEMENT_LABELS[CUBE_FACE_AFFINITIES[face.id].element]}
                  </div>
                ))}
              </div>
              <PixarButton onClick={dismissOnboarding} variant="primary" size="md" shine className="mt-6">Start Experiment</PixarButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameOver && (
          <CubeGameOver
            score={score}
            best={best}
            syncedCount={syncedCount}
            biggestCombo={biggestCombo}
            feverActivations={feverActivations}
            bestReaction={bestReaction}
            onReset={reset}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CubeGame;
