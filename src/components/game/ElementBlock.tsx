import { motion } from 'framer-motion';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO } from '@/game/elements';
import { cn } from '@/lib/utils';

interface ElementBlockProps {
  element: ElementType;
  size?: number;
  isPreview?: boolean;
}

export function ElementBlock({ element, size = 28, isPreview = false }: ElementBlockProps) {
  const info = ELEMENT_INFO[element];

  const getElementStyles = () => {
    const baseStyles: React.CSSProperties = {
      width: size,
      height: size,
      backgroundColor: info.color,
      boxShadow: `0 0 ${isPreview ? 4 : 8}px ${info.glowColor}, inset 0 1px 2px rgba(255,255,255,0.3)`,
    };

    return baseStyles;
  };

  const getAnimationClass = () => {
    switch (element) {
      case 'fire':
        return 'animate-pulse';
      case 'acid':
        return 'animate-bounce';
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
        'rounded-sm border border-white/20 flex items-center justify-center text-xs select-none',
        getAnimationClass()
      )}
      style={getElementStyles()}
    >
      <span 
        className="drop-shadow-lg"
        style={{ fontSize: size * 0.6 }}
      >
        {info.symbol}
      </span>
    </motion.div>
  );
}
