"use client";

import { trackEvent } from "@/lib/services/analytics";
import { trackGAEvent } from "@/lib/services/ga";

export type MetricEventName =
  | "sign_up"
  | "signup_click"
  | "login"
  | "login_click"
  | "planner_calculation"
  | "simulator_click"
  | "job_saved"
  | "save_job_click"
  | "property_saved"
  | "save_property_click"
  | "checklist_used"
  | "email_template_generated"
  | "partners_viewed"
  | "partner_clicked"
  | "recommendation_click"
  | "affiliate_clicked"
  | "affiliate_click"
  | "article_viewed"
  | "article_click"
  | "page_view"
  | "public_job_view"
  | "public_property_view"
  | "job_detail_click"
  | "property_detail_click"
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
  | "official_link_click"
  | "partner_category_view"
  | "partner_service_click"
  | "partner_filter_use"
  | "partner_recommendation_click"
  | "article_view"
  | "article_related_partner_click"
  | "article_related_checklist_click"
  | "checklist_partner_click"
  | "public_job_map_view"
  | "public_property_map_view"
  | "public_job_pin_select"
  | "public_property_pin_select"
  | "article_submit"
  | "article_partner_transition"
  | "content_report_submit"
  | "register_cta_click"
  | "checklist_cta_click"
  | "planner_cta_click";

function toGAParams(
  options: {
    eventType?: string;
    targetType?: string;
    targetId?: string;
    pagePath?: string;
    metadata?: Record<string, unknown>;
    referrer?: string;
  },
) {
  const params: Record<string, string | number | boolean | null | undefined> = {
    event_type: options.eventType,
    target_type: options.targetType,
    target_id: options.targetId,
    page_path:
      options.pagePath ||
      (typeof window !== "undefined" ? window.location.pathname : undefined),
    referrer: options.referrer,
  };

  Object.entries(options.metadata || {}).forEach(([key, value]) => {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null ||
      value === undefined
    ) {
      params[key] = value;
      return;
    }

    params[key] = JSON.stringify(value);
  });

  return params;
}

function getGAEventName(eventName: MetricEventName) {
  const gaEventNameMap: Partial<Record<MetricEventName, string>> = {
    partner_category_view: "partner_page_view",
    comparison_page_view: "partner_page_view",
    partners_viewed: "partner_page_view",
    register_cta_click: "register_click",
    signup_click: "register_click",
    checklist_cta_click: "checklist_click",
    article_related_checklist_click: "checklist_click",
    checklist_partner_click: "checklist_click",
    planner_cta_click: "planner_click",
    planner_calculation: "simulation_run",
    simulator_click: "simulation_run",
    job_saved: "job_save",
    save_job_click: "job_save",
    property_saved: "property_save",
    save_property_click: "property_save",
    affiliate_click: "affiliate_link_click",
    recommendation_click: "partner_recommendation_click",
  };

  return gaEventNameMap[eventName] || eventName;
}

export async function trackMetric(
  eventName: MetricEventName,
  options: {
    eventType?: string;
    targetType?: string;
    targetId?: string;
    pagePath?: string;
    metadata?: Record<string, unknown>;
    referrer?: string;
  } = {},
) {
  if (eventName !== "page_view") {
    trackGAEvent(getGAEventName(eventName), {
      ...toGAParams(options),
      source_event_name: eventName,
    });
  }

  await trackEvent({
    eventName,
    targetType: options.targetType,
    targetId: options.targetId,
    pagePath: options.pagePath,
    metadata: {
      ...(options.metadata || {}),
      ...(options.eventType ? { eventType: options.eventType } : {}),
      ...(options.referrer ? { referrer: options.referrer } : {}),
    },
  });
}
