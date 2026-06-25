import { motion, useReducedMotion } from 'framer-motion';
import React, { useRef, useCallback, TouchEvent, memo, useEffect, useState } from 'react';
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

type ReactionKind = 'burn' | 'extinguish' | 'dissolve';

const reactionIcons: Record<ReactionKind, { icon: typeof Flame; color: string; label: string; helper: string }> = {
  burn: { icon: Flame, color: 'text-orange-400', label: 'WILDFIRE', helper: 'wood chain' },
  extinguish: { icon: Droplets, color: 'text-blue-400', label: 'STEAM BURST', helper: 'fire + water' },
  dissolve: { icon: FlaskConical, color: 'text-green-400', label: 'ACID MELT', helper: 'acid clears' },
};

interface GridCellProps {
  cell: Cell;
  x: number;
  y: number;
  isPreview: boolean;
  previewElement: string | null;
  reactionType: ReactionKind | null;
  sourceType: ReactionKind | null;
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
  const SourceIcon = sourceType ? reactionIcons[sourceType].icon : null;
  const TargetIcon = reactionType && !sourceType ? reactionIcons[reactionType].icon : null;

  return (
    <div
      className={cn(
        'aspect-square rounded-lg transition-colors duration-75 cursor-pointer relative overflow-hidden game-grid-cell active:scale-[0.96]',
        cellSize,
        !cell.element && !previewElement && 'bg-game-cell',
        !cell.element && hasSelectedPiece && 'hover:bg-game-cell-hover',
        isPreview && isValidPreview && 'ring-2 ring-game-accent/70',
        isPreview && !isValidPreview && 'ring-2 ring-red-400/60 animate-pulse',
      )}
      onMouseEnter={() => onCellHover({ x, y })}
      onClick={() => onCellClick({ x, y })}
    >
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

      {SourceIcon && sourceType && isPreview && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-source-pulse">
          <SourceIcon className={cn('w-5 h-5', reactionIcons[sourceType].color, 'drop-shadow-lg')} />
        </div>
      )}

