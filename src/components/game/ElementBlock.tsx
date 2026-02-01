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
    // Simplified box-shadow for better performance
    return {
      width: size,
      height: size,
      backgroundColor: info.color,
      boxShadow: isPreview 
        ? `0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3), 0 0 ${size * 0.15}px ${info.glowColor}`
        : `0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3), inset 0 ${size * 0.06}px ${size * 0.1}px rgba(255,255,255,0.4), 0 0 ${size * 0.25}px ${info.glowColor}`,
      borderRadius: size * 0.2,
      transform: 'translateZ(0)', // GPU acceleration
    };
  };

  return (
    <motion.div
      // Skip animation for preview blocks to reduce overhead
      initial={isPreview ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={isPreview ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'flex items-center justify-center select-none border-2 border-white/20 game-grid-cell',
      )}
      style={getElementStyles()}
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
    </motion.div>
  );
}
