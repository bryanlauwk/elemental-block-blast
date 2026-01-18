import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';

interface ElementState {
  id: string;
  emoji: string;
  gradient: string;
  glowColor: string;
  size: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  zone: 'left' | 'right';
  lastReactionTime: number;
}

interface Reaction {
  id: string;
  x: number;
  y: number;
  type: 'steam' | 'sparks' | 'fizz' | 'dissolve' | 'bubbles' | 'pop';
  emoji: string;
  particles: { angle: number; speed: number; size: number; delay: number }[];
  timestamp: number;
}

// Element reaction rules
const REACTION_RULES: Record<string, { partner: string; type: Reaction['type']; emoji: string }[]> = {
  fire: [
    { partner: 'water', type: 'steam', emoji: '💨' },
    { partner: 'wood', type: 'sparks', emoji: '✨' },
    { partner: 'helium', type: 'pop', emoji: '💥' },
  ],
  water: [
    { partner: 'fire', type: 'steam', emoji: '💨' },
    { partner: 'helium', type: 'bubbles', emoji: '🫧' },
  ],
  wood: [
    { partner: 'fire', type: 'sparks', emoji: '🔥' },
    { partner: 'acid', type: 'dissolve', emoji: '💀' },
  ],
  acid: [
    { partner: 'stone', type: 'fizz', emoji: '🧪' },
    { partner: 'wood', type: 'dissolve', emoji: '☠️' },
  ],
  stone: [
    { partner: 'acid', type: 'fizz', emoji: '💚' },
  ],
  helium: [
    { partner: 'fire', type: 'pop', emoji: '💥' },
    { partner: 'water', type: 'bubbles', emoji: '🫧' },
  ],
};

const initialElements: Omit<ElementState, 'x' | 'y' | 'targetX' | 'targetY' | 'vx' | 'vy' | 'lastReactionTime'>[] = [
  { 
    id: 'fire', 
    emoji: '🔥', 
    gradient: 'from-orange-400 via-orange-500 to-red-600',
    glowColor: 'rgba(251, 146, 60, 0.7)',
    size: 64,
    zone: 'left',
  },
  { 
    id: 'water', 
    emoji: '💧', 
    gradient: 'from-cyan-300 via-blue-400 to-blue-600',
    glowColor: 'rgba(34, 211, 238, 0.7)',
    size: 56,
    zone: 'left',
  },
  { 
    id: 'wood', 
    emoji: '🪵', 
    gradient: 'from-amber-500 via-amber-600 to-amber-800',
    glowColor: 'rgba(217, 119, 6, 0.7)',
    size: 58,
    zone: 'left',
  },
  { 
    id: 'stone', 
    emoji: '🪨', 
    gradient: 'from-gray-300 via-gray-400 to-gray-600',
    glowColor: 'rgba(156, 163, 175, 0.7)',
    size: 60,
    zone: 'right',
  },
  { 
    id: 'acid', 
    emoji: '🧪', 
    gradient: 'from-green-300 via-green-400 to-emerald-600',
    glowColor: 'rgba(74, 222, 128, 0.7)',
    size: 58,
    zone: 'right',
  },
  { 
    id: 'helium', 
    emoji: '🎈', 
    gradient: 'from-pink-300 via-pink-400 to-pink-600',
    glowColor: 'rgba(244, 114, 182, 0.7)',
    size: 54,
    zone: 'right',
  },
];

const REACTION_RADIUS = 80;
const REACTION_COOLDOWN = 4000;
const SPEED = 0.3;
const TARGET_THRESHOLD = 20;

interface ElementMascotsProps {
  isPlaying?: boolean;
}

