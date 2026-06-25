import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { playSound } from "@/game/sounds";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface PixarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Adds an animated light sweep across the face (a "press me" cue). */
  shine?: boolean;
}

const variantFace: Record<Variant, string> = {
  primary: "bg-pixar-red text-white",
  secondary: "bg-pixar-yellow text-pixar-navy-deep",
  ghost:
    "bg-pixar-navy/70 text-white border border-pixar-blue/40 backdrop-blur",
};

const variantShadow: Record<Variant, string> = {
  primary: "bg-pixar-red-deep",
  secondary: "bg-pixar-yellow-deep",
  ghost: "bg-pixar-navy-deep",
};

const sizeMap: Record<Size, { pad: string; text: string; offset: string }> = {
  sm: { pad: "px-5 py-2", text: "text-base", offset: "-bottom-1" },
  md: { pad: "px-8 py-3", text: "text-xl", offset: "-bottom-1.5" },
  lg: {
    pad: "px-14 sm:px-16 md:px-20 py-4 sm:py-5 md:py-6",
    text: "text-3xl sm:text-4xl md:text-5xl",
    offset: "-bottom-2",
  },
};

/**
 * Chunky Pixar 3D button: candy face + offset shadow layer + glossy top
 * highlight. Primary = red, secondary = yellow, ghost = navy glass.
 */
export const PixarButton = forwardRef<HTMLButtonElement, PixarButtonProps>(
  (
    { className, variant = "primary", size = "md", shine = false, children, onClick, ...props },
    ref,
  ) => {
    const s = sizeMap[size];
    const ringColor =
      variant === "secondary" ? "focus-visible:ring-pixar-red/60" : "focus-visible:ring-pixar-yellow/60";
    return (
      <button
        ref={ref}
        {...props}
        onClick={(e) => {
          playSound("select");
          onClick?.(e);
        }}
        className={cn(
          "group relative inline-block rounded-full",
          "focus:outline-none focus-visible:ring-4",
          ringColor,
          className,
        )}
      >
        {/* Drop-shadow layer */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 rounded-full",
            s.offset,
            variantShadow[variant],
          )}
        />
        {/* Face */}
        <span
          className={cn(
            "relative block rounded-full overflow-hidden transition-transform",
            "active:translate-y-1 group-hover:brightness-110",
            s.pad,
            variantFace[variant],
          )}
        >
          {/* Top gloss */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full"
          />
          {/* Bottom inner shadow */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent rounded-b-full"
          />
          {/* Animated light sweep */}
          {shine && <span aria-hidden className="pixar-shine" />}
          <span
            className={cn(
              "relative z-10 block leading-none uppercase tracking-widest font-display",
              s.text,
            )}
            style={{
              textShadow:
                variant === "secondary"
                  ? "0 2px 0 hsl(var(--pixar-yellow-deep)), 0 4px 8px rgba(0,0,0,0.25)"
                  : "0 2px 0 hsl(var(--pixar-red-deep)), 0 4px 8px rgba(0,0,0,0.35)",
            }}
          >
            {children}
          </span>
        </span>
      </button>
    );
  },
);

PixarButton.displayName = "PixarButton";