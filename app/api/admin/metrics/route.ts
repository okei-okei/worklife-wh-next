import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";

type Row = Record<string, unknown>;
type EventRow = {
  event_name: string;
  user_id: string | null;
  target_type?: string | null;
  target_id?: string | null;
  page_path?: string | null;
  metadata: Row | null;
  created_at: string;
};
const since = (days: number) => new Date(Date.now() - days * 86400000);
const startOfToday = () => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; };
const countAfter = (values: Array<string | null | undefined>, date: Date) => values.filter((value) => value && new Date(value) >= date).length;
const rank = (values: string[], limit = 5) => Object.entries(values.reduce<Record<string, number>>((a, value) => ({ ...a, [value || "未設定"]: (a[value || "未設定"] || 0) + 1 }), {})).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, limit);

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const client = admin.serviceClient;
  try {
    const users = [];
    for (let page = 1; ; page++) { const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 }); if (error) throw error; users.push(...data.users); if (data.users.length < 1000) break; }
    const rows = async (table: string) => {
      const result = await client.from(table).select("*");
      if (!result.error) return (result.data || []) as Row[];

      const fallback = await admin.userClient.from(table).select("*");
      return (fallback.error ? [] : fallback.data || []) as Row[];
    };
    const [analyticsRaw, eventsRaw, jobs, properties, savedJobs, savedProperties, checklist, submissions, articles, leads, affiliates, pageViews, reports, contacts, privacy] = await Promise.all([
      rows("analytics_events"), rows("admin_metrics_events"), rows("public_jobs"), rows("public_properties"), rows("saved_jobs"), rows("saved_properties"), rows("user_checklist_items"), rows("listing_submissions"), rows("articles"), rows("lead_clicks"), rows("affiliate_clicks"), rows("page_views"), rows("content_reports"), rows("contact_requests"), rows("privacy_requests"),
    ]);
    const analyticsEvents = analyticsRaw as unknown as EventRow[];
    const events = (analyticsEvents.length ? analyticsEvents : eventsRaw) as unknown as EventRow[];
    const eventCount = (...names: string[]) => events.filter((event) => names.includes(event.event_name)).length;
    const eventCountSince = (date: Date, ...names: string[]) =>
      events.filter((event) => names.includes(event.event_name) && new Date(event.created_at) >= date).length;
    const eventValues = (name: string, key: string) => events.filter((event) => event.event_name === name).map((event) => String(event.metadata?.[key] || "未設定"));
    const eventMeta = (event: EventRow, key: string) => String(event.metadata?.[key] || "");
    const eventCategory = (event: EventRow) => {
      const fromMeta = eventMeta(event, "category") || eventMeta(event, "partnerCategory");
      const raw = fromMeta || event.target_id || event.page_path || "unknown";
      const normalized = String(raw)
        .replace("/partners/", "")
        .replace("sim-esim", "SIM/eSIM")
        .replace("insurance", "海外保険")
        .replace("money-transfer", "海外送金")
        .replace("money_transfer", "海外送金")
        .replace("bank", "銀行口座")
        .replace("electricity", "電気")
        .replace("internet", "インターネット")
        .replace("furniture", "家具・生活用品")
        .replace("language-school", "語学学校")
        .replace("language_school", "語学学校")
        .replace("study-agency", "留学エージェント")
        .replace("study_agency", "留学エージェント")
        .replace("flights-transport", "航空券・移動")
        .replace("flights_transport", "航空券・移動");
      return normalized || "未設定";
    };
    const today = startOfToday(), week = since(7), month = since(30);
    const created = users.map((user) => user.created_at), logins = users.map((user) => user.last_sign_in_at);
    const active7 = new Set([...users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= week).map((u) => u.id), ...events.filter((e) => new Date(e.created_at) >= week && e.user_id).map((e) => e.user_id!)]).size;
    const active30 = new Set([...users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= month).map((u) => u.id), ...events.filter((e) => new Date(e.created_at) >= month && e.user_id).map((e) => e.user_id!)]).size;
    const countries = users.map((user) => String(user.user_metadata?.country_code || user.user_metadata?.country || "OTHER").toUpperCase());
    const statusCount = (values: Row[], status: string) => values.filter((row) => row.status === status).length;
    const submissionCount = (type: string, status: string) => submissions.filter((row) => row.type === type && row.status === status).length;
    const numeric = (value: unknown) => typeof value === "number" ? value : Number(value) || 0;
    const rents = properties.map((row) => numeric(row.rent_weekly)).filter((value) => value > 0);
    const checklistUsers = new Set(checklist.map((row) => row.user_id).filter(Boolean)).size;
    const completedChecklist = checklist.filter((row) => row.is_completed === true || row.completed === true).length;
    const partnerViews = eventCount("comparison_page_view", "partners_viewed");
    const cardClicks = eventCount("comparison_card_click", "partner_clicked") + leads.length;
    const affiliateClicks = Math.max(affiliates.length, eventCount("affiliate_link_click", "affiliate_clicked"));
    const publishedArticles = articles.filter((a) => a.status === "published" || a.status === "approved");
    const uniqueVisitors = new Set(pageViews.map((row) => row.visitor_id || row.user_id).filter(Boolean)).size;
    const articleRanking = [...publishedArticles].sort((a, b) => numeric(b.views) - numeric(a.views)).slice(0, 5).map((a) => ({ name: String(a.title), count: numeric(a.views), href: `/articles/${a.slug}` }));
    const regionRank = (values: Row[]) => rank(values.map((row) => String(row.region || row.district || row.city || "未設定")));
    const categoryRank = (values: Row[]) => rank(values.map((row) => String(row.category || row.employment_type || "未設定")));
    const partnerCategoryLabels = [
      "SIM/eSIM",
      "海外保険",
      "海外送金",
      "銀行口座",
      "電気",
      "インターネット",
      "家具・生活用品",
      "語学学校",
      "留学エージェント",
      "航空券・移動",
    ];
    const categoryAnalytics = partnerCategoryLabels.map((category) => {
      const categoryEvents = events.filter((event) => eventCategory(event) === category);
      const pageViewsCount = categoryEvents.filter((event) => event.event_name === "partner_category_view").length;
      const serviceClicks = categoryEvents.filter((event) =>
        ["partner_service_click", "official_link_click", "affiliate_link_click"].includes(event.event_name),
      ).length;
      const adClicks = categoryEvents.filter((event) => event.event_name === "affiliate_link_click").length;
      const officialClicks = categoryEvents.filter((event) => event.event_name === "official_link_click").length;
      return {
        category,
        pageViews: pageViewsCount,
        serviceClicks,
        adClicks,
        officialClicks,
        ctr: pageViewsCount ? ((adClicks + officialClicks) / pageViewsCount) * 100 : 0,
      };
    });
    const popularServices = rank(
      events
        .filter((event) => ["partner_service_click", "official_link_click", "affiliate_link_click"].includes(event.event_name))
        .map((event) => eventMeta(event, "serviceName") || event.target_id || "未設定"),
      10,
    );
    const popularAdServices = rank(
      events
        .filter((event) => event.event_name === "affiliate_link_click")
        .map((event) => eventMeta(event, "serviceName") || event.target_id || "未設定"),
      10,
    );
    const popularArticleViews = rank(
      events
        .filter((event) => event.event_name === "article_view")
        .map((event) => eventMeta(event, "title") || eventMeta(event, "slug") || event.target_id || "未設定"),
      10,
    );
    const articlePartnerClicks = rank(
      events
        .filter((event) => event.event_name === "article_related_partner_click")
        .map((event) => eventMeta(event, "title") || eventMeta(event, "slug") || event.target_id || "未設定"),
      10,
    );
    const recentEvents = [...events]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map((event) => ({
        eventName: event.event_name,
        targetType: event.target_type || "",
        targetId: event.target_id || "",
        pagePath: event.page_path || "",
        createdAt: event.created_at,
      }));
    return NextResponse.json({
      users: { total: users.length, newUsers: { today: countAfter(created, today), days7: countAfter(created, week), days30: countAfter(created, month) }, active7, active30, loggedIn: logins.filter(Boolean).length, activeRate: users.length ? active30 / users.length * 100 : 0, countries: { NZ: countries.filter((c) => c === "NZ").length, AU: countries.filter((c) => c === "AU").length, CA: countries.filter((c) => c === "CA").length, other: countries.filter((c) => !["NZ", "AU", "CA"].includes(c)).length } },
      jobs: { publicTotal: jobs.length, active: jobs.filter((j) => j.is_active !== false).length, pending: submissionCount("job", "pending"), rejected: submissionCount("job", "rejected"), saved: savedJobs.length, applicationSupport: eventCount("job_application_template_generate", "email_template_generated"), categories: categoryRank(jobs), regions: regionRank(jobs) },
      properties: { publicTotal: properties.length, active: properties.filter((p) => p.is_active !== false).length, pending: submissionCount("property", "pending"), rejected: submissionCount("property", "rejected"), saved: savedProperties.length, inquirySupport: eventCount("property_inquiry_template_generate"), regions: regionRank(properties), averageWeeklyRent: rents.length ? rents.reduce((a, b) => a + b, 0) / rents.length : 0 },
      planner: { uses: eventCount("planner_calculation", "planner_view"), combinations: savedJobs.length * savedProperties.length, mapViews: eventCount("planner_map_view"), trialUses: eventCount("planner_trial_view") },
      checklist: { users: checklistUsers, completionRate: checklist.length ? completedChecklist / checklist.length * 100 : 0, itemClicks: rank(eventValues("checklist_item_complete", "itemKey")), partnerTransitions: eventCount("checklist_partner_transition") },
      comparison: { cardViews: eventCount("comparison_card_view"), cardClicks, externalClicks: affiliateClicks, affiliateClicks, categoryClicks: rank([...eventValues("comparison_card_click", "category"), ...leads.map((row) => String(row.category || "未設定"))], 8), ctr: eventCount("comparison_card_view") ? cardClicks / eventCount("comparison_card_view") * 100 : 0 },
      articles: { published: publishedArticles.length, drafts: statusCount(articles, "draft"), pending: statusCount(articles, "pending"), rejected: statusCount(articles, "rejected"), totalViews: publishedArticles.reduce((sum, row) => sum + numeric(row.views), 0), partnerTransitions: eventCount("article_partner_transition"), popular: articleRanking },
      risk: { reports: reports.length, unresolvedReports: reports.filter((r) => !r.status || r.status === "pending").length, deletedPosts: eventCount("article_deleted"), pendingPosts: statusCount(articles, "pending"), contacts: contacts.length, privacyRequests: privacy.length },
      popularPartners: rank(leads.map((row) => String(row.partner_name || row.category || "未設定"))),
      popularAffiliateLinks: rank(affiliates.map((row) => String(row.service_name || row.target_url || "未設定"))),
      conversion: { visitorToSignup: uniqueVisitors ? countAfter(created, month) / uniqueVisitors * 100 : 0, partnerToAffiliate: partnerViews ? affiliateClicks / partnerViews * 100 : 0 },
      analytics: {
        kpis: {
          partnerViewsToday: eventCountSince(today, "partner_category_view"),
          partnerViews7Days: eventCountSince(week, "partner_category_view"),
          affiliateClicksToday: eventCountSince(today, "affiliate_link_click"),
          affiliateClicks7Days: eventCountSince(week, "affiliate_link_click"),
          officialClicksToday: eventCountSince(today, "official_link_click"),
          officialClicks7Days: eventCountSince(week, "official_link_click"),
          officialClicksTotal: eventCount("official_link_click"),
          affiliateClicksTotal: eventCount("affiliate_link_click"),
          articleViewsTotal: eventCount("article_view"),
          partnerViewsTotal: eventCount("partner_category_view"),
          articleViewsToday: eventCountSince(today, "article_view"),
          articleViews7Days: eventCountSince(week, "article_view"),
          checklistPartnerClicks: eventCount("checklist_partner_click"),
        },
        categories: categoryAnalytics,
        popularServices,
        popularAdServices,
        popularArticles: popularArticleViews,
        articlePartnerTransitions: articlePartnerClicks,
        recentEvents,
      },
    });
  } catch (error) { console.error(error); return NextResponse.json({ error: error instanceof Error ? error.message : "管理指標を取得できませんでした。" }, { status: 500 }); }
}
