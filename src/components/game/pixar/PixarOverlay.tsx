import { HTMLAttributes, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useModalA11y } from "@/hooks/useModalA11y";

interface PixarOverlayProps extends HTMLAttributes<HTMLDivElement> {
  /** Constrain to its container vs. the full viewport. Default constrained. */
  fullscreen?: boolean;
  /** Whether to trap focus and lock scroll while visible. */
  modal?: boolean;
  /** Optional escape handler for dismissible modals. */
  onEscape?: () => void;
}

/**
 * Pixar-themed dim overlay used for game-over / modal-style screens within
 * a container. Navy wash + soft Pixar glow.
 */
export function PixarOverlay({
  className,
  fullscreen = false,
  modal = true,
  onEscape,
  children,
  ...props
}: PixarOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  useModalA11y(overlayRef, modal, { onEscape });

  return (
    <motion.div
      ref={overlayRef}
      role="dialog"
      aria-modal={modal ? "true" : undefined}
      tabIndex={-1}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.18, ease: "easeOut" }}
      className={cn(
        fullscreen ? "fixed" : "absolute",
        "pixar-modal-overlay inset-0 z-20 flex flex-col items-center justify-center rounded-3xl",
        "bg-pixar-navy-deep/40 backdrop-blur-2xl backdrop-saturate-150",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 50% 30%, hsl(var(--pixar-blue) / 0.22) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 50% 90%, hsl(var(--pixar-red) / 0.18) 0%, transparent 70%)",
      }}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}
