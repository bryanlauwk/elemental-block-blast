import { motion } from 'framer-motion';

import fireMascot from '@/assets/mascots/fire.png';
import waterMascot from '@/assets/mascots/water.png';
import woodMascot from '@/assets/mascots/wood.png';
import stoneMascot from '@/assets/mascots/stone.png';
import acidMascot from '@/assets/mascots/acid.png';
import heliumMascot from '@/assets/mascots/helium.png';

interface MascotConfig {
  id: string;
  src: string;
  position: { x: string; y: string };
  size: number;
  floatDelay: number;
  floatDuration: number;
  rotation: number;
}

const mascots: MascotConfig[] = [
  { 
    id: 'fire', 
    src: fireMascot, 
    position: { x: '8%', y: '35%' }, 
    size: 55, 
    floatDelay: 0, 
    floatDuration: 3.5,
    rotation: -5
  },
  { 
    id: 'water', 
    src: waterMascot, 
    position: { x: '82%', y: '32%' }, 
    size: 50, 
    floatDelay: 0.5, 
    floatDuration: 4,
    rotation: 5
  },
  { 
    id: 'wood', 
    src: woodMascot, 
    position: { x: '5%', y: '58%' }, 
    size: 48, 
    floatDelay: 1, 
    floatDuration: 3.8,
    rotation: 4
  },
  { 
    id: 'stone', 
    src: stoneMascot, 
    position: { x: '85%', y: '55%' }, 
    size: 45, 
    floatDelay: 1.5, 
    floatDuration: 4.2,
    rotation: -3
  },
  { 
    id: 'acid', 
    src: acidMascot, 
    position: { x: '12%', y: '75%' }, 
    size: 42, 
    floatDelay: 0.8, 
    floatDuration: 3.2,
    rotation: 6
  },
  { 
    id: 'helium', 
    src: heliumMascot, 
    position: { x: '78%', y: '72%' }, 
    size: 42, 
    floatDelay: 1.2, 
    floatDuration: 4.5,
    rotation: -4
  },
];

interface ElementMascotsProps {
  isPlaying?: boolean;
}

export const ElementMascots = ({ isPlaying = false }: ElementMascotsProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {mascots.map((mascot) => (
        <motion.div
          key={mascot.id}
          className="absolute pointer-events-auto cursor-pointer"
          style={{
            left: mascot.position.x,
            top: mascot.position.y,
            width: mascot.size,
            height: mascot.size,
          }}
          initial={{ 
            opacity: 0, 
            scale: 0.5,
            rotate: mascot.rotation 
          }}
          animate={{ 
            opacity: isPlaying ? 0 : 1, 
            scale: isPlaying ? 0.5 : 1,
            rotate: mascot.rotation,
            y: [0, -12, 0],
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.5,
            transition: { duration: 0.3 }
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
            y: {
              duration: mascot.floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: mascot.floatDelay,
            }
          }}
          whileHover={{
            scale: 1.15,
            rotate: mascot.rotation + (mascot.rotation > 0 ? -10 : 10),
            transition: { duration: 0.2 }
          }}
        >
          <motion.img
            src={mascot.src}
            alt={`${mascot.id} mascot`}
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
              mixBlendMode: 'multiply',
              background: 'transparent',
            }}
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: mascot.floatDelay + 0.5,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ElementMascots;
