import { motion } from 'framer-motion';
import { Cell, DraggablePiece, Position, GRID_WIDTH, GRID_HEIGHT } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';

interface BlockBlastGridProps {
  grid: Cell[][];
  selectedPiece: DraggablePiece | null;
  dropPreview: Position | null;
  shakeIntensity: number;
  canPlacePiece: (piece: DraggablePiece, pos: Position) => boolean;
  onCellHover: (pos: Position) => void;
  onCellClick: (pos: Position) => void;
  onGridLeave: () => void;
}

export function BlockBlastGrid({
  grid,
  selectedPiece,
  dropPreview,
  shakeIntensity,
  canPlacePiece,
  onCellHover,
  onCellClick,
  onGridLeave,
}: BlockBlastGridProps) {
  // Check if a position is part of preview
  const isPreviewPosition = (x: number, y: number): boolean => {
    if (!selectedPiece || !dropPreview) return false;
    
    return selectedPiece.shape.some(
      (p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y
    );
  };

  // Get preview element at position
  const getPreviewElement = (x: number, y: number): string | null => {
    if (!selectedPiece || !dropPreview) return null;
    
    const index = selectedPiece.shape.findIndex(
      (p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y
    );
    
    return index !== -1 ? selectedPiece.elements[index] : null;
  };

  // Check if preview position is valid
  const isValidPreview = selectedPiece && dropPreview && canPlacePiece(selectedPiece, dropPreview);

  return (
    <motion.div
      animate={{
        x: shakeIntensity > 0 ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
      className="relative"
      onMouseLeave={onGridLeave}
    >
      {/* Grid container with Block Blast styling */}
      <div className="relative p-3 rounded-2xl bg-gradient-to-b from-game-grid-dark to-game-grid-darker shadow-2xl border border-game-grid-border">
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        {/* Grid cells */}
        <div 
          className="grid gap-1 relative z-10"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isPreview = isPreviewPosition(x, y);
              const previewElement = getPreviewElement(x, y);

              return (
                <motion.div
                  key={cell.id}
                  className={cn(
                    'aspect-square rounded-lg transition-all duration-150 cursor-pointer relative overflow-hidden',
                    'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11',
                    !cell.element && !previewElement && 'bg-game-cell hover:bg-game-cell-hover',
                    isPreview && isValidPreview && 'ring-2 ring-green-400 ring-opacity-70',
                    isPreview && !isValidPreview && 'ring-2 ring-red-400 ring-opacity-70',
                    selectedPiece && 'hover:bg-game-cell-hover'
                  )}
                  onMouseEnter={() => onCellHover({ x, y })}
                  onClick={() => onCellClick({ x, y })}
                  whileHover={selectedPiece ? { scale: 1.05 } : {}}
                  whileTap={selectedPiece ? { scale: 0.95 } : {}}
                >
                  {/* Cell background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-lg" />
                  
                  {cell.element && (
                    <div className="w-full h-full flex items-center justify-center">
                      <ElementBlock element={cell.element} size={36} />
                    </div>
                  )}
                  
                  {previewElement && !cell.element && isValidPreview && (
                    <motion.div 
                      className="w-full h-full flex items-center justify-center opacity-60"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      <ElementBlock element={previewElement as any} size={36} isPreview />
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
