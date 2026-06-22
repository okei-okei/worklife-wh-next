import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Article } from "@/lib/articles";

export const dynamic = "force-dynamic";

async function getArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await client
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data || []) as Article[];
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl">
          <p className="text-sm font-bold text-emerald-700">WorkLife WH コラム</p>
          <h1 className="mt-2 text-2xl font-bold md:text-4xl">海外生活の役立ち情報</h1>
          <p className="mt-3 font-medium leading-7 text-gray-800">
            渡航準備、仕事、住まい、お金について、行動前に確認したいポイントをまとめています。
          </p>
        </header>

        {articles.length ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {article.cover_image_url ? (
                  // External URLs are managed by administrators.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.cover_image_url} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : null}
                <div className="p-4 md:p-5">
                  <p className="text-xs font-bold text-emerald-700">{article.category}</p>
                  <h2 className="mt-2 text-xl font-bold leading-7 text-gray-900">{article.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-gray-700">
                    {article.excerpt || "記事の内容を確認する"}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs font-medium text-gray-600">
                    <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("ja-JP") : ""}</span>
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                  <Link href={`/articles/${article.slug}`} className="mt-4 inline-block font-bold text-emerald-700">
                    記事を読む
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold">記事を準備中です</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-700">公開された記事がここに表示されます。</p>
          </section>
        )}
      </div>
    </main>
  );
}

