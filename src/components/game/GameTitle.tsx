import { motion } from 'framer-motion';
import { Flame, Droplets, TreeDeciduous, Mountain, Wind, Crown } from 'lucide-react';

// OG-inspired colors - warm gradient for ELEMENTAL (fire/gold tones)
const elementalColors = [
  { bg: '#FF6B35', shadow: '#C44D1B' }, // E - Fire Orange
  { bg: '#FF7F40', shadow: '#CC5020' }, // L - Orange
  { bg: '#FF9344', shadow: '#CC6620' }, // E - Light Orange
  { bg: '#FFA94D', shadow: '#CC7A20' }, // M - Gold Orange
  { bg: '#FFBE56', shadow: '#CC8E25' }, // E - Warm Gold
  { bg: '#FFD25F', shadow: '#CCA230' }, // N - Gold
  { bg: '#FFE168', shadow: '#CCB535' }, // T - Light Gold
  { bg: '#FFF071', shadow: '#CCC340' }, // A - Bright Gold (crown)
  { bg: '#FFFA7A', shadow: '#CCD045' }, // L - Yellow Gold
];

// OG-inspired BLOCK BLAST - Cyan/Teal energy theme
const blockBlastColors = [
  // BLOCK - Warm tones transitioning
  { bg: '#FFB347', shadow: '#CC8020' }, // B
  { bg: '#FFC864', shadow: '#CC9530' }, // L
  { bg: '#FFDD82', shadow: '#CCAA50' }, // O
  { bg: '#E8E0A0', shadow: '#B8AD70' }, // C
  { bg: '#C0DEC0', shadow: '#90AB90' }, // K
  // BLAST - Cyan energy
  { bg: '#00E5FF', shadow: '#006080' }, // B - Bright Cyan
  { bg: '#00D8F5', shadow: '#005570' }, // L
  { bg: '#00CBEB', shadow: '#004A60' }, // A
  { bg: '#00BEE0', shadow: '#003F50' }, // S
  { bg: '#00B0D5', shadow: '#003440' }, // T
];

// Element icons with OG-inspired styling
const elementIcons = [
  { 
    Icon: Flame, 
    name: 'Fire',
    bgGradient: 'linear-gradient(145deg, #FF6B35 0%, #F7931E 50%, #E85D04 100%)',
    shadowColor: '#9D2A04',
    iconColor: '#FFFFFF',
    glowColor: '#FF6B35'
  },
  { 
    Icon: Droplets, 
    name: 'Water',
    bgGradient: 'linear-gradient(145deg, #00B4D8 0%, #0096C7 50%, #0077B6 100%)',
    shadowColor: '#023E8A',
    iconColor: '#FFFFFF',
    glowColor: '#00B4D8'
  },
  { 
    Icon: TreeDeciduous, 
    name: 'Wood',
    bgGradient: 'linear-gradient(145deg, #8B5A2B 0%, #6B4423 50%, #5D3A1A 100%)',
    shadowColor: '#3D2314',
    iconColor: '#C4A574',
    glowColor: '#8B5A2B'
  },
  { 
    Icon: Mountain, 
    name: 'Stone',
    bgGradient: 'linear-gradient(145deg, #8D8D8D 0%, #6B6B6B 50%, #4A4A4A 100%)',
    shadowColor: '#2D2D2D',
    iconColor: '#D4D4D4',
    glowColor: '#8D8D8D'
  },
  { 
    Icon: Wind, 
    name: 'Helium',
    bgGradient: 'linear-gradient(145deg, #84D98A 0%, #4CAF50 50%, #2E7D32 100%)',
    shadowColor: '#1B5E20',
    iconColor: '#E8F5E9',
    glowColor: '#4CAF50'
  },
];

// Subtle letter rotations
const elementalRotations = [1, -0.5, 0.5, -1, 0.5, -0.5, 1, -0.5, 0.5];
const blockBlastRotations = [-0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 1, -0.5, 0.5, -1];

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string };
  index: number;
  isSecondWord?: boolean;
  hasCrown?: boolean;
  rotation?: number;
}

