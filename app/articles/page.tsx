import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import type { Article } from "@/lib/articles";
import { staticArticles } from "@/lib/constants/articles";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリの役立ち情報 | WorkLife WH",
  description:
    "ニュージーランドのワーホリ準備、仕事探し、家探し、お金、生活インフラに関する記事を整理しています。",
  path: "/articles",
});

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ja-JP");
}

function mergeArticles(dbArticles: Article[]) {
  const bySlug = new Map<string, Article>();

  for (const article of staticArticles) bySlug.set(article.slug, article);
  for (const article of dbArticles) bySlug.set(article.slug, article);

  return Array.from(bySlug.values()).sort((a, b) => {
    const left = new Date(a.published_at || a.updated_at).getTime();
    const right = new Date(b.published_at || b.updated_at).getTime();
    return right - left;
  });
}

async function getArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return staticArticles;

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await client
    .from("articles")
    .select("*")
    .in("status", ["published", "approved"])
    .order("published_at", { ascending: false });

  return mergeArticles((data || []) as Article[]);
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "ホーム", href: "/" },
                { label: "役立ち情報" },
              ]}
            />
          </div>
          <p className="text-sm font-bold text-blue-700">WorkLife WH コラム</p>
          <h1 className="mt-2 text-2xl font-bold md:text-4xl">
            海外生活の役立ち情報
          </h1>
          <p className="mt-3 font-medium leading-7 text-gray-700">
            渡航準備、仕事、住まい、お金について、行動前に確認したいポイントを運営記事として整理しています。
          </p>
          <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-700">
            記事には広告・紹介リンクが含まれる場合があります。料金、プラン、条件は変更される可能性があるため、申込前に必ず公式サイトで最新情報をご確認ください。
          </p>
        </header>

        {articles.length ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="flex min-h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
              >
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                    {article.category}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                    {article.country_code || "NZ"}
                  </span>
                  {article.is_sponsored || article.is_affiliate ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                      広告・紹介リンク
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 break-words text-lg font-bold leading-7 md:text-xl">
                  {article.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-gray-700">
                  {article.excerpt || "記事の内容を確認する"}
                </p>
                <p className="mt-4 text-xs font-medium text-gray-600">
                  更新 {formatDate(article.updated_at)}
                </p>
                <div className="mt-auto pt-4">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="block w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
                  >
                    読む
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold">記事を準備中です</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
              公開された記事がここに表示されます。
            </p>
          </section>
        )}

        <div className="flex justify-end">
          <Link
            href="/mypage"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            マイページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
