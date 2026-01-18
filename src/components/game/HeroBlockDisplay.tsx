import { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Vibrant neon block colors - Block Blast style
const BLOCK_COLORS = {
  red: { bg: '#FF4757', shadow: '#C0392B', highlight: '#FF8A80' },
  orange: { bg: '#FF9F43', shadow: '#E17055', highlight: '#FFEAA7' },
  yellow: { bg: '#FFC312', shadow: '#F79F1F', highlight: '#FFF59D' },
  green: { bg: '#2ED573', shadow: '#00B894', highlight: '#A3CB38' },
  cyan: { bg: '#00D2D3', shadow: '#00838F', highlight: '#81ECEC' },
  blue: { bg: '#54A0FF', shadow: '#2E86DE', highlight: '#A3D9FF' },
  purple: { bg: '#A55EEA', shadow: '#8854D0', highlight: '#D2B4DE' },
};

// Responsive block sizes
const BLOCK_SIZE_MOBILE = 28;
const BLOCK_SIZE_TABLET = 34;
const BLOCK_SIZE_DESKTOP = 40;

// Floor block sizes (slightly smaller)
const FLOOR_BLOCK_MOBILE = 24;
const FLOOR_BLOCK_TABLET = 28;
const FLOOR_BLOCK_DESKTOP = 32;

// Single 3D glossy plastic block
interface BlockProps {
  color: { bg: string; shadow: string; highlight: string };
  size?: number;
  delay?: number;
  opacity?: number;
}

const Block = ({ color, size = BLOCK_SIZE_MOBILE, delay = 0, opacity = 0.85 }: BlockProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity }}
      transition={{ 
        delay,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      className="relative overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        boxShadow: `
          inset 3px 3px 8px ${color.highlight}70,
          inset -2px -2px 6px rgba(0,0,0,0.25),
          0 3px 0 ${color.shadow},
          0 4px 10px rgba(0,0,0,0.25)
        `,
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: '5px',
      }}
    >
      {/* Top shine spot */}
      <div 
        className="absolute top-1 left-1 w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, transparent 70%)',
        }}
      />
      {/* Top gradient gloss */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t" />
    </motion.div>
  );
};

// Left tower - taller, 6-7 rows
const LeftTower = ({ blockSize }: { blockSize: number }) => {
  const colors = [
    [BLOCK_COLORS.purple],
    [BLOCK_COLORS.blue, BLOCK_COLORS.purple],
    [BLOCK_COLORS.cyan, BLOCK_COLORS.blue],
    [BLOCK_COLORS.blue, BLOCK_COLORS.purple],
    [BLOCK_COLORS.purple, BLOCK_COLORS.red],
    [BLOCK_COLORS.red, BLOCK_COLORS.orange],
    [BLOCK_COLORS.orange, BLOCK_COLORS.yellow],
  ];

  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ 
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="flex flex-col items-end"
      style={{ gap: '2px' }}
    >
      {colors.map((row, rowIdx) => (
        <div key={rowIdx} className="flex" style={{ gap: '2px' }}>
          {row.map((color, colIdx) => (
            <Block 
              key={`${rowIdx}-${colIdx}`} 
              color={color} 
              size={blockSize}
              delay={rowIdx * 0.05}
              opacity={0.9}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
};

// Right tower - taller, 6-7 rows
const RightTower = ({ blockSize }: { blockSize: number }) => {
  const colors = [
    [BLOCK_COLORS.green],
    [BLOCK_COLORS.green, BLOCK_COLORS.cyan],
    [BLOCK_COLORS.cyan, BLOCK_COLORS.green],
    [BLOCK_COLORS.yellow, BLOCK_COLORS.green],
    [BLOCK_COLORS.orange, BLOCK_COLORS.yellow],
    [BLOCK_COLORS.red, BLOCK_COLORS.orange],
    [BLOCK_COLORS.purple, BLOCK_COLORS.red],
  ];

  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ 
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.5
      }}
      className="flex flex-col items-start"
      style={{ gap: '2px' }}
    >
      {colors.map((row, rowIdx) => (
        <div key={rowIdx} className="flex" style={{ gap: '2px' }}>
          {row.map((color, colIdx) => (
            <Block 
              key={`${rowIdx}-${colIdx}`} 
              color={color} 
              size={blockSize}
              delay={rowIdx * 0.05 + 0.1}
              opacity={0.9}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
};

// Floor blocks - grounding element
const FloorBlocks = ({ blockSize }: { blockSize: number }) => {
  // Create a rainbow pattern for the floor
  const floorColors = [
    BLOCK_COLORS.purple,
    BLOCK_COLORS.blue,
    BLOCK_COLORS.cyan,
    BLOCK_COLORS.green,
    BLOCK_COLORS.yellow,
    BLOCK_COLORS.orange,
    BLOCK_COLORS.red,
    BLOCK_COLORS.purple,
    BLOCK_COLORS.blue,
    BLOCK_COLORS.cyan,
    BLOCK_COLORS.green,
    BLOCK_COLORS.yellow,
  ];

  return (
    <div className="flex justify-center" style={{ gap: '3px' }}>
      {floorColors.map((color, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ 
            delay: 0.8 + idx * 0.03,
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          className="relative overflow-hidden shrink-0"
          style={{
            width: blockSize,
            height: blockSize,
            backgroundColor: color.bg,
            boxShadow: `
              inset 2px 2px 6px ${color.highlight}60,
              inset -1px -1px 4px rgba(0,0,0,0.2),
              0 2px 0 ${color.shadow},
              0 3px 8px rgba(0,0,0,0.2)
            `,
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
          }}
        >
          {/* Small shine */}
          <div 
            className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t" />
        </motion.div>
      ))}
    </div>
  );
};

interface HeroBlockDisplayProps {
  children?: ReactNode;
}

export const HeroBlockDisplay = ({ children }: HeroBlockDisplayProps) => {
  return (
    <div className="flex flex-col items-center w-full relative">
      {/* Container for towers and CTA */}
      <div className="relative flex items-end justify-center gap-4 sm:gap-8 md:gap-12 w-full">
        
        {/* Left tower - responsive sizing */}
        <div className="hidden md:block">
          <LeftTower blockSize={BLOCK_SIZE_DESKTOP} />
        </div>
        <div className="hidden sm:block md:hidden">
          <LeftTower blockSize={BLOCK_SIZE_TABLET} />
        </div>
        <div className="block sm:hidden">
          <LeftTower blockSize={BLOCK_SIZE_MOBILE} />
        </div>

        {/* Center - CTA buttons */}
        {children && (
          <motion.div 
            className="flex flex-col items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {children}
          </motion.div>
        )}

        {/* Right tower - responsive sizing */}
        <div className="hidden md:block">
          <RightTower blockSize={BLOCK_SIZE_DESKTOP} />
        </div>
        <div className="hidden sm:block md:hidden">
          <RightTower blockSize={BLOCK_SIZE_TABLET} />
        </div>
        <div className="block sm:hidden">
          <RightTower blockSize={BLOCK_SIZE_MOBILE} />
        </div>
      </div>
      
      {/* Floor glow line */}
      <motion.div 
        className="w-full max-w-sm sm:max-w-md md:max-w-lg mt-4 sm:mt-6"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div 
          className="h-1 rounded-full mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.6) 20%, rgba(99,102,241,0.8) 50%, rgba(0,229,255,0.6) 80%, transparent 100%)',
            boxShadow: '0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(0,229,255,0.3)',
          }}
        />
      </motion.div>
      
      {/* Floor blocks - responsive sizing */}
      <div className="mt-3 sm:mt-4">
        <div className="hidden md:block">
          <FloorBlocks blockSize={FLOOR_BLOCK_DESKTOP} />
        </div>
        <div className="hidden sm:block md:hidden">
          <FloorBlocks blockSize={FLOOR_BLOCK_TABLET} />
        </div>
        <div className="block sm:hidden">
          <FloorBlocks blockSize={FLOOR_BLOCK_MOBILE} />
        </div>
      </div>
    </div>
  );
};

export default HeroBlockDisplay;
