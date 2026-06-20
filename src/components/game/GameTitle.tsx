import { motion } from 'framer-motion';
import { Flame, Droplets, TreeDeciduous, Mountain, Wind } from 'lucide-react';

// OG image inspired colors - warm fire gradient for ELEMENTAL
const elementalColors = [
  { bg: '#FF4D4D', shadow: '#CC2020' }, // E - Red
  { bg: '#FF6633', shadow: '#CC4020' }, // L - Red-Orange
  { bg: '#FF8833', shadow: '#CC6020' }, // E - Orange
  { bg: '#FFAA33', shadow: '#CC8020' }, // M - Orange-Yellow
  { bg: '#FFCC33', shadow: '#CCA020' }, // E - Yellow
  { bg: '#FFE033', shadow: '#CCB020' }, // N - Light Yellow
  { bg: '#FFCC33', shadow: '#CCA020' }, // T - Yellow
  { bg: '#FFAA33', shadow: '#CC8020' }, // A - Orange-Yellow
  { bg: '#FF8833', shadow: '#CC6020' }, // L - Orange
];

// BLOCK BLAST colors from OG - warm to cyan transition
const blockBlastColors = [
  // BLOCK - Warm gold tones
  { bg: '#FFB84D', shadow: '#CC8520' }, // B
  { bg: '#FFC966', shadow: '#CC9530' }, // L
  { bg: '#FFDA80', shadow: '#CCA540' }, // O
  { bg: '#E6D9B3', shadow: '#B3A680' }, // C
  { bg: '#B3D9E6', shadow: '#80A6B3' }, // K
  // BLAST - Cyan/Teal
  { bg: '#00E5FF', shadow: '#007080' }, // B
  { bg: '#00D4EE', shadow: '#006570' }, // L
  { bg: '#00C4DD', shadow: '#005A60' }, // A
  { bg: '#00B4CC', shadow: '#004F50' }, // S
  { bg: '#00A4BB', shadow: '#004440' }, // T
];

// Element icons
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
        delay: index * 0.03,
        type: 'spring',
        stiffness: 400,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.1, 
        y: -4,
        transition: { duration: 0.15 }
      }}
      className={`relative inline-block font-black cursor-default select-none ${
        isSecondWord 
          ? 'text-[2.4rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem]' 
          : 'text-[1.8rem] sm:text-[2.2rem] md:text-[2.8rem] lg:text-[3.5rem]'
      }`}
      style={{
        fontFamily: "'Fredoka One', 'Bangers', 'Impact', sans-serif",
        color: color.bg,
        textShadow: `
          0 2px 0 rgba(255,255,255,0.4),
          2px 2px 0 ${color.shadow},
          4px 4px 0 ${color.shadow},
          5px 5px 8px rgba(0,0,0,0.4)
        `,
        WebkitTextStroke: '1px rgba(0,0,0,0.15)',
        letterSpacing: '0.01em',
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
        delay: 0.6 + index * 0.08,
        type: 'spring',
        stiffness: 300,
        damping: 15
      }}
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer group"
    >
      <div
        className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center"
        style={{
          background: element.bgGradient,
          boxShadow: `
            0 4px 0 ${element.shadowColor},
            0 6px 0 rgba(0,0,0,0.25),
            inset 0 2px 4px rgba(255,255,255,0.35),
            0 8px 20px rgba(0,0,0,0.2)
          `,
          border: '2px solid rgba(255,255,255,0.25)',
        }}
      >
        <div 
          className="absolute top-1 left-2 right-2 h-2.5 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
          }}
        />
        <Icon 
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 drop-shadow-md relative z-10"
          style={{ color: element.iconColor }}
          strokeWidth={2.5}
        />
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <span className="text-[10px] sm:text-xs font-semibold text-white/70 whitespace-nowrap">
          {element.name}
        </span>
      </div>
    </motion.div>
  );
};

// Static fire ring like in OG image
const FireRing = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
    {/* Outer fire/orange ring */}
    <div
      className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full"
      style={{
        background: 'conic-gradient(from 180deg, #FF6B35 0%, #FFB347 25%, #00E5FF 50%, #0096C7 75%, #FF6B35 100%)',
        opacity: 0.25,
        filter: 'blur(30px)',
      }}
    />
    {/* Inner warm glow */}
    <div
      className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[300px] md:h-[300px] lg:w-[380px] lg:h-[380px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(255,150,50,0.3) 0%, rgba(255,100,30,0.15) 50%, transparent 70%)',
      }}
    />
    {/* Cyan accent at bottom */}
    <div
      className="absolute w-[200px] h-[100px] sm:w-[260px] sm:h-[130px] md:w-[350px] md:h-[175px] lg:w-[440px] lg:h-[220px] rounded-full translate-y-[60px] sm:translate-y-[80px] md:translate-y-[100px] lg:translate-y-[120px]"
      style={{
        background: 'radial-gradient(ellipse, rgba(0,229,255,0.25) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }}
    />
  </div>
);

export const GameTitle = () => {
  const word1 = 'ELEMENTAL';
  const word2 = 'BLOCK BLAST';

  return (
    <motion.div 
      className="flex flex-col items-center relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Fire ring background like OG */}
      <FireRing />

      {/* Logo container */}
      <div className="relative p-2 sm:p-3 md:p-4 lg:p-5">
        {/* Title words stacked */}
        <div className="flex flex-col items-center gap-0">
          {/* First line - ELEMENTAL */}
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

          {/* Second line - BLOCK BLAST with neon shimmer sweep overlay */}
          <div className="relative flex items-center justify-center -mt-1 sm:-mt-2 md:-mt-3">
            {word2.split('').map((letter, i) => {
              if (letter === ' ') return <span key={`space-${i}`} className="w-2 sm:w-3 md:w-4 lg:w-5" />;
              const colorIndex = i < 5 ? i : i - 1;
              return (
                <BlockLetter 
                  key={`w2-${i}`} 
                  letter={letter} 
                  color={blockBlastColors[colorIndex]} 
                  index={9 + i}
                  isSecondWord
                />
              );
            })}
            {/* One-time shimmer sweep */}
            <motion.span
              aria-hidden
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '120%', opacity: [0, 0.85, 0] }}
              transition={{ delay: 1.1, duration: 1.4, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-y-0 w-1/3"
              style={{
                background:
                  'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                mixBlendMode: 'screen',
                filter: 'blur(2px)',
              }}
            />
          </div>
        </div>

        {/* Element Icons Row */}
        <motion.div 
          className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mt-4 sm:mt-5 md:mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
