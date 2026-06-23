import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const allowedEvents = new Set([
  "sign_up",
  "login",
  "planner_calculation",
  "job_saved",
  "property_saved",
  "checklist_used",
  "email_template_generated",
  "partners_viewed",
  "partner_clicked",
  "affiliate_clicked",
  "article_viewed",
  "page_view",
  "public_job_view",
  "public_property_view",
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
  "article_view",
  "article_submit",
  "article_partner_transition",
  "content_report_submit",
]);

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
  const pagePath = body.pagePath?.slice(0, 500) || null;
  const metadata = body.metadata || {};

  const inserts: PromiseLike<unknown>[] = [
    serviceClient.from("admin_metrics_events").insert({
      user_id: userId,
      event_name: body.eventName,
      event_type: body.eventType?.slice(0, 100) || "action",
      page_path: pagePath,
      metadata,
    }),
  ];

  if (body.eventName === "page_view") {
    inserts.push(
      serviceClient.from("page_views").insert({
        user_id: userId,
        visitor_id: body.visitorId?.slice(0, 100) || null,
        page_path: pagePath || "/",
        referrer: body.referrer?.slice(0, 1000) || null,
      }),
    );
  }

  if (
    body.eventName === "partner_clicked" ||
    body.eventName === "affiliate_clicked" ||
    body.eventName === "comparison_card_click" ||
    body.eventName === "affiliate_link_click"
  ) {
    inserts.push(
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

  const results = await Promise.all(inserts);
  const failed = results.some(
    (result) =>
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      Boolean(result.error),
  );

  return NextResponse.json({ recorded: !failed }, { status: failed ? 500 : 201 });
}
