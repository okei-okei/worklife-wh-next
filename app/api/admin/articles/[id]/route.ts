import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";
import {
  isArticleCategory,
  normalizeArticleSlug,
  type ArticleInput,
} from "@/lib/articles";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const { id } = await context.params;
  const { data, error } = await admin.serviceClient.from("articles").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ article: data });
}

export async function PATCH(request: NextRequest, context: Context) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Partial<ArticleInput> | null;
  if (!body?.title?.trim() || !body.category || !isArticleCategory(body.category)) {
    return NextResponse.json({ error: "タイトルとカテゴリーを確認してください。" }, { status: 400 });
  }
  const slug = normalizeArticleSlug(body.slug || body.title);
  if (!slug) return NextResponse.json({ error: "slugを入力してください。" }, { status: 400 });

  const { data, error } = await admin.serviceClient
    .from("articles")
    .update({
      title: body.title.trim(),
      slug,
      excerpt: body.excerpt?.trim() || null,
      content: body.content?.trim() || "",
      category: body.category,
      cover_image_url: body.cover_image_url?.trim() || null,
      status: body.status === "published" ? "published" : "draft",
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data });
}

export async function DELETE(request: NextRequest, context: Context) {
  const admin = await getAdminContext(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  const { id } = await context.params;
  const { error } = await admin.serviceClient.from("articles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

