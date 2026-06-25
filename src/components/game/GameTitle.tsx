import { motion } from 'framer-motion';

/**
 * Neon Glass Bento title — Space Grotesk gradient-clip headline that reads
 * cleanly on top of the lo-fi neon-alley backdrop. No 3D letter stacks.
 */
export const GameTitle = () => {
  return (
    <div className="flex flex-col items-center text-center select-none">
      <motion.span
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="font-sans text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.45em] text-cyan-300/80 mb-3"
      >
        Elemental · Neon Alley Edition
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, filter: 'blur(8px)', y: -4 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="font-display font-bold uppercase tracking-tighter leading-[0.92] text-[clamp(3rem,12vw,7rem)] bg-clip-text text-transparent"
        style={{
          backgroundImage:
            'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)',
          filter:
            'drop-shadow(0 0 18px rgba(255,255,255,0.25)) drop-shadow(0 0 38px hsl(190 95% 60% / 0.25))',
        }}
      >
        Block<br />Blast
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 flex flex-wrap justify-center gap-2"
      >
        <span className="font-sans px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30 backdrop-blur">
          Lo-Fi Rhythm
        </span>
        <span className="font-sans px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 backdrop-blur">
          Chain Reactions
        </span>
      </motion.div>
    </div>
  );
};

export default GameTitle;