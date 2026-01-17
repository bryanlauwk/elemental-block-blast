import { motion } from 'framer-motion';
import { Cell, DraggablePiece, Position, GRID_WIDTH, GRID_HEIGHT } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';
import { ReactionPreview } from '@/hooks/useBlockBlastEngine';

interface BlockBlastGridProps {
  grid: Cell[][];
  selectedPiece: DraggablePiece | null;
  dropPreview: Position | null;
  shakeIntensity: number;
  canPlacePiece: (piece: DraggablePiece, pos: Position) => boolean;
  onCellHover: (pos: Position) => void;
  onCellClick: (pos: Position) => void;
  onGridLeave: () => void;
  reactionPreviews?: ReactionPreview[];
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
  reactionPreviews = [],
}: BlockBlastGridProps) {
  const isPreviewPosition = (x: number, y: number): boolean => {
    if (!selectedPiece || !dropPreview) return false;
    return selectedPiece.shape.some(
      (p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y
    );
  };

  const getPreviewElement = (x: number, y: number): string | null => {
    if (!selectedPiece || !dropPreview) return null;
    const index = selectedPiece.shape.findIndex(
      (p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y
    );
    return index !== -1 ? selectedPiece.elements[index] : null;
  };

  const getReactionType = (x: number, y: number): 'burn' | 'extinguish' | 'dissolve' | null => {
    for (const preview of reactionPreviews) {
      const affected = preview.affectedPositions.find(p => p.x === x && p.y === y);
      if (affected) return preview.type;
    }
    return null;
  };

  const isValidPreview = selectedPiece && dropPreview && canPlacePiece(selectedPiece, dropPreview);
  const reactionBonus = reactionPreviews.reduce((sum, p) => sum + p.affectedPositions.length * 50, 0);

  // Calculate cell size based on screen
  const cellSize = 'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11';

  return (
    <motion.div
      animate={{
        x: shakeIntensity > 0 ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
      className="relative"
      onMouseLeave={onGridLeave}
    >
      {/* Reaction bonus indicator */}
      {reactionBonus > 0 && isValidPreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-bold text-game-accent z-20 bg-game-grid-dark/80 px-3 py-1 rounded-full"
        >
          +{reactionBonus} bonus!
        </motion.div>
      )}
      
      {/* Grid container - clean, minimal styling */}
      <div className="relative p-2 sm:p-3 rounded-2xl bg-game-grid-dark shadow-2xl border border-game-grid-border/50">
        {/* Subtle outer glow */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        />
        
        {/* Grid cells */}
        <div 
          className="grid gap-[3px] sm:gap-1 relative z-10"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isPreview = isPreviewPosition(x, y);
              const previewElement = getPreviewElement(x, y);
              const reactionType = getReactionType(x, y);

              return (
                <motion.div
                  key={cell.id}
                  className={cn(
                    'aspect-square rounded-lg transition-colors duration-100 cursor-pointer relative',
                    cellSize,
                    !cell.element && !previewElement && 'bg-game-cell',
                    !cell.element && selectedPiece && 'hover:bg-game-cell-hover',
                    isPreview && isValidPreview && 'ring-2 ring-game-accent/70',
                    isPreview && !isValidPreview && 'ring-2 ring-red-400/60',
                    reactionType === 'burn' && 'ring-2 ring-orange-400/80 bg-orange-500/10',
                    reactionType === 'extinguish' && 'ring-2 ring-blue-400/80 bg-blue-400/10',
                    reactionType === 'dissolve' && 'ring-2 ring-emerald-400/80 bg-emerald-400/10',
                  )}
                  onMouseEnter={() => onCellHover({ x, y })}
                  onClick={() => onCellClick({ x, y })}
                  whileTap={selectedPiece ? { scale: 0.95 } : {}}
                >
                  {/* Reaction indicator dot */}
                  {reactionType && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        'absolute top-0.5 right-0.5 w-2 h-2 rounded-full z-20',
                        reactionType === 'burn' && 'bg-orange-400',
                        reactionType === 'extinguish' && 'bg-blue-400',
                        reactionType === 'dissolve' && 'bg-emerald-400',
                      )}
                    />
                  )}
                  
                  {cell.element && (
                    <div className={cn(
                      'w-full h-full flex items-center justify-center p-0.5',
                      reactionType && 'animate-pulse'
                    )}>
                      <ElementBlock element={cell.element} size={32} />
                    </div>
                  )}
                  
                  {previewElement && !cell.element && isValidPreview && (
                    <motion.div 
                      className="w-full h-full flex items-center justify-center p-0.5 opacity-50"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <ElementBlock element={previewElement as any} size={32} isPreview />
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
