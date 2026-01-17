import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementType } from '@/game/types';
import { ELEMENT_INFO, ElementInfo } from '@/game/elements';
import { ElementBlock } from './ElementBlock';

const DISPLAY_ELEMENTS: ElementType[] = ['fire', 'water', 'wood', 'acid', 'life', 'helium', 'stone'];

export function PeriodicTable() {
  const [hoveredElement, setHoveredElement] = useState<ElementType | null>(null);
  const hoveredInfo = hoveredElement ? ELEMENT_INFO[hoveredElement] : null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
        ⚗️ Periodic Table
      </h3>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        {DISPLAY_ELEMENTS.map((element) => {
          const info = ELEMENT_INFO[element];
          return (
            <button
              key={element}
              className="relative group"
              onMouseEnter={() => setHoveredElement(element)}
              onMouseLeave={() => setHoveredElement(null)}
              onTouchStart={() => setHoveredElement(element)}
              onTouchEnd={() => setHoveredElement(null)}
            >
              <div className="flex flex-col items-center p-2 rounded bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
                <ElementBlock element={element} size={24} isPreview />
                <span className="text-[10px] text-slate-400 mt-1 uppercase">
                  {info.name.slice(0, 4)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {hoveredInfo && (
          <motion.div
            key={hoveredElement}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-slate-900/80 rounded-lg p-3 border border-slate-600"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{hoveredInfo.symbol}</span>
              <span className="font-bold text-white">{hoveredInfo.name}</span>
            </div>
            <p className="text-xs text-slate-400 mb-2 italic">
              {hoveredInfo.description}
            </p>
            <ul className="text-xs text-slate-300 space-y-1">
              {hoveredInfo.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-yellow-500">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {!hoveredInfo && (
        <p className="text-xs text-slate-500 text-center italic">
          Hover an element to see its rules
        </p>
      )}
    </div>
  );
}
