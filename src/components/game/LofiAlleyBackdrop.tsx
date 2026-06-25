import { motion, useReducedMotion } from "framer-motion";
import alleyBg from "@/assets/popart-alley-bg.jpg";

interface LofiAlleyBackdropProps {
  /** Blur the artwork while gameplay is active so the board stays the focus. */
  blurred?: boolean;
  /** Briefly brighten & sharpen the backdrop (e.g. on phase-up). */
  pulse?: boolean;
}

/**
 * Vibrant pop-art alley atmosphere layer that sits behind the entire screen.
 * Renders three stacked layers: artwork → ink overlay → strong vignette.
 * Tuned for a saturated bright source: heavy overlay & blur during play so
 * the board wins, full-bleed glow on the landing screen.
 * GPU-only transitions (filter / opacity / transform) to keep 60fps.
 */
export const LofiAlleyBackdrop = ({ blurred = false, pulse = false }: LofiAlleyBackdropProps) => {
  const reduceMotion = useReducedMotion();
  const pulseActive = pulse && !reduceMotion;

  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Artwork */}
      <motion.div
        className="absolute inset-0 bg-center bg-cover will-change-transform"
        style={{ backgroundImage: `url(${alleyBg})` }}
        animate={{
          filter: pulseActive
            ? "blur(0px) brightness(1.18) saturate(1.2)"
            : blurred
              ? "blur(8px) brightness(0.78) saturate(0.9)"
              : "blur(0px) brightness(1) saturate(1.08)",
          scale: pulseActive ? 1.02 : 1,
        }}
        transition={{ duration: pulseActive ? 0.45 : 0.9, ease: "easeOut" }}
      />

      {/* Ink overlay — landing lets the art shine, gameplay pushes it back */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "hsl(258 60% 6%)" }}
        animate={{ opacity: pulseActive ? 0.2 : blurred ? 0.62 : 0.18 }}
        transition={{ duration: pulseActive ? 0.45 : 0.9, ease: "easeOut" }}
      />

      {/* Strong vignette pushing focus to the board — corners go near-black */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: blurred
            ? "radial-gradient(ellipse 60% 48% at 50% 50%, transparent 30%, hsl(258 70% 4% / 0.92) 100%)"
            : "radial-gradient(ellipse 80% 65% at 50% 50%, transparent 55%, hsl(258 70% 4% / 0.55) 100%)",
        }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
};

export default LofiAlleyBackdrop;