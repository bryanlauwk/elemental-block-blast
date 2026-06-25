type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

const isBrowser = typeof window !== 'undefined';

export const trackGameEvent = (eventName: string, payload: AnalyticsPayload = {}) => {
  if (!isBrowser) return;

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

  window.dispatchEvent(new CustomEvent('elemental-game-event', {
    detail: { eventName, payload: cleanPayload, timestamp: Date.now() },
  }));

  // Optional adapters for future GA4/GTM wiring. Safe no-op when unavailable.
  const win = window as typeof window & {
    dataLayer?: unknown[];
    gtag?: (event: 'event', name: string, payload?: AnalyticsPayload) => void;
  };

  win.dataLayer?.push({ event: eventName, ...cleanPayload });
  win.gtag?.('event', eventName, cleanPayload);
};
