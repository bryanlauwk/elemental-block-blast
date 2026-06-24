import { motion } from 'framer-motion';
import React, { useRef, useCallback, TouchEvent, memo, useEffect, useState } from 'react';
import { Cell, DraggablePiece, Position, GRID_WIDTH, GRID_HEIGHT } from '@/game/types';
import { ElementBlock } from './ElementBlock';
import { cn } from '@/lib/utils';
import { ReactionPreview } from '@/hooks/useBlockBlastEngine';
import { Flame, Droplets, FlaskConical } from 'lucide-react';
import { PhaseConfig } from '@/game/phases';
import StageHazard from './StageHazard';

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
  phase?: PhaseConfig;
  hazardPos?: Position | null;
}

const reactionIcons = {
  burn: { icon: Flame, color: 'text-orange-400', label: 'BURN' },
  extinguish: { icon: Droplets, color: 'text-blue-400', label: 'SPLASH' },
  dissolve: { icon: FlaskConical, color: 'text-green-400', label: 'DISSOLVE' },
};

// Memoized grid cell component to prevent unnecessary re-renders
interface GridCellProps {
  cell: Cell;
  x: number;
  y: number;
  isPreview: boolean;
  previewElement: string | null;
  reactionType: 'burn' | 'extinguish' | 'dissolve' | null;
  sourceType: 'burn' | 'extinguish' | 'dissolve' | null;
  isValidPreview: boolean;
  hasSelectedPiece: boolean;
  onCellHover: (pos: Position) => void;
  onCellClick: (pos: Position) => void;
  cellSize: string;
}

