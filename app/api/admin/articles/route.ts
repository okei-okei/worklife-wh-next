import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";
import {
  isArticleCategory,
  normalizeArticleSlug,
  type ArticleInput,
} from "@/lib/articles";

function validateInput(body: Partial<ArticleInput>) {
  const title = body.title?.trim() || "";
  const slug = normalizeArticleSlug(body.slug || title);
  if (!title || !slug || !body.category || !isArticleCategory(body.category)) {
    return null;
  }
  return {
    title,
    slug,
    excerpt: body.excerpt?.trim() || null,
    content: body.content?.trim() || "",
    category: body.category,
    cover_image_url: body.cover_image_url?.trim() || null,
    status: body.status === "published" ? "published" : "draft",
  };
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { data, error } = await admin.serviceClient
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const body = (await request.json().catch(() => null)) as Partial<ArticleInput> | null;
  const input = body ? validateInput(body) : null;
  if (!input) return NextResponse.json({ error: "タイトル、slug、カテゴリーを確認してください。" }, { status: 400 });

  const { data, error } = await admin.serviceClient
    .from("articles")
    .insert(input)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data }, { status: 201 });
}

