import { motion } from 'framer-motion';
import { Flame, Droplets, TreeDeciduous, Mountain, Wind, Crown } from 'lucide-react';

// Rainbow spectrum for ELEMENTAL - vibrant arcade style
const elementalColors = [
  { bg: '#FF4136', shadow: '#C41E3A' }, // E - Red
  { bg: '#FF851B', shadow: '#CC6600' }, // L - Orange
  { bg: '#FFD700', shadow: '#CC9900' }, // E - Yellow
  { bg: '#2ECC40', shadow: '#228B22' }, // M - Green
  { bg: '#39CCCC', shadow: '#008B8B' }, // E - Teal
  { bg: '#0074D9', shadow: '#004080' }, // N - Blue
  { bg: '#6366F1', shadow: '#4338CA' }, // T - Indigo
  { bg: '#B10DC9', shadow: '#800080' }, // A - Purple (crown goes here)
  { bg: '#F012BE', shadow: '#A0007A' }, // L - Magenta
];

// Orange/Gold gradient for BLOCK - warm arcade tones
const blockColors = [
  { bg: '#FF9500', shadow: '#CC6600' }, // B - Orange
  { bg: '#FFB347', shadow: '#CC8800' }, // L - Light Orange
  { bg: '#FFC125', shadow: '#B8860B' }, // O - Gold
  { bg: '#FFD700', shadow: '#CC9900' }, // C - Yellow Gold
  { bg: '#FFDF00', shadow: '#CCAA00' }, // K - Bright Gold
];

// Vibrant cyan/teal gradient for BLAST
const blastColors = [
  { bg: '#00E5FF', shadow: '#006994' }, // B - Bright Cyan
  { bg: '#00D4F0', shadow: '#005F7A' }, // L - Cyan
  { bg: '#00C4E0', shadow: '#005566' }, // A - Teal Cyan
  { bg: '#00B4D0', shadow: '#004C52' }, // S - Teal
  { bg: '#00A4C0', shadow: '#00444A' }, // T - Deep Teal
];

// Element icons with professional styling
const elementIcons = [
  { 
    Icon: Flame, 
    name: 'Fire',
    bgGradient: 'linear-gradient(145deg, #FF6B35 0%, #F7931E 50%, #E85D04 100%)',
    shadowColor: '#9D2A04',
    iconColor: '#FFFFFF'
  },
  { 
    Icon: Droplets, 
    name: 'Water',
    bgGradient: 'linear-gradient(145deg, #00B4D8 0%, #0096C7 50%, #0077B6 100%)',
    shadowColor: '#023E8A',
    iconColor: '#FFFFFF'
  },
  { 
    Icon: TreeDeciduous, 
    name: 'Wood',
    bgGradient: 'linear-gradient(145deg, #8B5A2B 0%, #6B4423 50%, #5D3A1A 100%)',
    shadowColor: '#3D2314',
    iconColor: '#C4A574'
  },
  { 
    Icon: Mountain, 
    name: 'Stone',
    bgGradient: 'linear-gradient(145deg, #8D8D8D 0%, #6B6B6B 50%, #4A4A4A 100%)',
    shadowColor: '#2D2D2D',
    iconColor: '#D4D4D4'
  },
  { 
    Icon: Wind, 
    name: 'Helium',
    bgGradient: 'linear-gradient(145deg, #84D98A 0%, #4CAF50 50%, #2E7D32 100%)',
    shadowColor: '#1B5E20',
    iconColor: '#E8F5E9'
  },
];

