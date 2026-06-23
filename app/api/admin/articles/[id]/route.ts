import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";
import { validateArticleInput } from "../route";
import type { ArticleInput } from "@/lib/articles";

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
  const input = body ? validateArticleInput(body) : null;
  if (!input) return NextResponse.json({ error: "タイトル、slug、カテゴリーを確認してください。" }, { status: 400 });

  const reviewFields = input.status === "approved" || input.status === "published"
    ? { approved_by: admin.user.id, approved_at: new Date().toISOString() }
    : input.status === "rejected"
      ? { approved_by: null, approved_at: null }
      : {};
  const { data, error } = await admin.serviceClient
    .from("articles")
    .update({ ...input, ...reviewFields })
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
