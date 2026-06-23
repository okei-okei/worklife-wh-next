import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";
import {
  isArticleCategory,
  isArticleStatus,
  normalizeArticleSlug,
  type ArticleInput,
} from "@/lib/articles";

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

export function validateArticleInput(body: Partial<ArticleInput>) {
  const title = body.title?.trim() || "";
  const slug = normalizeArticleSlug(body.slug || title);
  if (!title || !slug || !body.category || !isArticleCategory(body.category)) return null;
  const status = body.status && isArticleStatus(body.status) ? body.status : "draft";
  return {
    title,
    slug,
    excerpt: body.excerpt?.trim() || null,
    content: body.content?.trim() || "",
    category: body.category,
    country_code: body.country_code?.trim() || "NZ",
    region: body.region?.trim() || null,
    article_type: body.article_type === "experience" ? "experience" : "general",
    cover_image_url: body.cover_image_url?.trim() || null,
    status,
    is_sponsored: Boolean(body.is_sponsored),
    is_affiliate: Boolean(body.is_affiliate),
    sponsor_name: body.sponsor_name?.trim() || null,
    related_checklist_items: stringArray(body.related_checklist_items),
    related_service_ids: stringArray(body.related_service_ids),
    rejected_reason: status === "rejected" ? body.rejected_reason?.trim() || null : null,
  };
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const { data, error } = await admin.serviceClient.from("articles").select("*").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const body = (await request.json().catch(() => null)) as Partial<ArticleInput> | null;
  const input = body ? validateArticleInput(body) : null;
  if (!input) return NextResponse.json({ error: "タイトル、slug、カテゴリーを確認してください。" }, { status: 400 });
  const { data, error } = await admin.serviceClient.from("articles").insert({ ...input, is_user_submitted: false }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data }, { status: 201 });
}
