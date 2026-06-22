import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "yellow" | "red" | "neutral";

interface PixarStatChipProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  tone?: Tone;
}

const toneBorder: Record<Tone, string> = {
  blue: "border-pixar-blue/40",
  yellow: "border-pixar-yellow/45",
  red: "border-pixar-red/40",
  neutral: "border-white/15",
};

const toneLabel: Record<Tone, string> = {
  blue: "text-pixar-blue",
  yellow: "text-pixar-yellow",
  red: "text-pixar-red",
  neutral: "text-white/60",
};

/**
 * Pill stat chip used across landing + game-over screens. Pairs an uppercase
 * label with a value, tinted by Pixar accent tone.
 */
export function PixarStatChip({
  label,
  value,
  tone = "neutral",
  className,
  ...props
}: PixarStatChipProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-full bg-pixar-navy-deep/70 border-2",
        toneBorder[tone],
        className,
      )}
    >
      <span
        className={cn(
          "text-[10px] sm:text-xs font-bold uppercase tracking-wider font-sans",
          toneLabel[tone],
        )}
      >
        {label}
      </span>
      <span className="text-white font-bold text-sm">{value}</span>
    </div>
  );
}