"use client";

import { supabase } from "@/lib/supabase";

export type MetricEventName =
  | "sign_up"
  | "login"
  | "planner_calculation"
  | "job_saved"
  | "property_saved"
  | "checklist_used"
  | "email_template_generated"
  | "partners_viewed"
  | "partner_clicked"
  | "affiliate_clicked"
  | "article_viewed"
  | "page_view"
  | "public_job_view"
  | "public_property_view"
  | "job_save"
  | "property_save"
  | "job_application_template_generate"
  | "property_inquiry_template_generate"
  | "planner_view"
  | "planner_trial_view"
  | "planner_map_view"
  | "checklist_view"
  | "checklist_item_complete"
  | "checklist_partner_transition"
  | "comparison_page_view"
  | "comparison_card_view"
  | "comparison_card_click"
  | "affiliate_link_click"
  | "article_view"
  | "article_submit"
  | "article_partner_transition"
  | "content_report_submit";

function getVisitorId() {
  if (typeof window === "undefined") return undefined;
  const key = "worklife-wh-visitor-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export async function trackMetric(
  eventName: MetricEventName,
  options: {
    eventType?: string;
    pagePath?: string;
    metadata?: Record<string, unknown>;
    referrer?: string;
  } = {},
) {
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
        eventType: options.eventType,
        pagePath:
          options.pagePath ||
          (typeof window !== "undefined" ? window.location.pathname : undefined),
        metadata: options.metadata || {},
        referrer:
          options.referrer ||
          (typeof document !== "undefined" ? document.referrer : undefined),
        visitorId: getVisitorId(),
      }),
      keepalive: true,
    });
  } catch (error) {
    console.warn("Metric tracking failed", error);
  }
}
