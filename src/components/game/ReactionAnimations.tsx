import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

// Reaction definitions based on game logic
interface Reaction {
  id: string;
  element1: { emoji: string; color: string; name: string };
  element2: { emoji: string; color: string; name: string };
  result: { emoji: string; color: string; name: string } | null;
  resultText: string;
  effectColor: string;
}

const REACTIONS: Reaction[] = [
  {
    id: 'fire-water',
    element1: { emoji: '🔥', color: '#EF4444', name: 'Fire' },
    element2: { emoji: '💧', color: '#3B82F6', name: 'Water' },
    result: null,
    resultText: 'STEAM!',
    effectColor: 'rgba(200, 200, 255, 0.8)',
  },
  {
    id: 'fire-wood',
    element1: { emoji: '🔥', color: '#EF4444', name: 'Fire' },
    element2: { emoji: '🪵', color: '#B45309', name: 'Wood' },
    result: { emoji: '💨', color: '#6B7280', name: 'Ash' },
    resultText: 'BURN!',
    effectColor: 'rgba(255, 150, 50, 0.8)',
  },
  {
    id: 'acid-wood',
    element1: { emoji: '🧪', color: '#22C55E', name: 'Acid' },
    element2: { emoji: '🪵', color: '#B45309', name: 'Wood' },
    result: null,
    resultText: 'DISSOLVE!',
    effectColor: 'rgba(50, 255, 100, 0.8)',
  },
  {
    id: 'acid-fire',
    element1: { emoji: '🧪', color: '#22C55E', name: 'Acid' },
    element2: { emoji: '🔥', color: '#EF4444', name: 'Fire' },
    result: null,
    resultText: 'NEUTRALIZE!',
    effectColor: 'rgba(255, 200, 50, 0.8)',
  },
  {
    id: 'helium-safe',
    element1: { emoji: '🎈', color: '#EC4899', name: 'Helium' },
    element2: { emoji: '🧪', color: '#22C55E', name: 'Acid' },
    result: { emoji: '🎈', color: '#EC4899', name: 'Helium' },
    resultText: 'IMMUNE!',
    effectColor: 'rgba(236, 72, 153, 0.8)',
  },
  {
    id: 'stone-safe',
    element1: { emoji: '🪨', color: '#6B7280', name: 'Stone' },
    element2: { emoji: '🔥', color: '#EF4444', name: 'Fire' },
    result: { emoji: '🪨', color: '#6B7280', name: 'Stone' },
    resultText: 'BLOCKED!',
    effectColor: 'rgba(107, 114, 128, 0.8)',
  },
];

interface ReactionAnimationProps {
  isPlaying?: boolean;
}

