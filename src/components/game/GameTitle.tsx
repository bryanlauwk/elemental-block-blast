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
  { bg: '#B10DC9', shadow: '#800080' }, // A - Purple
  { bg: '#F012BE', shadow: '#A0007A' }, // L - Magenta
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

interface BlockLetterProps {
  letter: string;
  color: { bg: string; shadow: string };
  index: number;
  isSecondWord?: boolean;
}

const BlockLetter = ({ letter, color, index, isSecondWord }: BlockLetterProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 30, scale: 0.5, rotateX: -90 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ 
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.1, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`relative inline-block font-black tracking-tight cursor-default select-none ${
        isSecondWord 
          ? 'text-[3.5rem] sm:text-[4.5rem] md:text-[6rem]' 
          : 'text-[2.2rem] sm:text-[2.8rem] md:text-[3.5rem]'
      }`}
      style={{
        fontFamily: "'Fredoka One', 'Arial Black', sans-serif",
        color: color.bg,
        textShadow: isSecondWord 
          ? `
            0 2px 0 rgba(255,255,255,0.4),
            3px 3px 0 ${color.shadow},
            6px 6px 0 ${color.shadow},
            8px 8px 0 ${color.shadow},
            10px 10px 0 rgba(0,0,0,0.3),
            12px 12px 15px rgba(0,0,0,0.4),
            0 0 60px ${color.bg}60
          `
          : `
            0 1px 0 rgba(255,255,255,0.5),
            2px 2px 0 ${color.shadow},
            4px 4px 0 ${color.shadow},
            5px 5px 0 ${color.shadow},
            6px 6px 10px rgba(0,0,0,0.3),
            0 0 30px ${color.bg}40
          `,
        WebkitTextStroke: isSecondWord ? '2px rgba(0,0,0,0.15)' : '1.5px rgba(0,0,0,0.15)',
        letterSpacing: isSecondWord ? '0.03em' : '0.05em',
        lineHeight: 1,
      }}
    >
      {letter}
    </motion.span>
  );
};

// Golden Crown Component
const GoldenCrown = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        delay: 0.4,
        type: 'spring',
        stiffness: 200,
        damping: 12
      }}
      className="relative -mb-2 sm:-mb-3"
    >
      <motion.div
        animate={{ 
          y: [0, -4, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Crown 
          className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
          strokeWidth={2}
          style={{
            color: '#FFD700',
            filter: `
              drop-shadow(0 2px 0 #CC7700)
              drop-shadow(0 4px 0 #AA5500)
              drop-shadow(0 6px 0 rgba(0,0,0,0.3))
              drop-shadow(0 0 20px rgba(255,215,0,0.5))
            `,
          }}
        />
        {/* Crown sparkle effects */}
        <motion.div
          className="absolute -top-1 left-1/2 w-2 h-2 bg-white rounded-full"
          style={{ transform: 'translateX(-50%)' }}
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
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
      {/* Main icon container */}
      <div
        className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-shadow duration-200"
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
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 drop-shadow-lg relative z-10"
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
  const word2 = 'BLAST';

  return (
    <motion.div 
      className="flex flex-col items-center gap-0 relative px-4"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Colorful glow behind title */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 30% 40%, rgba(255,65,54,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 40%, rgba(0,116,217,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 50% 60%, rgba(0,229,255,0.25) 0%, transparent 50%)
          `,
          filter: 'blur(50px)',
        }}
      />
      
      {/* First word - ELEMENTAL (Rainbow) */}
      <div className="flex items-center justify-center">
        {word1.split('').map((letter, i) => (
          <BlockLetter
            key={`w1-${i}`}
            letter={letter}
            color={elementalColors[i]}
            index={i}
          />
        ))}
      </div>

      {/* Golden Crown */}
      <GoldenCrown />

      {/* Second word - BLAST (Cyan/Teal) */}
      <div className="flex items-center justify-center -mt-1 sm:-mt-2">
        {word2.split('').map((letter, i) => (
          <BlockLetter 
            key={`w2-${i}`} 
            letter={letter} 
            color={blastColors[i]} 
            index={9 + i}
            isSecondWord
          />
        ))}
      </div>

      {/* Element Icons Row */}
      <motion.div 
        className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 mt-6 sm:mt-8 md:mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {elementIcons.map((element, index) => (
          <ElementIcon key={element.name} element={element} index={index} />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default GameTitle;
