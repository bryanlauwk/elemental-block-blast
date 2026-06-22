import { HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PixarOverlayProps extends HTMLAttributes<HTMLDivElement> {
  /** Constrain to its container vs. the full viewport. Default constrained. */
  fullscreen?: boolean;
}

/**
 * Pixar-themed dim overlay used for game-over / modal-style screens within
 * a container. Navy wash + soft Pixar glow.
 */
export function PixarOverlay({
  className,
  fullscreen = false,
  children,
  ...props
}: PixarOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        fullscreen ? "fixed" : "absolute",
        "inset-0 z-20 flex flex-col items-center justify-center rounded-3xl",
        "bg-pixar-navy-deep/85 backdrop-blur-sm",
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