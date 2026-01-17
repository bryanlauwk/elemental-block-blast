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
    return {
      width: size,
      height: size,
      backgroundColor: info.color,
      boxShadow: `
        0 ${size * 0.08}px 0 0 rgba(0,0,0,0.3),
        inset 0 ${size * 0.06}px ${size * 0.1}px rgba(255,255,255,0.4),
        inset 0 -${size * 0.04}px ${size * 0.08}px rgba(0,0,0,0.2),
        0 0 ${isPreview ? size * 0.15 : size * 0.3}px ${info.glowColor}
      `,
      borderRadius: size * 0.2,
    };
  };

  return (
    <motion.div
      initial={isPreview ? {} : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'flex items-center justify-center select-none border-2 border-white/20',
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