const GridCell = memo(function GridCell({
  cell,
  x,
  y,
  isPreview,
  previewElement,
  reactionType,
  sourceType,
  isValidPreview,
  hasSelectedPiece,
  onCellHover,
  onCellClick,
  cellSize,
}: GridCellProps) {
  return (
    <motion.div
      className={cn(
        'aspect-square rounded-lg transition-colors duration-100 cursor-pointer relative overflow-hidden game-grid-cell',
        cellSize,
        !cell.element && !previewElement && 'bg-game-cell',
        !cell.element && hasSelectedPiece && 'hover:bg-game-cell-hover',
        isPreview && isValidPreview && 'ring-2 ring-game-accent/70',
        isPreview && !isValidPreview && 'ring-2 ring-red-400/60',
      )}
      onMouseEnter={() => onCellHover({ x, y })}
      onClick={() => onCellClick({ x, y })}
      whileTap={hasSelectedPiece ? { scale: 0.95 } : {}}
    >
      {/* Reaction target highlight - CSS animation instead of Framer Motion */}
      {reactionType && (
        <div
          className={cn(
            'absolute inset-0 rounded-lg animate-reaction-pulse',
            reactionType === 'burn' && 'bg-orange-500/40',
            reactionType === 'extinguish' && 'bg-blue-400/40',
            reactionType === 'dissolve' && 'bg-green-400/40',
          )}
        />
      )}

      {/* Reaction source indicator - CSS animation */}
      {sourceType && isPreview && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-source-pulse">
          {(() => {
            const config = reactionIcons[sourceType];
            const Icon = config.icon;
            return <Icon className={cn('w-5 h-5', config.color, 'drop-shadow-lg')} />;
          })()}
        </div>
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
          <ElementBlock element={cell.element} size={36} />
        </div>
      )}
      
      {previewElement && !cell.element && isValidPreview && (
        <div className="w-full h-full flex items-center justify-center p-0.5 opacity-60">
          <ElementBlock element={previewElement as any} size={36} isPreview />
        </div>
      )}
    </motion.div>
  );
});

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
  phase,
  hazardPos = null,
}: BlockBlastGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const lastTouchCell = useRef<Position | null>(null);
  const rafRef = useRef<number | null>(null);

  const isPreviewPosition = useCallback((x: number, y: number): boolean => {
    if (!selectedPiece || !dropPreview) return false;
    return selectedPiece.shape.some(
      (p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y
    );
  }, [selectedPiece, dropPreview]);

  const getPreviewElement = useCallback((x: number, y: number): string | null => {
    if (!selectedPiece || !dropPreview) return null;
    const index = selectedPiece.shape.findIndex(
      (p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y
    );
    return index !== -1 ? selectedPiece.elements[index] : null;
  }, [selectedPiece, dropPreview]);

  const getReactionType = useCallback((x: number, y: number): 'burn' | 'extinguish' | 'dissolve' | null => {
    for (const preview of reactionPreviews) {
      const affected = preview.affectedPositions.find(p => p.x === x && p.y === y);
      if (affected) return preview.type;
    }
    return null;
  }, [reactionPreviews]);

  const isReactionSource = useCallback((x: number, y: number): 'burn' | 'extinguish' | 'dissolve' | null => {
    for (const preview of reactionPreviews) {
      if (preview.pos.x === x && preview.pos.y === y) return preview.type;
    }
    return null;
  }, [reactionPreviews]);

  // Throttled hover handler using requestAnimationFrame
  const throttledCellHover = useCallback((pos: Position) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      onCellHover(pos);
      rafRef.current = null;
    });
  }, [onCellHover]);

  // Get cell position from touch coordinates.
  // We lift the targeted cell ~1.1 cells above the actual finger so the
  // ghost preview (and the cell being targeted) stays visible instead of
  // hiding under the thumb. The finger is also allowed to roam a little
  // below the grid so the bottom rows remain reachable.
  const getCellFromTouch = useCallback((touchX: number, touchY: number): Position | null => {
    if (!gridRef.current) return null;

    const gridElement = gridRef.current;
    const rect = gridElement.getBoundingClientRect();

    const cellWidth = rect.width / GRID_WIDTH;
    const cellHeight = rect.height / GRID_HEIGHT;
    const fingerOffset = cellHeight * 1.1;

    // Allow some slack around the grid so edge rows/cols stay reachable
    // (extra room at the bottom to compensate for the upward finger offset).
    if (
      touchX < rect.left - cellWidth * 0.5 ||
      touchX > rect.right + cellWidth * 0.5 ||
      touchY < rect.top ||
      touchY > rect.bottom + fingerOffset
    ) {
      return null;
    }

    const relativeX = touchX - rect.left;
    const relativeY = touchY - rect.top - fingerOffset;

    const x = Math.min(GRID_WIDTH - 1, Math.max(0, Math.floor(relativeX / cellWidth)));
    const y = Math.min(GRID_HEIGHT - 1, Math.max(0, Math.floor(relativeY / cellHeight)));

    return { x, y };
  }, []);

  // Touch handlers for drag preview
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!selectedPiece) return;
    
    const touch = e.touches[0];
    const cell = getCellFromTouch(touch.clientX, touch.clientY);
    
    if (cell) {
      lastTouchCell.current = cell;
      onCellHover(cell);
    }
  }, [selectedPiece, getCellFromTouch, onCellHover]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!selectedPiece) return;
    
    const touch = e.touches[0];
    const cell = getCellFromTouch(touch.clientX, touch.clientY);
    
    if (cell) {
      // Only update if cell changed to avoid unnecessary re-renders
      if (!lastTouchCell.current || lastTouchCell.current.x !== cell.x || lastTouchCell.current.y !== cell.y) {
        lastTouchCell.current = cell;
        onCellHover(cell);
      }
    } else {
      // Touch moved outside grid
      if (lastTouchCell.current) {
        lastTouchCell.current = null;
        onGridLeave();
      }
    }
  }, [selectedPiece, getCellFromTouch, onCellHover, onGridLeave]);

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!selectedPiece || !lastTouchCell.current) return;
    
    const cell = lastTouchCell.current;
    
    // Place piece if valid
    if (canPlacePiece(selectedPiece, cell)) {
      onCellClick(cell);
    }
    
    lastTouchCell.current = null;
  }, [selectedPiece, canPlacePiece, onCellClick]);

  const isValidPreview = selectedPiece && dropPreview && canPlacePiece(selectedPiece, dropPreview);
  const reactionBonus = reactionPreviews.reduce((sum, p) => sum + p.affectedPositions.length * 50, 0);
  const primaryReactionType = reactionPreviews.length > 0 ? reactionPreviews[0].type : null;

  // Calculate cell size based on screen - larger for mobile touch targets
  const cellSize = 'w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11';

  // One-shot flash overlay tied to shakeIntensity bumps (combo clears)
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (shakeIntensity > 3) {
      setFlashKey((k) => k + 1);
    }
  }, [shakeIntensity]);

  return (
    <motion.div
      animate={{
        x: shakeIntensity > 0 ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
      className="relative touch-none"
      onMouseLeave={onGridLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
      
      {/* Grid container — Pixar Toy Box frame */}
      <div className="pixar-grid-frame relative p-2 sm:p-3 rounded-3xl">
        {/* Top accent line — Pixar yellow→red */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-[2px] rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, hsl(var(--stage-accent, var(--pixar-yellow))) 30%, hsl(var(--pixar-red)) 70%, transparent 100%)',
            opacity: 0.85,
            transition: 'background 1.2s ease',
          }}
        />

        {/* Combo flash overlay — mounted only briefly */}
        {flashKey > 0 && (
          <span
            key={flashKey}
            className="neon-flash-overlay rounded-2xl"
            aria-hidden
          />
        )}
        
        {/* Grid cells */}
        <div 
          ref={gridRef}
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
                <GridCell
                  key={cell.id}
                  cell={cell}
                  x={x}
                  y={y}
                  isPreview={isPreview}
                  previewElement={previewElement}
                  reactionType={reactionType}
                  sourceType={sourceType}
                  isValidPreview={!!isValidPreview}
                  hasSelectedPiece={!!selectedPiece}
                  onCellHover={throttledCellHover}
                  onCellClick={onCellClick}
                  cellSize={cellSize}
                />
              );
            })
          )}
          {phase && <StageHazard phase={phase} pos={hazardPos} />}
        </div>
      </div>
    </motion.div>
  );
}
