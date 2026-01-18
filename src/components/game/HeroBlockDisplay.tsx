import { motion } from 'framer-motion';

// Element colors matching the game
const ELEMENT_COLORS = {
  fire: { bg: '#FF6B4A', glow: 'rgba(255, 107, 74, 0.6)', emoji: '🔥' },
  water: { bg: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', emoji: '💧' },
  wood: { bg: '#A1662F', glow: 'rgba(161, 102, 47, 0.6)', emoji: '🪵' },
  stone: { bg: '#6B7280', glow: 'rgba(107, 114, 128, 0.6)', emoji: '🪨' },
  acid: { bg: '#22C55E', glow: 'rgba(34, 197, 94, 0.6)', emoji: '🧪' },
  helium: { bg: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)', emoji: '🎈' },
};

type ElementType = keyof typeof ELEMENT_COLORS;

const BLOCK_SIZE = 36;

interface BlockCellProps {
  element: ElementType;
  delay?: number;
}

const BlockCell = ({ element, delay = 0 }: BlockCellProps) => {
  const { bg, glow, emoji } = ELEMENT_COLORS[element];
  
  return (
    <motion.div
      className="rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        backgroundColor: bg,
        boxShadow: `
          0 4px 0 ${bg}99,
          0 6px 12px ${glow},
          inset 0 2px 4px rgba(255,255,255,0.4)
        `,
        border: '2px solid rgba(255,255,255,0.3)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay, 
        duration: 0.3, 
        type: 'spring', 
        stiffness: 400 
      }}
    >
      {/* Shine */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-t-md" />
      <span className="relative z-10" style={{ fontSize: BLOCK_SIZE * 0.5 }}>{emoji}</span>
    </motion.div>
  );
};

// Left tower stack
const LeftTower = () => {
  const blocks: ElementType[] = ['fire', 'fire', 'water', 'stone', 'wood'];
  
  return (
    <motion.div 
      className="flex flex-col-reverse gap-1"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {blocks.map((element, i) => (
        <BlockCell key={i} element={element} delay={0.3 + i * 0.08} />
      ))}
    </motion.div>
  );
};

// Right tower stack
const RightTower = () => {
  const blocks: ElementType[] = ['acid', 'helium', 'water', 'fire', 'stone'];
  
  return (
    <motion.div 
      className="flex flex-col-reverse gap-1"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {blocks.map((element, i) => (
        <BlockCell key={i} element={element} delay={0.35 + i * 0.08} />
      ))}
    </motion.div>
  );
};

// Center floating piece with beam
const CenterPiece = () => {
  const shape: { row: number; col: number; element: ElementType }[] = [
    { row: 0, col: 0, element: 'water' },
    { row: 0, col: 1, element: 'water' },
    { row: 1, col: 0, element: 'water' },
    { row: 1, col: 1, element: 'water' },
  ];
  
  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {/* Downward beam/glow */}
      <motion.div
        className="absolute top-full left-1/2 -translate-x-1/2 w-20 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(59, 130, 246, 0.4) 0%,
            rgba(59, 130, 246, 0.2) 30%,
            rgba(59, 130, 246, 0.05) 70%,
            transparent 100%
          )`,
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
          scaleY: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating piece */}
      <motion.div
        className="relative p-2 rounded-xl"
        style={{
          background: 'linear-gradient(145deg, rgba(40, 40, 60, 0.9), rgba(25, 25, 40, 0.95))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 30px rgba(59, 130, 246, 0.3)',
          border: '2px solid rgba(255,255,255,0.15)',
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
        <div className="grid grid-cols-2 gap-1">
          {shape.map((block, i) => (
            <BlockCell key={i} element={block.element} delay={0.5 + i * 0.05} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <motion.div 
      className="flex items-end justify-center gap-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LeftTower />
      <CenterPiece />
      <RightTower />
    </motion.div>
  );
};

export default HeroBlockDisplay;
