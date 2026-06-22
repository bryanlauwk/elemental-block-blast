import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "yellow" | "red" | "blue";

interface PixarBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

const toneStyles: Record<Tone, string> = {
  yellow: "bg-pixar-yellow text-pixar-navy-deep border-pixar-yellow-deep",
  red: "bg-pixar-red text-white border-pixar-red-deep",
  blue: "bg-pixar-blue text-pixar-navy-deep border-pixar-blue-deep",
};

/**
 * Tiny chunky Pixar pill for status callouts (Daily Challenge, New High Score).
 */
export function PixarBadge({
  tone = "yellow",
  icon,
  className,
  children,
  ...props
}: PixarBadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-sans border-b-2",
        toneStyles[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}