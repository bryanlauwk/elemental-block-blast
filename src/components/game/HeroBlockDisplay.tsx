import { motion } from 'framer-motion';

const BLOCK_COLORS = {
  red: { bg: '#E84545', light: '#FF6B6B', dark: '#C73636' },
  cyan: { bg: '#5ED9ED', light: '#8AE6F5', dark: '#3CBFD4' },
  yellow: { bg: '#FFD93D', light: '#FFE66D', dark: '#E6C235' },
  green: { bg: '#6BCB77', light: '#8FD99A', dark: '#52B55E' },
  blue: { bg: '#4E6BFF', light: '#7A8FFF', dark: '#3A54E6' },
  purple: { bg: '#9D65C9', light: '#B88AD9', dark: '#7F4FAD' },
  orange: { bg: '#FF9F45', light: '#FFB86C', dark: '#E68A35' },
};

type BlockColor = keyof typeof BLOCK_COLORS;

interface Block3DProps {
  color: BlockColor;
  width: number;
  height: number;
  emoji?: string;
  delay?: number;
}

const Block3D = ({ color, width, height, emoji, delay = 0 }: Block3DProps) => {
  const colors = BLOCK_COLORS[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="relative"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Main block face */}
      <div
        className="absolute inset-0 rounded-lg flex items-center justify-center text-2xl"
        style={{
          backgroundColor: colors.bg,
          boxShadow: `
            inset 0 2px 0 ${colors.light},
            inset 0 -3px 0 ${colors.dark},
            0 4px 0 ${colors.dark},
            0 6px 12px rgba(0,0,0,0.3)
          `,
        }}
      >
        {emoji && <span className="drop-shadow-md">{emoji}</span>}
      </div>
    </motion.div>
  );
};

const LeftBlockTower = () => {
  return (
    <div className="flex flex-col items-end gap-0.5">
      {/* Top small block */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Block3D color="red" width={44} height={44} emoji="🔥" delay={0.1} />
      </motion.div>
      
      {/* Middle row - 2 blocks */}
      <div className="flex gap-0.5">
        <Block3D color="green" width={44} height={44} emoji="🌿" delay={0.2} />
        <Block3D color="cyan" width={44} height={44} delay={0.25} />
      </div>
      
      {/* Wide block */}
      <Block3D color="blue" width={92} height={44} emoji="💧" delay={0.3} />
      
      {/* Bottom row */}
      <div className="flex gap-0.5">
        <Block3D color="purple" width={44} height={44} delay={0.35} />
        <Block3D color="orange" width={44} height={44} emoji="⚗️" delay={0.4} />
      </div>
    </div>
  );
};

const RightBlockTower = () => {
  return (
    <div className="flex flex-col items-start gap-0.5">
      {/* Top row - offset */}
      <div className="flex gap-0.5 ml-11">
        <Block3D color="yellow" width={44} height={44} emoji="🎈" delay={0.15} />
      </div>
      
      {/* Second row */}
      <div className="flex gap-0.5">
        <Block3D color="cyan" width={44} height={44} delay={0.2} />
        <Block3D color="green" width={44} height={44} emoji="🪨" delay={0.25} />
      </div>
      
      {/* Third row - wide */}
      <Block3D color="orange" width={92} height={44} delay={0.3} />
      
      {/* Bottom row */}
      <div className="flex gap-0.5">
        <Block3D color="blue" width={44} height={44} emoji="💀" delay={0.35} />
        <Block3D color="red" width={44} height={44} delay={0.4} />
      </div>
    </div>
  );
};

const FloatingPiece = () => {
  return (
    <div className="relative flex flex-col items-center">
      {/* T-shaped piece */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        {/* Top of T */}
        <div className="flex gap-0.5 mb-0.5">
          <Block3D color="yellow" width={36} height={36} delay={0} />
          <Block3D color="yellow" width={36} height={36} delay={0.05} />
          <Block3D color="yellow" width={36} height={36} delay={0.1} />
        </div>
        {/* Stem of T */}
        <div className="flex justify-center">
          <Block3D color="yellow" width={36} height={36} delay={0.15} />
        </div>
      </motion.div>
      
      {/* Cyan beam */}
      <motion.div
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 w-12 h-32"
        style={{
          background: 'linear-gradient(180deg, #5ED9ED 0%, rgba(94, 217, 237, 0.4) 50%, transparent 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
        }}
      />
    </div>
  );
};

const GroundSpotlight = () => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-8"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(94, 217, 237, 0.6) 0%, rgba(94, 217, 237, 0.2) 40%, transparent 70%)',
        filter: 'blur(8px)',
      }}
    />
  );
};

export const HeroBlockDisplay = () => {
  return (
    <div className="relative flex items-end justify-center gap-6 h-72 pt-8">
      {/* Left tower */}
      <div className="flex-shrink-0">
        <LeftBlockTower />
      </div>
      
      {/* Center floating piece */}
      <div className="flex-shrink-0 -mb-4">
        <FloatingPiece />
      </div>
      
      {/* Right tower */}
      <div className="flex-shrink-0">
        <RightBlockTower />
      </div>
      
      {/* Ground spotlight */}
      <GroundSpotlight />
    </div>
  );
};

export default HeroBlockDisplay;
