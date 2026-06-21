import { motion, useReducedMotion } from 'framer-motion';

interface PixarWordProps {
  text: string;
  className: string;
  baseDelay: number;
  size: string;
}

const PixarWord = ({ text, className, baseDelay, size }: PixarWordProps) => {
  return (
    <span className={`relative inline-flex ${size}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={`${text}-${i}`}
          initial={{ y: -40, opacity: 0, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            delay: baseDelay + i * 0.05,
            type: 'spring',
            stiffness: 380,
            damping: 14,
          }}
          className={`inline-block ${className}`}
          style={{ fontFamily: "'Abril Fatface', Georgia, serif" }}
        >
          {char}
        </motion.span>
      ))}
      <span aria-hidden className="pixar-shimmer-sweep" />
    </span>
  );
};

export const GameTitle = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center text-center select-none">
      {/* Eyebrow */}
      <motion.span
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-pixar-blue text-sm sm:text-base md:text-lg font-bold uppercase tracking-[0.4em] mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
        style={{ fontFamily: 'Cabin, system-ui, sans-serif' }}
      >
        Elemental
      </motion.span>

      {/* Stacked headline */}
      <h1
        className={`flex flex-col items-center leading-none ${reduceMotion ? '' : 'pixar-title-bob'}`}
      >
        <PixarWord
          text="BLOCK"
          baseDelay={0.25}
          size="text-6xl sm:text-7xl md:text-8xl lg:text-9xl"
          className="text-pixar-yellow pixar-letter-shadow-yellow tracking-tighter"
        />
        <PixarWord
          text="BLAST"
          baseDelay={0.55}
          size="text-6xl sm:text-7xl md:text-8xl lg:text-9xl -mt-3 sm:-mt-4 md:-mt-5"
          className="text-pixar-red pixar-letter-shadow-red"
        />
      </h1>
    </div>
  );
};

export default GameTitle;