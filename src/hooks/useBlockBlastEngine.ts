import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Cell,
  BlockBlastState,
  Position,
  DraggablePiece,
  GRID_WIDTH,
  GRID_HEIGHT,
} from '@/game/types';
import { playSound } from '@/game/sounds';
import { SeededRandom, getDateSeed } from '@/game/seededRandom';
import {
  createEmptyGrid,
  createRandomPiece,
  canPlacePieceAt,
  canAnyPieceFit,
  resolveGrid,
  getComboText,
  getReactionPreview as computeReactionPreview,
  findHint as computeHint,
  type ReactionPreview,
  type ReactionEvent,
  type ReactionPreviewSummary,
  type ParticleTrigger,
} from '@/game/engine';

// Re-export the reaction types so existing component imports keep working.
export type { ReactionPreview, ReactionEvent, ReactionPreviewSummary, ParticleTrigger };

export interface BlockBlastEngine {
  gameState: BlockBlastState;
  shakeIntensity: number;
  comboDisplay: { count: number; show: boolean; text: string };
  scorePopup: { score: number; show: boolean; reactionType?: 'burn' | 'extinguish' | 'dissolve' };
  reactionPreviews: ReactionPreview[];
  reactionEvents: ReactionEvent[];
  reactionPreviewSummary: ReactionPreviewSummary | null;
  particleTrigger: ParticleTrigger | null;
  /** Increments each time the board is fully cleared (Perfect Clear). */
  perfectClearSignal: number;
  /** Reaction Fever: charge 0-100, whether active, and when it ends (ms). */
  feverMeter: number;
  feverActive: boolean;
  feverEndsAt: number;
  isDailyChallenge: boolean;
  startGame: () => void;
  startDailyChallenge: () => void;
  resetGame: () => void;
  selectPiece: (piece: DraggablePiece | null) => void;
  setDropPreview: (pos: Position | null) => void;
  canPlacePiece: (piece: DraggablePiece, pos: Position) => boolean;
  placePiece: (piece: DraggablePiece, pos: Position) => void;
  getReactionPreview: (piece: DraggablePiece, pos: Position) => ReactionPreview[];
  findHint: (blocked?: Position | null) => { piece: DraggablePiece; pos: Position } | null;
}

