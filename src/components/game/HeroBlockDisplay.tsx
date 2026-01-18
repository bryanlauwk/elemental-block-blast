import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Element colors matching the game
const ELEMENT_COLORS = {
  fire: { bg: '#FF6B4A', glow: 'rgba(255, 107, 74, 0.6)', emoji: '🔥' },
  water: { bg: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', emoji: '💧' },
  wood: { bg: '#A1662F', glow: 'rgba(161, 102, 47, 0.6)', emoji: '🪵' },
  stone: { bg: '#6B7280', glow: 'rgba(107, 114, 128, 0.6)', emoji: '🪨' },
  acid: { bg: '#22C55E', glow: 'rgba(34, 197, 94, 0.6)', emoji: '🧪' },
  helium: { bg: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)', emoji: '🎈' },
};

type ElementType = keyof typeof ELEMENT_COLORS | null;

// Sample grid state to showcase gameplay (8x8)
// Rows 5, 6, 7 are full and will be animated as clearing
const SAMPLE_GRID: ElementType[][] = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, 'helium', 'helium', null, null, null],
  [null, 'water', 'water', 'fire', 'fire', null, 'acid', null],
  ['stone', 'water', 'wood', 'fire', 'helium', 'helium', 'acid', null],
  ['stone', 'fire', 'wood', 'water', 'acid', 'water', 'acid', 'fire'],
  ['wood', 'fire', 'stone', 'water', 'acid', 'helium', 'wood', 'fire'],
  ['fire', 'water', 'stone', 'wood', 'helium', 'acid', 'fire', 'water'],
];

// Rows that are "full" and will animate as clearing
const CLEARING_ROWS = [5, 6, 7];

// Sample pieces for tray
const SAMPLE_PIECES = [
  { shape: [[0, 0], [0, 1], [1, 0], [1, 1]], element: 'water' as const },
  { shape: [[0, 0], [1, 0], [2, 0]], element: 'fire' as const },
  { shape: [[0, 0], [0, 1], [1, 1]], element: 'acid' as const },
];

const CELL_SIZE = 28;
const GRID_GAP = 2;

interface BlockCellProps {
  element: ElementType;
  size?: number;
  delay?: number;
  isClearing?: boolean;
  clearDelay?: number;
}

