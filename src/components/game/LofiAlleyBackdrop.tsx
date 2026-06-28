import { motion, useReducedMotion } from "framer-motion";
import alleyBg from "@/assets/hero-alley-with-cat.jpg";

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
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[hsl(224_70%_6%)]">
      {/* Artwork — kept crisp so the alley reads like the reference */}
      <motion.div
        className="absolute inset-0 bg-cover will-change-transform"
        style={{
          backgroundImage: `url(${alleyBg})`,
          // Push the painted cat into the lower-right corner so it never
          // sits behind the centered headline / CTA cluster.
          backgroundPosition: "85% 100%",
        }}
        animate={{
          filter: pulseActive
            ? "blur(0px) brightness(1.2) saturate(1.2)"
            : "blur(0px) brightness(1.02) saturate(1.12)",
          scale: pulseActive ? 1.02 : 1,
        }}
        transition={{ duration: pulseActive ? 0.4 : 0.7, ease: "easeOut" }}
      />

      {/* Light navy wash — keeps glass UI legible without killing the colors */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "hsl(224 70% 6%)" }}
        animate={{ opacity: pulseActive ? 0.25 : blurred ? 0.55 : 0.48 }}
        transition={{ duration: pulseActive ? 0.4 : 0.7, ease: "easeOut" }}
      />

      {/* Soft center spotlight so the headline + CTA cluster stay legible
          over the busy alley artwork. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 42%, hsl(224 70% 4% / 0.45) 0%, transparent 70%)",
        }}
      />

      {/* Edge-only vignette — center stays vivid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 95% 80% at 50% 50%, transparent 65%, hsl(224 70% 5% / 0.75) 100%)",
        }}
      />
    </div>
  );
};

export default LofiAlleyBackdrop;