import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhaseConfig } from "@/game/phases";
import { playSound } from "@/game/sounds";

interface PhaseUpOverlayProps {
  phase: PhaseConfig | null;
  onDone: () => void;
}

export function PhaseUpOverlay({ phase, onDone }: PhaseUpOverlayProps) {
  useEffect(() => {
    if (!phase) return;
    try {
      playSound("combo");
    } catch {
      // ignore if sound missing
    }
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  return (
    <AnimatePresence>
      {phase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 40% at 50% 50%, hsl(${phase.glow} / 0.45) 0%, transparent 70%)`,
            }}
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="relative text-center px-8 py-6 rounded-3xl"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--pixar-navy) / 0.92), hsl(var(--pixar-navy-deep) / 0.96))",
              border: "2px solid hsl(var(--pixar-yellow) / 0.6)",
              boxShadow: "0 20px 60px hsl(var(--pixar-navy-deep) / 0.8), 0 0 40px hsl(var(--pixar-yellow) / 0.25)",
            }}
          >
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-pixar-yellow/90">
              Phase {phase.id} Unlocked
            </p>
            <p className="mt-2 text-5xl sm:text-6xl font-display bg-gradient-to-r from-pixar-yellow via-white to-pixar-red bg-clip-text text-transparent pixar-letter-shadow-yellow">
              {phase.name}
            </p>
            <p className="mt-2 text-sm font-sans text-white/80">{phase.tagline}</p>
            <p className="mt-1 text-xs font-sans text-white/55 italic">
              New shapes: {phase.unlocks}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PhaseUpOverlay;