import { motion } from 'framer-motion';
import { useRef } from 'react';
import { DraggablePiece, Position } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, RefreshCw } from 'lucide-react';
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
  /** Swap one piece for a freshly generated one (once per turn). */
  onRerollPiece?: (pieceId: string) => void;
  /** Whether the reroll action is currently available. */
  rerollAvailable?: boolean;
  /** How many rerolls remain for the whole run (game-wide cap). */
  rerollsRemaining?: number;
  /** Maximum number of rerolls per run (for display). */
  rerollsMax?: number;
}

export function PieceTray({ pieces, selectedPiece, onSelectPiece, onDragHover, onDragDrop, disabled, onRerollPiece, rerollAvailable, rerollsRemaining, rerollsMax }: PieceTrayProps) {
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

  // Sizes scale down on narrow viewports so 3 pieces always fit a phone.
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 400;
  const isTight = viewportW < 380;
  const blockSize = isTight ? 18 : isMobile ? 22 : 22;
  const cellSize = isTight ? 20 : isMobile ? 24 : 22;

  return (
    <div className="classic-piece-tray w-full">
      <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
        Experiment Tray
        {typeof rerollsRemaining === 'number' && typeof rerollsMax === 'number' && rerollsMax > 0 && (
          <span className="ml-2 normal-case tracking-normal text-cyan-200/70">
            · Rerolls {rerollsRemaining}/{rerollsMax}
          </span>
        )}
      </p>
      <div className="flex justify-center items-center gap-2 sm:gap-5 overflow-x-auto -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pieces.map((piece) => {
          const isSelected = selectedPiece?.id === piece.id;
          const bounds = getPieceBounds(piece.shape);
          
          return (
            <motion.button
              key={piece.id}
              className={cn(
                'relative shrink-0 p-2 sm:p-3 rounded-xl transition-all touch-manipulation',
                'pixar-glass-tile',
                // Minimum touch target size of 48px for mobile
                'min-w-[48px] min-h-[48px] sm:min-w-0 sm:min-h-0',
                isSelected && 'pixar-glass-tile--active ring-2 ring-pixar-yellow/70',
                disabled && 'opacity-40 cursor-not-allowed',
                !disabled && 'active:scale-95'
              )}
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => handlePointerDown(e, piece)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              animate={isSelected ? { 
                scale: 1.05,
                y: -3,
                transition: { duration: 0.15 }
              } : { scale: 1, y: 0 }}
              disabled={disabled}
            >
              {/* Per-piece reroll — one swap allowed per turn */}
              {onRerollPiece && (
                <button
                  type="button"
                  onPointerDown={(e) => { e.stopPropagation(); }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!rerollAvailable || disabled) return;
                    if (typeof rerollsRemaining === 'number' && rerollsRemaining <= 0) return;
                    onRerollPiece(piece.id);
                  }}
                  disabled={!rerollAvailable || disabled || (typeof rerollsRemaining === 'number' && rerollsRemaining <= 0)}
                  title={
                    typeof rerollsRemaining === 'number' && rerollsRemaining <= 0
                      ? 'No rerolls left for this run'
                      : rerollAvailable
                        ? `Swap this piece (once per turn — ${rerollsRemaining ?? '?'} left this run)`
                        : 'Reroll used — place a piece to refresh'
                  }
                  aria-label="Reroll this piece"
                  className={cn(
                    'absolute -top-2 -right-2 z-10 rounded-full p-1 border transition-all',
                    rerollAvailable && !disabled && (typeof rerollsRemaining !== 'number' || rerollsRemaining > 0)
                      ? 'bg-white/10 border-cyan-300/60 text-cyan-200 hover:bg-white/20 hover:scale-110 active:scale-95 shadow-[0_0_10px_-2px_hsl(190_95%_60%/0.7)]'
                      : 'bg-white/5 border-white/15 text-white/30 cursor-not-allowed'
                  )}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
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
                    boxShadow: '0 0 24px rgba(250, 204, 21, 0.35)',
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
      <p className="text-center text-xs text-game-text-muted/70 mt-3">
        {selectedPiece
          ? (isMobile ? 'Drag over the lab board, then lift to place' : 'Tap a glowing cell to run the experiment')
          : 'Drag a piece onto the board'}
      </p>
    </div>
  );
}
