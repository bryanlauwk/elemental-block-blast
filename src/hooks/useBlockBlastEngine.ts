import { useState, useCallback } from 'react';
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

const createEmptyGrid = (): Cell[][] => {
  return Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => ({
      element: null,
      id: `${x}-${y}-${Date.now()}`,
    }))
  );
};

const getRandomElement = (): ElementType => {
  const totalWeight = ELEMENT_WEIGHTS.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { element, weight } of ELEMENT_WEIGHTS) {
    random -= weight;
    if (random <= 0) return element;
  }
  
  return 'stone';
};

const getRandomShape = (): Position[] => {
  const totalWeight = SHAPE_WEIGHTS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { shapeIndex, weight } of SHAPE_WEIGHTS) {
    random -= weight;
    if (random <= 0) return BLOCK_SHAPES[shapeIndex];
  }
  
  return BLOCK_SHAPES[0];
};

// Create piece with UNIFORM element type (all blocks same element)
const createRandomPiece = (): DraggablePiece => {
  const shape = getRandomShape();
  const element = getRandomElement(); // Single element for entire piece
  const elements = shape.map(() => element); // All same element
  
  return {
    id: `piece-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    shape,
    elements,
  };
};

export interface ReactionPreview {
  pos: Position;
  type: 'burn' | 'extinguish' | 'dissolve';
  affectedPositions: Position[];
}

export interface BlockBlastEngine {
  gameState: BlockBlastState;
  shakeIntensity: number;
  comboDisplay: { count: number; show: boolean; text: string };
  scorePopup: { score: number; show: boolean };
  reactionPreviews: ReactionPreview[];
  startGame: () => void;
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
  const [scorePopup, setScorePopup] = useState({ score: 0, show: false });
  const [reactionPreviews, setReactionPreviews] = useState<ReactionPreview[]>([]);

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
  const processReactions = useCallback((grid: Cell[][]): { grid: Cell[][]; reacted: boolean; reactionCount: number } => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let reacted = false;
    let reactionCount = 0;
    const toRemove = new Set<string>(); // Use set to avoid duplicates
    const toAdd: { pos: Position; element: ElementType }[] = [];

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
          neighbors.forEach(({ pos, cell: neighbor }) => {
            if (neighbor.element === 'wood') {
              toRemove.add(posKey(pos.x, pos.y));
              toAdd.push({ pos, element: 'ash' });
              reacted = true;
              reactionCount++;
              playSound('sizzle');
            }
          });
        }

        // Fire + Water → BOTH disappear (mutual destruction)
        if (cell.element === 'fire') {
          neighbors.forEach(({ pos, cell: neighbor }) => {
            if (neighbor.element === 'water') {
              toRemove.add(posKey(x, y)); // Remove fire
              toRemove.add(posKey(pos.x, pos.y)); // Remove water
              reacted = true;
              reactionCount++;
              playSound('splash');
            }
          });
        }

        // Acid → Destroys ONE adjacent non-immune block, then acid disappears (one-shot)
        if (cell.element === 'acid') {
          for (const { pos, cell: neighbor } of neighbors) {
            if (neighbor.element && neighbor.element !== 'stone' && neighbor.element !== 'helium' && neighbor.element !== 'acid') {
              toRemove.add(posKey(pos.x, pos.y)); // Remove target
              toRemove.add(posKey(x, y)); // Acid consumes itself
              reacted = true;
              reactionCount++;
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

    return { grid: newGrid, reacted, reactionCount };
  }, []);

  // NEW: Resolve grid - LINE CLEARS FIRST, then reactions (strategic order)
  const resolveGrid = useCallback((grid: Cell[][]): { grid: Cell[][]; totalScore: number; maxCombo: number; linesCleared: number } => {
    let currentGrid = grid;
    let totalScore = 0;
    let combo = 0;
    let totalLinesCleared = 0;
    let hasChanges = true;

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
      const { grid: reactedGrid, reacted, reactionCount } = processReactions(currentGrid);
      if (reacted) {
        currentGrid = reactedGrid;
        hasChanges = true;
        // Reactions are BONUS points (50 per reaction), with chain multiplier (1.5x)
        const reactionBonus = reactionCount * 50 * Math.pow(1.5, combo);
        totalScore += Math.floor(reactionBonus);
        combo++;
      }
    }

    return { grid: currentGrid, totalScore, maxCombo: combo, linesCleared: totalLinesCleared };
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

  // Start game
  const startGame = useCallback(() => {
    const initialPieces = [createRandomPiece(), createRandomPiece(), createRandomPiece()];
    
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
      } else {
        setReactionPreviews([]);
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
      const { grid: resolvedGrid, totalScore, maxCombo, linesCleared } = resolveGrid(newGrid);
      
      // Show combo display if significant
      if (maxCombo > 0 || linesCleared > 0) {
        const text = getComboText(maxCombo, linesCleared);
        setComboDisplay({ count: maxCombo, show: true, text });
        setScorePopup({ score: totalScore, show: true });
        
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
      
      // If all pieces used, generate new ones
      const newPieces = remainingPieces.length === 0 
        ? [createRandomPiece(), createRandomPiece(), createRandomPiece()]
        : remainingPieces;
      
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
        score: prev.score + totalScore + piece.shape.length * 10, // Base points for placing
        combo: maxCombo,
        isGameOver,
      };
    });
    
    setReactionPreviews([]);
  }, [resolveGrid, canAnyPieceFit]);

  return {
    gameState,
    shakeIntensity,
    comboDisplay,
    scorePopup,
    reactionPreviews,
    startGame,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
    getReactionPreview,
  };
}
