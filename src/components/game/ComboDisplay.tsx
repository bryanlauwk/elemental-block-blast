import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ComboDisplayProps {
  count: number;
  show: boolean;
}

export function ComboDisplay({ count, show }: ComboDisplayProps) {
  return (
    <AnimatePresence>
      {show && count > 1 && (
        <motion.div
          initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0, y: -60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div
            className="relative flex items-center gap-2 rounded-xl border border-neon-mint/50 bg-neon-bg-deep/85 px-5 py-3 backdrop-blur-md"
            style={{
              boxShadow:
                '0 0 28px hsl(var(--neon-magenta) / 0.5), 0 0 60px hsl(var(--neon-mint) / 0.3), inset 0 1px 0 hsl(var(--neon-mint) / 0.4)',
            }}
          >
            <Zap className="h-6 w-6 text-neon-mint drop-shadow-[0_0_8px_hsl(var(--neon-mint))]" />
            <span className="neon-shimmer-text text-3xl font-black uppercase tracking-[0.18em] animate-combo-pulse">
              Combo x{count}
            </span>
            <span className="neon-shockwave" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
