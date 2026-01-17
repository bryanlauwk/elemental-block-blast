import { motion } from 'framer-motion';

const BLOCK_SIZE = 44;

interface BlockConfig {
  element: string;
  color: string;
  glow: string;
}

const elements: BlockConfig[] = [
  { element: 'H', color: 'hsl(15, 90%, 55%)', glow: 'hsl(15, 90%, 65%)' }, // Fire
  { element: 'O', color: 'hsl(200, 80%, 50%)', glow: 'hsl(200, 80%, 60%)' }, // Water
  { element: 'C', color: 'hsl(90, 60%, 45%)', glow: 'hsl(90, 60%, 55%)' }, // Wood
  { element: 'Si', color: 'hsl(35, 30%, 45%)', glow: 'hsl(35, 30%, 55%)' }, // Stone
  { element: 'Cl', color: 'hsl(80, 70%, 50%)', glow: 'hsl(80, 70%, 60%)' }, // Acid
  { element: 'He', color: 'hsl(280, 60%, 60%)', glow: 'hsl(280, 60%, 70%)' }, // Helium
];

const SingleBlock = ({ 
  element, 
  color, 
  glow, 
  delay = 0,
  size = BLOCK_SIZE 
}: BlockConfig & { delay?: number; size?: number }) => (
  <motion.div
    className="relative rounded-lg"
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
    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-md">
      {element}
    </span>
  </motion.div>
);

// Left stack of blocks
const LeftBlockStack = () => {
  const stackBlocks = [
    { ...elements[0], row: 0, col: 0 },
    { ...elements[2], row: 0, col: 1 },
    { ...elements[1], row: 1, col: 0 },
    { ...elements[3], row: 1, col: 1 },
    { ...elements[4], row: 2, col: 0 },
    { ...elements[5], row: 2, col: 1 },
  ];

  return (
    <motion.div 
      className="relative hidden sm:block"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="grid grid-cols-2 gap-1">
        {stackBlocks.map((block, i) => (
          <SingleBlock 
            key={i} 
            {...block} 
            delay={0.6 + i * 0.08}
            size={36}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Right stack of blocks
const RightBlockStack = () => {
  const stackBlocks = [
    { ...elements[1], row: 0, col: 0 },
    { ...elements[0], row: 0, col: 1 },
    { ...elements[5], row: 1, col: 0 },
    { ...elements[2], row: 1, col: 1 },
    { ...elements[3], row: 2, col: 0 },
    { ...elements[4], row: 2, col: 1 },
  ];

  return (
    <motion.div 
      className="relative hidden sm:block"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="grid grid-cols-2 gap-1">
        {stackBlocks.map((block, i) => (
          <SingleBlock 
            key={i} 
            {...block} 
            delay={0.6 + i * 0.08}
            size={36}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Hero T-piece in center
const HeroPiece = () => {
  const pieceBlocks = [
    { x: 0, y: 0, ...elements[0] },
    { x: 1, y: 0, ...elements[1] },
    { x: 2, y: 0, ...elements[2] },
    { x: 1, y: 1, ...elements[3] },
  ];

  return (
    <motion.div 
      className="relative"
      initial={{ y: 30, opacity: 0, scale: 0.8 }}
      animate={{ 
        y: 0, 
        opacity: 1, 
        scale: 1,
      }}
      transition={{ 
        delay: 0.8,
        type: 'spring',
        stiffness: 150,
        damping: 15,
      }}
    >
      {/* Glow underneath */}
      <motion.div
        className="absolute -inset-8 rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(circle, hsl(160, 70%, 45%) 0%, transparent 70%)',
          opacity: 0.4,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* The piece */}
      <motion.div 
        className="relative grid gap-1"
        style={{
          gridTemplateColumns: `repeat(3, ${BLOCK_SIZE}px)`,
          gridTemplateRows: `repeat(2, ${BLOCK_SIZE}px)`,
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {pieceBlocks.map((block, i) => (
          <div 
            key={i}
            style={{
              gridColumn: block.x + 1,
              gridRow: block.y + 1,
            }}
          >
            <SingleBlock {...block} delay={0.9 + i * 0.1} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10 mt-4">
      <LeftBlockStack />
      <HeroPiece />
      <RightBlockStack />
    </div>
  );
};

export default HeroBlockDisplay;
