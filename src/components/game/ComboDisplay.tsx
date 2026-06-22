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
            className="relative flex items-center gap-2 rounded-2xl border-2 border-pixar-yellow/60 bg-pixar-navy-deep/90 px-5 py-3 backdrop-blur-md"
            style={{
              boxShadow:
                '0 6px 0 hsl(var(--pixar-navy-deep)), 0 12px 24px hsl(var(--pixar-red) / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.25)',
            }}
          >
            <Zap className="h-6 w-6 text-pixar-yellow drop-shadow-[0_0_8px_hsl(var(--pixar-yellow))]" />
            <span className="pixar-text-shimmer text-3xl font-display uppercase tracking-[0.18em] animate-combo-pulse">
              Combo x{count}
            </span>
            <span className="neon-shockwave" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