const BlockLetter = ({ letter, color, index, isSecondWord, hasCrown, rotation = 0 }: BlockLetterProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 40, scale: 0.3, rotateX: -90, rotateZ: rotation * 2 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, rotateZ: rotation }}
      transition={{ 
        delay: index * 0.04,
        type: 'spring',
        stiffness: 350,
        damping: 12
      }}
      whileHover={{ 
        scale: 1.15, 
        y: -8,
        rotateZ: rotation * 1.5,
        transition: { duration: 0.15 }
      }}
      className={`relative inline-block font-black cursor-default select-none ${
        isSecondWord 
          ? 'text-[2.2rem] sm:text-[2.8rem] md:text-[3.8rem] lg:text-[4.5rem]' 
          : 'text-[2rem] sm:text-[2.5rem] md:text-[3.2rem] lg:text-[4rem]'
      }`}
      style={{
        fontFamily: "'Bangers', 'Impact', 'Arial Black', sans-serif",
        fontStyle: 'italic',
        color: color.bg,
        transform: `rotate(${rotation}deg)`,
        textShadow: isSecondWord 
          ? `
            0 2px 0 rgba(255,255,255,0.6),
            3px 3px 0 ${color.shadow},
            5px 5px 0 ${color.shadow},
            6px 6px 12px rgba(0,0,0,0.5),
            0 0 50px ${color.bg}80,
            0 0 80px ${color.bg}50,
            0 0 120px ${color.bg}30
          `
          : `
            0 2px 0 rgba(255,255,255,0.6),
            3px 3px 0 ${color.shadow},
            5px 5px 0 ${color.shadow},
            6px 6px 12px rgba(0,0,0,0.5),
            0 0 40px ${color.bg}70,
            0 0 60px ${color.bg}40
          `,
        WebkitTextStroke: isSecondWord ? '1.5px rgba(0,0,0,0.2)' : '1.5px rgba(0,0,0,0.2)',
        letterSpacing: '0.02em',
        lineHeight: 1,
      }}
    >
      {letter}
      {hasCrown && (
        <motion.div
          className="absolute -top-3 sm:-top-4 md:-top-6 lg:-top-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
        >
          <motion.div
            animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Crown 
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              strokeWidth={2.5}
              style={{
                color: '#FFD700',
                filter: `
                  drop-shadow(0 2px 0 #CC7700)
                  drop-shadow(0 3px 0 #AA5500)
                  drop-shadow(0 4px 0 rgba(0,0,0,0.4))
                  drop-shadow(0 0 20px rgba(255,215,0,0.9))
                  drop-shadow(0 0 40px rgba(255,150,0,0.6))
                `,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.span>
  );
};

interface ElementIconProps {
  element: typeof elementIcons[0];
  index: number;
}

const ElementIcon = ({ element, index }: ElementIconProps) => {
  const { Icon } = element;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: 0.8 + index * 0.1,
        type: 'spring',
        stiffness: 250,
        damping: 15
      }}
      whileHover={{ scale: 1.12, y: -6 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer group"
    >
      {/* Glow effect behind icon */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{ 
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
        style={{
          background: element.glowColor,
          filter: 'blur(12px)',
        }}
      />
      
      {/* Main icon container */}
      <div
        className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center transition-shadow duration-200"
        style={{
          background: element.bgGradient,
          boxShadow: `
            0 5px 0 ${element.shadowColor},
            0 7px 0 rgba(0,0,0,0.3),
            inset 0 2px 6px rgba(255,255,255,0.4),
            0 10px 30px rgba(0,0,0,0.3),
            0 0 30px ${element.glowColor}50
          `,
          border: '2px solid rgba(255,255,255,0.3)',
        }}
      >
        {/* Top shine bar */}
        <div 
          className="absolute top-1 left-2 right-2 h-3 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
          }}
        />
        
        {/* Lucide Icon */}
        <Icon 
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 drop-shadow-lg relative z-10"
          style={{ color: element.iconColor }}
          strokeWidth={2.5}
        />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <span className="text-[10px] sm:text-xs font-semibold text-white/80 whitespace-nowrap">
          {element.name}
        </span>
      </div>
    </motion.div>
  );
};

// Animated energy ring component (like the OG image)
const EnergyRing = () => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center pointer-events-none"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2, duration: 0.6 }}
  >
    {/* Outer fire ring */}
    <motion.div
      className="absolute w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{
        background: 'conic-gradient(from 0deg, transparent 0%, #FF6B35 20%, #FFB347 40%, transparent 60%, #00E5FF 80%, #00B4D8 90%, transparent 100%)',
        filter: 'blur(8px)',
        opacity: 0.4,
      }}
    />
    
    {/* Inner energy glow */}
    <motion.div
      className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[360px] md:h-[360px] lg:w-[440px] lg:h-[440px] rounded-full"
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: 'radial-gradient(circle, rgba(255,180,0,0.4) 0%, rgba(255,100,0,0.2) 40%, transparent 70%)',
        filter: 'blur(20px)',
      }}
    />

    {/* Cyan accent ring */}
    <motion.div
      className="absolute w-[260px] h-[260px] sm:w-[330px] sm:h-[330px] md:w-[420px] md:h-[420px] lg:w-[520px] lg:h-[520px] rounded-full"
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      style={{
        border: '3px solid transparent',
        borderTopColor: '#00E5FF40',
        borderRightColor: '#FF6B3540',
        filter: 'blur(2px)',
      }}
    />
  </motion.div>
);

