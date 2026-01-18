import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';
import ReactionProducts from './ReactionProducts';

type ElementStatus = 'wandering' | 'approaching' | 'reacting' | 'transforming' | 'respawning';

interface ElementState {
  id: string;
  emoji: string;
  gradient: string;
  glowColor: string;
  baseSize: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  zone: 'left' | 'right';
  status: ElementStatus;
  opacity: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  lastReactionTime: number;
  respawnTimer: number;
  invulnerable: boolean;
}

interface ReactionProduct {
  id: string;
  type: 'steam' | 'sparks' | 'ash' | 'explosion' | 'bubbles' | 'fizz' | 'dissolve';
  x: number;
  y: number;
  timestamp: number;
  elements: string[];
}

// Enhanced reaction rules with product types
const REACTION_RULES: Record<string, { partner: string; productType: ReactionProduct['type']; emoji: string }[]> = {
  fire: [
    { partner: 'water', productType: 'steam', emoji: '💨' },
    { partner: 'wood', productType: 'sparks', emoji: '🔥' },
    { partner: 'helium', productType: 'explosion', emoji: '💥' },
  ],
  water: [
    { partner: 'fire', productType: 'steam', emoji: '💨' },
    { partner: 'helium', productType: 'bubbles', emoji: '🫧' },
  ],
  wood: [
    { partner: 'fire', productType: 'sparks', emoji: '🔥' },
    { partner: 'acid', productType: 'dissolve', emoji: '💀' },
  ],
  acid: [
    { partner: 'stone', productType: 'fizz', emoji: '🧪' },
    { partner: 'wood', productType: 'dissolve', emoji: '☠️' },
  ],
  stone: [
    { partner: 'acid', productType: 'fizz', emoji: '💚' },
  ],
  helium: [
    { partner: 'fire', productType: 'explosion', emoji: '💥' },
    { partner: 'water', productType: 'bubbles', emoji: '🫧' },
  ],
};

// Element weights for physics (heavier = slower)
const ELEMENT_WEIGHTS: Record<string, number> = {
  fire: 0.6,
  water: 0.8,
  wood: 1.0,
  stone: 1.5,
  acid: 0.7,
  helium: 0.3,
};

const initialElements: Omit<ElementState, 'x' | 'y' | 'targetX' | 'targetY' | 'vx' | 'vy' | 'lastReactionTime' | 'status' | 'opacity' | 'scale' | 'scaleX' | 'scaleY' | 'rotation' | 'respawnTimer' | 'invulnerable'>[] = [
  { 
    id: 'fire', 
    emoji: '🔥', 
    gradient: 'from-orange-400 via-orange-500 to-red-600',
    glowColor: 'rgba(251, 146, 60, 0.7)',
    baseSize: 64,
    zone: 'left',
  },
  { 
    id: 'water', 
    emoji: '💧', 
    gradient: 'from-cyan-300 via-blue-400 to-blue-600',
    glowColor: 'rgba(34, 211, 238, 0.7)',
    baseSize: 56,
    zone: 'left',
  },
  { 
    id: 'wood', 
    emoji: '🪵', 
    gradient: 'from-amber-500 via-amber-600 to-amber-800',
    glowColor: 'rgba(217, 119, 6, 0.7)',
    baseSize: 58,
    zone: 'left',
  },
  { 
    id: 'stone', 
    emoji: '🪨', 
    gradient: 'from-gray-300 via-gray-400 to-gray-600',
    glowColor: 'rgba(156, 163, 175, 0.7)',
    baseSize: 60,
    zone: 'right',
  },
  { 
    id: 'acid', 
    emoji: '🧪', 
    gradient: 'from-green-300 via-green-400 to-emerald-600',
    glowColor: 'rgba(74, 222, 128, 0.7)',
    baseSize: 58,
    zone: 'right',
  },
  { 
    id: 'helium', 
    emoji: '🎈', 
    gradient: 'from-pink-300 via-pink-400 to-pink-600',
    glowColor: 'rgba(244, 114, 182, 0.7)',
    baseSize: 54,
    zone: 'right',
  },
];

const REACTION_RADIUS = 70;
const REACTION_COOLDOWN = 5000;
const TRANSFORM_DURATION = 800;
const RESPAWN_DELAY = 2000;
const INVULNERABILITY_DURATION = 1500;

interface ElementMascotsProps {
  isPlaying?: boolean;
}

