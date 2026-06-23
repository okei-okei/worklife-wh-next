import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isArticleCategory, normalizeArticleSlug } from "@/lib/articles";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  if (!url || !anonKey || !serviceKey) return NextResponse.json({ error: "サーバー設定が不足しています。" }, { status: 503 });
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await authClient.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const category = typeof body?.category === "string" ? body.category : "";
  if (!title || !content || !isArticleCategory(category)) return NextResponse.json({ error: "タイトル、カテゴリー、本文を入力してください。" }, { status: 400 });
  if (!body?.noAdvertising || !body?.noPersonalInfo || !body?.guidelineAccepted) return NextResponse.json({ error: "3つの確認事項への同意が必要です。" }, { status: 400 });

  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const baseSlug = normalizeArticleSlug(typeof body?.slug === "string" ? body.slug : title) || "community-article";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const { data, error } = await service.from("articles").insert({
    title,
    slug,
    excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() || null : null,
    content,
    category,
    country_code: typeof body.countryCode === "string" ? body.countryCode : "NZ",
    region: typeof body.region === "string" ? body.region.trim() || null : null,
    article_type: body.articleType === "experience" ? "experience" : "general",
    cover_image_url: typeof body.coverImageUrl === "string" ? body.coverImageUrl.trim() || null : null,
    status: "pending",
    is_user_submitted: true,
    submitted_by: user.id,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await service.from("admin_metrics_events").insert({ user_id: user.id, event_name: "article_submit", event_type: "content", page_path: "/articles/submit", metadata: { articleId: data.id } });
  return NextResponse.json({ submitted: true }, { status: 201 });
}
