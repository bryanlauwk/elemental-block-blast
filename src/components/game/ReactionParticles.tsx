import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Position } from '@/game/types';
import { BOMB_TIMINGS } from '@/game/bombTimings';
import { isReducedMotion, subscribeReducedMotion } from '@/game/motionPreferences';

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
  const [bombCharges, setBombCharges] = useState<
    { id: string; x: number; y: number }[]
  >([]);
  const [bombFireballs, setBombFireballs] = useState<
    { id: string; x: number; y: number }[]
  >([]);
  const [bombSmokes, setBombSmokes] = useState<
    { id: string; x: number; y: number }[]
  >([]);
  const [bombBeams, setBombBeams] = useState<
    { id: string; cx: number; cy: number; orient: 'h' | 'v'; length: number }[]
  >([]);
  const [bombCellFlashes, setBombCellFlashes] = useState<
    { id: string; x: number; y: number; delay: number; orient: 'h' | 'v' }[]
  >([]);
  const [reduced, setReduced] = useState<boolean>(() => isReducedMotion());

  useEffect(() => subscribeReducedMotion(setReduced), []);

  useEffect(() => {
    if (!trigger || trigger.positions.length === 0) return;

    if (trigger.type === 'bomb') {
      const centers = trigger.centers ?? trigger.positions;
      const newParticles: Particle[] = [];
      const debrisColors = ['#fff3b0', '#ffb627', '#ff6b35', '#d62828', '#6c757d', '#2b2b2b'];

      // Debris is the most visually noisy layer — skip entirely in reduced motion.
      if (!reduced) centers.forEach((pos) => {
        const cx = gridOffset.x + (pos.x + 0.5) * cellSize;
        const cy = gridOffset.y + (pos.y + 0.5) * cellSize;
        // Radial debris shards — denser ring with gravity-affected fall.
        const shards = 22;
        for (let i = 0; i < shards; i++) {
          const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.3;
          newParticles.push({
            id: `bomb-${trigger.timestamp}-${pos.x}-${pos.y}-${i}`,
            x: cx,
            y: cy,
            type: 'bomb',
            emoji: '',
            delay: Math.random() * 0.05,
            angle,
            distance: 70 + Math.random() * 130,
            size: 3 + Math.random() * 5,
            color: debrisColors[i % debrisColors.length],
          });
        }
      });

      setParticles((prev) => [...prev, ...newParticles]);

      // Layered FX per epicenter: charge ring → flash → shockwave → fireball → smoke plume.
      const newCharges = centers.map((pos) => ({
        id: `bc-${trigger.timestamp}-${pos.x}-${pos.y}`,
        x: gridOffset.x + (pos.x + 0.5) * cellSize,
        y: gridOffset.y + (pos.y + 0.5) * cellSize,
      }));
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
      const newFireballs = centers.map((pos) => ({
        id: `bfb-${trigger.timestamp}-${pos.x}-${pos.y}`,
        x: gridOffset.x + (pos.x + 0.5) * cellSize,
        y: gridOffset.y + (pos.y + 0.5) * cellSize,
      }));
      const newSmokes = reduced ? [] : centers.map((pos) => ({
        id: `bsm-${trigger.timestamp}-${pos.x}-${pos.y}`,
        x: gridOffset.x + (pos.x + 0.5) * cellSize,
        y: gridOffset.y + (pos.y + 0.5) * cellSize,
      }));

      // === Row & column "blast beams" — make the clear physically visible. ===
      // We render a horizontal and vertical streak from each bomb center and a
      // staggered per-cell flash that sweeps outward along the row & column.
      // Use the union of all trigger.positions to know which cells were cleared
      // by *this* detonation set (engine pre-computes row+col cells).
      const clearedSet = new Set(trigger.positions.map((p) => `${p.x},${p.y}`));
      const newBeams: typeof bombBeams = [];
      const newCellFlashes: typeof bombCellFlashes = [];
      // Approximate grid extents from the cleared cells — covers full row/col.
      const allX = trigger.positions.map((p) => p.x);
      const allY = trigger.positions.map((p) => p.y);
      const minX = Math.min(...allX), maxX = Math.max(...allX);
      const minY = Math.min(...allY), maxY = Math.max(...allY);
      centers.forEach((pos) => {
        const cx = gridOffset.x + (pos.x + 0.5) * cellSize;
        const cy = gridOffset.y + (pos.y + 0.5) * cellSize;
        const hLen = (maxX - minX + 1) * cellSize;
        const vLen = (maxY - minY + 1) * cellSize;
        newBeams.push({
          id: `bbh-${trigger.timestamp}-${pos.x}-${pos.y}`,
          cx, cy, orient: 'h', length: hLen,
        });
        newBeams.push({
          id: `bbv-${trigger.timestamp}-${pos.x}-${pos.y}`,
          cx, cy, orient: 'v', length: vLen,
        });
        // Stagger cell flashes by distance from the bomb (per row / per col).
        const perStepMs = reduced ? 18 : 32;
        for (let xx = minX; xx <= maxX; xx++) {
          if (!clearedSet.has(`${xx},${pos.y}`)) continue;
          const dist = Math.abs(xx - pos.x);
          newCellFlashes.push({
            id: `bcfh-${trigger.timestamp}-${pos.x}-${pos.y}-${xx}`,
            x: gridOffset.x + xx * cellSize,
            y: gridOffset.y + pos.y * cellSize,
            delay: (dist * perStepMs) / 1000,
            orient: 'h',
          });
        }
        for (let yy = minY; yy <= maxY; yy++) {
          if (!clearedSet.has(`${pos.x},${yy}`)) continue;
          const dist = Math.abs(yy - pos.y);
          newCellFlashes.push({
            id: `bcfv-${trigger.timestamp}-${pos.x}-${pos.y}-${yy}`,
            x: gridOffset.x + pos.x * cellSize,
            y: gridOffset.y + yy * cellSize,
            delay: (dist * perStepMs) / 1000,
            orient: 'v',
          });
        }
      });
      setBombBeams((prev) => [...prev, ...newBeams]);
      setBombCellFlashes((prev) => [...prev, ...newCellFlashes]);

      setBombCharges((prev) => [...prev, ...newCharges]);
      setShockwaves((prev) => [...prev, ...newShocks]);
      setBombFlashes((prev) => [...prev, ...newFlashes]);
      setBombFireballs((prev) => [...prev, ...newFireballs]);
      setBombSmokes((prev) => [...prev, ...newSmokes]);

      const chargeTimeout = setTimeout(() => {
        setBombCharges((prev) => prev.filter((c) => !newCharges.some((nc) => nc.id === c.id)));
      }, BOMB_TIMINGS.chargeMs + 40);
      const shockTimeout = setTimeout(() => {
        setShockwaves((prev) => prev.filter((s) => !newShocks.some((ns) => ns.id === s.id)));
      }, BOMB_TIMINGS.shockwaveMs + 250);
      const flashTimeout = setTimeout(() => {
        setBombFlashes((prev) => prev.filter((f) => !newFlashes.some((nf) => nf.id === f.id)));
      }, BOMB_TIMINGS.flashMs + 100);
      const fireballTimeout = setTimeout(() => {
        setBombFireballs((prev) => prev.filter((b) => !newFireballs.some((nb) => nb.id === b.id)));
      }, BOMB_TIMINGS.fireballMs + 50);
      const smokeTimeout = setTimeout(() => {
        setBombSmokes((prev) => prev.filter((s) => !newSmokes.some((ns) => ns.id === s.id)));
      }, BOMB_TIMINGS.smokePlumeDelayMs + BOMB_TIMINGS.smokePlumeMs);
      const particleTimeout = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      }, BOMB_TIMINGS.debrisMs + 300);
      const beamTimeout = setTimeout(() => {
        setBombBeams((prev) => prev.filter((b) => !newBeams.some((nb) => nb.id === b.id)));
        setBombCellFlashes((prev) => prev.filter((f) => !newCellFlashes.some((nf) => nf.id === f.id)));
      }, BOMB_TIMINGS.shockwaveMs + 400);
      return () => {
        clearTimeout(chargeTimeout);
        clearTimeout(shockTimeout);
        clearTimeout(flashTimeout);
        clearTimeout(fireballTimeout);
        clearTimeout(smokeTimeout);
        clearTimeout(particleTimeout);
        clearTimeout(beamTimeout);
      };
    }

    // Non-bomb reactions intentionally render no sparkle/bubble particles —
    // the screen-shake, line-clear flash, and score popup already telegraph
    // a successful clear without cluttering the board.
    return;
  }, [trigger, cellSize, gridOffset, reduced]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {/* Bomb charge ring — quick yellow pre-detonation pop */}
      {bombCharges.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-full"
          initial={{ opacity: 0.9, scale: 0.4 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: BOMB_TIMINGS.chargeMs / 1000, ease: 'easeOut' }}
          style={{
            left: c.x,
            top: c.y,
            width: cellSize * 1.4,
            height: cellSize * 1.4,
            marginLeft: -(cellSize * 0.7),
            marginTop: -(cellSize * 0.7),
            background:
              'radial-gradient(circle, rgba(255,247,194,1) 0%, rgba(255,209,102,0.85) 45%, rgba(255,107,53,0) 80%)',
            mixBlendMode: 'screen',
            filter: 'blur(0.5px)',
          }}
        />
      ))}
      {/* Bomb white flash — quick high-intensity burst */}
      {bombFlashes.map((f) => (
        <motion.div
          key={f.id}
          className="absolute rounded-full"
          initial={{ opacity: 0.95, scale: 0.3 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: BOMB_TIMINGS.flashMs / 1000, ease: 'easeOut' }}
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
      {/* Fireball — orange/red core that lingers a moment longer */}
      {bombFireballs.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          initial={{ opacity: 0.95, scale: 0.5 }}
          animate={{ opacity: [0.95, 0.8, 0], scale: [0.5, 1.6, 2.1] }}
          transition={{ duration: BOMB_TIMINGS.fireballMs / 1000, times: [0, 0.5, 1], ease: 'easeOut' }}
          style={{
            left: b.x,
            top: b.y,
            width: cellSize * 2,
            height: cellSize * 2,
            marginLeft: -(cellSize * 1),
            marginTop: -(cellSize * 1),
            background:
              'radial-gradient(circle, rgba(255,209,102,0.95) 0%, rgba(255,107,53,0.85) 35%, rgba(214,40,40,0.55) 65%, rgba(60,10,10,0) 90%)',
            filter: 'blur(2px)',
            mixBlendMode: 'screen',
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
            transition={{ duration: BOMB_TIMINGS.shockwaveMs / 1000, ease: [0.16, 1, 0.3, 1] }}
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
      {/* Dissipation — rising dark smoke plume */}
      {!reduced && bombSmokes.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          initial={{ opacity: 0.55, scale: 0.7, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.9, y: -cellSize * 1.4 }}
          transition={{ duration: BOMB_TIMINGS.smokePlumeMs / 1000, delay: BOMB_TIMINGS.smokePlumeDelayMs / 1000, ease: 'easeOut' }}
          style={{
            left: s.x,
            top: s.y,
            width: cellSize * 1.8,
            height: cellSize * 1.8,
            marginLeft: -(cellSize * 0.9),
            marginTop: -(cellSize * 0.9),
            background:
              'radial-gradient(circle, rgba(70,55,55,0.7) 0%, rgba(40,30,30,0.45) 45%, rgba(20,15,15,0) 85%)',
            filter: 'blur(4px)',
          }}
        />
      ))}
      {/* Dark smoke ring follow-up for bomb */}
      {!reduced && shockwaves.filter((s) => s.kind === 'bomb').map((s) => (
        <motion.span
          key={`${s.id}-smoke`}
          className="absolute rounded-full pointer-events-none"
          initial={{ opacity: 0.6, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.6 }}
          transition={{ duration: BOMB_TIMINGS.smokeRingMs / 1000, delay: BOMB_TIMINGS.smokeRingDelayMs / 1000, ease: 'easeOut' }}
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
      {/* === Row & column blast beams — directional streaks from the bomb === */}
      {bombBeams.map((b) => {
        const isH = b.orient === 'h';
        const thickness = Math.max(6, cellSize * 0.45);
        return (
          <motion.div
            key={b.id}
            className="absolute pointer-events-none rounded-full"
            initial={{ opacity: 0, scaleX: isH ? 0 : 1, scaleY: isH ? 1 : 0 }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              scaleX: isH ? [0, 1, 1, 1] : 1,
              scaleY: isH ? 1 : [0, 1, 1, 1],
            }}
            transition={{
              duration: (BOMB_TIMINGS.shockwaveMs + 150) / 1000,
              times: [0, 0.18, 0.55, 1],
              ease: 'easeOut',
            }}
            style={{
              left: b.cx,
              top: b.cy,
              width: isH ? b.length : thickness,
              height: isH ? thickness : b.length,
              marginLeft: isH ? -(b.length / 2) : -(thickness / 2),
              marginTop: isH ? -(thickness / 2) : -(b.length / 2),
              background: isH
                ? 'linear-gradient(90deg, rgba(255,224,130,0) 0%, rgba(255,200,90,0.95) 35%, #fff 50%, rgba(255,200,90,0.95) 65%, rgba(255,224,130,0) 100%)'
                : 'linear-gradient(180deg, rgba(255,224,130,0) 0%, rgba(255,200,90,0.95) 35%, #fff 50%, rgba(255,200,90,0.95) 65%, rgba(255,224,130,0) 100%)',
              boxShadow:
                '0 0 16px rgba(255,180,80,0.85), 0 0 32px rgba(255,107,53,0.55)',
              mixBlendMode: 'screen',
              filter: 'blur(1px)',
              transformOrigin: 'center center',
            }}
          />
        );
      })}
      {/* Per-cell impact flashes sweeping outward along the row/column */}
      {bombCellFlashes.map((f) => (
        <motion.div
          key={f.id}
          className="absolute pointer-events-none rounded-md"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.95, 0], scale: [0.6, 1.05, 0.85] }}
          transition={{ duration: 0.42, delay: f.delay, ease: 'easeOut' }}
          style={{
            left: f.x,
            top: f.y,
            width: cellSize,
            height: cellSize,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,200,90,0.65) 40%, rgba(255,107,53,0.25) 75%, rgba(0,0,0,0) 100%)',
            boxShadow: '0 0 12px rgba(255,180,80,0.8)',
            mixBlendMode: 'screen',
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
