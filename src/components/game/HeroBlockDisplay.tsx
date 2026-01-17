import { motion } from 'framer-motion';

// Element colors matching the game
const ELEMENT_COLORS = {
  fire: { bg: 'hsl(15, 90%, 55%)', glow: 'rgba(239, 68, 68, 0.6)', emoji: '🔥' },
  water: { bg: 'hsl(200, 80%, 55%)', glow: 'rgba(59, 130, 246, 0.6)', emoji: '💧' },
  wood: { bg: 'hsl(30, 50%, 35%)', glow: 'rgba(180, 83, 9, 0.6)', emoji: '🪵' },
  stone: { bg: 'hsl(0, 0%, 45%)', glow: 'rgba(107, 114, 128, 0.6)', emoji: '🪨' },
  acid: { bg: 'hsl(120, 80%, 40%)', glow: 'rgba(34, 197, 94, 0.6)', emoji: '🧪' },
  helium: { bg: 'hsl(330, 80%, 70%)', glow: 'rgba(236, 72, 153, 0.6)', emoji: '🎈' },
};

type ElementType = keyof typeof ELEMENT_COLORS;

const CELL_SIZE = 28;
const GRID_SIZE = 8;

// Pre-placed blocks on the grid to show gameplay
const PLACED_BLOCKS: { row: number; col: number; element: ElementType }[] = [
  // Some fire blocks
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
      className="rounded-md flex items-center justify-center shadow-md border border-white/20"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        boxShadow: `0 2px 8px ${glow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay, 
        duration: 0.3, 
        type: 'spring', 
        stiffness: 300 
      }}
    >
      <span style={{ fontSize: size * 0.55 }}>{emoji}</span>
    </motion.div>
  );
};

const GameGridPreview = () => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Grid glow */}
      <div 
        className="absolute inset-0 rounded-xl blur-xl opacity-40"
        style={{ 
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.4), rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4))',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Grid container */}
      <div 
        className="relative rounded-xl p-2 border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 30, 0.95))',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Grid cells */}
        <div 
          className="grid gap-0.5"
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
                  delay={0.05 * index * 0.1}
                />
              );
            }
            
            return (
              <div
                key={index}
                className="rounded-sm"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
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
  const pieceSize = 20;
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: [0, -4, 0],
      }}
      transition={{ 
        opacity: { delay, duration: 0.4 },
        y: { delay: delay + 0.5, duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      {/* Piece glow */}
      <div 
        className="absolute inset-0 rounded-lg blur-md opacity-50"
        style={{ backgroundColor: ELEMENT_COLORS[element].glow, transform: 'scale(1.3)' }}
      />
      
      {/* Piece container */}
      <div 
        className="relative p-2 rounded-lg"
        style={{
          background: 'rgba(30, 30, 40, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
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
      className="flex items-end justify-center gap-4 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <PiecePreview shape={PIECE_SHAPES.L} element="fire" delay={0.4} />
      <PiecePreview shape={PIECE_SHAPES.T} element="water" delay={0.5} />
      <PiecePreview shape={PIECE_SHAPES.Square} element="acid" delay={0.6} />
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
