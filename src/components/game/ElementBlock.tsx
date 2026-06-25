import { motion } from 'framer-motion';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO } from '@/game/elements';
import { cn } from '@/lib/utils';

interface ElementBlockProps {
  element: ElementType;
  size?: number;
  isPreview?: boolean;
  showSymbol?: boolean;
}

export function ElementBlock({ element, size = 36, isPreview = false, showSymbol = true }: ElementBlockProps) {
  const info = ELEMENT_INFO[element];

  const getElementStyles = (): React.CSSProperties => {
    // Pop-Art comic-book tile: solid flat fill, thick ink outline, chunky
    // offset ink shadow (no blur), single highlight band on top.
    const ink = 'hsl(258 60% 9%)';
    const offset = Math.max(2, size * 0.1);
    return {
      width: size,
      height: size,
      background: info.color,
      border: `${Math.max(1.5, size * 0.05)}px solid ${ink}`,
      boxShadow: isPreview
        ? `0 ${size * 0.06}px 0 0 ${ink}, 0 0 ${size * 0.2}px ${info.glowColor}`
        : `${offset * 0.4}px ${offset}px 0 ${ink},
           0 ${size * 0.16}px ${size * 0.18}px rgba(0,0,0,0.35),
           0 0 ${size * 0.28}px ${info.glowColor}`,
      borderRadius: size * 0.22,
      transform: 'translateZ(0)',
    };
  };

  return (
    <motion.div
      initial={isPreview ? { scale: 1, opacity: 1 } : { scale: 1.18, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        isPreview
          ? { duration: 0 }
          : { type: 'spring', stiffness: 520, damping: 22, mass: 0.5 }
      }
      className={cn(
        'relative flex items-center justify-center select-none game-grid-cell overflow-hidden',
      )}
      style={getElementStyles()}
    >
      {/* Top highlight band — flat, comic-book style */}
      {!isPreview && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-1 top-1 h-[28%] rounded-t-[4px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
      )}
      {/* Crack overlay for cracked gold */}
      {element === 'goldCracked' && (
        <svg aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute inset-0 z-20 h-full w-full">
          <polyline
            points="20,2 17,14 23,20 16,26 19,38"
            fill="none"
            stroke="hsl(258 60% 9%)"
            strokeWidth={size * 0.07}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
      {showSymbol && (
        <span
          className="relative z-10 font-bold text-white"
          style={{ 
            fontSize: size * 0.45,
            textShadow: '0 1px 0 hsl(258 60% 9%), 0 2px 0 hsl(258 60% 9%), 0 0 6px rgba(0,0,0,0.5)',
            WebkitTextStroke: '0.75px hsl(258 60% 9%)',
          }}
        >
          {info.symbol}
        </span>
      )}
    </motion.div>
  );
}
