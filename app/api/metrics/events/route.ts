import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const allowedEvents = new Set([
  "sign_up",
  "signup_click",
  "login",
  "login_click",
  "planner_calculation",
  "simulator_click",
  "job_saved",
  "save_job_click",
  "property_saved",
  "save_property_click",
  "checklist_used",
  "email_template_generated",
  "partners_viewed",
  "partner_clicked",
  "recommendation_click",
  "affiliate_clicked",
  "affiliate_click",
  "article_viewed",
  "article_click",
  "page_view",
  "public_job_view",
  "public_property_view",
  "job_detail_click",
  "property_detail_click",
  "job_save",
  "property_save",
  "job_application_template_generate",
  "property_inquiry_template_generate",
  "planner_view",
  "planner_trial_view",
  "planner_map_view",
  "checklist_view",
  "checklist_item_complete",
  "checklist_partner_transition",
  "comparison_page_view",
  "comparison_card_view",
  "comparison_card_click",
  "affiliate_link_click",
  "official_link_click",
  "partner_category_view",
  "partner_service_click",
  "partner_filter_use",
  "partner_recommendation_click",
  "article_view",
  "article_related_partner_click",
  "article_related_checklist_click",
  "article_submit",
  "article_partner_transition",
  "checklist_partner_click",
  "register_cta_click",
  "checklist_cta_click",
  "planner_cta_click",
  "public_job_map_view",
  "public_property_map_view",
  "public_job_pin_select",
  "public_property_pin_select",
  "content_report_submit",
]);

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const sanitized = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  return sanitized ? sanitized.slice(0, maxLength) : null;
}

function sanitizeMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const entries = Object.entries(value as Record<string, unknown>).slice(0, 30);
  const metadata: Record<string, unknown> = {};

  for (const [key, item] of entries) {
    const safeKey = key.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 80);
    if (!safeKey) continue;

    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean" ||
      item === null
    ) {
      metadata[safeKey] =
        typeof item === "string" ? item.slice(0, 1000) : item;
    }
  }

  return metadata;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ recorded: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    eventName?: string;
    eventType?: string;
    targetType?: string;
    targetId?: string;
    pagePath?: string;
    metadata?: Record<string, unknown>;
    referrer?: string;
    visitorId?: string;
  } | null;

  if (!body?.eventName || !allowedEvents.has(body.eventName)) {
    return NextResponse.json({ recorded: false }, { status: 400 });
  }

  let userId: string | null = null;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (token) {
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
    } = await authClient.auth.getUser(token);
    userId = user?.id || null;
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const pagePath = sanitizeText(body.pagePath, 500);
  const metadata = sanitizeMetadata(body.metadata);
  const targetType = sanitizeText(body.targetType, 100);
  const targetId = sanitizeText(body.targetId, 300);
  const eventType = sanitizeText(body.eventType, 100) || "action";

  const primaryResult = await serviceClient.from("analytics_events").insert({
    user_id: userId,
    event_name: body.eventName,
    target_type: targetType,
    target_id: targetId,
    page_path: pagePath,
    metadata,
  });

  if (primaryResult.error) {
    return NextResponse.json({ recorded: false }, { status: 500 });
  }

  const optionalInserts: PromiseLike<unknown>[] = [
    serviceClient.from("admin_metrics_events").insert({
      user_id: userId,
      event_name: body.eventName,
      event_type: eventType,
      page_path: pagePath,
      metadata,
    }),
  ];

  if (body.eventName === "page_view") {
    optionalInserts.push(
      serviceClient.from("page_views").insert({
        user_id: userId,
        visitor_id: sanitizeText(body.visitorId, 100),
        page_path: pagePath || "/",
        referrer: sanitizeText(body.referrer, 1000),
      }),
    );
  }

  if (
    body.eventName === "partner_clicked" ||
    body.eventName === "partner_service_click" ||
    body.eventName === "official_link_click" ||
    body.eventName === "affiliate_clicked" ||
    body.eventName === "affiliate_click" ||
    body.eventName === "comparison_card_click" ||
    body.eventName === "recommendation_click" ||
    body.eventName === "affiliate_link_click"
  ) {
    optionalInserts.push(
      serviceClient.from("affiliate_clicks").insert({
        user_id: userId,
        service_name:
          typeof metadata.serviceName === "string"
            ? metadata.serviceName.slice(0, 300)
            : null,
        service_category:
          typeof metadata.category === "string"
            ? metadata.category.slice(0, 100)
            : null,
        target_url:
          typeof metadata.targetUrl === "string"
            ? metadata.targetUrl.slice(0, 2000)
            : null,
        page_path: pagePath,
      }),
    );
  }

  const results = await Promise.all(optionalInserts);
  const optionalFailed = results.some(
    (result) =>
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      Boolean(result.error),
  );

  return NextResponse.json({ recorded: true, optionalFailed }, { status: 201 });
}