export function useBlockBlastEngine(): BlockBlastEngine {
  const [gameState, setGameState] = useState<BlockBlastState>({
    grid: createEmptyGrid(),
    availablePieces: [],
    selectedPiece: null,
    dropPreview: null,
    score: 0,
    combo: 0,
    isGameOver: false,
    lastLifeTick: Date.now(),
  });

  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [perfectClearSignal, setPerfectClearSignal] = useState(0);

  // ── Reaction Fever ──
  // The meter (0-100) charges from reactions & line clears. At full it triggers
  // Fever: ~9s of double score with a HUD overdrive. feverActiveRef mirrors the
  // state so placePiece can read it without re-creating the callback.
  const FEVER_MS = 9000;
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
  const [comboDisplay, setComboDisplay] = useState({ count: 0, show: false, text: '' });
  const [scorePopup, setScorePopup] = useState<{ score: number; show: boolean; reactionType?: 'burn' | 'extinguish' | 'dissolve' }>({ score: 0, show: false });
  const [reactionPreviews, setReactionPreviews] = useState<ReactionPreview[]>([]);
  const [reactionEvents, setReactionEvents] = useState<ReactionEvent[]>([]);
  const [reactionPreviewSummary, setReactionPreviewSummary] = useState<ReactionPreviewSummary | null>(null);
  const [particleTrigger, setParticleTrigger] = useState<ParticleTrigger | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0); // Track for comeback mechanic
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);

  // Seeded RNG for daily challenge mode
  const seededRngRef = useRef<SeededRandom | null>(null);

  const canPlacePiece = useCallback(
    (piece: DraggablePiece, pos: Position): boolean => canPlacePieceAt(gameState.grid, piece, pos),
    [gameState.grid],
  );

  const getReactionPreview = useCallback(
    (piece: DraggablePiece, pos: Position): ReactionPreview[] => computeReactionPreview(gameState.grid, piece, pos),
    [gameState.grid],
  );

  // Start regular game (random pieces)
  const startGame = useCallback(() => {
    seededRngRef.current = null;
    setIsDailyChallenge(false);

    const initialPieces = [createRandomPiece(0), createRandomPiece(0), createRandomPiece(0)];

    setGameState({
      grid: createEmptyGrid(),
      availablePieces: initialPieces,
      selectedPiece: null,
      dropPreview: null,
      score: 0,
      combo: 0,
      isGameOver: false,
      lastLifeTick: Date.now(),
    });
    setReactionPreviews([]);
    setReactionEvents([]);
    setReactionPreviewSummary(null);
    setFailedAttempts(0);
    endFever();
  }, [endFever]);

  // Start daily challenge (seeded pieces - same for everyone today)
  const startDailyChallenge = useCallback(() => {
    const seed = getDateSeed();
    seededRngRef.current = new SeededRandom(seed);
    setIsDailyChallenge(true);

    const rng = seededRngRef.current;
    const initialPieces = [
      createRandomPiece(0, false, rng),
      createRandomPiece(0, false, rng),
      createRandomPiece(0, false, rng),
    ];

    setGameState({
      grid: createEmptyGrid(),
      availablePieces: initialPieces,
      selectedPiece: null,
      dropPreview: null,
      score: 0,
      combo: 0,
      isGameOver: false,
      lastLifeTick: Date.now(),
    });
    setReactionPreviews([]);
    setReactionEvents([]);
    setReactionPreviewSummary(null);
    setFailedAttempts(0);
    endFever();
  }, [endFever]);

  // Select piece
  const selectPiece = useCallback((piece: DraggablePiece | null) => {
    setGameState(prev => ({ ...prev, selectedPiece: piece, dropPreview: null }));
    setReactionPreviews([]);
  }, []);

  // Set drop preview and calculate reaction previews
  const setDropPreview = useCallback((pos: Position | null) => {
    setGameState(prev => {
      if (pos && prev.selectedPiece && canPlacePieceAt(prev.grid, prev.selectedPiece, pos)) {
        const previews = computeReactionPreview(prev.grid, prev.selectedPiece, pos);
        setReactionPreviews(previews);

        if (previews.length > 0) {
          const typeCounts: Record<string, { count: number; points: number }> = {};
          previews.forEach(p => {
            const key = p.type;
            if (!typeCounts[key]) typeCounts[key] = { count: 0, points: 0 };
            typeCounts[key].count += p.affectedPositions.length;
            typeCounts[key].points += p.affectedPositions.length * 50;
          });
          const primaryType = Object.entries(typeCounts).sort((a, b) => b[1].count - a[1].count)[0];
          setReactionPreviewSummary({
            type: primaryType[0] as 'burn' | 'extinguish' | 'dissolve',
            count: Object.values(typeCounts).reduce((sum, t) => sum + t.count, 0),
            points: Object.values(typeCounts).reduce((sum, t) => sum + t.points, 0),
          });
        } else {
          setReactionPreviewSummary(null);
        }
      } else {
        setReactionPreviews([]);
        setReactionPreviewSummary(null);
      }
      return { ...prev, dropPreview: pos };
    });
  }, []);

  // Place piece on grid
  const placePiece = useCallback((piece: DraggablePiece, pos: Position) => {
    setGameState(prev => {
      if (prev.isGameOver) return prev;

      // Lock piece to grid
      const newGrid = prev.grid.map(row => row.map(cell => ({ ...cell })));

      piece.shape.forEach((p, i) => {
        const newX = pos.x + p.x;
        const newY = pos.y + p.y;

        if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
          newGrid[newY][newX] = {
            element: piece.elements[i],
            id: `${newX}-${newY}-${Date.now()}-${Math.random()}`,
          };
        }
      });

      playSound('drop');

      // Resolve grid (line clears FIRST, then reactions)
      const { grid: resolvedGrid, totalScore, maxCombo, linesCleared, allReactionEvents, primaryReactionType, allAffectedPositions, perfectClear } = resolveGrid(newGrid);

      if (perfectClear) {
        setPerfectClearSignal(s => s + 1);
        playSound('highScore');
      }

      if (allReactionEvents.length > 0) {
        setReactionEvents(prevEvents => [...prevEvents, ...allReactionEvents].slice(-20));
      }

      if (allAffectedPositions.length > 0) {
        const allPositions = allAffectedPositions.flatMap(ap => ap.positions);
        const primaryType = allAffectedPositions[0].type;
        setParticleTrigger({
          type: primaryType,
          positions: allPositions,
          timestamp: Date.now(),
        });
      }

      if (maxCombo > 0 || linesCleared > 0) {
        const text = perfectClear ? 'PERFECT CLEAR!' : getComboText(maxCombo, linesCleared);
        setComboDisplay({ count: maxCombo, show: true, text });
        setScorePopup({ score: totalScore, show: true, reactionType: primaryReactionType });

        if (maxCombo > 1 || linesCleared >= 2) {
          setShakeIntensity(Math.min(maxCombo * 3 + linesCleared * 2, 12));
          playSound('combo');
        }

        setTimeout(() => {
          setComboDisplay({ count: 0, show: false, text: '' });
          setScorePopup({ score: 0, show: false });
          setShakeIntensity(0);
        }, 1200);
      }

      // Reaction Fever: double score while active; otherwise charge the meter
      // from this move's reactions and line clears (and trigger Fever at full).
      const feverMult = feverActiveRef.current ? 2 : 1;
      if (!feverActiveRef.current) {
        const gain = linesCleared * 10 + allReactionEvents.length * 6;
        if (gain > 0) {
          setFeverMeter(m => {
            const nm = m + gain;
            if (nm >= 100) { activateFever(); return 100; }
            return nm;
          });
        }
      }

      // Remove placed piece from available
      const remainingPieces = prev.availablePieces.filter(p => p.id !== piece.id);
      const newScore = prev.score + Math.floor(totalScore * feverMult) + piece.shape.length * 10;

      // Refill with dynamic difficulty; first piece may be easier in comeback mode.
      const needsComeback = failedAttempts >= 3;
      const rng = seededRngRef.current;
      const newPieces = remainingPieces.length === 0
        ? [
            createRandomPiece(newScore, needsComeback, rng || undefined),
            createRandomPiece(newScore, false, rng || undefined),
            createRandomPiece(newScore, false, rng || undefined),
          ]
        : remainingPieces;

      setFailedAttempts(0);

      const isGameOver = !canAnyPieceFit(resolvedGrid, newPieces);
      if (isGameOver) {
        playSound('gameOver');
      }

      return {
        ...prev,
        grid: resolvedGrid,
        availablePieces: newPieces,
        selectedPiece: null,
        dropPreview: null,
        score: newScore,
        combo: maxCombo,
        isGameOver,
      };
    });

    setReactionPreviews([]);
    setReactionPreviewSummary(null);
  }, [failedAttempts, activateFever]);

  const findHint = useCallback(
    (blocked?: Position | null) => computeHint(gameState.grid, gameState.availablePieces, blocked),
    [gameState.grid, gameState.availablePieces],
  );

  // Reset game - return to menu without saving score
  const resetGame = useCallback(() => {
    seededRngRef.current = null;
    setIsDailyChallenge(false);
    setGameState({
      grid: createEmptyGrid(),
      availablePieces: [],
      selectedPiece: null,
      dropPreview: null,
      score: 0,
      combo: 0,
      isGameOver: false,
      lastLifeTick: Date.now(),
    });
    setReactionPreviews([]);
    setReactionEvents([]);
    setReactionPreviewSummary(null);
    setFailedAttempts(0);
    endFever();
  }, [endFever]);

  return {
    gameState,
    shakeIntensity,
    comboDisplay,
    scorePopup,
    reactionPreviews,
    reactionEvents,
    reactionPreviewSummary,
    particleTrigger,
    perfectClearSignal,
    feverMeter,
    feverActive,
    feverEndsAt,
    isDailyChallenge,
    startGame,
    startDailyChallenge,
    resetGame,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
    getReactionPreview,
    findHint,
  };
}
