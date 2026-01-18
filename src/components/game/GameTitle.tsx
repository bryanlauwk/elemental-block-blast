import { motion } from 'framer-motion';
import { Flame, Droplets, TreeDeciduous, Mountain, Wind } from 'lucide-react';

// Cohesive color palette for ELEMENTAL - cyan to purple gradient flow
const elementalColors = [
  { bg: '#00E5FF', shadow: '#0097A7' }, // E - Bright Cyan
  { bg: '#00D4E8', shadow: '#0088A0' }, // L - Cyan
  { bg: '#00C4D0', shadow: '#007A88' }, // E - Teal Cyan
  { bg: '#6366F1', shadow: '#4338CA' }, // M - Indigo
  { bg: '#8B5CF6', shadow: '#6D28D9' }, // E - Violet
  { bg: '#A855F7', shadow: '#7C3AED' }, // N - Purple
  { bg: '#C084FC', shadow: '#9333EA' }, // T - Light Purple
  { bg: '#D946EF', shadow: '#A21CAF' }, // A - Fuchsia
  { bg: '#EC4899', shadow: '#BE185D' }, // L - Pink
];

// BLAST - icy white with strong cyan shadow
const blastColors = [
  { bg: '#FFFFFF', shadow: '#0891B2' }, // B
  { bg: '#FFFFFF', shadow: '#0891B2' }, // L
  { bg: '#FFFFFF', shadow: '#0891B2' }, // A
  { bg: '#FFFFFF', shadow: '#0891B2' }, // S
  { bg: '#FFFFFF', shadow: '#0891B2' }, // T
];

// Element icons using Lucide with professional styling
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
      initial={{ opacity: 0, y: 30, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.04,
        type: 'spring',
        stiffness: 300,
        damping: 15
      }}
      className={`relative inline-block font-black tracking-tight ${
        isSecondWord 
          ? 'text-[3rem] sm:text-[4rem] md:text-[5.5rem]' 
          : 'text-[1.8rem] sm:text-[2.4rem] md:text-[3.2rem]'
      }`}
      style={{
        fontFamily: "'Fredoka One', 'Arial Black', sans-serif",
        color: color.bg,
        textShadow: isSecondWord 
          ? `
            3px 3px 0 ${color.shadow},
            5px 5px 0 ${color.shadow},
            7px 7px 0 ${color.shadow},
            9px 9px 0 ${color.shadow},
            10px 10px 0 rgba(0,0,0,0.4),
            0 0 40px ${color.shadow}80
          `
          : `
            2px 2px 0 ${color.shadow},
            3px 3px 0 ${color.shadow},
            4px 4px 0 ${color.shadow},
            5px 5px 0 rgba(0,0,0,0.3),
            0 0 25px ${color.bg}50
          `,
        WebkitTextStroke: isSecondWord ? '2px rgba(0,0,0,0.1)' : '1px rgba(0,0,0,0.1)',
        letterSpacing: isSecondWord ? '0.02em' : '0.04em',
        lineHeight: 1,
      }}
    >
      {letter}
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
        delay: 0.6 + index * 0.1,
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
      className="flex flex-col items-center gap-1 relative px-4"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Glow behind title */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(99,102,241,0.25) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />
      
      {/* First word - ELEMENTAL */}
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

      {/* Second word - BLAST - larger, bolder, icy white */}
      <div className="flex items-center justify-center -mt-1 sm:-mt-2 md:-mt-3">
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

      {/* Element Icons Row - USP Showcase with proper spacing */}
      <motion.div 
        className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 mt-6 sm:mt-8 md:mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {elementIcons.map((element, index) => (
          <ElementIcon key={element.name} element={element} index={index} />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default GameTitle;