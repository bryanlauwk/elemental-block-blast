import { motion } from 'framer-motion';

interface ElementBadge {
  id: string;
  emoji: string;
  gradient: string;
  glowColor: string;
  position: { x: string; y: string };
  size: number;
  floatDelay: number;
}

// Responsive positions: default (mobile), md (tablet), lg (desktop)
const elementBadges: ElementBadge[] = [
  { 
    id: 'fire', 
    emoji: '🔥', 
    gradient: 'from-orange-500 to-red-600',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    position: { x: '8%', y: '32%' }, // Pushed further left for tablets
    size: 48,
    floatDelay: 0
  },
  { 
    id: 'water', 
    emoji: '💧', 
    gradient: 'from-blue-400 to-blue-600',
    glowColor: 'rgba(96, 165, 250, 0.5)',
    position: { x: '22%', y: '20%' }, // Top left area
    size: 42,
    floatDelay: 0.3
  },
  { 
    id: 'wood', 
    emoji: '🪵', 
    gradient: 'from-amber-600 to-amber-800',
    glowColor: 'rgba(217, 119, 6, 0.5)',
    position: { x: '5%', y: '58%' }, // Lower left
    size: 44,
    floatDelay: 0.6
  },
  { 
    id: 'stone', 
    emoji: '🪨', 
    gradient: 'from-gray-400 to-gray-600',
    glowColor: 'rgba(156, 163, 175, 0.5)',
    position: { x: '88%', y: '28%' }, // Top right
    size: 46,
    floatDelay: 0.2
  },
  { 
    id: 'acid', 
    emoji: '🧪', 
    gradient: 'from-green-400 to-emerald-600',
    glowColor: 'rgba(74, 222, 128, 0.5)',
    position: { x: '92%', y: '52%' }, // Right side
    size: 44,
    floatDelay: 0.5
  },
  { 
    id: 'helium', 
    emoji: '🎈', 
    gradient: 'from-pink-400 to-pink-600',
    glowColor: 'rgba(244, 114, 182, 0.5)',
    position: { x: '78%', y: '18%' }, // Top right corner
    size: 40,
    floatDelay: 0.8
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
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isPlaying ? 0 : 1, 
            scale: isPlaying ? 0 : 1,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.4, type: 'spring', stiffness: 200 },
            y: {
              duration: 3 + badge.floatDelay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: badge.floatDelay,
            }
          }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-lg opacity-60"
            style={{ backgroundColor: badge.glowColor }}
          />
          
          {/* Badge container */}
          <div 
            className={`relative w-full h-full rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-lg border-2 border-white/20`}
          >
            {/* Inner highlight */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
            
            {/* Emoji */}
            <span 
              className="relative text-center select-none"
              style={{ fontSize: badge.size * 0.5 }}
            >
              {badge.emoji}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ElementMascots;
