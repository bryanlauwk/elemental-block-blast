import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Position } from '@/game/types';

interface Particle {
  id: string;
  x: number;
  y: number;
  type: 'burn' | 'extinguish' | 'dissolve';
  emoji: string;
  delay: number;
  angle: number;
  distance: number;
  size: number;
}

interface ReactionParticlesProps {
  trigger: {
    type: 'burn' | 'extinguish' | 'dissolve';
    positions: Position[];
    timestamp: number;
  } | null;
  cellSize?: number;
  gridOffset?: { x: number; y: number };
}

// Subtle, quick particle bursts so they don't obscure the board.
const particleConfig = {
  burn: {
    emojis: ['✨', '🔥'],
    colors: ['#ff6b35', '#ff9f1c', '#ffcd3c'],
    count: 3,
  },
  extinguish: {
    emojis: ['💧', '✨'],
    colors: ['#00b4d8', '#48cae4', '#90e0ef'],
    count: 3,
  },
  dissolve: {
    emojis: ['✨', '🧪'],
    colors: ['#52b788', '#40916c', '#74c69d'],
    count: 2,
  },
};

const ReactionParticles: React.FC<ReactionParticlesProps> = ({ 
  trigger, 
  cellSize = 44,
  gridOffset = { x: 0, y: 0 }
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<
    { id: string; x: number; y: number; type: 'burn' | 'extinguish' | 'dissolve' }[]
  >([]);

  useEffect(() => {
    if (!trigger || trigger.positions.length === 0) return;

    const config = particleConfig[trigger.type];
    const newParticles: Particle[] = [];

    trigger.positions.forEach((pos) => {
      const centerX = gridOffset.x + (pos.x + 0.5) * cellSize;
      const centerY = gridOffset.y + (pos.y + 0.5) * cellSize;

      for (let i = 0; i < config.count; i++) {
        const angle = (Math.PI * 2 * i) / config.count + Math.random() * 0.5;
        const distance = 22 + Math.random() * 30;

        newParticles.push({
          id: `${trigger.timestamp}-${pos.x}-${pos.y}-${i}`,
          x: centerX,
          y: centerY,
          type: trigger.type,
          emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
          delay: Math.random() * 0.1,
          angle,
          distance,
          size: 10 + Math.random() * 6,
        });
      }
    });

    setParticles(prev => [...prev, ...newParticles]);

    // Spawn one cheap shockwave ring per source position
    const newShocks = trigger.positions.map((pos) => ({
      id: `s-${trigger.timestamp}-${pos.x}-${pos.y}`,
      x: gridOffset.x + (pos.x + 0.5) * cellSize,
      y: gridOffset.y + (pos.y + 0.5) * cellSize,
      type: trigger.type,
    }));
    setShockwaves((prev) => [...prev, ...newShocks]);
    const shockTimeout = setTimeout(() => {
      setShockwaves((prev) => prev.filter((s) => !newShocks.some((ns) => ns.id === s.id)));
    }, 600);

    // Clean up particles after the (now shorter) animation
    const timeout = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 800);

    return () => {
      clearTimeout(timeout);
      clearTimeout(shockTimeout);
    };
  }, [trigger, cellSize, gridOffset]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {/* Shockwave rings — single CSS animation each */}
      {shockwaves.map((s) => (
        <span
          key={s.id}
          className={`neon-shockwave ${
            s.type === 'burn' ? 'neon-shockwave--magenta' : ''
          }`}
          style={{
            left: s.x,
            top: s.y,
            width: cellSize * 1.6,
            height: cellSize * 1.6,
          }}
        />
      ))}
      <AnimatePresence>
        {particles.map((particle) => {
          const endX = Math.cos(particle.angle) * particle.distance;
          const endY = Math.sin(particle.angle) * particle.distance - 20; // Slight upward bias

          return (
            <motion.div
              key={particle.id}
              initial={{ 
                x: particle.x, 
                y: particle.y, 
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: particle.x + endX,
                y: particle.y + endY,
                scale: [0, 1, 0.6],
                opacity: [0.9, 0.8, 0],
                rotate: particle.type === 'dissolve' ? [0, 120] : [0, 30],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.45 + Math.random() * 0.25,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{ 
                fontSize: particle.size,
                left: -particle.size / 2,
                top: -particle.size / 2,
              }}
            >
              {particle.emoji}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ReactionParticles;
