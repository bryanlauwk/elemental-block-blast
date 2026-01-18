import { useState, useCallback, useRef } from 'react';
import {
  Cell,
  BlockBlastState,
  Position,
  DraggablePiece,
  ElementType,
  BLOCK_SHAPES,
  SHAPE_WEIGHTS,
  ELEMENT_WEIGHTS,
  GRID_WIDTH,
  GRID_HEIGHT,
} from '@/game/types';
import { playSound } from '@/game/sounds';
import { SeededRandom, getDateSeed } from '@/game/seededRandom';

const createEmptyGrid = (): Cell[][] => {
  return Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => ({
      element: null,
      id: `${x}-${y}-${Date.now()}`,
    }))
  );
};

// Random element using optional seeded RNG
const getRandomElement = (rng?: SeededRandom): ElementType => {
  const totalWeight = ELEMENT_WEIGHTS.reduce((sum, e) => sum + e.weight, 0);
  let random = (rng ? rng.next() : Math.random()) * totalWeight;
  
  for (const { element, weight } of ELEMENT_WEIGHTS) {
    random -= weight;
    if (random <= 0) return element;
  }
  
  return 'stone';
};

// Dynamic difficulty: adjusts shape weights based on current score
const getRandomShape = (score: number = 0, rng?: SeededRandom): Position[] => {
  // Apply score-based modifiers to shape weights
  const modifiedWeights = SHAPE_WEIGHTS.map(({ shapeIndex, weight }) => {
    const shapeSize = BLOCK_SHAPES[shapeIndex].length;
    let modifier = 1;
    
    if (score < 500) {
      // Easy phase: favor small pieces (1-3 blocks)
      modifier = shapeSize <= 3 ? 1.5 : shapeSize <= 4 ? 0.8 : 0.3;
    } else if (score < 1500) {
      // Normal phase: standard distribution
      modifier = 1;
    } else if (score < 3000) {
      // Hard phase: favor medium-large pieces
      modifier = shapeSize <= 2 ? 0.7 : shapeSize <= 4 ? 1.2 : 1.5;
    } else {
      // Expert phase: heavily favor complex pieces
      modifier = shapeSize <= 2 ? 0.4 : shapeSize <= 4 ? 1.0 : 2.0;
    }
    
    return { shapeIndex, weight: weight * modifier };
  });
  
  const totalWeight = modifiedWeights.reduce((sum, s) => sum + s.weight, 0);
  let random = (rng ? rng.next() : Math.random()) * totalWeight;
  
  for (const { shapeIndex, weight } of modifiedWeights) {
    random -= weight;
    if (random <= 0) return BLOCK_SHAPES[shapeIndex];
  }
  
  return BLOCK_SHAPES[0];
};

// Create piece with UNIFORM element type (all blocks same element)
// Now accepts score for dynamic difficulty, comebackMode for easier pieces, and optional RNG for seeded mode
const createRandomPiece = (score: number = 0, comebackMode: boolean = false, rng?: SeededRandom): DraggablePiece => {
  // Comeback mode: guarantee a small piece (1-2 blocks)
  let shape: Position[];
  if (comebackMode) {
    const smallShapeIndices = [0, 1, 2]; // Single, H2, V2
    const idx = rng ? rng.nextInt(0, smallShapeIndices.length - 1) : Math.floor(Math.random() * smallShapeIndices.length);
    shape = BLOCK_SHAPES[smallShapeIndices[idx]];
  } else {
    shape = getRandomShape(score, rng);
  }
  
  const element = getRandomElement(rng);
  const elements = shape.map(() => element);
  
  const randomSuffix = rng 
    ? rng.nextInt(100000, 999999).toString() 
    : Math.random().toString(36).substr(2, 9);
  
  return {
    id: `piece-${Date.now()}-${randomSuffix}`,
    shape,
    elements,
  };
};

export interface ReactionPreview {
  pos: Position;
  type: 'burn' | 'extinguish' | 'dissolve';
  affectedPositions: Position[];
}

export interface ReactionEvent {
  id: string;
  type: 'burn' | 'extinguish' | 'dissolve';
  source: string;
  target: string;
  points: number;
  timestamp: number;
}

export interface ReactionPreviewSummary {
  type: 'burn' | 'extinguish' | 'dissolve';
  count: number;
  points: number;
}

export interface ParticleTrigger {
  type: 'burn' | 'extinguish' | 'dissolve';
  positions: Position[];
  timestamp: number;
}

