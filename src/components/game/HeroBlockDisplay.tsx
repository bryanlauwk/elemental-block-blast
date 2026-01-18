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
const BLOCK_SIZE_MOBILE = 40;
const BLOCK_SIZE_TABLET = 48;
const BLOCK_SIZE_DESKTOP = 52;

// Single 3D glossy plastic block
interface BlockProps {
  color: { bg: string; shadow: string; highlight: string };
  size?: number;
  delay?: number;
}

const Block = ({ color, size = BLOCK_SIZE_MOBILE, delay = 0 }: BlockProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
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
          inset 4px 4px 10px ${color.highlight}80,
          inset -3px -3px 8px rgba(0,0,0,0.3),
          0 4px 0 ${color.shadow},
          0 6px 12px rgba(0,0,0,0.3)
        `,
        border: '1.5px solid rgba(255,255,255,0.4)',
        borderRadius: '6px',
      }}
    >
      {/* Top shine spot */}
      <div 
        className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
        }}
      />
      {/* Top gradient gloss */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t" />
      {/* Bottom shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent rounded-b" />
    </motion.div>
  );
};

// Left tower - 3 blocks wide x 5 tall (rectangular solid)
const LeftTower = ({ blockSize }: { blockSize: number }) => {
  const colors = [
    [BLOCK_COLORS.red, BLOCK_COLORS.orange, BLOCK_COLORS.yellow],
    [BLOCK_COLORS.orange, BLOCK_COLORS.yellow, BLOCK_COLORS.green],
    [BLOCK_COLORS.yellow, BLOCK_COLORS.green, BLOCK_COLORS.cyan],
    [BLOCK_COLORS.green, BLOCK_COLORS.cyan, BLOCK_COLORS.blue],
    [BLOCK_COLORS.cyan, BLOCK_COLORS.blue, BLOCK_COLORS.purple],
  ];

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="flex flex-col"
      style={{ gap: '2px' }}
    >
      {colors.map((row, rowIdx) => (
        <div key={rowIdx} className="flex" style={{ gap: '2px' }}>
          {row.map((color, colIdx) => (
            <Block 
              key={`${rowIdx}-${colIdx}`} 
              color={color} 
              size={blockSize}
              delay={rowIdx * 0.05 + colIdx * 0.02}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
};

// Right tower - 3 blocks wide x 5 tall (rectangular solid), mirrored colors
const RightTower = ({ blockSize }: { blockSize: number }) => {
  const colors = [
    [BLOCK_COLORS.purple, BLOCK_COLORS.blue, BLOCK_COLORS.cyan],
    [BLOCK_COLORS.blue, BLOCK_COLORS.cyan, BLOCK_COLORS.green],
    [BLOCK_COLORS.cyan, BLOCK_COLORS.green, BLOCK_COLORS.yellow],
    [BLOCK_COLORS.green, BLOCK_COLORS.yellow, BLOCK_COLORS.orange],
    [BLOCK_COLORS.yellow, BLOCK_COLORS.orange, BLOCK_COLORS.red],
  ];

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.5 // Offset from left tower
      }}
      className="flex flex-col"
      style={{ gap: '2px' }}
    >
      {colors.map((row, rowIdx) => (
        <div key={rowIdx} className="flex" style={{ gap: '2px' }}>
          {row.map((color, colIdx) => (
            <Block 
              key={`${rowIdx}-${colIdx}`} 
              color={color} 
              size={blockSize}
              delay={rowIdx * 0.05 + colIdx * 0.02 + 0.1}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
};

interface HeroBlockDisplayProps {
  children?: ReactNode;
}

export const HeroBlockDisplay = ({ children }: HeroBlockDisplayProps) => {
  return (
    <div className="flex flex-col items-center w-full mt-4 sm:mt-6">
      {/* Container for towers and CTA */}
      <div className="relative flex items-end justify-center gap-6 sm:gap-10 md:gap-14 w-full">
        
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
            className="flex flex-col items-center gap-3 sm:gap-4 pb-4 sm:pb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
    </div>
  );
};

export default HeroBlockDisplay;
