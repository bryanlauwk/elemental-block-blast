import { motion } from 'framer-motion';
import { Cell, Block, Position, GRID_WIDTH, GRID_HEIGHT } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';

interface GameGridProps {
  grid: Cell[][];
  currentPiece: Block | null;
  currentPosition: Position;
  shakeIntensity: number;
}

export function GameGrid({ grid, currentPiece, currentPosition, shakeIntensity }: GameGridProps) {
  // Calculate ghost piece position
  const getGhostPosition = (): Position | null => {
    if (!currentPiece) return null;
    
    let ghostY = currentPosition.y;
    while (true) {
      const nextY = ghostY + 1;
      const valid = currentPiece.positions.every((p) => {
        const newX = currentPosition.x + p.x;
        const newY = nextY + p.y;
        if (newX < 0 || newX >= GRID_WIDTH) return false;
        if (newY >= GRID_HEIGHT) return false;
        if (newY < 0) return true;
        if (grid[newY][newX].element !== null) return false;
        return true;
      });
      
      if (!valid) break;
      ghostY = nextY;
    }
    
    return { x: currentPosition.x, y: ghostY };
  };

  const ghostPosition = getGhostPosition();

  // Check if a position is part of current piece
  const getCurrentPieceElement = (x: number, y: number): string | null => {
    if (!currentPiece) return null;
    
    const index = currentPiece.positions.findIndex(
      (p) => currentPosition.x + p.x === x && currentPosition.y + p.y === y
    );
    
    return index !== -1 ? currentPiece.elements[index] : null;
  };

  // Check if position is ghost piece
  const isGhostPosition = (x: number, y: number): boolean => {
    if (!currentPiece || !ghostPosition || ghostPosition.y === currentPosition.y) return false;
    
    return currentPiece.positions.some(
      (p) => ghostPosition.x + p.x === x && ghostPosition.y + p.y === y
    );
  };

  return (
    <motion.div
      animate={{
        x: shakeIntensity > 0 ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Grid background */}
      <div 
        className="grid gap-px bg-slate-900/50 p-1 rounded-lg border-2 border-slate-700"
        style={{
          gridTemplateColumns: `repeat(${GRID_WIDTH}, 28px)`,
          gridTemplateRows: `repeat(${GRID_HEIGHT}, 28px)`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const pieceElement = getCurrentPieceElement(x, y);
            const isGhost = isGhostPosition(x, y);

            return (
              <div
                key={cell.id}
                className={cn(
                  'w-7 h-7 rounded-sm transition-colors',
                  !cell.element && !pieceElement && 'bg-slate-800/40',
                  isGhost && 'bg-slate-600/30 border border-dashed border-slate-500'
                )}
              >
                {cell.element && (
                  <ElementBlock element={cell.element} />
                )}
                {pieceElement && !cell.element && (
                  <ElementBlock element={pieceElement as any} />
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