// Floating spark particles
const SparkParticle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1.5 h-1.5 rounded-full"
    initial={{ opacity: 0, x, y, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      y: [y, y - 60],
      scale: [0, 1, 0]
    }}
    transition={{ 
      delay,
      duration: 2,
      repeat: Infinity,
      repeatDelay: Math.random() * 2
    }}
    style={{
      background: Math.random() > 0.5 ? '#FF6B35' : '#00E5FF',
      boxShadow: `0 0 8px ${Math.random() > 0.5 ? '#FF6B35' : '#00E5FF'}`,
    }}
  />
);

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLOCK BLAST';

  // Generate random spark positions
  const sparks = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 0.3,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 100 + 50,
  }));

  return (
    <motion.div 
      className="flex flex-col items-center relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Energy ring effect */}
      <EnergyRing />
      
      {/* Floating sparks */}
      {sparks.map((spark, i) => (
        <SparkParticle key={i} {...spark} />
      ))}

      {/* Unified logo container */}
      <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 z-10">
        {/* Soft glowing backdrop */}
        <div 
          className="absolute inset-0 -z-10 rounded-3xl"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 50% 50%, rgba(255,107,53,0.2) 0%, transparent 50%)
            `,
            filter: 'blur(40px)',
          }}
        />
        
        {/* Colorful glow behind title - OG style */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 30% 40%, rgba(255,107,53,0.25) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 40%, rgba(255,200,100,0.2) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 50% 70%, rgba(0,229,255,0.3) 0%, transparent 50%)
            `,
            filter: 'blur(50px)',
          }}
        />
        
        {/* Title words stacked */}
        <div className="flex flex-col items-center -space-y-1 sm:-space-y-2 md:-space-y-3 lg:-space-y-4">
          {/* First line - ELEMENTAL */}
          <div className="flex items-center justify-center">
            {word1.split('').map((letter, i) => (
              <BlockLetter
                key={`w1-${i}`}
                letter={letter}
                color={elementalColors[i]}
                index={i}
                hasCrown={i === 7}
                rotation={elementalRotations[i]}
              />
            ))}
          </div>

          {/* Second line - BLOCK BLAST with enhanced glow */}
          <motion.div 
            className="flex items-center justify-center"
            animate={{ 
              filter: [
                'drop-shadow(0 0 40px rgba(0,229,255,0.5))',
                'drop-shadow(0 0 70px rgba(0,229,255,0.8))',
                'drop-shadow(0 0 40px rgba(0,229,255,0.5))'
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {word2.split('').map((letter, i) => {
              if (letter === ' ') return <span key={`space-${i}`} className="w-3 sm:w-4 md:w-6 lg:w-8" />;
              const colorIndex = i < 5 ? i : i - 1;
              return (
                <BlockLetter 
                  key={`w2-${i}`} 
                  letter={letter} 
                  color={blockBlastColors[colorIndex]} 
                  index={9 + i}
                  isSecondWord
                  rotation={blockBlastRotations[colorIndex]}
                />
              );
            })}
          </motion.div>
        </div>

        {/* Element Icons Row */}
        <motion.div 
          className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mt-4 sm:mt-5 md:mt-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {elementIcons.map((element, index) => (
            <ElementIcon key={element.name} element={element} index={index} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameTitle;
