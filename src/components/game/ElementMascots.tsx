import { motion } from 'framer-motion';

interface ElementBadge {
  id: string;
  emoji: string;
  gradient: string;
  glowColor: string;
  position: { x: string; y: string };
  size: number;
  floatDelay: number;
  rotateDirection: number;
}

const elementBadges: ElementBadge[] = [
  { 
    id: 'fire', 
    emoji: '🔥', 
    gradient: 'from-orange-400 via-orange-500 to-red-600',
    glowColor: 'rgba(251, 146, 60, 0.7)',
    position: { x: '5%', y: '28%' },
    size: 64,
    floatDelay: 0,
    rotateDirection: 1,
  },
  { 
    id: 'water', 
    emoji: '💧', 
    gradient: 'from-cyan-300 via-blue-400 to-blue-600',
    glowColor: 'rgba(34, 211, 238, 0.7)',
    position: { x: '18%', y: '15%' },
    size: 56,
    floatDelay: 0.3,
    rotateDirection: -1,
  },
  { 
    id: 'wood', 
    emoji: '🪵', 
    gradient: 'from-amber-500 via-amber-600 to-amber-800',
    glowColor: 'rgba(217, 119, 6, 0.7)',
    position: { x: '3%', y: '55%' },
    size: 58,
    floatDelay: 0.6,
    rotateDirection: 1,
  },
  { 
    id: 'stone', 
    emoji: '🪨', 
    gradient: 'from-gray-300 via-gray-400 to-gray-600',
    glowColor: 'rgba(156, 163, 175, 0.7)',
    position: { x: '88%', y: '22%' },
    size: 60,
    floatDelay: 0.2,
    rotateDirection: -1,
  },
  { 
    id: 'acid', 
    emoji: '🧪', 
    gradient: 'from-green-300 via-green-400 to-emerald-600',
    glowColor: 'rgba(74, 222, 128, 0.7)',
    position: { x: '92%', y: '48%' },
    size: 58,
    floatDelay: 0.5,
    rotateDirection: 1,
  },
  { 
    id: 'helium', 
    emoji: '🎈', 
    gradient: 'from-pink-300 via-pink-400 to-pink-600',
    glowColor: 'rgba(244, 114, 182, 0.7)',
    position: { x: '78%', y: '12%' },
    size: 54,
    floatDelay: 0.8,
    rotateDirection: -1,
  },
];

interface ElementMascotsProps {
  isPlaying?: boolean;
}

export const ElementMascots = ({ isPlaying = false }: ElementMascotsProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {elementBadges.map((badge) => (
        <motion.div
          key={badge.id}
          className="absolute pointer-events-none"
          style={{
            left: badge.position.x,
            top: badge.position.y,
            width: badge.size,
            height: badge.size,
          }}
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ 
            opacity: isPlaying ? 0 : 1, 
            scale: isPlaying ? 0 : 1,
            y: [0, -15, 0],
            rotate: [badge.rotateDirection * -5, badge.rotateDirection * 5, badge.rotateDirection * -5],
          }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.5, type: 'spring', stiffness: 200 },
            y: {
              duration: 2.5 + badge.floatDelay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: badge.floatDelay,
            },
            rotate: {
              duration: 3 + badge.floatDelay * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: badge.floatDelay,
            }
          }}
        >
          {/* Outer glow ring */}
          <motion.div 
            className="absolute inset-[-8px] rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${badge.glowColor}, transparent 70%)`,
              filter: 'blur(8px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: badge.floatDelay,
            }}
          />

          {/* Inner glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-lg opacity-70"
            style={{ backgroundColor: badge.glowColor }}
          />
          
          {/* Badge container */}
          <div 
            className={`relative w-full h-full rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-xl border-3 border-white/30`}
            style={{
              boxShadow: `0 4px 20px ${badge.glowColor}, inset 0 2px 10px rgba(255,255,255,0.3)`,
            }}
          >
            {/* Inner highlight */}
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
            
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"
                animate={{
                  y: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: badge.floatDelay * 2,
                }}
              />
            </motion.div>
            
            {/* Emoji */}
            <motion.span 
              className="relative text-center select-none z-10"
              style={{ fontSize: badge.size * 0.5 }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: badge.floatDelay + 0.5,
              }}
            >
              {badge.emoji}
            </motion.span>
          </div>

          {/* Particle trail */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 6 - i * 1.5,
                height: 6 - i * 1.5,
                backgroundColor: badge.glowColor,
                left: '50%',
                bottom: -10 - i * 8,
                marginLeft: -(3 - i * 0.75),
              }}
              animate={{
                opacity: [0.8, 0.3, 0.8],
                scale: [1, 0.8, 1],
                y: [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: badge.floatDelay + i * 0.2,
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export default ElementMascots;
