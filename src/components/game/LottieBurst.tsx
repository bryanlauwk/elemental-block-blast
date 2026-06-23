import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";
import confetti from "@/assets/lottie/confetti.json";
import sparkle from "@/assets/lottie/sparkle.json";

const DATA = { confetti, sparkle } as const;

interface LottieBurstProps {
  type: keyof typeof DATA;
  /** Increment this to fire the animation once. */
  trigger: number;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Plays a celebratory Lottie once each time `trigger` changes, then unmounts.
// Self-authored animations (Pixar palette) live in src/assets/lottie.
export function LottieBurst({ type, trigger, className }: LottieBurstProps) {
  const [show, setShow] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (trigger > 0 && !prefersReducedMotion()) setShow(true);
  }, [trigger]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[60] flex items-center justify-center",
        className
      )}
    >
      <Lottie
        key={trigger}
        lottieRef={lottieRef}
        animationData={DATA[type]}
        loop={false}
        autoplay
        onComplete={() => setShow(false)}
        className="h-full w-full max-w-[520px]"
      />
    </div>
  );
}

export default LottieBurst;
