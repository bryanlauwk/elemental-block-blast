import { PhaseConfig } from "@/game/phases";

interface PhasePillProps {
  phase: PhaseConfig;
  next: PhaseConfig | null;
  progress: number;
}

export function PhasePill({ phase, next, progress }: PhasePillProps) {
  return (
    <div className="w-full max-w-[420px] mt-2">
      <div
        className="flex items-center gap-3 rounded-2xl px-3 py-1.5 border border-pixar-blue/25"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--pixar-navy) / 0.85), hsl(var(--pixar-navy-deep) / 0.95))",
          boxShadow:
            "0 1px 0 hsl(var(--pixar-blue) / 0.25) inset, 0 8px 24px hsl(var(--pixar-navy-deep) / 0.5)",
        }}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm text-pixar-navy-deep"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--pixar-yellow)), hsl(var(--pixar-yellow-deep)))",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 0 hsl(var(--pixar-yellow-deep))",
          }}
          aria-label={`Phase ${phase.id}`}
        >
          {phase.id}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-sm text-white truncate tracking-wide">
              {phase.name}
            </span>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/55 shrink-0">
              {next ? `Next: ${next.name}` : "Max phase"}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.round(progress * 100)}%`,
                background:
                  "linear-gradient(90deg, hsl(var(--pixar-yellow)), hsl(var(--pixar-red)))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhasePill;