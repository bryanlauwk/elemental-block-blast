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

  // Check if position will be affected by a reaction
  const getReactionType = (x: number, y: number): 'burn' | 'extinguish' | 'dissolve' | null => {
    for (const preview of reactionPreviews) {
      const affected = preview.affectedPositions.find(p => p.x === x && p.y === y);
      if (affected) return preview.type;
    }
    return null;
  };

  // Check if preview position is valid
  const isValidPreview = selectedPiece && dropPreview && canPlacePiece(selectedPiece, dropPreview);
  
  // Calculate estimated bonus from reactions
  const reactionBonus = reactionPreviews.reduce((sum, p) => sum + p.affectedPositions.length * 50, 0);

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
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-amber-400 z-20"
        >
          +{reactionBonus} reaction bonus!
        </motion.div>
      )}
      
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
              const reactionType = getReactionType(x, y);

              return (
                <motion.div
                  key={cell.id}
                  className={cn(
                    'aspect-square rounded-lg transition-all duration-150 cursor-pointer relative overflow-hidden',
                    'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11',
                    !cell.element && !previewElement && 'bg-game-cell hover:bg-game-cell-hover',
                    isPreview && isValidPreview && 'ring-2 ring-green-400 ring-opacity-70',
                    isPreview && !isValidPreview && 'ring-2 ring-red-400 ring-opacity-70',
                    selectedPiece && 'hover:bg-game-cell-hover',
                    // Reaction preview highlights
                    reactionType === 'burn' && 'ring-2 ring-orange-500 ring-opacity-80 bg-orange-500/20',
                    reactionType === 'extinguish' && 'ring-2 ring-blue-400 ring-opacity-80 bg-blue-400/20',
                    reactionType === 'dissolve' && 'ring-2 ring-green-500 ring-opacity-80 bg-green-500/20',
                  )}
                  onMouseEnter={() => onCellHover({ x, y })}
                  onClick={() => onCellClick({ x, y })}
                  whileHover={selectedPiece ? { scale: 1.05 } : {}}
                  whileTap={selectedPiece ? { scale: 0.95 } : {}}
                >
                  {/* Cell background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-lg" />
                  
                  {/* Reaction type indicator */}
                  {reactionType && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        'absolute top-0 right-0 w-3 h-3 rounded-full z-20',
                        reactionType === 'burn' && 'bg-orange-500',
                        reactionType === 'extinguish' && 'bg-blue-400',
                        reactionType === 'dissolve' && 'bg-green-500',
                      )}
                    />
                  )}
                  
                  {cell.element && (
                    <div className={cn(
                      'w-full h-full flex items-center justify-center',
                      reactionType && 'animate-pulse'
                    )}>
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
      
      {/* Reaction legend when previewing */}
      {reactionPreviews.length > 0 && isValidPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3 text-xs"
        >
          {reactionPreviews.some(p => p.type === 'burn') && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Burns wood
            </span>
          )}
          {reactionPreviews.some(p => p.type === 'extinguish') && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Extinguishes
            </span>
          )}
          {reactionPreviews.some(p => p.type === 'dissolve') && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Dissolves
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
