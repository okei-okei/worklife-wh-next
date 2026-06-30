import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import AuthAwareCta from "@/components/AuthAwareCta";
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

function getArticleBadges(article: Article) {
  const badges: { label: string; className: string }[] = [];

  if (article.article_type === "experience" || article.category === "実体験") {
    badges.push({
      label: "実体験",
      className: "bg-emerald-50 text-emerald-700",
    });
  }
  if (article.category === "治安・注意喚起" || article.category === "注意喚起") {
    badges.push({
      label: "注意喚起",
      className: "bg-red-50 text-red-700",
    });
  }
  if (article.category === "比較") {
    badges.push({
      label: "比較",
      className: "bg-purple-50 text-purple-700",
    });
  }

  return badges;
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex min-h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
          {article.category}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
          {article.country_code || "NZ"}
        </span>
        {getArticleBadges(article).map((badge) => (
          <span
            key={badge.label}
            className={`rounded-full px-3 py-1 ${badge.className}`}
          >
            {badge.label}
          </span>
        ))}
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
  );
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

type ArticlesPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const articles = await getArticles();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = resolvedSearchParams.category || "all";
  const categories = Array.from(new Set(articles.map((article) => article.category))).sort(
    (a, b) => a.localeCompare(b, "ja"),
  );
  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  const beginnerArticles = [
    "nz-working-holiday-real-experience",
    "nz-homestay-vs-sharehouse",
    "nz-working-holiday-job-search-real",
    "nz-rental-checkpoints-real",
    "nz-working-holiday-what-to-bring",
  ]
    .map((slug) => bySlug.get(slug))
    .filter((article): article is Article => Boolean(article));
  const popularArticles = articles.slice(0, 5);

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

        <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                初めての人におすすめ
              </h2>
              <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
                実体験ベースで、仕事・家・持ち物の全体像をつかめる記事です。
              </p>
            </div>
            <Link
              href="/mypage/checklist"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
            >
              チェックリストを見る
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
            {beginnerArticles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="rounded-xl bg-gray-50 p-3 hover:bg-blue-50"
              >
                <span className="text-xs font-bold text-blue-700">
                  {index + 1}
                </span>
                <h3 className="mt-1 line-clamp-3 text-sm font-bold leading-6 text-gray-900">
                  {article.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">カテゴリで探す</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
                実体験、仕事探し、物件探し、比較などから記事を絞り込めます。
              </p>
            </div>
            <p className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              {filteredArticles.length}件
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/articles"
              className={`rounded-lg px-4 py-3 text-sm font-bold ${
                selectedCategory === "all"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              すべて
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/articles?category=${encodeURIComponent(category)}`}
                className={`rounded-lg px-4 py-3 text-sm font-bold ${
                  selectedCategory === category
                    ? "bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-lg font-bold text-gray-900">人気記事</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
            {popularArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="rounded-xl bg-gray-50 p-3 hover:bg-blue-50"
              >
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                  {article.category}
                </span>
                <h3 className="mt-2 line-clamp-3 text-sm font-bold leading-6 text-gray-900">
                  {article.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {filteredArticles.length ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
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

        <AuthAwareCta
          title="読んだ内容を準備リストに反映する"
          description="無料登録すると、記事で確認した準備をチェックリストや生活プランナーに接続できます。"
        />

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
