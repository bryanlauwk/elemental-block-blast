import { motion } from 'framer-motion';

// Element colors matching the game - vibrant Block Blast style
const ELEMENT_COLORS = {
  fire: { bg: '#FF6B4A', glow: 'rgba(255, 107, 74, 0.6)', emoji: '🔥' },
  water: { bg: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', emoji: '💧' },
  wood: { bg: '#A1662F', glow: 'rgba(161, 102, 47, 0.6)', emoji: '🪵' },
  stone: { bg: '#6B7280', glow: 'rgba(107, 114, 128, 0.6)', emoji: '🪨' },
  acid: { bg: '#22C55E', glow: 'rgba(34, 197, 94, 0.6)', emoji: '🧪' },
  helium: { bg: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)', emoji: '🎈' },
};

type ElementType = keyof typeof ELEMENT_COLORS;

// Larger block size for cleaner look
const BLOCK_SIZE = 44;

interface BlockCellProps {
  element: ElementType;
  size?: number;
  delay?: number;
}

const BlockCell = ({ element, size = BLOCK_SIZE, delay = 0 }: BlockCellProps) => {
  const { bg, glow, emoji } = ELEMENT_COLORS[element];

  return (
    <motion.div
      className="rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        boxShadow: `
          0 4px 0 ${bg}99,
          0 6px 12px ${glow},
          inset 0 3px 6px rgba(255,255,255,0.4)
        `,
        border: '2px solid rgba(255,255,255,0.3)',
      }}
      initial={{ scale: 0, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{
        delay,
        duration: 0.3,
        type: 'spring',
        stiffness: 400,
      }}
    >
      {/* Shine */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-t-md" />
      <span className="relative z-10" style={{ fontSize: size * 0.5 }}>
        {emoji}
      </span>
    </motion.div>
  );
};

// Simple left side block stack
const LeftBlockStack = () => {
  const blocks: { element: ElementType; x: number; y: number }[] = [
    { element: 'fire', x: 0, y: 0 },
    { element: 'water', x: 1, y: 0 },
    { element: 'stone', x: 0, y: 1 },
    { element: 'acid', x: 1, y: 1 },
    { element: 'wood', x: 0, y: 2 },
  ];

  return (
    <motion.div
      className="relative"
      style={{ width: BLOCK_SIZE * 2 + 4, height: BLOCK_SIZE * 3 + 8 }}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + 2),
            top: block.y * (BLOCK_SIZE + 2),
          }}
        >
          <BlockCell element={block.element} delay={0.3 + i * 0.08} />
        </motion.div>
      ))}
    </motion.div>
  );
};

// Simple right side block stack
const RightBlockStack = () => {
  const blocks: { element: ElementType; x: number; y: number }[] = [
    { element: 'helium', x: 0, y: 0 },
    { element: 'fire', x: 1, y: 0 },
    { element: 'water', x: 0, y: 1 },
    { element: 'stone', x: 1, y: 1 },
    { element: 'acid', x: 1, y: 2 },
  ];

  return (
    <motion.div
      className="relative"
      style={{ width: BLOCK_SIZE * 2 + 4, height: BLOCK_SIZE * 3 + 8 }}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + 2),
            top: block.y * (BLOCK_SIZE + 2),
          }}
        >
          <BlockCell element={block.element} delay={0.4 + i * 0.08} />
        </motion.div>
      ))}
    </motion.div>
  );
};

// Center floating piece with downward beam
const CenterFloatingPiece = () => {
  const piece: { element: ElementType; x: number; y: number }[] = [
    { element: 'helium', x: 0, y: 0 },
    { element: 'helium', x: 1, y: 0 },
    { element: 'helium', x: 0, y: 1 },
  ];

  const pieceSize = 36;

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {/* Floating piece */}
      <motion.div
        className="relative p-2 rounded-xl"
        style={{
          background: 'linear-gradient(145deg, rgba(40, 50, 80, 0.9), rgba(25, 30, 55, 0.95))',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4), 0 0 30px rgba(236, 72, 153, 0.3)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(2, ${pieceSize}px)`,
            gridTemplateRows: `repeat(2, ${pieceSize}px)`,
          }}
        >
          {[0, 1, 2, 3].map((i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const block = piece.find((p) => p.x === col && p.y === row);
            
            if (!block) return <div key={i} style={{ width: pieceSize, height: pieceSize }} />;
            
            return <BlockCell key={i} element={block.element} size={pieceSize} delay={0.6} />;
          })}
        </div>
      </motion.div>

      {/* Downward beam */}
      <motion.div
        className="w-12 h-16 pointer-events-none -mt-1"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(236, 72, 153, 0.35) 0%,
            rgba(236, 72, 153, 0.12) 50%,
            transparent 100%
          )`,
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Subtle perspective grid below */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-6 opacity-30"
        style={{
          background: `linear-gradient(to bottom,
            transparent 0%,
            rgba(100, 150, 255, 0.3) 100%
          )`,
          borderRadius: '50%',
          filter: 'blur(4px)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 0.8 }}
      />
    </motion.div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <motion.div
      className="flex items-end justify-center gap-6 sm:gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left stack */}
      <LeftBlockStack />

      {/* Center floating piece */}
      <CenterFloatingPiece />

      {/* Right stack */}
      <RightBlockStack />
    </motion.div>
  );
};

export default HeroBlockDisplay;
