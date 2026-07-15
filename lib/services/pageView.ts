"use client";

function getVisitorId() {
  if (typeof window === "undefined") return undefined;
  const key = "worklife-wh-visitor-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function trackPageView(pagePath: string) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    eventName: "page_view",
    eventType: "page_view",
    pagePath,
    metadata: { eventType: "page_view" },
    referrer: document.referrer,
    visitorId: getVisitorId(),
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/metrics/events", blob);
    return;
  }

  void fetch("/api/metrics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
