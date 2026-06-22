import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PixarPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Show the Pixar yellow→red accent line across the top edge. */
  topAccent?: boolean;
  /** Pop highlight (used when a new best score lands). */
  highlight?: boolean;
}

/**
 * Shared Pixar HUD container — navy glassy panel with optional top accent.
 * Wrap any scoreboard / sidebar / inline panel in this for one look.
 */
export const PixarPanel = forwardRef<HTMLDivElement, PixarPanelProps>(
  ({ className, topAccent = true, highlight = false, children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className={cn(
        "pixar-hud-panel relative overflow-hidden rounded-3xl",
        highlight && "neon-hud-panel--best-pop",
        className,
      )}
    >
      {topAccent && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, hsl(var(--pixar-yellow)) 30%, hsl(var(--pixar-red)) 70%, transparent 100%)",
          }}
        />
      )}
      {children}
    </div>
  ),
);

PixarPanel.displayName = "PixarPanel";