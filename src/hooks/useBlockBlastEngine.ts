import { useState, useCallback, useEffect, useRef } from 'react';
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
  LIFE_SPREAD_INTERVAL,
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

const createRandomPiece = (): DraggablePiece => {
  const shape = getRandomShape();
  const elements = shape.map(() => getRandomElement());
  
  return {
    id: `piece-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    shape,
    elements,
  };
};

export interface BlockBlastEngine {
  gameState: BlockBlastState;
  shakeIntensity: number;
  comboDisplay: { count: number; show: boolean; text: string };
  scorePopup: { score: number; show: boolean };
  startGame: () => void;
  selectPiece: (piece: DraggablePiece | null) => void;
  setDropPreview: (pos: Position | null) => void;
  canPlacePiece: (piece: DraggablePiece, pos: Position) => boolean;
  placePiece: (piece: DraggablePiece, pos: Position) => void;
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
  
  const lifeTickRef = useRef<NodeJS.Timeout | null>(null);

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

  // Process elemental reactions
  const processReactions = useCallback((grid: Cell[][]): { grid: Cell[][]; reacted: boolean; reactionCount: number } => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let reacted = false;
    let reactionCount = 0;
    const toRemove: Position[] = [];
    const toAdd: { pos: Position; element: ElementType }[] = [];

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

        // Fire burns wood and life
        if (cell.element === 'fire') {
          neighbors.forEach(({ pos, cell: neighbor }) => {
            if (neighbor.element === 'wood') {
              toRemove.push(pos);
              toAdd.push({ pos, element: 'ash' });
              reacted = true;
              reactionCount++;
              playSound('sizzle');
            }
            if (neighbor.element === 'life') {
              toRemove.push(pos);
              reacted = true;
              reactionCount++;
              playSound('sizzle');
            }
          });
        }

        // Water extinguishes fire
        if (cell.element === 'water') {
          neighbors.forEach(({ pos, cell: neighbor }) => {
            if (neighbor.element === 'fire') {
              toRemove.push(pos);
              reacted = true;
              reactionCount++;
              playSound('splash');
            }
          });
        }

        // Acid dissolves adjacent blocks (except stone and helium)
        if (cell.element === 'acid') {
          neighbors.forEach(({ pos, cell: neighbor }) => {
            if (neighbor.element && neighbor.element !== 'stone' && neighbor.element !== 'helium' && neighbor.element !== 'acid') {
              toRemove.push(pos);
              reacted = true;
              reactionCount++;
              playSound('dissolve');
            }
          });
        }
      }
    }

    // Apply removals
    toRemove.forEach(({ x, y }) => {
      if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
        newGrid[y][x] = { element: null, id: `${x}-${y}-${Date.now()}` };
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

  // Clear full rows and columns (Block Blast style)
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

  // Resolve grid - chain reactions
  const resolveGrid = useCallback((grid: Cell[][]): { grid: Cell[][]; totalScore: number; maxCombo: number; linesCleared: number } => {
    let currentGrid = grid;
    let totalScore = 0;
    let combo = 0;
    let totalLinesCleared = 0;
    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;

      // Clear lines first
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

      // Process reactions
      const { grid: reactedGrid, reacted, reactionCount } = processReactions(currentGrid);
      if (reacted) {
        currentGrid = reactedGrid;
        hasChanges = true;
        combo++;
        totalScore += reactionCount * 150 * combo;
      }
    }

    return { grid: currentGrid, totalScore, maxCombo: combo, linesCleared: totalLinesCleared };
  }, [clearLines, processReactions]);

  // Spread life blocks
  const spreadLife = useCallback((grid: Cell[][]): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const lifePositions: Position[] = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (newGrid[y][x].element === 'life') {
          lifePositions.push({ x, y });
        }
      }
    }

    lifePositions.forEach(({ x, y }) => {
      const emptyNeighbors: Position[] = [];
      
      if (x > 0 && newGrid[y][x - 1].element === null) emptyNeighbors.push({ x: x - 1, y });
      if (x < GRID_WIDTH - 1 && newGrid[y][x + 1].element === null) emptyNeighbors.push({ x: x + 1, y });
      if (y > 0 && newGrid[y - 1][x].element === null) emptyNeighbors.push({ x, y: y - 1 });
      if (y < GRID_HEIGHT - 1 && newGrid[y + 1][x].element === null) emptyNeighbors.push({ x, y: y + 1 });

      if (emptyNeighbors.length > 0) {
        const randomNeighbor = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
        newGrid[randomNeighbor.y][randomNeighbor.x] = {
          element: 'life',
          id: `${randomNeighbor.x}-${randomNeighbor.y}-${Date.now()}`,
        };
        playSound('grow');
      }
    });

    return newGrid;
  }, []);

  // Get combo text
  const getComboText = (combo: number, linesCleared: number): string => {
    if (combo >= 4) return 'LEGENDARY!';
    if (combo >= 3) return 'INCREDIBLE!';
    if (combo >= 2) return 'AMAZING!';
    if (linesCleared >= 3) return 'FANTASTIC!';
    if (linesCleared >= 2) return 'GREAT!';
    return 'NICE!';
  };

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
  }, []);

  // Select piece
  const selectPiece = useCallback((piece: DraggablePiece | null) => {
    setGameState(prev => ({ ...prev, selectedPiece: piece, dropPreview: null }));
  }, []);

  // Set drop preview
  const setDropPreview = useCallback((pos: Position | null) => {
    setGameState(prev => ({ ...prev, dropPreview: pos }));
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
      
      // Resolve grid (reactions + line clears)
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
  }, [resolveGrid, canAnyPieceFit]);

  // Life tick effect
  useEffect(() => {
    if (gameState.isGameOver) {
      if (lifeTickRef.current) {
        clearInterval(lifeTickRef.current);
        lifeTickRef.current = null;
      }
      return;
    }

    lifeTickRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.isGameOver) return prev;
        
        const newGrid = spreadLife(prev.grid);
        return { ...prev, grid: newGrid, lastLifeTick: Date.now() };
      });
    }, LIFE_SPREAD_INTERVAL);

    return () => {
      if (lifeTickRef.current) {
        clearInterval(lifeTickRef.current);
      }
    };
  }, [gameState.isGameOver, spreadLife]);

  return {
    gameState,
    shakeIntensity,
    comboDisplay,
    scorePopup,
    startGame,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
  };
}
