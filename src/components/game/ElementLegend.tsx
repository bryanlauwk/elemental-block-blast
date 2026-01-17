import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO } from '@/game/elements';
import { ElementBlock } from './ElementBlock';

const DISPLAY_ELEMENTS: ElementType[] = ['stone', 'wood', 'fire', 'water', 'acid', 'helium'];

export function ElementLegend() {
  const [activeElement, setActiveElement] = useState<ElementType | null>(null);
  const activeInfo = activeElement ? ELEMENT_INFO[activeElement] : null;

  return (
    <div className="relative">
      {/* Compact horizontal element bar */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {DISPLAY_ELEMENTS.map((element) => {
          const info = ELEMENT_INFO[element];
          const isActive = activeElement === element;
          
          return (
            <motion.button
              key={element}
              className="relative group"
              onMouseEnter={() => setActiveElement(element)}
              onMouseLeave={() => setActiveElement(null)}
              onTouchStart={() => setActiveElement(isActive ? null : element)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`
                p-1.5 rounded-lg transition-all
                ${isActive ? 'bg-white/20 ring-2 ring-white/30' : 'bg-white/5 hover:bg-white/10'}
              `}>
                <ElementBlock element={element} size={28} isPreview />
              </div>
              
              {/* Element name on hover - desktop only */}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-game-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                {info.name}
              </span>
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
            className="absolute left-1/2 -translate-x-1/2 mt-8 z-50 w-64 sm:w-72"
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
