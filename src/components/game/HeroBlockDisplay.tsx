import { motion } from 'framer-motion';

const BLOCK_SIZE = 40;
const SMALL_BLOCK = 32;

interface ElementConfig {
  type: string;
  symbol: string;
  color: string;
  glow: string;
}

const elements: ElementConfig[] = [
  { type: 'fire', symbol: '🔥', color: 'hsl(15, 90%, 55%)', glow: 'hsl(15, 100%, 65%)' },
  { type: 'water', symbol: '💧', color: 'hsl(200, 80%, 50%)', glow: 'hsl(200, 90%, 60%)' },
  { type: 'wood', symbol: '🪵', color: 'hsl(30, 50%, 35%)', glow: 'hsl(30, 60%, 45%)' },
  { type: 'stone', symbol: '🪨', color: 'hsl(0, 0%, 45%)', glow: 'hsl(0, 0%, 55%)' },
  { type: 'acid', symbol: '🧪', color: 'hsl(120, 70%, 40%)', glow: 'hsl(120, 80%, 50%)' },
  { type: 'helium', symbol: '🎈', color: 'hsl(330, 70%, 65%)', glow: 'hsl(330, 80%, 75%)' },
];

const SingleBlock = ({ 
  symbol, 
  color, 
  glow, 
  delay = 0,
  size = BLOCK_SIZE 
}: { symbol: string; color: string; glow: string; delay?: number; size?: number }) => (
  <motion.div
    className="relative rounded-lg flex items-center justify-center"
    style={{
      width: size,
      height: size,
      background: `linear-gradient(135deg, ${glow} 0%, ${color} 50%, ${color} 100%)`,
      boxShadow: `
        inset 2px 2px 4px rgba(255,255,255,0.3),
        inset -2px -2px 4px rgba(0,0,0,0.3),
        0 4px 8px rgba(0,0,0,0.4)
      `,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
  >
    <span className="text-lg drop-shadow-md" style={{ fontSize: size * 0.5 }}>
      {symbol}
    </span>
  </motion.div>
);

// L-piece on left
const LeftPiece = () => {
  const piece = [
    { row: 0, col: 0, ...elements[0] }, // fire
    { row: 1, col: 0, ...elements[0] }, // fire
    { row: 2, col: 0, ...elements[2] }, // wood
    { row: 2, col: 1, ...elements[2] }, // wood
  ];

  return (
    <motion.div 
      className="relative"
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      >
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(2, ${SMALL_BLOCK}px)` }}>
          {piece.map((block, i) => (
            <div 
              key={i}
              style={{
                gridColumn: block.col + 1,
                gridRow: block.row + 1,
              }}
            >
              <SingleBlock {...block} delay={0.5 + i * 0.08} size={SMALL_BLOCK} />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Square piece on right  
const RightPiece = () => {
  const piece = [
    { row: 0, col: 0, ...elements[3] }, // stone
    { row: 0, col: 1, ...elements[3] }, // stone
    { row: 1, col: 0, ...elements[1] }, // water
    { row: 1, col: 1, ...elements[1] }, // water
  ];

  return (
    <motion.div 
      className="relative"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-1">
          {piece.map((block, i) => (
            <SingleBlock key={i} {...block} delay={0.5 + i * 0.08} size={SMALL_BLOCK} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hero T-piece in center with mini grid behind
const HeroPiece = () => {
  const pieceBlocks = [
    { x: 0, y: 0, ...elements[0] }, // fire
    { x: 1, y: 0, ...elements[1] }, // water
    { x: 2, y: 0, ...elements[2] }, // wood
    { x: 1, y: 1, ...elements[4] }, // acid
  ];

  return (
    <motion.div 
      className="relative"
      initial={{ y: 20, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 150, damping: 15 }}
    >
      {/* Mini grid preview behind */}
      <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
        <div 
          className="grid gap-0.5 opacity-20"
          style={{ gridTemplateColumns: `repeat(5, 20px)` }}
        >
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: 20,
                height: 20,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Glow underneath */}
      <motion.div
        className="absolute -inset-6 rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(circle, hsl(200, 80%, 50%) 0%, transparent 70%)',
          opacity: 0.4,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* The T-piece */}
      <motion.div 
        className="relative grid gap-1"
        style={{
          gridTemplateColumns: `repeat(3, ${BLOCK_SIZE}px)`,
          gridTemplateRows: `repeat(2, ${BLOCK_SIZE}px)`,
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {pieceBlocks.map((block, i) => (
          <div 
            key={i}
            style={{
              gridColumn: block.x + 1,
              gridRow: block.y + 1,
            }}
          >
            <SingleBlock {...block} delay={0.7 + i * 0.1} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 mt-2">
      <LeftPiece />
      <HeroPiece />
      <RightPiece />
    </div>
  );
};

export default HeroBlockDisplay;
