"use client";

import { supabase } from "@/lib/supabase";

export type TrackEventInput = {
  eventName: string;
  targetType?: string;
  targetId?: string;
  pagePath?: string;
  metadata?: Record<string, unknown>;
};

function getVisitorId() {
  if (typeof window === "undefined") return undefined;
  const key = "worklife-wh-visitor-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export async function trackEvent({
  eventName,
  targetType,
  targetId,
  pagePath,
  metadata,
}: TrackEventInput) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await fetch("/api/metrics/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
      },
      body: JSON.stringify({
        eventName,
        eventType: metadata?.eventType,
        targetType,
        targetId,
        pagePath:
          pagePath ||
          (typeof window !== "undefined" ? window.location.pathname : undefined),
        metadata: metadata || {},
        referrer:
          typeof document !== "undefined" ? document.referrer : undefined,
        visitorId: getVisitorId(),
      }),
      keepalive: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Analytics tracking failed", error);
    }
  }
}
