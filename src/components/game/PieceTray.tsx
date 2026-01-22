import { motion } from 'framer-motion';
import { DraggablePiece, Position } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';

interface PieceTrayProps {
  pieces: DraggablePiece[];
  selectedPiece: DraggablePiece | null;
  onSelectPiece: (piece: DraggablePiece | null) => void;
  disabled?: boolean;
}

export function PieceTray({ pieces, selectedPiece, onSelectPiece, disabled }: PieceTrayProps) {
  const isMobile = useIsMobile();
  
  const getPieceBounds = (shape: Position[]) => {
    const minX = Math.min(...shape.map(p => p.x));
    const maxX = Math.max(...shape.map(p => p.x));
    const minY = Math.min(...shape.map(p => p.y));
    const maxY = Math.max(...shape.map(p => p.y));
    return { width: maxX - minX + 1, height: maxY - minY + 1, minX, minY };
  };

  // Larger sizes for mobile touch targets
  const blockSize = isMobile ? 26 : 22;
  const cellSize = isMobile ? 28 : 22;

  return (
    <div className="w-full">
      <div className="flex justify-center items-center gap-3 sm:gap-5">
        {pieces.map((piece) => {
          const isSelected = selectedPiece?.id === piece.id;
          const bounds = getPieceBounds(piece.shape);
          
          return (
            <motion.button
              key={piece.id}
              className={cn(
                'relative p-3 sm:p-3 rounded-xl transition-all touch-manipulation',
                'bg-game-tray/50 border border-game-grid-border/30',
                // Minimum touch target size of 48px for mobile
                'min-w-[56px] min-h-[56px] sm:min-w-0 sm:min-h-0',
                isSelected && 'ring-2 ring-game-accent bg-game-accent/10 border-game-accent/30',
                disabled && 'opacity-40 cursor-not-allowed',
                !disabled && !isSelected && 'hover:bg-game-tray hover:border-game-grid-border/50 active:scale-95'
              )}
              onClick={() => {
                if (disabled) return;
                onSelectPiece(isSelected ? null : piece);
              }}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              animate={isSelected ? { 
                scale: 1.05,
                transition: { duration: 0.15 }
              } : { scale: 1 }}
              disabled={disabled}
            >
              {/* Piece preview grid */}
              <div 
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${bounds.width}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${bounds.height}, ${cellSize}px)`,
                }}
              >
                {Array.from({ length: bounds.height }, (_, row) =>
                  Array.from({ length: bounds.width }, (_, col) => {
                    const shapeIndex = piece.shape.findIndex(
                      p => p.x - bounds.minX === col && p.y - bounds.minY === row
                    );
                    const hasBlock = shapeIndex !== -1;
                    
                    return (
                      <div
                        key={`${row}-${col}`}
                        className="flex items-center justify-center"
                        style={{ width: cellSize, height: cellSize }}
                      >
                        {hasBlock && (
                          <ElementBlock 
                            element={piece.elements[shapeIndex]} 
                            size={blockSize}
                            isPreview
                            showSymbol={false}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Selection glow */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Cancel selection button for mobile */}
      {isMobile && selectedPiece && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-3"
        >
          <button
            onClick={() => onSelectPiece(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-game-cell hover:bg-game-cell-hover border border-game-grid-border/30 text-sm text-game-text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel Selection
          </button>
        </motion.div>
      )}
      
      {/* Instruction hint */}
      <p className="text-center text-xs text-game-text-muted/60 mt-3">
        {selectedPiece 
          ? (isMobile ? 'Drag on grid to preview, lift to place' : 'Tap grid to place') 
          : 'Select a piece'}
      </p>
    </div>
  );
}
