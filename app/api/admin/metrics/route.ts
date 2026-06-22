import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";

type EventRow = { event_name: string; user_id: string | null; created_at: string };
type ArticleRow = { title: string; slug: string; status: string; views: number };
type LeadRow = { partner_name: string | null; category: string | null; destination_url: string | null };
type AffiliateRow = { service_name: string | null; service_category: string | null; target_url: string | null; created_at: string };

function since(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function startOfToday() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function countAfter(values: Array<string | null | undefined>, threshold: Date) {
  return values.filter((value) => value && new Date(value) >= threshold).length;
}

function rankBy<T>(rows: T[], getKey: (row: T) => string, limit = 5) {
  const counts = rows.reduce<Record<string, number>>((result, row) => {
    const key = getKey(row) || "未設定";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const client = admin.serviceClient;

  try {
    const users = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      users.push(...data.users);
      if (data.users.length < 1000) break;
    }

    const safeCount = async (
      table: string,
      filter?: { column: string; value: string | boolean },
    ) => {
      let query = client.from(table).select("*", { count: "exact", head: true });
      if (filter) query = query.eq(filter.column, filter.value);
      const { count, error } = await query;
      return error ? 0 : count || 0;
    };

    const [savedJobs, savedProperties, checklistRows, pendingSubmissions] = await Promise.all([
      safeCount("saved_jobs"),
      safeCount("saved_properties"),
      safeCount("user_checklist_items"),
      safeCount("listing_submissions", { column: "status", value: "pending" }),
    ]);

    const [eventsResult, articlesResult, leadsResult, affiliateResult, pageViewsResult] = await Promise.all([
      client.from("admin_metrics_events").select("event_name,user_id,created_at"),
      client.from("articles").select("title,slug,status,views"),
      client.from("lead_clicks").select("partner_name,category,destination_url"),
      client.from("affiliate_clicks").select("service_name,service_category,target_url,created_at"),
      client.from("page_views").select("visitor_id,user_id,page_path,created_at").gte("created_at", since(30).toISOString()),
    ]);

    const events = (eventsResult.error ? [] : eventsResult.data || []) as EventRow[];
    const articles = (articlesResult.error ? [] : articlesResult.data || []) as ArticleRow[];
    const leads = (leadsResult.error ? [] : leadsResult.data || []) as LeadRow[];
    const affiliateClicks = (affiliateResult.error ? [] : affiliateResult.data || []) as AffiliateRow[];
    const pageViews = pageViewsResult.error ? [] : pageViewsResult.data || [];
    const today = startOfToday();
    const week = since(7);
    const month = since(30);
    const createdDates = users.map((user) => user.created_at);
    const loginDates = users.map((user) => user.last_sign_in_at);
    const recentEvents = events.filter((event) => new Date(event.created_at) >= month);
    const activeIds = new Set([
      ...users.filter((user) => user.last_sign_in_at && new Date(user.last_sign_in_at) >= month).map((user) => user.id),
      ...recentEvents.map((event) => event.user_id).filter((id): id is string => Boolean(id)),
    ]);
    const eventCount = (name: string) => events.filter((event) => event.event_name === name).length;
    const uniqueVisitors = new Set(pageViews.map((row) => row.visitor_id || row.user_id).filter(Boolean)).size;
    const newUsers30 = countAfter(createdDates, month);
    const affiliate30 = affiliateClicks.filter((click) => new Date(click.created_at) >= month).length;
    const partnerViews30 = pageViews.filter((row) => row.page_path === "/partners").length;

    return NextResponse.json({
      totalMembers: users.length,
      newUsers: { today: countAfter(createdDates, today), days7: countAfter(createdDates, week), days30: newUsers30 },
      loginUsers: { today: countAfter(loginDates, today), days7: countAfter(loginDates, week), days30: countAfter(loginDates, month) },
      activeUsers30: activeIds.size,
      activeRate: users.length ? (activeIds.size / users.length) * 100 : 0,
      featureUsage: {
        planner: eventCount("planner_calculation"),
        properties: savedProperties,
        jobs: savedJobs,
        checklist: Math.max(checklistRows, eventCount("checklist_used")),
        emailTemplates: eventCount("email_template_generated"),
        partnerViews: eventCount("partners_viewed"),
        partnerClicks: leads.length,
        affiliateClicks: affiliateClicks.length,
      },
      articles: {
        total: articles.length,
        published: articles.filter((article) => article.status === "published").length,
        drafts: articles.filter((article) => article.status === "draft").length,
      },
      popularArticles: [...articles]
        .filter((article) => article.status === "published")
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map((article) => ({ name: article.title, count: article.views, href: `/articles/${article.slug}` })),
      popularPartners: rankBy(leads, (row) => row.partner_name || row.category || "未設定"),
      popularAffiliateLinks: rankBy(affiliateClicks, (row) => row.service_name || row.target_url || "未設定"),
      conversion: {
        visitorToSignup: uniqueVisitors ? (newUsers30 / uniqueVisitors) * 100 : 0,
        partnerViewToAffiliate: partnerViews30 ? (affiliate30 / partnerViews30) * 100 : 0,
      },
      pendingSubmissions,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "管理指標を取得できませんでした。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
