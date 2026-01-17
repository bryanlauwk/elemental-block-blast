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
  const getPieceBounds = (shape: Position[]) => {
    const minX = Math.min(...shape.map(p => p.x));
    const maxX = Math.max(...shape.map(p => p.x));
    const minY = Math.min(...shape.map(p => p.y));
    const maxY = Math.max(...shape.map(p => p.y));
    return { width: maxX - minX + 1, height: maxY - minY + 1, minX, minY };
  };

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
                'relative p-2 sm:p-3 rounded-xl transition-all',
                'bg-game-tray/50 border border-game-grid-border/30',
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
                  gridTemplateColumns: `repeat(${bounds.width}, 22px)`,
                  gridTemplateRows: `repeat(${bounds.height}, 22px)`,
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
                        className="w-[22px] h-[22px] flex items-center justify-center"
                      >
                        {hasBlock && (
                          <ElementBlock 
                            element={piece.elements[shapeIndex]} 
                            size={20}
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
      
      {/* Minimal hint */}
      <p className="text-center text-xs text-game-text-muted/60 mt-3">
        {selectedPiece ? 'Tap grid to place' : 'Select a piece'}
      </p>
    </div>
  );
}
