import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Cell,
  GameState,
  Position,
  Block,
  Tetromino,
  ElementType,
  TETROMINO_SHAPES,
  ELEMENT_WEIGHTS,
  GRID_WIDTH,
  GRID_HEIGHT,
  LIFE_SPREAD_INTERVAL,
  BASE_TICK_SPEED,
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

const createRandomTetromino = (): Tetromino => {
  const shapeIndex = Math.floor(Math.random() * TETROMINO_SHAPES.length);
  const shape = TETROMINO_SHAPES[shapeIndex];
  const blockCount = shape[0].length;
  const elements = Array.from({ length: blockCount }, () => getRandomElement());
  
  return { shape, elements };
};

const tetrominoToBlock = (tetromino: Tetromino, rotation: number = 0): Block => {
  return {
    positions: tetromino.shape[rotation % 4],
    elements: tetromino.elements,
    rotation,
  };
};

export interface GameEngine {
  gameState: GameState;
  shakeIntensity: number;
  comboDisplay: { count: number; show: boolean };
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  hardDrop: () => void;
  rotateClockwise: () => void;
  rotateCounterClockwise: () => void;
}

export function useGameEngine(): GameEngine {
  const [gameState, setGameState] = useState<GameState>({
    grid: createEmptyGrid(),
    currentPiece: null,
    currentPosition: { x: 3, y: 0 },
    nextPieces: [],
    score: 0,
    combo: 0,
    isGameOver: false,
    isPaused: true,
    lastLifeTick: Date.now(),
  });
  
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [comboDisplay, setComboDisplay] = useState({ count: 0, show: false });
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lifeTickRef = useRef<NodeJS.Timeout | null>(null);

  // Check if position is valid
  const isValidPosition = useCallback((grid: Cell[][], block: Block, pos: Position): boolean => {
    return block.positions.every((p) => {
      const newX = pos.x + p.x;
      const newY = pos.y + p.y;
      
      if (newX < 0 || newX >= GRID_WIDTH) return false;
      if (newY >= GRID_HEIGHT) return false;
      if (newY < 0) return true; // Allow above grid
      if (grid[newY][newX].element !== null) return false;
      
      return true;
    });
  }, []);

  // Lock piece to grid
  const lockPiece = useCallback((grid: Cell[][], block: Block, pos: Position): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    
    block.positions.forEach((p, i) => {
      const newX = pos.x + p.x;
      const newY = pos.y + p.y;
      
      if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
        newGrid[newY][newX] = {
          element: block.elements[i],
          id: `${newX}-${newY}-${Date.now()}-${Math.random()}`,
        };
      }
    });
    
    playSound('drop');
    return newGrid;
  }, []);

  // Apply gravity (sand physics)
  const applyGravity = useCallback((grid: Cell[][]): { grid: Cell[][]; moved: boolean } => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let moved = false;

    // Process from bottom to top
    for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = newGrid[y][x];
        
        if (cell.element && cell.element !== 'helium') {
          // Check if can fall
          if (newGrid[y + 1][x].element === null) {
            newGrid[y + 1][x] = { ...cell, id: `${x}-${y + 1}-${Date.now()}` };
            newGrid[y][x] = { element: null, id: `${x}-${y}-${Date.now()}` };
            moved = true;
          }
        }
      }
    }

    // Helium floats up
    for (let y = 1; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = newGrid[y][x];
        
        if (cell.element === 'helium') {
          if (newGrid[y - 1][x].element === null) {
            newGrid[y - 1][x] = { ...cell, id: `${x}-${y - 1}-${Date.now()}` };
            newGrid[y][x] = { element: null, id: `${x}-${y}-${Date.now()}` };
            moved = true;
            playSound('float');
          }
        }
      }
    }

    return { grid: newGrid, moved };
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

        // Acid dissolves block below (max 3 depth tracked via metadata would be complex, simplified here)
        if (cell.element === 'acid' && y < GRID_HEIGHT - 1) {
          const below = newGrid[y + 1][x];
          if (below.element && below.element !== 'stone' && below.element !== 'helium') {
            toRemove.push({ x, y: y + 1 });
            reacted = true;
            reactionCount++;
            playSound('dissolve');
          }
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

  // Clear full lines
  const clearLines = useCallback((grid: Cell[][]): { grid: Cell[][]; linesCleared: number } => {
    const newGrid = grid.filter(row => !row.every(cell => cell.element !== null));
    const linesCleared = GRID_HEIGHT - newGrid.length;

    if (linesCleared > 0) {
      playSound('lineClear');
      // Add empty rows at top
      const emptyRows = Array.from({ length: linesCleared }, (_, i) =>
        Array.from({ length: GRID_WIDTH }, (_, x) => ({
          element: null as ElementType | null,
          id: `${x}-${i}-${Date.now()}`,
        }))
      );
      return { grid: [...emptyRows, ...newGrid], linesCleared };
    }

    return { grid: newGrid, linesCleared };
  }, []);

  // Resolve grid - recursive chain reactions
  const resolveGrid = useCallback((grid: Cell[][]): { grid: Cell[][]; totalScore: number; maxCombo: number } => {
    let currentGrid = grid;
    let totalScore = 0;
    let combo = 0;
    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;

      // Process reactions
      const { grid: reactedGrid, reacted, reactionCount } = processReactions(currentGrid);
      if (reacted) {
        currentGrid = reactedGrid;
        hasChanges = true;
        combo++;
        totalScore += reactionCount * 500;
      }

      // Apply gravity until stable
      let gravityResult = applyGravity(currentGrid);
      while (gravityResult.moved) {
        currentGrid = gravityResult.grid;
        hasChanges = true;
        gravityResult = applyGravity(currentGrid);
      }

      // Clear lines
      const { grid: clearedGrid, linesCleared } = clearLines(currentGrid);
      if (linesCleared > 0) {
        currentGrid = clearedGrid;
        hasChanges = true;
        totalScore += linesCleared * 1000;
        
        // Apply gravity after line clear
        gravityResult = applyGravity(currentGrid);
        while (gravityResult.moved) {
          currentGrid = gravityResult.grid;
          gravityResult = applyGravity(currentGrid);
        }
      }
    }

    return { grid: currentGrid, totalScore, maxCombo: combo };
  }, [processReactions, applyGravity, clearLines]);

  // Spread life blocks
  const spreadLife = useCallback((grid: Cell[][]): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const lifePositions: Position[] = [];

    // Find all life blocks
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (newGrid[y][x].element === 'life') {
          lifePositions.push({ x, y });
        }
      }
    }

    // Each life block tries to spread
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

  // Spawn new piece
  const spawnPiece = useCallback((state: GameState): GameState => {
    const nextPieces = state.nextPieces.length < 3
      ? [...state.nextPieces, createRandomTetromino(), createRandomTetromino(), createRandomTetromino()]
      : state.nextPieces;

    const [nextTetromino, ...remainingPieces] = nextPieces;
    const newPiece = tetrominoToBlock(nextTetromino);
    const startPos = { x: 3, y: 0 };

    // Check if game over
    if (!isValidPosition(state.grid, newPiece, startPos)) {
      playSound('gameOver');
      return {
        ...state,
        isGameOver: true,
        isPaused: true,
        nextPieces: remainingPieces,
      };
    }

    return {
      ...state,
      currentPiece: newPiece,
      currentPosition: startPos,
      nextPieces: remainingPieces,
    };
  }, [isValidPosition]);

  // Start game
  const startGame = useCallback(() => {
    const initialPieces = [createRandomTetromino(), createRandomTetromino(), createRandomTetromino()];
    
    setGameState({
      grid: createEmptyGrid(),
      currentPiece: null,
      currentPosition: { x: 3, y: 0 },
      nextPieces: initialPieces,
      score: 0,
      combo: 0,
      isGameOver: false,
      isPaused: false,
      lastLifeTick: Date.now(),
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Movement functions
  const moveLeft = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const newPos = { ...prev.currentPosition, x: prev.currentPosition.x - 1 };
      if (isValidPosition(prev.grid, prev.currentPiece, newPos)) {
        return { ...prev, currentPosition: newPos };
      }
      return prev;
    });
  }, [isValidPosition]);

  const moveRight = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const newPos = { ...prev.currentPosition, x: prev.currentPosition.x + 1 };
      if (isValidPosition(prev.grid, prev.currentPiece, newPos)) {
        return { ...prev, currentPosition: newPos };
      }
      return prev;
    });
  }, [isValidPosition]);

  const moveDown = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const newPos = { ...prev.currentPosition, y: prev.currentPosition.y + 1 };
      if (isValidPosition(prev.grid, prev.currentPiece, newPos)) {
        return { ...prev, currentPosition: newPos };
      }
      
      // Lock piece
      const lockedGrid = lockPiece(prev.grid, prev.currentPiece, prev.currentPosition);
      const { grid: resolvedGrid, totalScore, maxCombo } = resolveGrid(lockedGrid);
      
      // Trigger effects
      if (maxCombo > 1) {
        setComboDisplay({ count: maxCombo, show: true });
        playSound('combo');
        setShakeIntensity(Math.min(maxCombo * 2, 10));
        setTimeout(() => {
          setComboDisplay({ count: 0, show: false });
          setShakeIntensity(0);
        }, 1000);
      }
      
      const newState = {
        ...prev,
        grid: resolvedGrid,
        score: prev.score + totalScore,
        combo: maxCombo,
        currentPiece: null,
      };
      
      return spawnPiece(newState);
    });
  }, [isValidPosition, lockPiece, resolveGrid, spawnPiece]);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      let newPos = { ...prev.currentPosition };
      while (isValidPosition(prev.grid, prev.currentPiece, { ...newPos, y: newPos.y + 1 })) {
        newPos.y++;
      }
      
      const lockedGrid = lockPiece(prev.grid, prev.currentPiece, newPos);
      const { grid: resolvedGrid, totalScore, maxCombo } = resolveGrid(lockedGrid);
      
      if (maxCombo > 1) {
        setComboDisplay({ count: maxCombo, show: true });
        playSound('combo');
        setShakeIntensity(Math.min(maxCombo * 2, 10));
        setTimeout(() => {
          setComboDisplay({ count: 0, show: false });
          setShakeIntensity(0);
        }, 1000);
      }
      
      const newState = {
        ...prev,
        grid: resolvedGrid,
        score: prev.score + totalScore,
        combo: maxCombo,
        currentPiece: null,
      };
      
      return spawnPiece(newState);
    });
  }, [isValidPosition, lockPiece, resolveGrid, spawnPiece]);

  const rotateClockwise = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const newRotation = (prev.currentPiece.rotation + 1) % 4;
      const shapeIndex = TETROMINO_SHAPES.findIndex(
        shapes => JSON.stringify(shapes[prev.currentPiece!.rotation]) === JSON.stringify(prev.currentPiece!.positions)
      );
      
      if (shapeIndex === -1) return prev;
      
      const newBlock: Block = {
        positions: TETROMINO_SHAPES[shapeIndex][newRotation],
        elements: prev.currentPiece.elements,
        rotation: newRotation,
      };
      
      if (isValidPosition(prev.grid, newBlock, prev.currentPosition)) {
        return { ...prev, currentPiece: newBlock };
      }
      
      // Wall kick attempts
      const kicks = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 2, y: 0 }, { x: -2, y: 0 }];
      for (const kick of kicks) {
        const kickedPos = { x: prev.currentPosition.x + kick.x, y: prev.currentPosition.y + kick.y };
        if (isValidPosition(prev.grid, newBlock, kickedPos)) {
          return { ...prev, currentPiece: newBlock, currentPosition: kickedPos };
        }
      }
      
      return prev;
    });
  }, [isValidPosition]);

  const rotateCounterClockwise = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const newRotation = (prev.currentPiece.rotation + 3) % 4;
      const shapeIndex = TETROMINO_SHAPES.findIndex(
        shapes => JSON.stringify(shapes[prev.currentPiece!.rotation]) === JSON.stringify(prev.currentPiece!.positions)
      );
      
      if (shapeIndex === -1) return prev;
      
      const newBlock: Block = {
        positions: TETROMINO_SHAPES[shapeIndex][newRotation],
        elements: prev.currentPiece.elements,
        rotation: newRotation,
      };
      
      if (isValidPosition(prev.grid, newBlock, prev.currentPosition)) {
        return { ...prev, currentPiece: newBlock };
      }
      
      return prev;
    });
  }, [isValidPosition]);

  // Game loop
  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    // Spawn first piece if needed
    if (!gameState.currentPiece) {
      setGameState(prev => spawnPiece(prev));
    }

    gameLoopRef.current = setInterval(() => {
      moveDown();
    }, BASE_TICK_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPaused, gameState.isGameOver, gameState.currentPiece, moveDown, spawnPiece]);

  // Life spreading tick
  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) {
      if (lifeTickRef.current) {
        clearInterval(lifeTickRef.current);
        lifeTickRef.current = null;
      }
      return;
    }

    lifeTickRef.current = setInterval(() => {
      setGameState(prev => {
        const newGrid = spreadLife(prev.grid);
        const { grid: resolvedGrid, totalScore, maxCombo } = resolveGrid(newGrid);
        
        return {
          ...prev,
          grid: resolvedGrid,
          score: prev.score + totalScore,
          lastLifeTick: Date.now(),
        };
      });
    }, LIFE_SPREAD_INTERVAL);

    return () => {
      if (lifeTickRef.current) {
        clearInterval(lifeTickRef.current);
      }
    };
  }, [gameState.isPaused, gameState.isGameOver, spreadLife, resolveGrid]);

  return {
    gameState,
    shakeIntensity,
    comboDisplay,
    startGame,
    pauseGame,
    resumeGame,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotateClockwise,
    rotateCounterClockwise,
  };
}
