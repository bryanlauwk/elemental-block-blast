import { motion } from 'framer-motion';
import { Cell, DraggablePiece, Position, GRID_WIDTH, GRID_HEIGHT } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';
import { ReactionPreview } from '@/hooks/useBlockBlastEngine';
import { Flame, Droplets, FlaskConical } from 'lucide-react';

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

const reactionIcons = {
  burn: { icon: Flame, color: 'text-orange-400', label: 'BURN' },
  extinguish: { icon: Droplets, color: 'text-blue-400', label: 'SPLASH' },
  dissolve: { icon: FlaskConical, color: 'text-green-400', label: 'DISSOLVE' },
};

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

  const isReactionSource = (x: number, y: number): 'burn' | 'extinguish' | 'dissolve' | null => {
    for (const preview of reactionPreviews) {
      if (preview.pos.x === x && preview.pos.y === y) return preview.type;
    }
    return null;
  };

  const isValidPreview = selectedPiece && dropPreview && canPlacePiece(selectedPiece, dropPreview);
  const reactionBonus = reactionPreviews.reduce((sum, p) => sum + p.affectedPositions.length * 50, 0);
  const primaryReactionType = reactionPreviews.length > 0 ? reactionPreviews[0].type : null;

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
      {/* Enhanced reaction bonus indicator */}
      {reactionBonus > 0 && isValidPreview && primaryReactionType && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={cn(
            "absolute -top-12 left-1/2 -translate-x-1/2 z-20",
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-game-grid-dark/90 border-2",
            primaryReactionType === 'burn' && 'border-orange-400/60',
            primaryReactionType === 'extinguish' && 'border-blue-400/60',
            primaryReactionType === 'dissolve' && 'border-green-400/60',
          )}
        >
          {(() => {
            const config = reactionIcons[primaryReactionType];
            const Icon = config.icon;
            return (
              <>
                <Icon className={cn('w-4 h-4', config.color)} />
                <span className={cn('text-sm font-bold', config.color)}>
                  {config.label}
                </span>
                <span className="text-white/80 text-sm font-bold">
                  +{reactionBonus}
                </span>
              </>
            );
          })()}
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
              const sourceType = isReactionSource(x, y);

              return (
                <motion.div
                  key={cell.id}
                  className={cn(
                    'aspect-square rounded-lg transition-colors duration-100 cursor-pointer relative overflow-hidden',
                    cellSize,
                    !cell.element && !previewElement && 'bg-game-cell',
                    !cell.element && selectedPiece && 'hover:bg-game-cell-hover',
                    isPreview && isValidPreview && 'ring-2 ring-game-accent/70',
                    isPreview && !isValidPreview && 'ring-2 ring-red-400/60',
                  )}
                  onMouseEnter={() => onCellHover({ x, y })}
                  onClick={() => onCellClick({ x, y })}
                  whileTap={selectedPiece ? { scale: 0.95 } : {}}
                >
                  {/* Reaction target highlight - pulsing background */}
                  {reactionType && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className={cn(
                        'absolute inset-0 rounded-lg',
                        reactionType === 'burn' && 'bg-orange-500/40',
                        reactionType === 'extinguish' && 'bg-blue-400/40',
                        reactionType === 'dissolve' && 'bg-green-400/40',
                      )}
                    />
                  )}

                  {/* Reaction source indicator - animated icon */}
                  {sourceType && isPreview && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                    >
                      {(() => {
                        const config = reactionIcons[sourceType];
                        const Icon = config.icon;
                        return <Icon className={cn('w-5 h-5', config.color, 'drop-shadow-lg')} />;
                      })()}
                    </motion.div>
                  )}

                  {/* Reaction indicator icon on target */}
                  {reactionType && !sourceType && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={cn(
                        'absolute top-0.5 right-0.5 w-4 h-4 rounded-full z-20 flex items-center justify-center',
                        reactionType === 'burn' && 'bg-orange-500',
                        reactionType === 'extinguish' && 'bg-blue-500',
                        reactionType === 'dissolve' && 'bg-green-500',
                      )}
                    >
                      {(() => {
                        const config = reactionIcons[reactionType];
                        const Icon = config.icon;
                        return <Icon className="w-2.5 h-2.5 text-white" />;
                      })()}
                    </motion.div>
                  )}
                  
                  {cell.element && (
                    <div className={cn(
                      'w-full h-full flex items-center justify-center p-0.5 relative z-10',
                      reactionType && 'animate-pulse'
                    )}>
                      <ElementBlock element={cell.element} size={32} />
                    </div>
                  )}
                  
                  {previewElement && !cell.element && isValidPreview && (
                    <motion.div 
                      className="w-full h-full flex items-center justify-center p-0.5 opacity-60"
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
