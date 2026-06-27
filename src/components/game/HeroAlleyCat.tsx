import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import walk1Asset from '@/assets/alley-cat-walk-1.png.asset.json';
import walk2Asset from '@/assets/alley-cat-walk-2.png.asset.json';
import sitAsset from '@/assets/alley-cat-sit.png.asset.json';
import stretchAsset from '@/assets/alley-cat-stretch.png.asset.json';

const FRAMES = {
  walk: [walk1Asset.url, walk2Asset.url],
  sit: sitAsset.url,
  stretch: stretchAsset.url,
} as const;

type CatState = 'walk' | 'sit' | 'stretch';

/**
 * Ambient neon alley-cat hero character.
 * Wander → pause → stretch → wander loop. No user interaction.
 */
export const HeroAlleyCat = () => {
  const reduceMotion = useReducedMotion();

  const [catState, setCatState] = useState<CatState>('walk');
  const [walkFrame, setWalkFrame] = useState(0);
  const [targetX, setTargetX] = useState(0);
  const [facingRight, setFacingRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Pick a new random X target within safe bounds.
  const pickTarget = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;
    const bounds = container.getBoundingClientRect();
    const isMobile = bounds.width < 640;
    const minPct = isMobile ? 5 : 10;
    const maxPct = isMobile ? 55 : 70;
    const pct = minPct + Math.random() * (maxPct - minPct);
    return (pct / 100) * bounds.width;
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setCatState('sit');
      return;
    }

    let cancelled = false;

    const walkLoop = () => {
      if (cancelled) return;
      setCatState('walk');
      const newTarget = pickTarget();
      setTargetX(newTarget);
      setFacingRight((prev) => {
        // Only flip if target is meaningfully different
        const current = containerRef.current;
        if (!current) return prev;
        const rect = current.getBoundingClientRect();
        const currentX = rect.width * 0.1; // rough start
        return newTarget > currentX ? true : false;
      });

      // Walk frame flipper
      const frameTimer = setInterval(() => {
        setWalkFrame((f) => (f === 0 ? 1 : 0));
      }, 600);

      // Travel time based on distance (4–7 s)
      const travelTime = 4000 + Math.random() * 3000;
      const pauseTimer = setTimeout(() => {
        clearInterval(frameTimer);
        if (cancelled) return;
        setCatState('sit');
        const sitTime = 2000 + Math.random() * 2000;
        const stretchTimer = setTimeout(() => {
          if (cancelled) return;
          setCatState('stretch');
          const resumeTimer = setTimeout(() => {
            if (cancelled) return;
            walkLoop();
          }, 600);
          timersRef.current.push(resumeTimer);
        }, sitTime);
        timersRef.current.push(stretchTimer);
      }, travelTime);

      timersRef.current.push(pauseTimer);
    };

    walkLoop();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [reduceMotion, pickTarget, clearTimers]);

  const currentImage =
    catState === 'walk'
      ? FRAMES.walk[walkFrame]
      : catState === 'sit'
        ? FRAMES.sit
        : FRAMES.stretch;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-16 sm:h-20 md:h-24 pointer-events-none select-none"
    >
      <motion.div
        className="absolute bottom-0 w-20 sm:w-24 md:w-28"
        animate={{
          x: targetX,
          y: reduceMotion ? [0, -4, 0] : 0,
        }}
        transition={{
          x: { duration: reduceMotion ? 0 : 4 + Math.random() * 3, ease: 'easeInOut' },
          y: reduceMotion ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 },
        }}
        initial={{ x: 0, opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        {/* Soft contact shadow puddle to ground the cat */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-[85%] h-2 sm:h-2.5 rounded-[50%]"
          style={{
            background:
              'radial-gradient(ellipse at center, hsl(0 0% 0% / 0.55) 0%, hsl(0 0% 0% / 0.25) 45%, transparent 75%)',
            filter: 'blur(3px)',
          }}
        />
        {/* Magenta back-rim glow bleeds into the alley palette */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 70%, hsl(var(--neon-magenta) / 0.28), transparent 65%)',
            filter: 'blur(10px)',
            mixBlendMode: 'screen',
          }}
        />
        {/* The cat — softer cyan rim + slight haze for atmospheric blending */}
        <motion.img
          src={currentImage}
          alt="Neon alley cat"
          className="relative w-full h-auto"
          style={{
            filter:
              'drop-shadow(0 1px 0 hsl(0 0% 0% / 0.35)) drop-shadow(0 0 6px hsl(var(--neon-cyan) / 0.35)) drop-shadow(0 0 14px hsl(var(--neon-magenta) / 0.22)) saturate(0.92) contrast(0.95)',
            transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
            opacity: 0.92,
          }}
          loading="eager"
          draggable={false}
        />
        {/* Atmospheric haze tint sampled from alley fog */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, hsl(220 40% 8% / 0.35) 0%, hsl(220 40% 8% / 0.05) 40%, transparent 100%)',
            mixBlendMode: 'multiply',
          }}
        />
      </motion.div>
    </div>
  );
};

export default HeroAlleyCat;
