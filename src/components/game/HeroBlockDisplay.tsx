import { motion } from 'framer-motion';

// Element colors - vibrant, game-style
const ELEMENTS = [
  { name: 'fire', bg: '#EF4444', emoji: '🔥', iconBg: 'linear-gradient(145deg, #EF4444, #DC2626)' },
  { name: 'water', bg: '#3B82F6', emoji: '💧', iconBg: 'linear-gradient(145deg, #3B82F6, #2563EB)' },
  { name: 'wood', bg: '#A1662F', emoji: '🪵', iconBg: 'linear-gradient(145deg, #A1662F, #8B5A2B)' },
  { name: 'stone', bg: '#78716C', emoji: '🪨', iconBg: 'linear-gradient(145deg, #78716C, #57534E)' },
  { name: 'helium', bg: '#22C55E', emoji: '🌿', iconBg: 'linear-gradient(145deg, #22C55E, #16A34A)' },
];

// Block colors for the stacks
const BLOCK_COLORS = [
  { bg: '#3B82F6', shadow: '#1D4ED8' }, // Blue
  { bg: '#EF4444', shadow: '#B91C1C' }, // Red
  { bg: '#06B6D4', shadow: '#0891B2' }, // Cyan
  { bg: '#22C55E', shadow: '#15803D' }, // Green
  { bg: '#F97316', shadow: '#C2410C' }, // Orange
  { bg: '#8B5CF6', shadow: '#6D28D9' }, // Purple
  { bg: '#EC4899', shadow: '#BE185D' }, // Pink
];

const BLOCK_SIZE = 48;

// Element icons row
const ElementIconsRow = () => {
  return (
    <motion.div
      className="flex items-center justify-center gap-2 sm:gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {ELEMENTS.map((element, i) => (
        <motion.div
          key={element.name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: element.iconBg,
            boxShadow: `0 4px 0 ${element.bg}99, 0 6px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)`,
            border: '2px solid rgba(255,255,255,0.25)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 400 }}
          whileHover={{ scale: 1.1, y: -2 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
          <span className="text-xl sm:text-2xl relative z-10">{element.emoji}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Single 3D block
interface BlockProps {
  color: { bg: string; shadow: string };
  size?: number;
  delay?: number;
}

const Block = ({ color, size = BLOCK_SIZE, delay = 0 }: BlockProps) => {
  return (
    <motion.div
      className="rounded-lg relative overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        boxShadow: `
          0 4px 0 ${color.shadow},
          0 6px 12px rgba(0,0,0,0.35),
          inset 0 3px 6px rgba(255,255,255,0.35),
          inset -2px -2px 4px rgba(0,0,0,0.15)
        `,
        border: '1px solid rgba(255,255,255,0.2)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 400, damping: 15 }}
    >
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent rounded-t-md" />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent" />
    </motion.div>
  );
};

// Left block stack - tetris style arrangement
const LeftBlockStack = () => {
  const blocks = [
    // Bottom row
    { color: BLOCK_COLORS[0], x: 0, y: 3 },
    { color: BLOCK_COLORS[0], x: 1, y: 3 },
    { color: BLOCK_COLORS[2], x: 2, y: 3 },
    // Second row
    { color: BLOCK_COLORS[1], x: 0, y: 2 },
    { color: BLOCK_COLORS[0], x: 1, y: 2 },
    // Third row
    { color: BLOCK_COLORS[1], x: 0, y: 1 },
    { color: BLOCK_COLORS[2], x: 1, y: 1 },
    // Top
    { color: BLOCK_COLORS[2], x: 0, y: 0 },
  ];

  const gap = 2;
  const width = 3 * (BLOCK_SIZE + gap);
  const height = 4 * (BLOCK_SIZE + gap);

  return (
    <motion.div
      className="relative"
      style={{ width, height }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {blocks.map((block, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + gap),
            top: block.y * (BLOCK_SIZE + gap),
          }}
        >
          <Block color={block.color} delay={0.4 + i * 0.05} />
        </div>
      ))}
    </motion.div>
  );
};

// Right block stack
const RightBlockStack = () => {
  const blocks = [
    // Bottom row
    { color: BLOCK_COLORS[2], x: 0, y: 3 },
    { color: BLOCK_COLORS[4], x: 1, y: 3 },
    { color: BLOCK_COLORS[4], x: 2, y: 3 },
    // Second row
    { color: BLOCK_COLORS[4], x: 1, y: 2 },
    { color: BLOCK_COLORS[4], x: 2, y: 2 },
    // Third row
    { color: BLOCK_COLORS[3], x: 1, y: 1 },
    { color: BLOCK_COLORS[3], x: 2, y: 1 },
    // Top
    { color: BLOCK_COLORS[3], x: 2, y: 0 },
  ];

  const gap = 2;
  const width = 3 * (BLOCK_SIZE + gap);
  const height = 4 * (BLOCK_SIZE + gap);

  return (
    <motion.div
      className="relative"
      style={{ width, height }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {blocks.map((block, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: block.x * (BLOCK_SIZE + gap),
            top: block.y * (BLOCK_SIZE + gap),
          }}
        >
          <Block color={block.color} delay={0.5 + i * 0.05} />
        </div>
      ))}
    </motion.div>
  );
};

// Center floating balloon/helium block with glow
const CenterBalloon = () => {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {/* Glow effect behind balloon */}
      <motion.div
        className="absolute w-32 h-32 rounded-full -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 0.2) 40%, transparent 70%)',
          filter: 'blur(10px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Balloon block */}
      <motion.div
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl relative overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #EC4899, #DB2777)',
          boxShadow: `
            0 6px 0 #BE185D,
            0 10px 20px rgba(236, 72, 153, 0.5),
            0 0 40px rgba(236, 72, 153, 0.4),
            inset 0 4px 8px rgba(255,255,255,0.4),
            inset -3px -3px 6px rgba(0,0,0,0.15)
          `,
          border: '2px solid rgba(255,255,255,0.3)',
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Shine */}
        <div className="absolute top-1 left-2 w-6 h-6 sm:w-8 sm:h-8 bg-white/40 rounded-full blur-sm" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent rounded-t-xl" />
        <span className="text-4xl sm:text-5xl relative z-10">🎈</span>
      </motion.div>

      {/* String/connection line */}
      <motion.div
        className="w-0.5 h-8 bg-gradient-to-b from-pink-400 to-transparent"
        animate={{
          scaleY: [1, 0.95, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

// Perspective floor grid
const PerspectiveFloor = () => {
  return (
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-20 pointer-events-none"
      style={{
        perspective: '200px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div
        className="w-full h-full"
        style={{
          background: `
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* Floor glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8"
        style={{
          background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </motion.div>
  );
};

export const HeroBlockDisplay = () => {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Element icons row */}
      <ElementIconsRow />

      {/* Main display with blocks and balloon */}
      <div className="relative flex items-end justify-center gap-4 sm:gap-8 mt-2">
        {/* Perspective floor */}
        <PerspectiveFloor />

        {/* Left stack */}
        <LeftBlockStack />

        {/* Center balloon */}
        <div className="flex flex-col items-center pb-4">
          <CenterBalloon />
        </div>

        {/* Right stack */}
        <RightBlockStack />
      </div>
    </motion.div>
  );
};

export default HeroBlockDisplay;