export interface BlockBlastEngine {
  gameState: BlockBlastState;
  shakeIntensity: number;
  comboDisplay: { count: number; show: boolean; text: string };
  scorePopup: { score: number; show: boolean; reactionType?: 'burn' | 'extinguish' | 'dissolve' };
  reactionPreviews: ReactionPreview[];
  reactionEvents: ReactionEvent[];
  reactionPreviewSummary: ReactionPreviewSummary | null;
  particleTrigger: ParticleTrigger | null;
  isDailyChallenge: boolean;
  startGame: () => void;
  startDailyChallenge: () => void;
  selectPiece: (piece: DraggablePiece | null) => void;
  setDropPreview: (pos: Position | null) => void;
  canPlacePiece: (piece: DraggablePiece, pos: Position) => boolean;
  placePiece: (piece: DraggablePiece, pos: Position) => void;
  getReactionPreview: (piece: DraggablePiece, pos: Position) => ReactionPreview[];
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
  
  // Check if piece can be placed at position
  const canPlacePiece = useCallback((piece: DraggablePiece, pos: Position): boolean => {
    return piece.shape.every((p) => {
      const newX = pos.x + p.x;
      const newY = pos.y + p.y;
      
      if (newX < 0 || newX >= GRID_WIDTH) return false;
      if (newY < 0 || newY >= GRID_HEIGHT) return false;
      if (gameState.grid[newY][newX].element !== null) return false;
      
      return true;
    });
  }, [gameState.grid]);

