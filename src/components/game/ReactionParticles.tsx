import React, { useEffect, useState, useRef, memo } from 'react';
import { Position } from '@/game/types';

interface Particle {
  id: string;
  x: number;
  y: number;
  endX: number;
  endY: number;
  type: 'burn' | 'extinguish' | 'dissolve';
  emoji: string;
  delay: number;
  size: number;
  duration: number;
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

// Reduced particle counts for better performance
const particleConfig = {
  burn: {
    emojis: ['🔥', '✨', '💥', '⚡'],
    count: 3,
  },
  extinguish: {
    emojis: ['💧', '💦', '🌊', '❄️'],
    count: 3,
  },
  dissolve: {
    emojis: ['🫧', '💀', '☠️', '🧪'],
    count: 2,
  },
};

// Use CSS animations instead of Framer Motion for particles
const ReactionParticles: React.FC<ReactionParticlesProps> = memo(({
  trigger,
  cellSize = 44,
  gridOffset = { x: 0, y: 0 }
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!trigger || trigger.positions.length === 0) return;

    const config = particleConfig[trigger.type];
    const newParticles: Particle[] = [];

    // Cap positions to avoid too many particles at once
    const positions = trigger.positions.length > 6 ? trigger.positions.slice(0, 6) : trigger.positions;

    positions.forEach((pos) => {
      const centerX = gridOffset.x + (pos.x + 0.5) * cellSize;
      const centerY = gridOffset.y + (pos.y + 0.5) * cellSize;

      for (let i = 0; i < config.count; i++) {
        const angle = (Math.PI * 2 * i) / config.count + Math.random() * 0.5;
        const distance = 30 + Math.random() * 50;
        const duration = 0.6 + Math.random() * 0.3;

        newParticles.push({
          id: `${trigger.timestamp}-${pos.x}-${pos.y}-${i}`,
          x: centerX,
          y: centerY,
          endX: Math.cos(angle) * distance,
          endY: Math.sin(angle) * distance - 20,
          type: trigger.type,
          emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
          delay: Math.random() * 0.1,
          size: 12 + Math.random() * 10,
          duration,
        });
      }
    });

    // Use Set for O(1) cleanup instead of O(n*m) .filter with .some
    const newIds = new Set(newParticles.map(p => p.id));
    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles after animation completes
    cleanupTimerRef.current = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newIds.has(p.id)));
    }, 1200);

    return () => {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, [trigger, cellSize, gridOffset]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute particle-animate"
          style={{
            fontSize: particle.size,
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            '--end-x': `${particle.endX}px`,
            '--end-y': `${particle.endY}px`,
            '--particle-duration': `${particle.duration}s`,
            '--particle-delay': `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          } as React.CSSProperties}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
});

export default ReactionParticles;
