import { PhaseConfig } from "@/game/phases";

interface AdaptiveStageProps {
  phase: PhaseConfig;
}

// Pure-CSS decorative layers; no JS animation loops.
const Decoration = ({ kind }: { kind: PhaseConfig["decoration"] }) => {
  if (kind === "gears") {
    return (
      <>
        <div className="stage-gear stage-gear--a" />
        <div className="stage-gear stage-gear--b" />
        <div className="stage-gear stage-gear--c" />
      </>
    );
  }
  if (kind === "clouds") {
    return (
      <>
        <div className="stage-cloud stage-cloud--a" />
        <div className="stage-cloud stage-cloud--b" />
        <div className="stage-cloud stage-cloud--c" />
      </>
    );
  }
  if (kind === "embers") {
    return (
      <>
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="stage-ember"
            style={{
              left: `${(i * 7 + 5) % 100}%`,
              animationDelay: `${(i % 7) * 0.6}s`,
              animationDuration: `${5 + (i % 5)}s`,
            }}
          />
        ))}
      </>
    );
  }
  // "blocks" — soft floating block silhouettes
  return (
    <>
      <div className="stage-float-block stage-float-block--a" />
      <div className="stage-float-block stage-float-block--b" />
      <div className="stage-float-block stage-float-block--c" />
    </>
  );
};

export function AdaptiveStage({ phase }: AdaptiveStageProps) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden adaptive-stage"
      style={{
        background: `radial-gradient(ellipse 60% 45% at 18% 20%, hsl(${phase.glow} / 0.22) 0%, transparent 60%),
          radial-gradient(ellipse 55% 50% at 85% 90%, hsl(${phase.accent} / 0.22) 0%, transparent 65%),
          linear-gradient(180deg, hsl(${phase.stageFrom}) 0%, hsl(${phase.stageTo}) 100%)`,
        transition: "background 1.2s ease",
      }}
    >
      {/* dot pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(hsl(${phase.accent} / 0.18) 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <Decoration kind={phase.decoration} />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 50%, transparent 45%, hsl(var(--pixar-navy-deep) / 0.85) 100%)",
        }}
      />
    </div>
  );
}

export default AdaptiveStage;