// Wild letter rotations for dynamic, hand-drawn arcade feel
const elementalRotations = [3, -2, 2.5, -3, 1.5, -2, 3, -1.5, 2];
const blockRotations = [-1.5, 2, -2, 1.5, -1];
const blastRotations = [-2, 3, -2.5, 2, -3];

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
          ? 'text-[3rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[7rem]' 
          : 'text-[2rem] sm:text-[2.6rem] md:text-[3.5rem] lg:text-[4.5rem]'
      }`}
      style={{
        fontFamily: "'Bangers', 'Impact', 'Arial Black', sans-serif",
        fontStyle: 'italic',
        color: color.bg,
        transform: `rotate(${rotation}deg)`,
        textShadow: isSecondWord 
          ? `
            0 3px 0 rgba(255,255,255,0.5),
            4px 4px 0 ${color.shadow},
            6px 6px 0 ${color.shadow},
            8px 8px 0 ${color.shadow},
            10px 10px 0 rgba(0,0,0,0.4),
            12px 12px 20px rgba(0,0,0,0.5),
            0 0 60px ${color.bg}70,
            0 0 100px ${color.bg}40
          `
          : `
            0 2px 0 rgba(255,255,255,0.5),
            3px 3px 0 ${color.shadow},
            5px 5px 0 ${color.shadow},
            6px 6px 10px rgba(0,0,0,0.4),
            0 0 40px ${color.bg}50
          `,
        WebkitTextStroke: isSecondWord ? '2px rgba(0,0,0,0.2)' : '1.5px rgba(0,0,0,0.15)',
        letterSpacing: isSecondWord ? '0.05em' : '0.03em',
        lineHeight: 1,
      }}
    >
      {letter}
      {/* Crown integrated on the letter */}
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
                  drop-shadow(0 0 20px rgba(255,215,0,0.8))
                `,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.span>
  );
};

// Removed separate GoldenCrown - now integrated into BlockLetter

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
      {/* Main icon container */}
      <div
        className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center transition-shadow duration-200"
        style={{
          background: element.bgGradient,
          boxShadow: `
            0 5px 0 ${element.shadowColor},
            0 7px 0 rgba(0,0,0,0.3),
            inset 0 2px 6px rgba(255,255,255,0.35),
            0 10px 25px rgba(0,0,0,0.25)
          `,
          border: '2px solid rgba(255,255,255,0.25)',
        }}
      >
        {/* Top shine bar */}
        <div 
          className="absolute top-1 left-2 right-2 h-3 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
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

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLOCK';
  const word3 = 'BLAST';

  return (
    <motion.div 
      className="flex flex-col items-center relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Unified logo container with subtle glow background */}
      <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Soft glowing backdrop for visual grouping */}
        <div 
          className="absolute inset-0 -z-10 rounded-3xl"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)
            `,
            filter: 'blur(30px)',
          }}
        />
        
        {/* Colorful glow behind title */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 50% 30% at 30% 30%, rgba(255,65,54,0.15) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 70% 30%, rgba(0,116,217,0.15) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 50% 70%, rgba(0,229,255,0.2) 0%, transparent 50%)
            `,
            filter: 'blur(40px)',
          }}
        />
        
        {/* Title words stacked - WILD typography */}
        <div className="flex flex-col items-center -space-y-1 sm:-space-y-2 md:-space-y-3 lg:-space-y-4">
          {/* First word - ELEMENTAL (Rainbow) with crown on A */}
          <div className="flex items-center justify-center">
            {word1.split('').map((letter, i) => (
              <BlockLetter
                key={`w1-${i}`}
                letter={letter}
                color={elementalColors[i]}
                index={i}
                hasCrown={i === 7} // Crown on "A"
                rotation={elementalRotations[i]}
              />
            ))}
          </div>

          {/* Second word - BLOCK (Orange/Gold) */}
          <div className="flex items-center justify-center">
            {word2.split('').map((letter, i) => (
              <BlockLetter 
                key={`w2-${i}`} 
                letter={letter} 
                color={blockColors[i]} 
                index={9 + i}
                isSecondWord
                rotation={blockRotations[i]}
              />
            ))}
          </div>

          {/* Third word - BLAST (Cyan/Teal) - MASSIVE with pulsing glow */}
          <motion.div 
            className="flex items-center justify-center"
            animate={{ 
              filter: ['drop-shadow(0 0 30px rgba(0,229,255,0.4))', 'drop-shadow(0 0 50px rgba(0,229,255,0.7))', 'drop-shadow(0 0 30px rgba(0,229,255,0.4))']
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {word3.split('').map((letter, i) => (
              <BlockLetter 
                key={`w3-${i}`} 
                letter={letter} 
                color={blastColors[i]} 
                index={14 + i}
                isSecondWord
                rotation={blastRotations[i]}
              />
            ))}
          </motion.div>
        </div>

        {/* Element Icons Row - tighter spacing, part of logo */}
        <motion.div 
          className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mt-2 sm:mt-3 md:mt-4"
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
