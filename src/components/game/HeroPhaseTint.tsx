import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PHASES = [
  {
    name: 'Sandbox',
    gradient:
      'radial-gradient(ellipse 70% 50% at 50% 28%, hsl(190 95% 60% / 0.14), transparent 70%)',
  },
  {
    name: 'Toy Factory',
    gradient:
      'radial-gradient(ellipse 70% 50% at 50% 28%, hsl(42 100% 60% / 0.14), transparent 70%)',
  },
  {
    name: 'Cloud City',
    gradient:
      'radial-gradient(ellipse 70% 50% at 50% 28%, hsl(268 85% 70% / 0.14), transparent 70%)',
  },
  {
    name: 'Volcano Run',
    gradient:
      'radial-gradient(ellipse 70% 50% at 50% 28%, hsl(0 85% 55% / 0.14), transparent 70%)',
  },
];

/**
 * Slow phase-cycling tint layer scoped to the hero area.
 * Crossfades through the four game-world moods on a ~34 s loop.
 */
export const HeroPhaseTint = () => {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const INTERVAL = 8500; // 6 s hold + 2.5 s crossfade overlap
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHASES.length);
    }, INTERVAL);

    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div aria-hidden className="absolute inset-0 -z-[1] overflow-hidden">
      {PHASES.map((phase, i) => (
        <motion.div
          key={phase.name}
          className="absolute inset-0"
          style={{ background: phase.gradient }}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export default HeroPhaseTint;