export const ElementMascots = ({ isPlaying = false }: ElementMascotsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<ElementState[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactingPairs, setReactingPairs] = useState<Set<string>>(new Set());
  const animationRef = useRef<number>();

  // Initialize elements with random positions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    
    const getRandomPosition = (zone: 'left' | 'right') => {
      const minX = zone === 'left' ? width * 0.02 : width * 0.75;
      const maxX = zone === 'left' ? width * 0.22 : width * 0.95;
      const minY = height * 0.1;
      const maxY = height * 0.65;
      
      return {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
      };
    };

    const initializedElements = initialElements.map(el => {
      const pos = getRandomPosition(el.zone);
      const target = getRandomPosition(el.zone);
      return {
        ...el,
        x: pos.x,
        y: pos.y,
        targetX: target.x,
        targetY: target.y,
        vx: 0,
        vy: 0,
        lastReactionTime: 0,
      };
    });

    setElements(initializedElements);
  }, []);

  // Get new random target within zone
  const getNewTarget = useCallback((zone: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const { width, height } = container.getBoundingClientRect();
    const minX = zone === 'left' ? width * 0.02 : width * 0.75;
    const maxX = zone === 'left' ? width * 0.22 : width * 0.95;
    const minY = height * 0.1;
    const maxY = height * 0.65;
    
    return {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
    };
  }, []);

  // Check for reactions between elements
  const checkReactions = useCallback((els: ElementState[]) => {
    const now = Date.now();
    const newReactions: Reaction[] = [];
    const newReactingPairs = new Set<string>();

    for (let i = 0; i < els.length; i++) {
      for (let j = i + 1; j < els.length; j++) {
        const el1 = els[i];
        const el2 = els[j];
        
        const dx = el2.x - el1.x;
        const dy = el2.y - el1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REACTION_RADIUS) {
          const pairKey = [el1.id, el2.id].sort().join('-');
          
          // Check if this pair can react and hasn't recently
          const canReact = 
            now - el1.lastReactionTime > REACTION_COOLDOWN &&
            now - el2.lastReactionTime > REACTION_COOLDOWN;

          if (canReact) {
            // Find if these elements can react
            const rules = REACTION_RULES[el1.id] || [];
            const reaction = rules.find(r => r.partner === el2.id);
            
            if (reaction) {
              // Create reaction at midpoint
              const midX = (el1.x + el2.x) / 2;
              const midY = (el1.y + el2.y) / 2;

              const particles = Array.from({ length: 8 }, (_, idx) => ({
                angle: (Math.PI * 2 * idx) / 8 + Math.random() * 0.5,
                speed: 30 + Math.random() * 40,
                size: 16 + Math.random() * 12,
                delay: Math.random() * 0.15,
              }));

              newReactions.push({
                id: `${pairKey}-${now}`,
                x: midX,
                y: midY,
                type: reaction.type,
                emoji: reaction.emoji,
                particles,
                timestamp: now,
              });

              // Mark elements as recently reacted
              el1.lastReactionTime = now;
              el2.lastReactionTime = now;

              // Push elements away from each other
              const pushForce = 3;
              const angle = Math.atan2(dy, dx);
              el1.vx -= Math.cos(angle) * pushForce;
              el1.vy -= Math.sin(angle) * pushForce;
              el2.vx += Math.cos(angle) * pushForce;
              el2.vy += Math.sin(angle) * pushForce;

              newReactingPairs.add(pairKey);
            }
          }
        }
      }
    }

    if (newReactions.length > 0) {
      setReactions(prev => [...prev, ...newReactions]);
      setReactingPairs(newReactingPairs);
      
      // Clear reacting pairs after animation
      setTimeout(() => setReactingPairs(new Set()), 500);
    }

    // Clean up old reactions
    setReactions(prev => prev.filter(r => now - r.timestamp < 1500));

    return els;
  }, []);

  // Animation loop
  useEffect(() => {
    if (isPlaying || elements.length === 0) return;

    const animate = () => {
      setElements(prevElements => {
        const newElements = prevElements.map(el => {
          // Calculate direction to target
          const dx = el.targetX - el.x;
          const dy = el.targetY - el.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If close to target, pick new target
          if (distance < TARGET_THRESHOLD) {
            const newTarget = getNewTarget(el.zone);
            return {
              ...el,
              targetX: newTarget.x,
              targetY: newTarget.y,
            };
          }

          // Move towards target with velocity
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Apply movement
          let newVx = el.vx + dirX * SPEED * 0.1;
          let newVy = el.vy + dirY * SPEED * 0.1;

          // Apply friction
          newVx *= 0.95;
          newVy *= 0.95;

          // Limit velocity
          const maxSpeed = SPEED * 2;
          const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (currentSpeed > maxSpeed) {
            newVx = (newVx / currentSpeed) * maxSpeed;
            newVy = (newVy / currentSpeed) * maxSpeed;
          }

          return {
            ...el,
            x: el.x + newVx,
            y: el.y + newVy,
            vx: newVx,
            vy: newVy,
          };
        });

        // Check for reactions
        return checkReactions(newElements);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, elements.length, getNewTarget, checkReactions]);

  const isReacting = (elementId: string) => {
    return Array.from(reactingPairs).some(pair => pair.includes(elementId));
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Element mascots */}
      {elements.map((el) => {
        const reacting = isReacting(el.id);
        
        return (
          <motion.div
            key={el.id}
            className="absolute pointer-events-none"
            style={{
              left: el.x - el.size / 2,
              top: el.y - el.size / 2,
              width: el.size,
              height: el.size,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isPlaying ? 0 : 1, 
              scale: isPlaying ? 0 : reacting ? 1.3 : 1,
            }}
            transition={{
              opacity: { duration: 0.4 },
              scale: { duration: 0.3, type: 'spring', stiffness: 300 },
            }}
          >
            {/* Outer glow ring */}
            <motion.div 
              className="absolute inset-[-8px] rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${el.glowColor}, transparent 70%)`,
                filter: 'blur(8px)',
              }}
              animate={{
                scale: reacting ? [1, 1.5, 1] : [1, 1.2, 1],
                opacity: reacting ? [0.8, 1, 0.8] : [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: reacting ? 0.3 : 2,
                repeat: reacting ? 0 : Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Inner glow effect */}
            <div 
              className="absolute inset-0 rounded-full blur-lg opacity-70"
              style={{ backgroundColor: el.glowColor }}
            />
            
            {/* Badge container */}
            <motion.div 
              className={`relative w-full h-full rounded-full bg-gradient-to-br ${el.gradient} flex items-center justify-center shadow-xl border-3 border-white/30`}
              style={{
                boxShadow: `0 4px 20px ${el.glowColor}, inset 0 2px 10px rgba(255,255,255,0.3)`,
              }}
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Inner highlight */}
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
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
                  }}
                />
              </motion.div>
              
              {/* Emoji */}
              <motion.span 
                className="relative text-center select-none z-10"
                style={{ fontSize: el.size * 0.5 }}
                animate={{
                  scale: reacting ? [1, 1.3, 1] : [1, 1.1, 1],
                }}
                transition={{
                  duration: reacting ? 0.3 : 1.5,
                  repeat: reacting ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
              >
                {el.emoji}
              </motion.span>
            </motion.div>

            {/* Particle trail */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 6 - i * 1.5,
                  height: 6 - i * 1.5,
                  backgroundColor: el.glowColor,
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
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        );
      })}

      {/* Reaction effects */}
      <AnimatePresence>
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute"
            style={{
              left: reaction.x,
              top: reaction.y,
            }}
          >
            {/* Central burst */}
            <motion.div
              className="absolute"
              style={{
                left: -20,
                top: -20,
                fontSize: 40,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1.5, 1], opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {reaction.emoji}
            </motion.div>

            {/* Particle burst */}
            {reaction.particles.map((particle, idx) => {
              const endX = Math.cos(particle.angle) * particle.speed;
              const endY = Math.sin(particle.angle) * particle.speed - 15;

              return (
                <motion.div
                  key={idx}
                  className="absolute"
                  style={{
                    fontSize: particle.size,
                    left: -particle.size / 2,
                    top: -particle.size / 2,
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: endX,
                    y: endY,
                    scale: [0, 1.2, 0.8],
                    opacity: [1, 1, 0],
                    rotate: reaction.type === 'dissolve' ? [0, 180] : [0, 45],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.3,
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                >
                  {reaction.emoji}
                </motion.div>
              );
            })}

            {/* Glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 100,
                height: 100,
                left: -50,
                top: -50,
                background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)',
              }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [0, 2], opacity: [0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ElementMascots;
