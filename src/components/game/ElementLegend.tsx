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
        <p className="font-display text-[10px] mb-3 uppercase tracking-[0.28em] bg-clip-text text-transparent bg-[linear-gradient(90deg,#e6faff,#ffd6f5)] drop-shadow-[0_0_6px_hsl(190_95%_60%/0.5)]">
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
                flex items-center gap-2.5 transition-all rounded-xl backdrop-blur-md
                ${isVertical
                  ? `w-full p-2 border ${isActive
                      ? 'bg-[linear-gradient(135deg,hsl(190_95%_60%/0.18),hsl(320_95%_62%/0.18))] border-cyan-300/55 shadow-[0_0_22px_-4px_hsl(190_95%_60%/0.65),0_0_18px_-6px_hsl(320_95%_62%/0.45),inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'bg-white/[0.04] border-cyan-300/15 hover:bg-white/[0.07] hover:border-cyan-300/35 hover:shadow-[0_0_14px_-6px_hsl(190_95%_60%/0.5)]'
                    }`
                  : `p-1.5 border ${isActive
                      ? 'bg-white/[0.08] border-cyan-300/50 shadow-[0_0_16px_-3px_hsl(320_95%_62%/0.55)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                    }`
                }
              `}>
                <ElementBlock element={element} size={isVertical ? 28 : 28} isPreview />
                {isVertical && (
                  <span className={`text-sm flex-1 text-left transition-colors font-display tracking-wide ${
                    isActive ? 'text-white drop-shadow-[0_0_6px_hsl(190_95%_60%/0.6)]' : 'text-white/70'
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
            <div
              className="rounded-xl p-3 border border-cyan-300/30 bg-[rgba(10,14,30,0.72)] backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6),0_0_30px_-8px_hsl(190_95%_60%/0.45),inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg drop-shadow-[0_0_8px_hsl(320_95%_62%/0.6)]">{activeInfo.symbol}</span>
                <span className="font-display font-bold text-white text-sm uppercase tracking-wide">{activeInfo.name}</span>
              </div>
              <p className="text-xs text-white/65 mb-2 font-sans leading-relaxed">
                {activeInfo.description}
              </p>
              <div className="space-y-1">
                {activeInfo.rules.slice(0, 2).map((rule, i) => (
                  <p key={i} className="text-xs text-white/75 flex items-start gap-1.5 font-sans">
                    <span className="text-cyan-300 drop-shadow-[0_0_4px_hsl(190_95%_60%/0.8)]">•</span>
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
