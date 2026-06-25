import { motion, useReducedMotion } from "framer-motion";
import alleyBg from "@/assets/lofi-neon-alley.jpg";

interface LofiAlleyBackdropProps {
  /** Blur the artwork while gameplay is active so the board stays the focus. */
  blurred?: boolean;
  /** Briefly brighten & sharpen the backdrop (e.g. on phase-up). */
  pulse?: boolean;
}

/**
 * Cozy lo-fi neon-alley atmosphere layer that sits behind the entire screen.
 * Renders three stacked layers: artwork → navy overlay → soft vignette.
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
            ? "blur(0px) brightness(1.18) saturate(1.15)"
            : blurred
              ? "blur(6px) brightness(0.95) saturate(1.05)"
              : "blur(0px) brightness(1) saturate(1.05)",
          scale: pulseActive ? 1.02 : 1,
        }}
        transition={{ duration: pulseActive ? 0.45 : 0.9, ease: "easeOut" }}
      />

      {/* Navy overlay — drops during pulse so the art shines through */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "hsl(224 70% 8%)" }}
        animate={{ opacity: pulseActive ? 0.28 : blurred ? 0.68 : 0.6 }}
        transition={{ duration: pulseActive ? 0.45 : 0.9, ease: "easeOut" }}
      />

      {/* Soft vignette pushing focus to the board */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, transparent 45%, hsl(224 70% 6% / 0.7) 100%)",
        }}
      />
    </div>
  );
};

export default LofiAlleyBackdrop;