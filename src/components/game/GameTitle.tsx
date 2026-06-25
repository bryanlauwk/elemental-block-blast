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
        className="ui-label-xs text-cyan-300/80 mb-3"
      >
        Elemental · Neon Alley Edition
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, filter: 'blur(8px)', y: -4 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="font-display font-bold uppercase tracking-tighter leading-[0.92] text-[clamp(2.75rem,11vw,6.25rem)] bg-clip-text text-transparent"
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
        className="mt-3 flex flex-wrap justify-center gap-2"
      >
        <span className="ui-btn-xs ui-label-xs bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30 backdrop-blur">
          Lo-Fi Rhythm
        </span>
        <span className="ui-btn-xs ui-label-xs bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 backdrop-blur">
          Chain Reactions
        </span>
      </motion.div>
    </div>
  );
};

export default GameTitle;