const BlockCell = ({ element, size = CELL_SIZE, delay = 0, isClearing = false, clearDelay = 0 }: BlockCellProps) => {
  if (!element) {
    return (
      <div
        className="rounded-md"
        style={{
          width: size,
          height: size,
          backgroundColor: 'rgba(30, 40, 70, 0.6)',
          border: '1px solid rgba(100, 150, 255, 0.15)',
        }}
      />
    );
  }

  const { bg, glow, emoji } = ELEMENT_COLORS[element];

  return (
    <motion.div
      className="rounded-md flex items-center justify-center relative overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        boxShadow: `
          0 3px 0 ${bg}99,
          0 4px 8px ${glow},
          inset 0 2px 4px rgba(255,255,255,0.35)
        `,
        border: '1px solid rgba(255,255,255,0.25)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isClearing
          ? {
              scale: [1, 1.15, 0],
              opacity: [1, 1, 0],
              filter: ['brightness(1)', 'brightness(2)', 'brightness(2)'],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={
        isClearing
          ? {
              delay: clearDelay,
              duration: 0.4,
              ease: 'easeOut',
            }
          : {
              delay,
              duration: 0.2,
              type: 'spring',
              stiffness: 500,
            }
      }
    >
      {/* Shine */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent rounded-t-sm" />
      {/* Clear flash overlay */}
      {isClearing && (
        <motion.div
          className="absolute inset-0 bg-white rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ delay: clearDelay, duration: 0.3 }}
        />
      )}
      <span className="relative z-10" style={{ fontSize: size * 0.45 }}>
        {emoji}
      </span>
    </motion.div>
  );
};

// 8x8 Game Grid Preview with row clearing animation
const GameGridPreview = () => {
  const [clearingPhase, setClearingPhase] = useState<'idle' | 'clearing' | 'refilling'>('idle');
  const [cycleKey, setCycleKey] = useState(0);

  // Animation cycle: idle -> clearing -> refilling -> idle
  useEffect(() => {
    const runCycle = () => {
      // Start clearing after initial display
      const clearTimer = setTimeout(() => {
        setClearingPhase('clearing');
        
        // After clear animation, trigger refill
        const refillTimer = setTimeout(() => {
          setClearingPhase('refilling');
          setCycleKey(k => k + 1);
          
          // Reset to idle for next cycle
          const resetTimer = setTimeout(() => {
            setClearingPhase('idle');
          }, 800);
          
          return () => clearTimeout(resetTimer);
        }, 600);
        
        return () => clearTimeout(refillTimer);
      }, 2500);
      
      return () => clearTimeout(clearTimer);
    };

    runCycle();
    
    // Repeat the cycle
    const interval = setInterval(() => {
      setClearingPhase('idle');
      setTimeout(() => {
        runCycle();
      }, 100);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative p-3 rounded-xl"
      style={{
        background: 'linear-gradient(145deg, rgba(20, 30, 60, 0.95), rgba(15, 20, 45, 0.98))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(59, 130, 246, 0.2)',
        border: '2px solid rgba(100, 150, 255, 0.2)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {/* Score popup when clearing */}
      <AnimatePresence>
        {clearingPhase === 'clearing' && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 font-bold text-xl"
            style={{
              color: '#FFD700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            +300 🎉
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`,
          gap: GRID_GAP,
        }}
      >
        {SAMPLE_GRID.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isClearingRow = CLEARING_ROWS.includes(rowIndex);
            const shouldClear = clearingPhase === 'clearing' && isClearingRow;
            const clearRowOffset = CLEARING_ROWS.indexOf(rowIndex);
            
            return (
              <AnimatePresence key={`${rowIndex}-${colIndex}-${cycleKey}`} mode="wait">
                {clearingPhase === 'clearing' && isClearingRow ? (
                  <BlockCell
                    element={cell}
                    isClearing={shouldClear}
                    clearDelay={clearRowOffset * 0.1 + colIndex * 0.02}
                  />
                ) : (
                  <BlockCell
                    element={cell}
                    delay={
                      clearingPhase === 'refilling' && isClearingRow
                        ? 0.1 + clearRowOffset * 0.15 + colIndex * 0.03
                        : 0.3 + (rowIndex * 8 + colIndex) * 0.008
                    }
                  />
                )}
              </AnimatePresence>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

// Floating piece above grid
const FloatingPiece = () => {
  const piece = { shape: [[0, 0], [0, 1], [1, 0]], element: 'helium' as const };
  const pieceSize = 24;

  // Calculate grid bounds
  const cols = Math.max(...piece.shape.map((p) => p[1])) + 1;
  const rows = Math.max(...piece.shape.map((p) => p[0])) + 1;

  return (
    <motion.div
      className="absolute -top-16 left-1/2 -translate-x-1/2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Downward beam */}
      <motion.div
        className="absolute top-full left-1/2 -translate-x-1/2 w-16 h-20 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(236, 72, 153, 0.4) 0%,
            rgba(236, 72, 153, 0.15) 50%,
            transparent 100%
          )`,
          filter: 'blur(6px)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Piece container */}
      <motion.div
        className="p-2 rounded-lg"
        style={{
          background: 'linear-gradient(145deg, rgba(40, 50, 80, 0.9), rgba(25, 30, 55, 0.95))',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(236, 72, 153, 0.3)',
          border: '2px solid rgba(255,255,255,0.15)',
        }}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${pieceSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${pieceSize}px)`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const isBlock = piece.shape.some((p) => p[0] === row && p[1] === col);
            
            if (!isBlock) return <div key={i} style={{ width: pieceSize, height: pieceSize }} />;
            
            return <BlockCell key={i} element={piece.element} size={pieceSize} delay={0.6} />;
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Piece tray preview
const PieceTrayPreview = () => {
  const pieceSize = 20;

  return (
    <motion.div
      className="flex justify-center gap-4 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      {SAMPLE_PIECES.map((piece, pieceIndex) => {
        const cols = Math.max(...piece.shape.map((p) => p[1])) + 1;
        const rows = Math.max(...piece.shape.map((p) => p[0])) + 1;

        return (
          <motion.div
            key={pieceIndex}
            className="p-2 rounded-lg"
            style={{
              background: 'linear-gradient(145deg, rgba(35, 45, 75, 0.8), rgba(20, 25, 50, 0.9))',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid rgba(100, 150, 255, 0.15)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${pieceSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${pieceSize}px)`,
              }}
            >
              {Array.from({ length: rows * cols }).map((_, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const isBlock = piece.shape.some((p) => p[0] === row && p[1] === col);

                if (!isBlock) return <div key={i} style={{ width: pieceSize, height: pieceSize }} />;

                return (
                  <BlockCell
                    key={i}
                    element={piece.element}
                    size={pieceSize}
                    delay={0.7 + pieceIndex * 0.1}
                  />
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <motion.div
      className="flex flex-col items-center py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main grid with floating piece */}
      <div className="relative">
        <FloatingPiece />
        <GameGridPreview />
      </div>

      {/* Piece tray below */}
      <PieceTrayPreview />
    </motion.div>
  );
};

export default HeroBlockDisplay;
