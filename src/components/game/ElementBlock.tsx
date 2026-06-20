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
    // Glossy gradient face + element-tinted glow
    return {
      width: size,
      height: size,
      background: isPreview
        ? info.color
        : `linear-gradient(160deg, ${info.color} 0%, ${info.color} 55%, rgba(0,0,0,0.18) 100%)`,
      boxShadow: isPreview
        ? `0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3), 0 0 ${size * 0.18}px ${info.glowColor}`
        : `0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3),
           inset 0 ${size * 0.06}px ${size * 0.1}px rgba(255,255,255,0.45),
           inset 0 ${-size * 0.06}px ${size * 0.1}px rgba(0,0,0,0.25),
           0 0 ${size * 0.3}px ${info.glowColor}`,
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
        'relative flex items-center justify-center select-none border border-white/25 game-grid-cell overflow-hidden',
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
      {showSymbol && (
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
    </motion.div>
  );
}
