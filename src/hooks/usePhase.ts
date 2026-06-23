import { useEffect, useRef, useState } from "react";
import { getPhaseProgress, PhaseConfig } from "@/game/phases";

export function usePhase(score: number) {
  const { phase, next, progress } = getPhaseProgress(score);
  const [justAdvanced, setJustAdvanced] = useState<PhaseConfig | null>(null);
  const lastId = useRef(phase.id);

  useEffect(() => {
    if (phase.id > lastId.current) {
      setJustAdvanced(phase);
      lastId.current = phase.id;
    } else if (phase.id < lastId.current) {
      // Reset (new game)
      lastId.current = phase.id;
    }
  }, [phase.id]);

  const clearJustAdvanced = () => setJustAdvanced(null);

  return { phase, next, progress, justAdvanced, clearJustAdvanced };
}