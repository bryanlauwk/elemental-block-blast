import { motion } from 'framer-motion';

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color1: string;
  color2: string;
  duration: number;
  delay: number;
}

const orbs: Orb[] = [
  { id: 1, x: -10, y: 10, size: 400, color1: '#FF69B4', color2: '#FF1493', duration: 20, delay: 0 },
  { id: 2, x: 80, y: -5, size: 350, color1: '#00CED1', color2: '#00FFFF', duration: 25, delay: 2 },
  { id: 3, x: 60, y: 70, size: 450, color1: '#9B59B6', color2: '#8E44AD', duration: 22, delay: 1 },
  { id: 4, x: -5, y: 60, size: 300, color1: '#FF6B35', color2: '#FF8C00', duration: 18, delay: 3 },
  { id: 5, x: 40, y: -10, size: 320, color1: '#32CD32', color2: '#00FF7F', duration: 24, delay: 0.5 },
  { id: 6, x: 90, y: 50, size: 280, color1: '#FFD700', color2: '#FFA500', duration: 21, delay: 1.5 },
];

export const RainbowOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle at 30% 30%, ${orb.color1}, ${orb.color2}, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: 0.4,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default RainbowOrbs;
