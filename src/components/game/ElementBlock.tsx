import { memo } from 'react';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO } from '@/game/elements';
import { cn } from '@/lib/utils';

interface ElementBlockProps {
  element: ElementType;
  size?: number;
  isPreview?: boolean;
  showSymbol?: boolean;
}

export const ElementBlock = memo(function ElementBlock({ element, size = 36, isPreview = false, showSymbol = true }: ElementBlockProps) {
  const info = ELEMENT_INFO[element];

  return (
    <div
      className={cn(
        'flex items-center justify-center select-none border-2 border-white/20 game-grid-cell',
        !isPreview && 'animate-block-appear',
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: info.color,
        boxShadow: isPreview
          ? `0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3), 0 0 ${size * 0.15}px ${info.glowColor}`
          : `0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3), inset 0 ${size * 0.06}px ${size * 0.1}px rgba(255,255,255,0.4), 0 0 ${size * 0.25}px ${info.glowColor}`,
        borderRadius: size * 0.2,
        transform: 'translateZ(0)',
      }}
    >
      {showSymbol && (
        <span
          className="font-bold text-white/90"
          style={{
            fontSize: size * 0.45,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {info.symbol}
        </span>
      )}
    </div>
  );
});
