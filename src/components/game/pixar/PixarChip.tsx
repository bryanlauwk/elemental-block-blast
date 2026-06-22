import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

interface PixarChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  active?: boolean;
}

const sizeMap: Record<Size, string> = {
  sm: "w-9 h-9 rounded-xl",
  md: "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl",
  lg: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl",
};

/**
 * Shared Pixar Toy Box icon chip — chunky navy capsule with a yellow/red
 * hover halo. Use for every top-bar/menu icon to keep the look consistent.
 */
export const PixarChip = forwardRef<HTMLButtonElement, PixarChipProps>(
  ({ className, size = "md", active = false, children, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={cn(
        "pixar-glass-chip flex items-center justify-center transition-all",
        "hover:-translate-y-0.5 active:translate-y-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-pixar-yellow/70",
        active && "ring-2 ring-pixar-yellow/70",
        sizeMap[size],
        className,
      )}
    >
      {children}
    </button>
  ),
);

PixarChip.displayName = "PixarChip";