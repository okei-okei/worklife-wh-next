import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, context: Context) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ recorded: false }, { status: 503 });
  }

  const { slug } = await context.params;
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
  const { data: article, error } = await serviceClient
    .from("articles")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !article) return NextResponse.json({ recorded: false }, { status: 404 });

  await Promise.all([
    serviceClient.rpc("increment_article_views", { article_id: article.id }),
    serviceClient.from("admin_metrics_events").insert({
      user_id: userId,
      event_name: "article_viewed",
      event_type: "content",
      page_path: `/articles/${slug}`,
      metadata: { articleId: article.id, slug },
    }),
  ]);

  return NextResponse.json({ recorded: true });
}
