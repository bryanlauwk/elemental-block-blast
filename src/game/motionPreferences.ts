/**
 * Centralized motion preferences. Combines the OS `prefers-reduced-motion`
 * signal with an in-app user override (persisted to localStorage) so players
 * can simplify particle effects (smoke plumes, debris, multi-stage bombs)
 * independently of system settings.
 */

const STORAGE_KEY = "ebb.reducedMotion"; // 'on' | 'off' | (absent → follow OS)

type Listener = (reduced: boolean) => void;
const listeners = new Set<Listener>();

function osPrefersReduced(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export type ReducedMotionOverride = "on" | "off" | "system";

export function getReducedMotionOverride(): ReducedMotionOverride {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "on" || v === "off") return v;
  return "system";
}

export function isReducedMotion(): boolean {
  const override = getReducedMotionOverride();
  if (override === "on") return true;
  if (override === "off") return false;
  return osPrefersReduced();
}

export function setReducedMotionOverride(value: ReducedMotionOverride) {
  if (typeof window === "undefined") return;
  if (value === "system") window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, value);
  const next = isReducedMotion();
  listeners.forEach((l) => l(next));
}

export function subscribeReducedMotion(listener: Listener): () => void {
  listeners.add(listener);
  // Also forward OS-level changes so UI stays in sync.
  let mq: MediaQueryList | null = null;
  const onOs = () => listener(isReducedMotion());
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener?.("change", onOs);
    } catch {}
  }
  return () => {
    listeners.delete(listener);
    mq?.removeEventListener?.("change", onOs);
  };
}