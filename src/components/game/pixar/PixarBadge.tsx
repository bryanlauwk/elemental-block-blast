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
        "ui-btn-xs ui-label-xs gap-1.5 border-b-2",
        toneStyles[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}