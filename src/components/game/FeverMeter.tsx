import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeverMeterProps {
  /** Charge 0-100 while building up. */
  meter: number;
  /** Whether Fever (double score) is currently active. */
  active: boolean;
  /** Timestamp (ms) when the active Fever ends. */
  endsAt: number;
}

/**
 * Reaction Fever HUD: a charging bar that fills from reactions & line clears,
 * then flips into a draining "FEVER ×2" overdrive bar while active.
 */
export function FeverMeter({ meter, active, endsAt }: FeverMeterProps) {
  const [remaining, setRemaining] = useState(1); // 0..1 time left during Fever
  const durationRef = useRef(1);

  useEffect(() => {
    if (!active) return;
    durationRef.current = Math.max(1, endsAt - Date.now());
    let raf = 0;
    const tick = () => {
      const left = Math.max(0, endsAt - Date.now());
      setRemaining(left / durationRef.current);
      if (left > 0) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, endsAt]);

  const fill = active ? remaining * 100 : meter;

  return (
    <div className="classic-fever-meter w-full max-w-[420px] mt-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl px-3 py-1.5 border transition-colors",
          active ? "border-pixar-red/60" : "border-white/15",
        )}
        style={{
          background:
            "linear-gradient(155deg, hsl(0 0% 100% / 0.10), hsl(var(--pixar-navy) / 0.52), hsl(var(--pixar-navy-deep) / 0.78))",
          boxShadow: active
            ? "0 0 22px hsl(var(--pixar-red) / 0.5), 0 1px 0 hsl(var(--pixar-red) / 0.3) inset"
            : "0 1px 0 hsl(0 0% 100% / 0.25) inset, 0 8px 24px hsl(var(--pixar-navy-deep) / 0.5)",
          backdropFilter: "blur(18px) saturate(160%)",
        }}
      >
        <motion.span
          animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={active ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
        >
          <Flame
            className={cn("w-4 h-4 shrink-0", active ? "text-pixar-red" : "text-pixar-blue")}
            fill={active ? "hsl(var(--pixar-yellow))" : "none"}
          />
        </motion.span>

        <span
          className={cn(
            "ui-label-xs shrink-0 w-14",
            active ? "text-pixar-yellow" : "text-white/55",
          )}
        >
          {active ? "Fever!" : "Fever"}
        </span>

        <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            animate={{ width: `${fill}%` }}
            transition={{ duration: active ? 0.1 : 0.4, ease: "easeOut" }}
            style={{
              background: active
                ? "linear-gradient(90deg, hsl(var(--pixar-yellow)), hsl(var(--pixar-red)))"
                : "linear-gradient(90deg, hsl(var(--pixar-blue)), hsl(var(--pixar-yellow)))",
            }}
          />
        </div>

        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-xs font-display text-white shrink-0 px-1.5 py-0.5 rounded-md"
              style={{ background: "linear-gradient(180deg, hsl(var(--pixar-red)), hsl(var(--pixar-red-deep)))" }}
            >
              ×2
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FeverMeter;
