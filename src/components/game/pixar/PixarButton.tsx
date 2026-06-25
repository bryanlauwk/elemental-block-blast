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
  // primary = cyan→magenta neon pill
  primary:
    "text-white border border-white/25 bg-[linear-gradient(135deg,hsl(190_95%_55%)_0%,hsl(268_85%_60%)_50%,hsl(306_90%_60%)_100%)] shadow-[0_0_30px_hsl(190_95%_55%/0.35),0_0_60px_hsl(306_90%_60%/0.25)]",
  // secondary = frosted glass with cyan hairline
  secondary:
    "text-white bg-white/8 border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_24px_hsl(190_95%_60%/0.22)]",
  // ghost = quiet glass
  ghost:
    "text-white/85 bg-white/5 border border-white/15 backdrop-blur-xl",
};

const sizeMap: Record<Size, { pad: string; text: string }> = {
  sm: { pad: "px-5 py-2", text: "text-sm" },
  md: { pad: "px-7 py-3", text: "text-base" },
  lg: {
    pad: "px-12 sm:px-14 md:px-16 py-4 sm:py-5",
    text: "text-xl sm:text-2xl md:text-3xl",
  },
};

/**
 * Neon Glass Bento button. Primary = cyan→violet→magenta neon pill,
 * secondary/ghost = frosted glass with hairline borders.
 */
export const PixarButton = forwardRef<HTMLButtonElement, PixarButtonProps>(
  (
    { className, variant = "primary", size = "md", shine = false, children, onClick, ...props },
    ref,
  ) => {
    const s = sizeMap[size];
    return (
      <button
        ref={ref}
        {...props}
        onClick={(e) => {
          playSound("select");
          onClick?.(e);
        }}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-2xl overflow-hidden",
          "font-display font-bold uppercase tracking-[0.2em] leading-none",
          "transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          variantFace[variant],
          s.pad,
          s.text,
          className,
        )}
      >
        {/* Top inner highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
        />
        {shine && <span aria-hidden className="pixar-shine" />}
        <span className="relative z-10">{children}</span>
      </button>
    );
  },
);

PixarButton.displayName = "PixarButton";