"use client";

type GAEventParam = string | number | boolean | null | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js",
      targetIdOrEventName: string | Date,
      config?: Record<string, GAEventParam>,
    ) => void;
  }
}

export function trackGAEvent(
  eventName: string,
  params?: Record<string, GAEventParam>,
) {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", eventName, params || {});
}
