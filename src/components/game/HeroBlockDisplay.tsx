import { motion } from 'framer-motion';

// Element colors matching the game
const ELEMENT_COLORS = {
  fire: { bg: 'hsl(15, 90%, 55%)', glow: 'rgba(239, 68, 68, 0.7)', emoji: '🔥' },
  water: { bg: 'hsl(200, 80%, 55%)', glow: 'rgba(59, 130, 246, 0.7)', emoji: '💧' },
  wood: { bg: 'hsl(30, 50%, 35%)', glow: 'rgba(180, 83, 9, 0.7)', emoji: '🪵' },
  stone: { bg: 'hsl(0, 0%, 45%)', glow: 'rgba(107, 114, 128, 0.7)', emoji: '🪨' },
  acid: { bg: 'hsl(120, 80%, 40%)', glow: 'rgba(34, 197, 94, 0.7)', emoji: '🧪' },
  helium: { bg: 'hsl(330, 80%, 70%)', glow: 'rgba(236, 72, 153, 0.7)', emoji: '🎈' },
};

type ElementType = keyof typeof ELEMENT_COLORS;

const CELL_SIZE = 32;
const GRID_SIZE = 8;

// Pre-placed blocks on the grid to show gameplay
const PLACED_BLOCKS: { row: number; col: number; element: ElementType }[] = [
  // Fire blocks - L shape
  { row: 1, col: 2, element: 'fire' },
  { row: 1, col: 3, element: 'fire' },
  { row: 2, col: 2, element: 'fire' },
  // Water blocks
  { row: 2, col: 4, element: 'water' },
  { row: 2, col: 5, element: 'water' },
  { row: 3, col: 4, element: 'water' },
  // Stone blocks 
  { row: 4, col: 5, element: 'stone' },
  { row: 4, col: 6, element: 'stone' },
  { row: 5, col: 5, element: 'stone' },
  { row: 5, col: 6, element: 'stone' },
  // Wood blocks
  { row: 5, col: 1, element: 'wood' },
  { row: 6, col: 1, element: 'wood' },
  { row: 6, col: 2, element: 'wood' },
  // Acid blocks
  { row: 3, col: 6, element: 'acid' },
  { row: 3, col: 7, element: 'acid' },
];

// Piece shapes for the tray
const PIECE_SHAPES = {
  L: [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
  ],
  T: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 1, col: 1 },
  ],
  Square: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ],
};

interface BlockCellProps {
  element: ElementType;
  size?: number;
  delay?: number;
}

const BlockCell = ({ element, size = CELL_SIZE, delay = 0 }: BlockCellProps) => {
  const { bg, glow, emoji } = ELEMENT_COLORS[element];
  
  return (
    <motion.div
      className="rounded-lg flex items-center justify-center border-2 border-white/30 relative overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        boxShadow: `0 4px 12px ${glow}, inset 0 2px 4px rgba(255,255,255,0.4)`,
      }}
      initial={{ scale: 0, opacity: 0, rotateY: -90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ 
        delay, 
        duration: 0.4, 
        type: 'spring', 
        stiffness: 300 
      }}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay * 2,
        }}
      />
      <span className="relative z-10" style={{ fontSize: size * 0.55 }}>{emoji}</span>
    </motion.div>
  );
};

const GameGridPreview = () => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      {/* Rainbow glow underneath */}
      <motion.div 
        className="absolute inset-0 rounded-2xl blur-2xl -z-10"
        style={{ 
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.5), rgba(59, 130, 246, 0.5), rgba(34, 197, 94, 0.5), rgba(168, 85, 247, 0.5))',
          transform: 'scale(1.15) translateY(10px)'
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1.15, 1.2, 1.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Grid container */}
      <div 
        className="relative rounded-2xl p-3 border-2 border-white/20"
        style={{
          background: 'linear-gradient(145deg, rgba(40, 40, 60, 0.95), rgba(25, 25, 40, 0.98))',
          boxShadow: '0 12px 48px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
        }}
      >
        {/* Inner shimmer */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        >
          <motion.div
            className="absolute w-20 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100px', '400px'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Grid cells */}
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;
            const placedBlock = PLACED_BLOCKS.find(b => b.row === row && b.col === col);
            
            if (placedBlock) {
              return (
                <BlockCell 
                  key={index} 
                  element={placedBlock.element} 
                  delay={0.02 * index}
                />
              );
            }
            
            return (
              <motion.div
                key={index}
                className="rounded-md relative overflow-hidden"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.01 * index }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

interface PiecePreviewProps {
  shape: { row: number; col: number }[];
  element: ElementType;
  delay: number;
}

const PiecePreview = ({ shape, element, delay }: PiecePreviewProps) => {
  const maxRow = Math.max(...shape.map(s => s.row)) + 1;
  const maxCol = Math.max(...shape.map(s => s.col)) + 1;
  const pieceSize = 24;
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        y: [0, -8, 0],
        scale: 1,
        rotate: [0, 2, -2, 0],
      }}
      transition={{ 
        opacity: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        scale: { delay, duration: 0.5, type: 'spring' },
        rotate: { delay: delay + 0.3, duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {/* Piece glow */}
      <motion.div 
        className="absolute inset-0 rounded-xl blur-lg -z-10"
        style={{ backgroundColor: ELEMENT_COLORS[element].glow, transform: 'scale(1.4)' }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: delay,
        }}
      />
      
      {/* Piece container */}
      <div 
        className="relative p-2.5 rounded-xl border border-white/20"
        style={{
          background: 'linear-gradient(145deg, rgba(40, 40, 60, 0.9), rgba(30, 30, 45, 0.95))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div 
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${maxCol}, ${pieceSize}px)`,
            gridTemplateRows: `repeat(${maxRow}, ${pieceSize}px)`,
          }}
        >
          {Array.from({ length: maxRow * maxCol }).map((_, index) => {
            const row = Math.floor(index / maxCol);
            const col = index % maxCol;
            const isBlock = shape.some(s => s.row === row && s.col === col);
            
            if (isBlock) {
              return <BlockCell key={index} element={element} size={pieceSize} delay={delay + 0.1} />;
            }
            
            return <div key={index} style={{ width: pieceSize, height: pieceSize }} />;
          })}
        </div>
      </div>
    </motion.div>
  );
};

const PieceTray = () => {
  return (
    <motion.div
      className="flex items-end justify-center gap-5 mt-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <PiecePreview shape={PIECE_SHAPES.L} element="fire" delay={0.5} />
      <PiecePreview shape={PIECE_SHAPES.T} element="water" delay={0.6} />
      <PiecePreview shape={PIECE_SHAPES.Square} element="acid" delay={0.7} />
    </motion.div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="flex flex-col items-center">
      <GameGridPreview />
      <PieceTray />
    </div>
  );
};

export default HeroBlockDisplay;
