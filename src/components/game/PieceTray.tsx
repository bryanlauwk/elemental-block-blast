import { motion } from 'framer-motion';
import { DraggablePiece, Position } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';

interface PieceTrayProps {
  pieces: DraggablePiece[];
  selectedPiece: DraggablePiece | null;
  onSelectPiece: (piece: DraggablePiece | null) => void;
  disabled?: boolean;
}

export function PieceTray({ pieces, selectedPiece, onSelectPiece, disabled }: PieceTrayProps) {
  // Calculate piece bounds for centering
  const getPieceBounds = (shape: Position[]) => {
    const minX = Math.min(...shape.map(p => p.x));
    const maxX = Math.max(...shape.map(p => p.x));
    const minY = Math.min(...shape.map(p => p.y));
    const maxY = Math.max(...shape.map(p => p.y));
    return { width: maxX - minX + 1, height: maxY - minY + 1, minX, minY };
  };

  return (
    <div className="w-full">
      {/* Tray container */}
      <div className="bg-gradient-to-b from-game-tray to-game-tray-dark rounded-2xl p-4 shadow-lg border border-game-grid-border">
        <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap">
          {pieces.map((piece) => {
            const isSelected = selectedPiece?.id === piece.id;
            const bounds = getPieceBounds(piece.shape);
            
            return (
              <motion.div
                key={piece.id}
                className={cn(
                  'relative cursor-pointer p-2 rounded-xl transition-all',
                  'bg-gradient-to-b from-white/10 to-transparent',
                  isSelected && 'ring-2 ring-game-accent shadow-lg shadow-game-accent/30 bg-game-accent/20',
                  disabled && 'opacity-50 cursor-not-allowed',
                  !disabled && !isSelected && 'hover:bg-white/10 hover:scale-105'
                )}
                onClick={() => {
                  if (disabled) return;
                  onSelectPiece(isSelected ? null : piece);
                }}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                animate={isSelected ? { 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                } : { scale: 1 }}
              >
                {/* Piece preview grid */}
                <div 
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${bounds.width}, 24px)`,
                    gridTemplateRows: `repeat(${bounds.height}, 24px)`,
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
                          className="w-6 h-6 flex items-center justify-center"
                        >
                          {hasBlock && (
                            <ElementBlock 
                              element={piece.elements[shapeIndex]} 
                              size={22}
                              isPreview
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-2 h-2 bg-game-accent rounded-full shadow-lg shadow-game-accent/50" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Hint text */}
        <p className="text-center text-xs text-game-text-muted mt-3">
          {selectedPiece ? 'Tap grid to place' : 'Select a piece to place'}
        </p>
      </div>
    </div>
  );
}
