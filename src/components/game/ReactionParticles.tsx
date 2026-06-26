import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Position } from '@/game/types';

interface Particle {
  id: string;
  x: number;
  y: number;
  type: 'burn' | 'extinguish' | 'dissolve' | 'bomb';
  emoji: string;
  delay: number;
  angle: number;
  distance: number;
  size: number;
  color?: string;
}

interface ReactionParticlesProps {
  trigger: {
    type: 'burn' | 'extinguish' | 'dissolve' | 'bomb';
    positions: Position[];
    centers?: Position[];
    timestamp: number;
  } | null;
  cellSize?: number;
  gridOffset?: { x: number; y: number };
}

// Subtle, quick particle bursts so they don't obscure the board.
const particleConfig = {
  burn: {
    emojis: ['✨'],
    colors: ['#ff9f1c'],
    count: 1,
  },
  extinguish: {
    emojis: ['✨'],
    colors: ['#48cae4'],
    count: 1,
  },
  dissolve: {
    emojis: ['✨'],
    colors: ['#52b788'],
    count: 1,
  },
};

const ReactionParticles: React.FC<ReactionParticlesProps> = ({ 
  trigger, 
  cellSize = 44,
  gridOffset = { x: 0, y: 0 }
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<
    { id: string; x: number; y: number; kind: 'reaction' | 'bomb' }[]
  >([]);
  const [bombFlashes, setBombFlashes] = useState<
    { id: string; x: number; y: number }[]
  >([]);

  useEffect(() => {
    if (!trigger || trigger.positions.length === 0) return;

    if (trigger.type === 'bomb') {
      const centers = trigger.centers ?? trigger.positions;
      const newParticles: Particle[] = [];
      const debrisColors = ['#fff3b0', '#ffb627', '#ff6b35', '#d62828', '#6c757d'];

      centers.forEach((pos) => {
        const cx = gridOffset.x + (pos.x + 0.5) * cellSize;
        const cy = gridOffset.y + (pos.y + 0.5) * cellSize;
        // Radial debris shards — fast outward, gravity-tinted downward bias.
        for (let i = 0; i < 14; i++) {
          const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.3;
          newParticles.push({
            id: `bomb-${trigger.timestamp}-${pos.x}-${pos.y}-${i}`,
            x: cx,
            y: cy,
            type: 'bomb',
            emoji: '',
            delay: Math.random() * 0.04,
            angle,
            distance: 60 + Math.random() * 90,
            size: 3 + Math.random() * 4,
            color: debrisColors[i % debrisColors.length],
          });
        }
      });

      setParticles((prev) => [...prev, ...newParticles]);

      // Big bomb shockwave + white flash per epicenter.
      const newShocks = centers.map((pos) => ({
        id: `bs-${trigger.timestamp}-${pos.x}-${pos.y}`,
        x: gridOffset.x + (pos.x + 0.5) * cellSize,
        y: gridOffset.y + (pos.y + 0.5) * cellSize,
        kind: 'bomb' as const,
      }));
      const newFlashes = centers.map((pos) => ({
        id: `bf-${trigger.timestamp}-${pos.x}-${pos.y}`,
        x: gridOffset.x + (pos.x + 0.5) * cellSize,
        y: gridOffset.y + (pos.y + 0.5) * cellSize,
      }));
      setShockwaves((prev) => [...prev, ...newShocks]);
      setBombFlashes((prev) => [...prev, ...newFlashes]);

      const shockTimeout = setTimeout(() => {
        setShockwaves((prev) => prev.filter((s) => !newShocks.some((ns) => ns.id === s.id)));
      }, 900);
      const flashTimeout = setTimeout(() => {
        setBombFlashes((prev) => prev.filter((f) => !newFlashes.some((nf) => nf.id === f.id)));
      }, 500);
      const particleTimeout = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      }, 950);
      return () => {
        clearTimeout(shockTimeout);
        clearTimeout(flashTimeout);
        clearTimeout(particleTimeout);
      };
    }

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
          size: 8 + Math.random() * 4,
        });
      }
    });

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles after the (now shorter) animation
    const timeout = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, [trigger, cellSize, gridOffset]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {/* Bomb white flash — quick high-intensity burst */}
      {bombFlashes.map((f) => (
        <motion.div
          key={f.id}
          className="absolute rounded-full"
          initial={{ opacity: 0.95, scale: 0.3 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            left: f.x,
            top: f.y,
            width: cellSize * 2.2,
            height: cellSize * 2.2,
            marginLeft: -(cellSize * 1.1),
            marginTop: -(cellSize * 1.1),
            background:
              'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,224,130,0.85) 25%, rgba(255,107,53,0.55) 55%, rgba(214,40,40,0) 80%)',
            mixBlendMode: 'screen',
            filter: 'blur(1px)',
          }}
        />
      ))}
      {/* Shockwave rings */}
      {shockwaves.map((s) => (
        s.kind === 'bomb' ? (
          <motion.span
            key={s.id}
            className="absolute rounded-full pointer-events-none"
            initial={{ opacity: 0.9, scale: 0.2 }}
            animate={{ opacity: 0, scale: 3.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              left: s.x,
              top: s.y,
              width: cellSize * 2.4,
              height: cellSize * 2.4,
              marginLeft: -(cellSize * 1.2),
              marginTop: -(cellSize * 1.2),
              border: '3px solid rgba(255,180,80,0.85)',
              boxShadow:
                '0 0 32px rgba(255,107,53,0.7), inset 0 0 24px rgba(214,40,40,0.55)',
            }}
          />
        ) : null
      ))}
      {/* Dark smoke ring follow-up for bomb */}
      {shockwaves.filter((s) => s.kind === 'bomb').map((s) => (
        <motion.span
          key={`${s.id}-smoke`}
          className="absolute rounded-full pointer-events-none"
          initial={{ opacity: 0.6, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.6 }}
          transition={{ duration: 0.85, delay: 0.1, ease: 'easeOut' }}
          style={{
            left: s.x,
            top: s.y,
            width: cellSize * 2.2,
            height: cellSize * 2.2,
            marginLeft: -(cellSize * 1.1),
            marginTop: -(cellSize * 1.1),
            background:
              'radial-gradient(circle, rgba(40,30,30,0) 35%, rgba(60,50,50,0.55) 55%, rgba(20,15,15,0) 85%)',
            filter: 'blur(2px)',
          }}
        />
      ))}
      <AnimatePresence>
        {particles.map((particle) => {
          const isBomb = particle.type === 'bomb';
          const endX = Math.cos(particle.angle) * particle.distance;
          const endY = isBomb
            ? Math.sin(particle.angle) * particle.distance + 30 // gravity drop for debris
            : Math.sin(particle.angle) * particle.distance - 20;

          if (isBomb) {
            return (
              <motion.div
                key={particle.id}
                initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 1 }}
                animate={{
                  x: particle.x + endX,
                  y: particle.y + endY,
                  opacity: [1, 1, 0],
                  scale: [1, 0.9, 0.4],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 + Math.random() * 0.25, delay: particle.delay, ease: 'easeOut' }}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  marginLeft: -particle.size / 2,
                  marginTop: -particle.size / 2,
                  background: particle.color,
                  boxShadow: `0 0 ${particle.size * 1.5}px ${particle.color}`,
                }}
              />
            );
          }

          return (
            <motion.div
              key={particle.id}
              initial={{ 
                x: particle.x, 
                y: particle.y, 
                scale: 0,
                opacity: 0.7,
              }}
              animate={{
                x: particle.x + endX,
                y: particle.y + endY,
                scale: [0, 0.9, 0.5],
                opacity: [0.7, 0.6, 0],
                rotate: particle.type === 'dissolve' ? [0, 120] : [0, 30],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.35 + Math.random() * 0.2,
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