export const ReactionAnimations = ({ isPlaying = false }: ReactionAnimationProps) => {
  const [currentReaction, setCurrentReaction] = useState<Reaction | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'approach' | 'collide' | 'result' | 'fade'>('idle');
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const startNewReaction = useCallback(() => {
    // Pick random reaction
    const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    // Pick random position (not too close to edges)
    const x = 25 + Math.random() * 50;
    const y = 25 + Math.random() * 40;
    setPosition({ x, y });
    setCurrentReaction(reaction);
    setAnimationPhase('approach');
  }, []);

  useEffect(() => {
    if (isPlaying) {
      setCurrentReaction(null);
      setAnimationPhase('idle');
      return;
    }

    // Start first reaction after delay
    const initialDelay = setTimeout(() => {
      startNewReaction();
    }, 2000);

    return () => clearTimeout(initialDelay);
  }, [isPlaying, startNewReaction]);

  useEffect(() => {
    if (!currentReaction || isPlaying) return;

    let timeout: NodeJS.Timeout;

    switch (animationPhase) {
      case 'approach':
        timeout = setTimeout(() => setAnimationPhase('collide'), 1200);
        break;
      case 'collide':
        timeout = setTimeout(() => setAnimationPhase('result'), 600);
        break;
      case 'result':
        timeout = setTimeout(() => setAnimationPhase('fade'), 1500);
        break;
      case 'fade':
        timeout = setTimeout(() => {
          setAnimationPhase('idle');
          // Start next reaction after a pause
          setTimeout(startNewReaction, 2000 + Math.random() * 2000);
        }, 800);
        break;
    }

    return () => clearTimeout(timeout);
  }, [animationPhase, currentReaction, isPlaying, startNewReaction]);

  if (isPlaying || !currentReaction) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <AnimatePresence>
        {animationPhase !== 'idle' && (
          <div
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Element 1 - approaches from left */}
            <motion.div
              className="absolute"
              initial={{ x: -80, y: 0, opacity: 0, scale: 0.5 }}
              animate={{
                x: animationPhase === 'approach' ? -30 : animationPhase === 'collide' ? 0 : 0,
                y: 0,
                opacity: animationPhase === 'fade' ? 0 : 1,
                scale: animationPhase === 'collide' ? 1.3 : 1,
                rotate: animationPhase === 'collide' ? [0, -10, 10, 0] : 0,
              }}
              transition={{
                duration: animationPhase === 'approach' ? 1 : 0.3,
                ease: animationPhase === 'approach' ? 'easeOut' : 'easeInOut',
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-white/30"
                style={{
                  backgroundColor: currentReaction.element1.color,
                  boxShadow: `0 0 30px ${currentReaction.element1.color}`,
                }}
              >
                {currentReaction.element1.emoji}
              </div>
            </motion.div>

            {/* Element 2 - approaches from right */}
            <motion.div
              className="absolute"
              initial={{ x: 80, y: 0, opacity: 0, scale: 0.5 }}
              animate={{
                x: animationPhase === 'approach' ? 30 : animationPhase === 'collide' ? 0 : 0,
                y: 0,
                opacity: animationPhase === 'fade' ? 0 : 1,
                scale: animationPhase === 'collide' ? 1.3 : 1,
                rotate: animationPhase === 'collide' ? [0, 10, -10, 0] : 0,
              }}
              transition={{
                duration: animationPhase === 'approach' ? 1 : 0.3,
                ease: animationPhase === 'approach' ? 'easeOut' : 'easeInOut',
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-white/30"
                style={{
                  backgroundColor: currentReaction.element2.color,
                  boxShadow: `0 0 30px ${currentReaction.element2.color}`,
                }}
              >
                {currentReaction.element2.emoji}
              </div>
            </motion.div>

            {/* Collision effect */}
            <AnimatePresence>
              {(animationPhase === 'collide' || animationPhase === 'result') && (
                <>
                  {/* Explosion ring */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
                    style={{ borderColor: currentReaction.effectColor }}
                    initial={{ width: 20, height: 20, opacity: 1 }}
                    animate={{ width: 150, height: 150, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  
                  {/* Particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: currentReaction.effectColor }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((i / 8) * Math.PI * 2) * 80,
                        y: Math.sin((i / 8) * Math.PI * 2) * 80,
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  ))}

                  {/* Center flash */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: currentReaction.effectColor }}
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: 60, height: 60, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Result text */}
            <AnimatePresence>
              {animationPhase === 'result' && (
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ top: -50 }}
                  initial={{ y: 20, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <span
                    className="px-4 py-2 rounded-full font-black text-lg text-white shadow-lg"
                    style={{
                      backgroundColor: currentReaction.effectColor,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {currentReaction.resultText}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result element (if any) */}
            <AnimatePresence>
              {animationPhase === 'result' && currentReaction.result && (
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl border-3 border-white/40"
                    style={{
                      backgroundColor: currentReaction.result.color,
                      boxShadow: `0 0 40px ${currentReaction.result.color}, 0 0 60px ${currentReaction.result.color}`,
                    }}
                  >
                    {currentReaction.result.emoji}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionAnimations;
