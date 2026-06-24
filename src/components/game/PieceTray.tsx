import { motion } from 'framer-motion';
import { useRef } from 'react';
import { DraggablePiece, Position } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';
import { playSound } from '@/game/sounds';

type PointerKind = string;

interface PieceTrayProps {
  pieces: DraggablePiece[];
  selectedPiece: DraggablePiece | null;
  onSelectPiece: (piece: DraggablePiece | null) => void;
  /** Called continuously while dragging a piece over the board. */
  onDragHover?: (piece: DraggablePiece, clientX: number, clientY: number, pointerType: PointerKind) => void;
  /** Called when a dragged piece is released. */
  onDragDrop?: (piece: DraggablePiece, clientX: number, clientY: number, pointerType: PointerKind) => void;
  disabled?: boolean;
}

export function PieceTray({ pieces, selectedPiece, onSelectPiece, onDragHover, onDragDrop, disabled }: PieceTrayProps) {
  const isMobile = useIsMobile();

  // Pointer-drag: press a piece and drag it onto the board (mouse + touch).
  // A press without movement falls back to tap-to-select.
  const drag = useRef<{ piece: DraggablePiece; startX: number; startY: number; moved: boolean; pointerId: number; pointerType: PointerKind } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, piece: DraggablePiece) => {
    if (disabled) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    drag.current = { piece, startX: e.clientX, startY: e.clientY, moved: false, pointerId: e.pointerId, pointerType: e.pointerType };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) {
      d.moved = true;
      playSound('select');
      onSelectPiece(d.piece);
    }
    if (d.moved) onDragHover?.(d.piece, e.clientX, e.clientY, d.pointerType);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    if (d.moved) {
      onDragDrop?.(d.piece, e.clientX, e.clientY, d.pointerType);
    } else {
      playSound('select');
      onSelectPiece(selectedPiece?.id === d.piece.id ? null : d.piece);
    }
  };

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
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => handlePointerDown(e, piece)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
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
          ? (isMobile ? 'Drag onto the board, lift to place' : 'Tap the board to place')
          : 'Drag a piece onto the board — or tap to select'}
      </p>
    </div>
  );
}
