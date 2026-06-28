import { motion, useReducedMotion } from 'framer-motion';
import heroScene from '@/assets/hero-alley-with-cat.jpg';

/**
 * Baked-in neon alley hero scene with the cat painted into the artwork.
 * Tiny CSS-only blink overlays are positioned over the cat's eyes so it
 * feels genuinely alive without any sticker-like sprite motion.
 */
export const HeroCatScene = () => {
  const reduceMotion = useReducedMotion();

  // Eye coordinates calibrated against the painted image (1920x1024).
  // Tweak only if the source artwork changes.
  const eyes = [
    { left: '48.6%', top: '70.2%' },
    { left: '52.4%', top: '70.4%' },
  ];

  return (
    <div className="relative w-full max-w-[640px] mx-auto pointer-events-none select-none">
      <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]">
        <img
          src={heroScene}
          alt="Neon alley cat at night"
          width={1920}
          height={1024}
          className="block w-full h-auto"
          draggable={false}
        />

        {/* Subtle bottom fade so the scene reads as continuous with the page */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 70%, hsl(224 70% 6% / 0.65) 100%)',
          }}
        />

        {/* Eye-blink overlays — CSS only, no sprite. Disabled in reduced motion. */}
        {!reduceMotion &&
          eyes.map((eye, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute"
              style={{
                left: eye.left,
                top: eye.top,
                width: '1.1%',
                height: '1.4%',
                background: 'hsl(220 45% 8%)',
                borderRadius: '40%',
                transform: 'translate(-50%, -50%)',
                transformOrigin: 'center',
                mixBlendMode: 'multiply',
              }}
              animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
              transition={{
                duration: 0.5,
                times: [0, 0.85, 0.92, 0.99, 1],
                repeat: Infinity,
                repeatDelay: 3.6 + i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}

        {/* Gentle neon flicker on signs — purely atmospheric */}
        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 30% 25% at 22% 28%, hsl(320 95% 62% / 0.18), transparent 70%), radial-gradient(ellipse 22% 22% at 92% 18%, hsl(190 95% 60% / 0.18), transparent 70%)',
              mixBlendMode: 'screen',
            }}
            animate={{ opacity: [0.6, 1, 0.7, 1, 0.85] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
};

export default HeroCatScene;