export const ElementMascots = ({ isPlaying = false }: ElementMascotsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<ElementState[]>([]);
  const [reactionProducts, setReactionProducts] = useState<ReactionProduct[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Get spawn position at screen edge
  const getEdgeSpawnPosition = useCallback((zone: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const { width, height } = container.getBoundingClientRect();
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    
    let x: number, y: number;
    
    if (edge === 0) { // top
      x = zone === 'left' ? Math.random() * width * 0.3 : width * 0.7 + Math.random() * width * 0.3;
      y = -50;
    } else if (edge === 1) { // right
      x = zone === 'left' ? width * 0.25 : width + 50;
      y = height * 0.1 + Math.random() * height * 0.5;
    } else if (edge === 2) { // bottom
      x = zone === 'left' ? Math.random() * width * 0.3 : width * 0.7 + Math.random() * width * 0.3;
      y = height + 50;
    } else { // left
      x = zone === 'left' ? -50 : width * 0.75;
      y = height * 0.1 + Math.random() * height * 0.5;
    }
    
    return { x, y };
  }, []);

  // Get random target within zone (with occasional cross-zone adventure)
  const getNewTarget = useCallback((zone: 'left' | 'right', allowCrossZone = false) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const { width, height } = container.getBoundingClientRect();
    
    // 15% chance to venture toward center
    const crossZone = allowCrossZone && Math.random() < 0.15;
    
    let minX: number, maxX: number;
    if (crossZone) {
      minX = width * 0.35;
      maxX = width * 0.65;
    } else {
      minX = zone === 'left' ? width * 0.02 : width * 0.75;
      maxX = zone === 'left' ? width * 0.28 : width * 0.95;
    }
    
    const minY = height * 0.08;
    const maxY = height * 0.68;
    
    return {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
    };
  }, []);

  // Initialize elements
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initializedElements = initialElements.map(el => {
      const pos = getNewTarget(el.zone);
      const target = getNewTarget(el.zone);
      return {
        ...el,
        x: pos.x,
        y: pos.y,
        targetX: target.x,
        targetY: target.y,
        vx: 0,
        vy: 0,
        status: 'wandering' as ElementStatus,
        opacity: 1,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        lastReactionTime: 0,
        respawnTimer: 0,
        invulnerable: false,
      };
    });

    setElements(initializedElements);
  }, [getNewTarget]);

  // Trigger reaction between two elements
  const triggerReaction = useCallback((el1: ElementState, el2: ElementState, rule: { productType: ReactionProduct['type']; emoji: string }) => {
    const now = Date.now();
    const midX = (el1.x + el2.x) / 2;
    const midY = (el1.y + el2.y) / 2;

    // Create reaction product
    const product: ReactionProduct = {
      id: `${el1.id}-${el2.id}-${now}`,
      type: rule.productType,
      x: midX,
      y: midY,
      timestamp: now,
      elements: [el1.id, el2.id],
    };

    setReactionProducts(prev => [...prev, product]);

    // Update element states to transforming
    setElements(prev => prev.map(el => {
      if (el.id === el1.id || el.id === el2.id) {
        return {
          ...el,
          status: 'transforming' as ElementStatus,
          lastReactionTime: now,
        };
      }
      return el;
    }));

    // Schedule respawn
    setTimeout(() => {
      setElements(prev => prev.map(el => {
        if (el.id === el1.id || el.id === el2.id) {
          const spawnPos = getEdgeSpawnPosition(el.zone);
          const target = getNewTarget(el.zone);
          return {
            ...el,
            x: spawnPos.x,
            y: spawnPos.y,
            targetX: target.x,
            targetY: target.y,
            vx: 0,
            vy: 0,
            status: 'respawning' as ElementStatus,
            opacity: 0,
            scale: 0,
            invulnerable: true,
            respawnTimer: Date.now(),
          };
        }
        return el;
      }));
    }, TRANSFORM_DURATION);

    // Complete respawn animation
    setTimeout(() => {
      setElements(prev => prev.map(el => {
        if ((el.id === el1.id || el.id === el2.id) && el.status === 'respawning') {
          return {
            ...el,
            status: 'wandering' as ElementStatus,
            opacity: 1,
            scale: 1,
          };
        }
        return el;
      }));
    }, TRANSFORM_DURATION + 500);

    // Remove invulnerability
    setTimeout(() => {
      setElements(prev => prev.map(el => {
        if (el.id === el1.id || el.id === el2.id) {
          return { ...el, invulnerable: false };
        }
        return el;
      }));
    }, TRANSFORM_DURATION + 500 + INVULNERABILITY_DURATION);
  }, [getEdgeSpawnPosition, getNewTarget]);

  // Main animation loop
  useEffect(() => {
    if (isPlaying || elements.length === 0) return;

    const animate = (timestamp: number) => {
      const delta = timestamp - timeRef.current;
      timeRef.current = timestamp;
      const now = Date.now();

      setElements(prevElements => {
        const newElements = prevElements.map(el => {
          // Skip elements that are transforming
          if (el.status === 'transforming') {
            // Shrink and fade animation
            const timeSinceReaction = now - el.lastReactionTime;
            const progress = Math.min(timeSinceReaction / TRANSFORM_DURATION, 1);
            
            return {
              ...el,
              opacity: 1 - progress,
              scale: 1 - progress * 0.8,
              rotation: el.rotation + 10,
            };
          }

          // Skip respawning elements (handled by scheduled state updates)
          if (el.status === 'respawning') {
            return el;
          }

          // Physics-based movement
          const weight = ELEMENT_WEIGHTS[el.id] || 1;
          const baseSpeed = 0.08 / weight;
          
          // Wandering behavior with slight randomness
          const dx = el.targetX - el.x;
          const dy = el.targetY - el.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Boid-like wandering: add slight random steering
          const wanderStrength = 0.02;
          const wanderX = (Math.random() - 0.5) * wanderStrength;
          const wanderY = (Math.random() - 0.5) * wanderStrength;

          // Pick new target if close enough
          if (distance < 30) {
            const newTarget = getNewTarget(el.zone, true);
            return {
              ...el,
              targetX: newTarget.x,
              targetY: newTarget.y,
            };
          }

          // Calculate steering toward target
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Apply forces with spring-like behavior
          const springStrength = 0.002;
          let newVx = el.vx + (dirX * baseSpeed + wanderX) + dx * springStrength;
          let newVy = el.vy + (dirY * baseSpeed + wanderY) + dy * springStrength;

          // Special behaviors per element
          if (el.id === 'helium') {
            // Helium bobs upward and floats more
            newVy -= 0.01;
            newVx += Math.sin(timestamp / 500) * 0.005;
          } else if (el.id === 'stone') {
            // Stone has more inertia
            newVx *= 0.98;
            newVy *= 0.98;
          } else if (el.id === 'fire') {
            // Fire flickers with slight jitter
            newVx += (Math.random() - 0.5) * 0.03;
            newVy += (Math.random() - 0.5) * 0.03;
          }

          // Apply friction
          const friction = 0.92;
          newVx *= friction;
          newVy *= friction;

          // Limit max velocity
          const maxSpeed = 2.5 / weight;
          const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (currentSpeed > maxSpeed) {
            newVx = (newVx / currentSpeed) * maxSpeed;
            newVy = (newVy / currentSpeed) * maxSpeed;
          }

          // Squash and stretch based on velocity
          const velocityMagnitude = Math.sqrt(newVx * newVx + newVy * newVy);
          const stretchFactor = Math.min(velocityMagnitude * 0.15, 0.2);
          const angle = Math.atan2(newVy, newVx);
          
          // Calculate squash/stretch in direction of movement
          const scaleX = 1 + stretchFactor;
          const scaleY = 1 - stretchFactor * 0.5;

          // Breathing animation when slow
          const breathe = velocityMagnitude < 0.5 ? Math.sin(timestamp / 800) * 0.05 : 0;

          return {
            ...el,
            x: el.x + newVx,
            y: el.y + newVy,
            vx: newVx,
            vy: newVy,
            scaleX: scaleX + breathe,
            scaleY: scaleY + breathe,
            rotation: angle * (180 / Math.PI) * 0.1,
          };
        });

        // Check for reactions between elements
        for (let i = 0; i < newElements.length; i++) {
          for (let j = i + 1; j < newElements.length; j++) {
            const el1 = newElements[i];
            const el2 = newElements[j];

            // Skip if either element is not wandering or is invulnerable
            if (el1.status !== 'wandering' || el2.status !== 'wandering') continue;
            if (el1.invulnerable || el2.invulnerable) continue;

            // Check cooldown
            if (now - el1.lastReactionTime < REACTION_COOLDOWN) continue;
            if (now - el2.lastReactionTime < REACTION_COOLDOWN) continue;

            const dx = el2.x - el1.x;
            const dy = el2.y - el1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < REACTION_RADIUS) {
              // Find reaction rule
              const rules = REACTION_RULES[el1.id] || [];
              const rule = rules.find(r => r.partner === el2.id);

              if (rule) {
                triggerReaction(el1, el2, rule);
                break;
              }
            }
          }
        }

        return newElements;
      });

      // Clean up old reaction products
      setReactionProducts(prev => prev.filter(p => now - p.timestamp < 3000));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, elements.length, getNewTarget, triggerReaction]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Element mascots */}
      <AnimatePresence>
        {elements.map((el) => {
          const size = el.baseSize * el.scale;
          const isTransforming = el.status === 'transforming';
          const isRespawning = el.status === 'respawning';
          const showInvulnerableShimmer = el.invulnerable && el.status === 'wandering';

          return (
            <motion.div
              key={el.id}
              className="absolute pointer-events-none"
              style={{
                left: el.x - size / 2,
                top: el.y - size / 2,
                width: size,
                height: size,
                opacity: el.opacity,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isPlaying ? 0 : el.opacity,
                scale: isPlaying ? 0 : el.scale,
                scaleX: el.scaleX,
                scaleY: el.scaleY,
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.4, type: 'spring', stiffness: 200 },
              }}
            >
              {/* Invulnerability shimmer */}
              {showInvulnerableShimmer && (
                <motion.div
                  className="absolute inset-[-12px] rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${el.glowColor}, transparent, ${el.glowColor}, transparent)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Outer glow ring */}
              <motion.div 
                className="absolute inset-[-10px] rounded-full"
                style={{ 
                  background: `radial-gradient(circle, ${el.glowColor}, transparent 70%)`,
                  filter: 'blur(10px)',
                }}
                animate={{
                  scale: isTransforming ? [1, 2, 0] : [1, 1.3, 1],
                  opacity: isTransforming ? [0.8, 1, 0] : [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: isTransforming ? 0.8 : 2.5,
                  repeat: isTransforming ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Transformation particles */}
              {isTransforming && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: el.glowColor,
                        left: '50%',
                        top: '50%',
                      }}
                      initial={{ x: -4, y: -4, scale: 1, opacity: 1 }}
                      animate={{
                        x: Math.cos((i / 8) * Math.PI * 2) * 60 - 4,
                        y: Math.sin((i / 8) * Math.PI * 2) * 60 - 30 - 4,
                        scale: 0,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                    />
                  ))}
                </>
              )}

              {/* Inner glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-full blur-lg"
                style={{ 
                  backgroundColor: el.glowColor,
                  opacity: isTransforming ? 0.9 : 0.7,
                }}
                animate={isTransforming ? { scale: [1, 1.5, 0] } : {}}
                transition={{ duration: 0.8 }}
              />
              
              {/* Badge container */}
              <motion.div 
                className={`relative w-full h-full rounded-full bg-gradient-to-br ${el.gradient} flex items-center justify-center shadow-xl border-2 border-white/30`}
                style={{
                  boxShadow: `0 4px 20px ${el.glowColor}, inset 0 2px 10px rgba(255,255,255,0.3)`,
                  transform: `rotate(${el.rotation}deg)`,
                }}
                animate={isRespawning ? {
                  scale: [0, 1.3, 1],
                  rotate: [180, -10, 0],
                } : {
                  rotate: [0, 3, -3, 0],
                }}
                transition={isRespawning ? {
                  duration: 0.5,
                  ease: 'backOut',
                } : {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Inner highlight */}
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
                
                {/* Shine effect */}
                <motion.div className="absolute inset-0 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"
                    animate={{ y: ['-100%', '200%'] }}
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
                  style={{ fontSize: size * 0.5 }}
                  animate={isTransforming ? {
                    scale: [1, 0],
                    rotate: [0, 180],
                  } : isRespawning ? {
                    scale: [0, 1.2, 1],
                  } : {
                    scale: [1, 1.08, 1],
                  }}
                  transition={isTransforming || isRespawning ? {
                    duration: 0.5,
                  } : {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {el.emoji}
                </motion.span>
              </motion.div>

              {/* Velocity trail particles */}
              {el.status === 'wandering' && Math.sqrt(el.vx * el.vx + el.vy * el.vy) > 0.8 && (
                [...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 6 - i * 1.5,
                      height: 6 - i * 1.5,
                      backgroundColor: el.glowColor,
                      left: '50%',
                      top: '50%',
                      marginLeft: -(3 - i * 0.75),
                      marginTop: -(3 - i * 0.75),
                    }}
                    animate={{
                      x: -el.vx * (i + 1) * 8,
                      y: -el.vy * (i + 1) * 8,
                      opacity: [0.8, 0.3],
                      scale: [1, 0.5],
                    }}
                    transition={{
                      duration: 0.3,
                      delay: i * 0.05,
                    }}
                  />
                ))
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Reaction products (steam, explosions, etc.) */}
      <ReactionProducts products={reactionProducts} />
    </div>
  );
};

export default ElementMascots;
