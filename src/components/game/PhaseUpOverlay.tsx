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
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  return (
    <AnimatePresence>
      {phase && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          className="pointer-events-none fixed top-3 left-1/2 -translate-x-1/2 z-50 flex justify-center px-3 w-full max-w-md"
        >
          <div
            className="relative flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-md"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--pixar-navy) / 0.78), hsl(var(--pixar-navy-deep) / 0.82))",
              border: `1px solid hsl(${phase.glow} / 0.55)`,
              boxShadow: `0 8px 24px hsl(var(--pixar-navy-deep) / 0.5), 0 0 18px hsl(${phase.glow} / 0.35)`,
            }}
          >
            <span
              className="text-[10px] font-sans font-bold uppercase tracking-[0.28em] px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                color: `hsl(${phase.glow})`,
                background: `hsl(${phase.glow} / 0.12)`,
                border: `1px solid hsl(${phase.glow} / 0.4)`,
              }}
            >
              Phase {phase.id}
            </span>
            <div className="flex flex-col leading-tight min-w-0">
              <p className="text-sm sm:text-base font-display text-white truncate">
                {phase.name}
              </p>
              <p className="text-[11px] font-sans text-white/65 truncate">
                {phase.tagline}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PhaseUpOverlay;