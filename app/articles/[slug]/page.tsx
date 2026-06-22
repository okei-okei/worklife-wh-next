import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import type { Article } from "@/lib/articles";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await client.from("articles").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return data as Article | null;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const paragraphs = article.content.split(/\n{2,}/).filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10">
      <ArticleViewTracker slug={slug} />
      <article className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white">
        {article.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.cover_image_url} alt="" className="max-h-[420px] w-full object-cover" />
        ) : null}
        <div className="p-4 md:p-8">
          <p className="text-sm font-bold text-emerald-700">{article.category}</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight md:text-4xl">{article.title}</h1>
          <p className="mt-3 text-sm font-medium text-gray-600">
            {article.published_at ? new Date(article.published_at).toLocaleDateString("ja-JP") : ""} ・ {article.views.toLocaleString()} views
          </p>
          {article.excerpt ? <p className="mt-6 border-l-4 border-emerald-600 pl-4 font-medium leading-7 text-gray-800">{article.excerpt}</p> : null}
          <div className="mt-8 space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-wrap font-medium leading-8 text-gray-800">{paragraph}</p>
            ))}
          </div>
          <div className="mt-10 border-t border-gray-200 pt-6">
            <Link href="/articles" className="font-bold text-emerald-700">役立ち情報一覧へ戻る</Link>
          </div>
        </div>
      </article>
    </main>
  );
}

