import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Keyboard } from 'lucide-react';

export function KeyboardHints() {
  const [showHints, setShowHints] = useState(false);
  
  const hints = [
    { keys: ['1', '2', '3'], action: 'Select Piece' },
    { keys: ['Click'], action: 'Place Piece' },
    { keys: ['Esc'], action: 'Deselect' },
    { keys: ['?'], action: 'Show/Hide Help' },
  ];

  return (
    <div className="hidden md:block fixed bottom-4 right-4 z-20">
      {/* Toggle button */}
      <motion.button
        onClick={() => setShowHints(!showHints)}
        className="p-2.5 rounded-full bg-game-grid-dark/80 border border-game-grid-border/50 hover:bg-game-grid-dark transition-colors text-white/60 hover:text-white/80"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </motion.button>
      
      {/* Hints panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 bg-game-grid-dark/95 backdrop-blur-sm rounded-xl p-4 border border-game-grid-border/50 shadow-2xl min-w-[180px]"
          >
            <h3 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span>⌨️</span> Controls
            </h3>
            <div className="space-y-2">
              {hints.map(({ keys, action }) => (
                <div key={action} className="flex items-center justify-between text-xs gap-4">
                  <div className="flex gap-1">
                    {keys.map((key) => (
                      <kbd
                        key={key}
                        className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono border border-white/10"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-white/50">{action}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-xs text-white/40 text-center">
              Press ? to toggle
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
