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
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="stage-ember"
            style={{
              left: `${(i * 11 + 3) % 100}%`,
              animationDelay: `${(i % 9) * 0.45}s`,
              animationDuration: `${4 + (i % 5)}s`,
            }}
          />
        ))}
      </>
    );
  }
  if (kind === "crystals") {
    return (
      <>
        <div className="stage-crystal stage-crystal--a" />
        <div className="stage-crystal stage-crystal--b" />
        <div className="stage-crystal stage-crystal--c" />
        <div className="stage-crystal stage-crystal--d" />
      </>
    );
  }
  if (kind === "stars") {
    return (
      <>
        {Array.from({ length: 54 }).map((_, i) => (
          <span
            key={i}
            className="stage-star"
            style={{
              left: `${(i * 13 + 7) % 100}%`,
              top: `${(i * 29 + 11) % 100}%`,
              animationDelay: `${(i % 9) * 0.4}s`,
              animationDuration: `${2.5 + (i % 4)}s`,
            }}
          />
        ))}
        <div className="stage-shooting-star" />
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
      {/* light vignette — only gently darkens the far corners so the scene
          stays bold and readable (sits BELOW the animated decorations) */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 95% 75% at 50% 46%, transparent 62%, hsl(${phase.stageTo} / 0.5) 100%)`,
          transition: "background 1.2s ease",
        }}
      />
      {/* dot pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(hsl(${phase.accent} / 0.18) 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
        }}
      />
      {/* animated decorations ride crisply on top of everything */}
      <Decoration kind={phase.decoration} />
    </div>
  );
}

export default AdaptiveStage;