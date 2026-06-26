import { motion } from 'framer-motion';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO } from '@/game/elements';
import { cn } from '@/lib/utils';

interface ElementBlockProps {
  element: ElementType;
  size?: number;
  isPreview?: boolean;
  showSymbol?: boolean;
  /** Countdown number to render on bomb cells (1-5). */
  countdown?: number;
}

export function ElementBlock({ element, size = 36, isPreview = false, showSymbol = true, countdown }: ElementBlockProps) {
  const info = ELEMENT_INFO[element];
  const isBomb = element === 'bomb';
  const bombUrgent = isBomb && typeof countdown === 'number' && countdown <= 2;

  const getElementStyles = (): React.CSSProperties => {
    // Chunky Pixar "toy cube": glossy top, beveled inner edges and a short
    // coloured front face (darker shade of the element) for real depth.
    const base = `color-mix(in srgb, ${info.color} 58%, #000)`;
    return {
      width: size,
      height: size,
      background: isPreview
        ? info.color
        : `linear-gradient(160deg, color-mix(in srgb, ${info.color} 88%, #fff) 0%, ${info.color} 50%, ${base} 100%)`,
      boxShadow: isPreview
        ? `0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3), 0 0 ${size * 0.18}px ${info.glowColor}`
        : `0 ${size * 0.12}px 0 0 ${base},
           0 ${size * 0.14}px ${size * 0.16}px rgba(0,0,0,0.45),
           inset 0 ${size * 0.1}px ${size * 0.12}px rgba(255,255,255,0.55),
           inset 0 ${-size * 0.13}px ${size * 0.14}px rgba(0,0,0,0.4),
           0 0 ${size * 0.26}px ${info.glowColor}`,
      borderRadius: size * 0.24,
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
        'relative flex items-center justify-center select-none border border-white/25 game-grid-cell overflow-hidden',
        bombUrgent && 'animate-pulse',
      )}
      style={getElementStyles()}
    >
      {/* Top gloss */}
      {!isPreview && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-1 top-0.5 h-1/2 rounded-t-[6px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        />
      )}
      {/* Crack overlay for cracked gold */}
      {element === 'goldCracked' && (
        <svg aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute inset-0 z-20 h-full w-full">
          <polyline
            points="20,2 17,14 23,20 16,26 19,38"
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={size * 0.07}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
      {showSymbol && !(isBomb && typeof countdown === 'number') && (
        <span
          className="relative z-10 font-bold text-white/95"
          style={{ 
            fontSize: size * 0.45,
            textShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 6px rgba(255,255,255,0.25)',
          }}
        >
          {info.symbol}
        </span>
      )}
      {isBomb && typeof countdown === 'number' && (
        <span
          className="relative z-10 font-black"
          style={{
            fontSize: size * 0.6,
            color: bombUrgent ? '#FFE066' : '#FF4D4D',
            textShadow: '0 1px 2px rgba(0,0,0,0.7), 0 0 10px rgba(255,77,77,0.9)',
          }}
        >
          {countdown}
        </span>
      )}
    </motion.div>
  );
}
