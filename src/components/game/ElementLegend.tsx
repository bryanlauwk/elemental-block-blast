import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO } from '@/game/elements';
import { ElementBlock } from './ElementBlock';

const DISPLAY_ELEMENTS: ElementType[] = ['stone', 'wood', 'fire', 'water', 'acid', 'helium', 'gold'];

interface ElementLegendProps {
  variant?: 'horizontal' | 'vertical';
}

export function ElementLegend({ variant = 'horizontal' }: ElementLegendProps) {
  const [activeElement, setActiveElement] = useState<ElementType | null>(null);
  const activeInfo = activeElement ? ELEMENT_INFO[activeElement] : null;

  const isVertical = variant === 'vertical';

  return (
    <div className="relative w-full">
      {/* Vertical header */}
      {isVertical && (
        <p className="text-xs text-game-text-muted/60 uppercase tracking-wider mb-3 font-medium">
          Elements
        </p>
      )}
      
      {/* Element bar - horizontal or vertical layout */}
      <div className={`flex ${isVertical ? 'flex-col gap-1' : 'items-center justify-center gap-2 sm:gap-3'}`}>
        {DISPLAY_ELEMENTS.map((element) => {
          const info = ELEMENT_INFO[element];
          const isActive = activeElement === element;
          
          return (
            <motion.button
              key={element}
              className={`relative group ${isVertical ? 'w-full' : ''}`}
              onMouseEnter={() => setActiveElement(element)}
              onMouseLeave={() => setActiveElement(null)}
              onTouchStart={() => setActiveElement(isActive ? null : element)}
              whileHover={{ scale: isVertical ? 1.02 : 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`
                flex items-center gap-2.5 transition-all rounded-lg
                ${isVertical 
                  ? `w-full p-2 ${isActive 
                      ? 'bg-white/15 border-l-2 border-game-accent' 
                      : 'hover:bg-white/10 border-l-2 border-transparent'
                    }` 
                  : `p-1.5 ${isActive 
                      ? 'bg-white/20 ring-2 ring-white/30' 
                      : 'bg-white/5 hover:bg-white/10'
                    }`
                }
              `}>
                <ElementBlock element={element} size={isVertical ? 28 : 28} isPreview />
                {isVertical && (
                  <span className={`text-sm flex-1 text-left transition-colors ${
                    isActive ? 'text-white' : 'text-game-text-muted'
                  }`}>
                    {info.name}
                  </span>
                )}
              </div>
              
              {/* Element name on hover - horizontal only, desktop only */}
              {!isVertical && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-game-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                  {info.name}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tooltip for active element */}
      <AnimatePresence>
        {activeInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className={`absolute z-50 ${isVertical 
              ? 'left-0 right-0 top-full mt-2' 
              : 'left-1/2 -translate-x-1/2 mt-8 w-64 sm:w-72'
            }`}
          >
            <div className="bg-game-grid-dark/95 backdrop-blur-sm rounded-xl p-3 border border-game-grid-border shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{activeInfo.symbol}</span>
                <span className="font-bold text-white text-sm">{activeInfo.name}</span>
              </div>
              <p className="text-xs text-game-text-muted mb-2">
                {activeInfo.description}
              </p>
              <div className="space-y-1">
                {activeInfo.rules.slice(0, 2).map((rule, i) => (
                  <p key={i} className="text-xs text-white/70 flex items-start gap-1.5">
                    <span className="text-game-accent">•</span>
                    {rule}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
