"use client";

import { trackEvent } from "@/lib/services/analytics";

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
  | "content_report_submit";

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