      {TargetIcon && reactionType && (
        <div
          className={cn(
            'absolute top-0.5 right-0.5 w-4 h-4 rounded-full z-20 flex items-center justify-center scale-100',
            reactionType === 'burn' && 'bg-orange-500',
            reactionType === 'extinguish' && 'bg-blue-500',
            reactionType === 'dissolve' && 'bg-green-500',
          )}
        >
          <TargetIcon className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      {cell.element && (
        <div className={cn('w-full h-full flex items-center justify-center p-0.5 relative z-10', reactionType && 'animate-pulse')}>
          <ElementBlock element={cell.element} size={36} />
        </div>
      )}

      {previewElement && !cell.element && isValidPreview && (
        <div className="w-full h-full flex items-center justify-center p-0.5 opacity-60">
          <ElementBlock element={previewElement as any} size={36} isPreview />
        </div>
      )}
    </div>
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
}: BlockBlastGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const lastTouchCell = useRef<Position | null>(null);
  const rafRef = useRef<number | null>(null);

  const isPreviewPosition = useCallback((x: number, y: number): boolean => {
    if (!selectedPiece || !dropPreview) return false;
    return selectedPiece.shape.some((p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y);
  }, [selectedPiece, dropPreview]);

  const getPreviewElement = useCallback((x: number, y: number): string | null => {
    if (!selectedPiece || !dropPreview) return null;
    const index = selectedPiece.shape.findIndex((p) => dropPreview.x + p.x === x && dropPreview.y + p.y === y);
    return index !== -1 ? selectedPiece.elements[index] : null;
  }, [selectedPiece, dropPreview]);

  const getReactionType = useCallback((x: number, y: number): ReactionKind | null => {
    for (const preview of reactionPreviews) {
      const affected = preview.affectedPositions.find((p) => p.x === x && p.y === y);
      if (affected) return preview.type;
    }
    return null;
  }, [reactionPreviews]);

  const isReactionSource = useCallback((x: number, y: number): ReactionKind | null => {
    for (const preview of reactionPreviews) {
      if (preview.pos.x === x && preview.pos.y === y) return preview.type;
    }
    return null;
  }, [reactionPreviews]);

  const throttledCellHover = useCallback((pos: Position) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      onCellHover(pos);
      rafRef.current = null;
    });
  }, [onCellHover]);

  const getCellFromTouch = useCallback((touchX: number, touchY: number): Position | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / GRID_WIDTH;
    const cellHeight = rect.height / GRID_HEIGHT;
    const fingerOffset = cellHeight * 1.1;

    if (
      touchX < rect.left - cellWidth * 0.5 ||
      touchX > rect.right + cellWidth * 0.5 ||
      touchY < rect.top ||
      touchY > rect.bottom + fingerOffset
    ) {
      return null;
    }

    const x = Math.min(GRID_WIDTH - 1, Math.max(0, Math.floor((touchX - rect.left) / cellWidth)));
    const y = Math.min(GRID_HEIGHT - 1, Math.max(0, Math.floor((touchY - rect.top - fingerOffset) / cellHeight)));
    return { x, y };
  }, []);

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
      if (!lastTouchCell.current || lastTouchCell.current.x !== cell.x || lastTouchCell.current.y !== cell.y) {
        lastTouchCell.current = cell;
        onCellHover(cell);
      }
    } else if (lastTouchCell.current) {
      lastTouchCell.current = null;
      onGridLeave();
    }
  }, [selectedPiece, getCellFromTouch, onCellHover, onGridLeave]);

  const handleTouchEnd = useCallback(() => {
    if (!selectedPiece || !lastTouchCell.current) return;
    const cell = lastTouchCell.current;
    if (canPlacePiece(selectedPiece, cell)) onCellClick(cell);
    lastTouchCell.current = null;
  }, [selectedPiece, canPlacePiece, onCellClick]);

  const isValidPreview = selectedPiece && dropPreview && canPlacePiece(selectedPiece, dropPreview);
  const reactionBonus = reactionPreviews.reduce((sum, p) => sum + p.affectedPositions.length * 50, 0);
  const primaryReactionType = reactionPreviews.length > 0 ? reactionPreviews[0].type : null;
  const cellSize = 'w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11';

  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (!prefersReducedMotion && shakeIntensity > 3) setFlashKey((k) => k + 1);
  }, [shakeIntensity, prefersReducedMotion]);

  return (
    <motion.div
      animate={prefersReducedMotion || shakeIntensity <= 0 ? { x: 0 } : { x: [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0] }}
      transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.22 }}
      className="classic-board-stack relative touch-none"
      onMouseLeave={onGridLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {reactionBonus > 0 && isValidPreview && primaryReactionType && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'absolute -top-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl shadow-2xl bg-game-grid-dark/90 border-2',
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
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4', config.color)} />
                  <span className={cn('text-sm font-black uppercase tracking-[0.14em]', config.color)}>{config.label}</span>
                  <span className="text-white/90 text-sm font-black">+{reactionBonus}</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">{config.helper}</span>
              </>
            );
          })()}
        </motion.div>
      )}

      <div className="pixar-grid-frame relative p-2 sm:p-3 rounded-3xl">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-[2px] rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(var(--stage-accent, var(--pixar-yellow))) 30%, hsl(var(--pixar-red)) 70%, transparent 100%)',
            opacity: 0.85,
            transition: prefersReducedMotion ? 'none' : 'background 1.2s ease',
          }}
        />

        {!prefersReducedMotion && flashKey > 0 && <span key={flashKey} className="neon-flash-overlay rounded-2xl" aria-hidden />}

        <div
          ref={gridRef}
          id="bb-grid"
          className="grid gap-[3px] sm:gap-1 relative z-10"
          style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`, gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)` }}
        >
          {grid.map((row, y) => row.map((cell, x) => {
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
          }))}
        </div>
      </div>

      <div className="classic-reaction-legend" aria-label="Elemental reaction guide">
        {(Object.entries(reactionIcons) as Array<[ReactionKind, typeof reactionIcons[ReactionKind]]>).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div key={type} className="classic-reaction-card">
              <Icon className={config.color} />
              <span>
                <span className={cn('classic-reaction-card__label', config.color)}>{config.label}</span>
                <span className="classic-reaction-card__helper">{config.helper}</span>
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
