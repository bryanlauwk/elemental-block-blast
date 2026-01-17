import { motion } from 'framer-motion';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO } from '@/game/elements';
import { cn } from '@/lib/utils';

interface ElementBlockProps {
  element: ElementType;
  size?: number;
  isPreview?: boolean;
}

export function ElementBlock({ element, size = 36, isPreview = false }: ElementBlockProps) {
  const info = ELEMENT_INFO[element];

  const getElementStyles = (): React.CSSProperties => {
    return {
      width: size,
      height: size,
      backgroundColor: info.color,
      boxShadow: `
        0 0 ${isPreview ? 6 : 12}px ${info.glowColor},
        inset 0 2px 4px rgba(255,255,255,0.3),
        inset 0 -2px 4px rgba(0,0,0,0.2)
      `,
    };
  };

  const getAnimationClass = () => {
    switch (element) {
      case 'fire':
        return 'animate-pulse';
      case 'acid':
        return '';
      case 'life':
        return 'animate-pulse';
      case 'helium':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={isPreview ? {} : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'rounded-lg border-2 border-white/30 flex items-center justify-center select-none',
        getAnimationClass()
      )}
      style={getElementStyles()}
    >
      <span 
        className="drop-shadow-lg font-bold"
        style={{ fontSize: size * 0.5 }}
      >
        {info.symbol}
      </span>
    </motion.div>
  );
}