  // Check if any piece can be placed anywhere
  const canAnyPieceFit = useCallback((grid: Cell[][], pieces: DraggablePiece[]): boolean => {
    for (const piece of pieces) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const canFit = piece.shape.every((p) => {
            const newX = x + p.x;
            const newY = y + p.y;
            
            if (newX < 0 || newX >= GRID_WIDTH) return false;
            if (newY < 0 || newY >= GRID_HEIGHT) return false;
            if (grid[newY][newX].element !== null) return false;
            
            return true;
          });
          
          if (canFit) return true;
        }
      }
    }
    return false;
  }, []);

  // Clear full rows and columns (Block Blast style) - ALWAYS HAPPENS FIRST
  const clearLines = useCallback((grid: Cell[][]): { grid: Cell[][]; linesCleared: number } => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let linesCleared = 0;
    
    // Find full rows
    const fullRows: number[] = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (newGrid[y].every(cell => cell.element !== null)) {
        fullRows.push(y);
      }
    }
    
    // Find full columns
    const fullCols: number[] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      let isFull = true;
      for (let y = 0; y < GRID_HEIGHT; y++) {
        if (newGrid[y][x].element === null) {
          isFull = false;
          break;
        }
      }
      if (isFull) fullCols.push(x);
    }
    
    // Clear full rows
    fullRows.forEach(y => {
      for (let x = 0; x < GRID_WIDTH; x++) {
        newGrid[y][x] = { element: null, id: `${x}-${y}-${Date.now()}` };
      }
      linesCleared++;
    });
    
    // Clear full columns
    fullCols.forEach(x => {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        newGrid[y][x] = { element: null, id: `${x}-${y}-${Date.now()}` };
      }
      linesCleared++;
    });
    
    if (linesCleared > 0) {
      playSound('lineClear');
    }
    
    return { grid: newGrid, linesCleared };
  }, []);

  // Process elemental reactions - SIMPLIFIED: mutual destruction, one-shot effects
  const processReactions = useCallback((grid: Cell[][]): { grid: Cell[][]; reacted: boolean; reactionCount: number; events: ReactionEvent[]; affectedPositions: { type: 'burn' | 'extinguish' | 'dissolve'; positions: Position[] }[] } => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let reacted = false;
    let reactionCount = 0;
    const toRemove = new Set<string>(); // Use set to avoid duplicates
    const toAdd: { pos: Position; element: ElementType }[] = [];
    const events: ReactionEvent[] = [];
    const affectedPositions: { type: 'burn' | 'extinguish' | 'dissolve'; positions: Position[] }[] = [];

    const posKey = (x: number, y: number) => `${x},${y}`;

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = newGrid[y][x];
        if (!cell.element) continue;

        const neighbors: { pos: Position; cell: Cell }[] = [
          { pos: { x: x - 1, y }, cell: x > 0 ? newGrid[y][x - 1] : { element: null, id: '' } },
          { pos: { x: x + 1, y }, cell: x < GRID_WIDTH - 1 ? newGrid[y][x + 1] : { element: null, id: '' } },
          { pos: { x, y: y - 1 }, cell: y > 0 ? newGrid[y - 1][x] : { element: null, id: '' } },
          { pos: { x, y: y + 1 }, cell: y < GRID_HEIGHT - 1 ? newGrid[y + 1][x] : { element: null, id: '' } },
        ];

        // Fire + Wood → Fire remains, Wood becomes Ash
        if (cell.element === 'fire') {
          const burnPositions: Position[] = [];
          neighbors.forEach(({ pos, cell: neighbor }) => {
            if (neighbor.element === 'wood') {
              toRemove.add(posKey(pos.x, pos.y));
              toAdd.push({ pos, element: 'ash' });
              burnPositions.push(pos);
              reacted = true;
              reactionCount++;
              events.push({
                id: `burn-${Date.now()}-${Math.random()}`,
                type: 'burn',
                source: 'fire',
                target: 'wood',
                points: 50,
                timestamp: Date.now(),
              });
              playSound('sizzle');
            }
          });
          if (burnPositions.length > 0) {
            affectedPositions.push({ type: 'burn', positions: burnPositions });
          }
        }

        // Fire + Water → BOTH disappear (mutual destruction)
        if (cell.element === 'fire') {
          const extinguishPositions: Position[] = [];
          neighbors.forEach(({ pos, cell: neighbor }) => {
            if (neighbor.element === 'water') {
              toRemove.add(posKey(x, y)); // Remove fire
              toRemove.add(posKey(pos.x, pos.y)); // Remove water
              extinguishPositions.push({ x, y });
              extinguishPositions.push(pos);
              reacted = true;
              reactionCount++;
              events.push({
                id: `extinguish-${Date.now()}-${Math.random()}`,
                type: 'extinguish',
                source: 'water',
                target: 'fire',
                points: 50,
                timestamp: Date.now(),
              });
              playSound('splash');
            }
          });
          if (extinguishPositions.length > 0) {
            affectedPositions.push({ type: 'extinguish', positions: extinguishPositions });
          }
        }

        // Acid → Destroys ONE adjacent non-immune block, then acid disappears (one-shot)
        if (cell.element === 'acid') {
          for (const { pos, cell: neighbor } of neighbors) {
            if (neighbor.element && neighbor.element !== 'stone' && neighbor.element !== 'helium' && neighbor.element !== 'acid') {
              toRemove.add(posKey(pos.x, pos.y)); // Remove target
              toRemove.add(posKey(x, y)); // Acid consumes itself
              affectedPositions.push({ type: 'dissolve', positions: [pos, { x, y }] });
              reacted = true;
              reactionCount++;
              events.push({
                id: `dissolve-${Date.now()}-${Math.random()}`,
                type: 'dissolve',
                source: 'acid',
                target: neighbor.element,
                points: 50,
                timestamp: Date.now(),
              });
              playSound('dissolve');
              break; // Only ONE block per acid
            }
          }
        }
      }
    }

    // Apply removals
    toRemove.forEach((key) => {
      const [xStr, yStr] = key.split(',');
      const rx = parseInt(xStr);
      const ry = parseInt(yStr);
      if (ry >= 0 && ry < GRID_HEIGHT && rx >= 0 && rx < GRID_WIDTH) {
        newGrid[ry][rx] = { element: null, id: `${rx}-${ry}-${Date.now()}` };
      }
    });

    // Apply additions (ash from burnt wood)
    toAdd.forEach(({ pos, element }) => {
      if (pos.y >= 0 && pos.y < GRID_HEIGHT && pos.x >= 0 && pos.x < GRID_WIDTH) {
        if (newGrid[pos.y][pos.x].element === null) {
          newGrid[pos.y][pos.x] = { element, id: `${pos.x}-${pos.y}-${Date.now()}` };
        }
      }
    });

    return { grid: newGrid, reacted, reactionCount, events, affectedPositions };
  }, []);

  // NEW: Resolve grid - LINE CLEARS FIRST, then reactions (strategic order)
  const resolveGrid = useCallback((grid: Cell[][]): { grid: Cell[][]; totalScore: number; maxCombo: number; linesCleared: number; allReactionEvents: ReactionEvent[]; primaryReactionType?: 'burn' | 'extinguish' | 'dissolve'; allAffectedPositions: { type: 'burn' | 'extinguish' | 'dissolve'; positions: Position[] }[] } => {
    let currentGrid = grid;
    let totalScore = 0;
    let combo = 0;
    let totalLinesCleared = 0;
    let hasChanges = true;
    const allReactionEvents: ReactionEvent[] = [];
    const allAffectedPositions: { type: 'burn' | 'extinguish' | 'dissolve'; positions: Position[] }[] = [];
    let primaryReactionType: 'burn' | 'extinguish' | 'dissolve' | undefined;

    while (hasChanges) {
      hasChanges = false;

      // STEP 1: Clear full lines FIRST (core Block Blast mechanic)
      const { grid: clearedGrid, linesCleared } = clearLines(currentGrid);
      if (linesCleared > 0) {
        currentGrid = clearedGrid;
        hasChanges = true;
        totalLinesCleared += linesCleared;
        combo++;
        // Block Blast style scoring - higher for more lines at once
        const lineBonus = linesCleared === 1 ? 100 : linesCleared === 2 ? 300 : linesCleared * 200;
        totalScore += lineBonus * (combo > 1 ? combo : 1);
      }

      // STEP 2: Process reactions AFTER line clears (bonus mechanic)
      const { grid: reactedGrid, reacted, reactionCount, events, affectedPositions } = processReactions(currentGrid);
      if (reacted) {
        currentGrid = reactedGrid;
        hasChanges = true;
        allReactionEvents.push(...events);
        allAffectedPositions.push(...affectedPositions);
        if (!primaryReactionType && events.length > 0) {
          primaryReactionType = events[0].type;
        }
        // Reactions are BONUS points (50 per reaction), with chain multiplier (1.5x)
        const reactionBonus = reactionCount * 50 * Math.pow(1.5, combo);
        totalScore += Math.floor(reactionBonus);
        combo++;
      }
    }

    return { grid: currentGrid, totalScore, maxCombo: combo, linesCleared: totalLinesCleared, allReactionEvents, primaryReactionType, allAffectedPositions };
  }, [clearLines, processReactions]);

  // Get combo text
  const getComboText = (combo: number, linesCleared: number): string => {
    if (combo >= 4) return 'LEGENDARY!';
    if (combo >= 3) return 'INCREDIBLE!';
    if (combo >= 2) return 'AMAZING!';
    if (linesCleared >= 3) return 'FANTASTIC!';
    if (linesCleared >= 2) return 'GREAT!';
    return 'NICE!';
  };

  // NEW: Get reaction preview when hovering
  const getReactionPreview = useCallback((piece: DraggablePiece, pos: Position): ReactionPreview[] => {
    const previews: ReactionPreview[] = [];
    
    // Simulate placing the piece
    const testGrid = gameState.grid.map(row => row.map(cell => ({ ...cell })));
    piece.shape.forEach((p, i) => {
      const newX = pos.x + p.x;
      const newY = pos.y + p.y;
      if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
        testGrid[newY][newX] = { element: piece.elements[i], id: 'preview' };
      }
    });

    // Check for potential reactions
    piece.shape.forEach((p, i) => {
      const x = pos.x + p.x;
      const y = pos.y + p.y;
      const element = piece.elements[i];

      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;

      const neighbors = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
      ].filter(n => n.x >= 0 && n.x < GRID_WIDTH && n.y >= 0 && n.y < GRID_HEIGHT);

      if (element === 'fire') {
        const burnTargets = neighbors.filter(n => gameState.grid[n.y][n.x].element === 'wood');
        const extinguishTargets = neighbors.filter(n => gameState.grid[n.y][n.x].element === 'water');
        
        if (burnTargets.length > 0) {
          previews.push({ pos: { x, y }, type: 'burn', affectedPositions: burnTargets });
        }
        if (extinguishTargets.length > 0) {
          previews.push({ pos: { x, y }, type: 'extinguish', affectedPositions: extinguishTargets });
        }
      }

      if (element === 'water') {
        const extinguishTargets = neighbors.filter(n => gameState.grid[n.y][n.x].element === 'fire');
        if (extinguishTargets.length > 0) {
          previews.push({ pos: { x, y }, type: 'extinguish', affectedPositions: extinguishTargets });
        }
      }

      if (element === 'acid') {
        const dissolveTargets = neighbors.filter(n => {
          const el = gameState.grid[n.y][n.x].element;
          return el && el !== 'stone' && el !== 'helium' && el !== 'acid';
        }).slice(0, 1); // Only one target
        
        if (dissolveTargets.length > 0) {
          previews.push({ pos: { x, y }, type: 'dissolve', affectedPositions: dissolveTargets });
        }
      }
    });

    return previews;
  }, [gameState.grid]);

  // Start regular game (random pieces)
  const startGame = useCallback(() => {
    // Clear seeded RNG for regular mode
    seededRngRef.current = null;
    setIsDailyChallenge(false);
    
    // Start with easy pieces (score 0)
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
  }, []);

  // Start daily challenge (seeded pieces - same for everyone today)
  const startDailyChallenge = useCallback(() => {
    // Initialize seeded RNG with today's date
    const seed = getDateSeed();
    seededRngRef.current = new SeededRandom(seed);
    setIsDailyChallenge(true);
    
    // Generate initial pieces using seeded RNG
    const rng = seededRngRef.current;
    const initialPieces = [
      createRandomPiece(0, false, rng), 
      createRandomPiece(0, false, rng), 
      createRandomPiece(0, false, rng)
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
  }, []);

  // Select piece
  const selectPiece = useCallback((piece: DraggablePiece | null) => {
    setGameState(prev => ({ ...prev, selectedPiece: piece, dropPreview: null }));
    setReactionPreviews([]);
  }, []);

  // Set drop preview and calculate reaction previews
  const setDropPreview = useCallback((pos: Position | null) => {
    setGameState(prev => {
      if (pos && prev.selectedPiece && canPlacePiece(prev.selectedPiece, pos)) {
        const previews = getReactionPreview(prev.selectedPiece, pos);
        setReactionPreviews(previews);
        
        // Calculate summary for the side panel
        if (previews.length > 0) {
          const typeCounts: Record<string, { count: number; points: number }> = {};
          previews.forEach(p => {
            const key = p.type;
            if (!typeCounts[key]) typeCounts[key] = { count: 0, points: 0 };
            typeCounts[key].count += p.affectedPositions.length;
            typeCounts[key].points += p.affectedPositions.length * 50;
          });
          // Get the primary reaction type
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
  }, [canPlacePiece, getReactionPreview]);

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
      const { grid: resolvedGrid, totalScore, maxCombo, linesCleared, allReactionEvents, primaryReactionType, allAffectedPositions } = resolveGrid(newGrid);
      
      // Add reaction events to history
      if (allReactionEvents.length > 0) {
        setReactionEvents(prev => [...prev, ...allReactionEvents].slice(-20)); // Keep last 20
      }

      // Trigger particles for reactions
      if (allAffectedPositions.length > 0) {
        // Combine all positions by type for particle effects
        const allPositions = allAffectedPositions.flatMap(ap => ap.positions);
        const primaryType = allAffectedPositions[0].type;
        setParticleTrigger({
          type: primaryType,
          positions: allPositions,
          timestamp: Date.now(),
        });
      }
      
      // Show combo display if significant
      if (maxCombo > 0 || linesCleared > 0) {
        const text = getComboText(maxCombo, linesCleared);
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
      
      // Remove placed piece from available
      const remainingPieces = prev.availablePieces.filter(p => p.id !== piece.id);
      const newScore = prev.score + totalScore + piece.shape.length * 10;
      
      // If all pieces used, generate new ones with dynamic difficulty
      // Check if comeback mode should be triggered (3+ failed attempts)
      // Use seeded RNG if in daily challenge mode
      const needsComeback = failedAttempts >= 3;
      const rng = seededRngRef.current;
      const newPieces = remainingPieces.length === 0 
        ? [
            createRandomPiece(newScore, needsComeback, rng || undefined), // First piece may be easier if comeback
            createRandomPiece(newScore, false, rng || undefined),
            createRandomPiece(newScore, false, rng || undefined)
          ]
        : remainingPieces;
      
      // Reset failed attempts on successful placement
      setFailedAttempts(0);
      
      // Check for game over
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
  }, [resolveGrid, canAnyPieceFit, failedAttempts]);

  return {
    gameState,
    shakeIntensity,
    comboDisplay,
    scorePopup,
    reactionPreviews,
    reactionEvents,
    reactionPreviewSummary,
    particleTrigger,
    isDailyChallenge,
    startGame,
    startDailyChallenge,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
    getReactionPreview,
  };
}
