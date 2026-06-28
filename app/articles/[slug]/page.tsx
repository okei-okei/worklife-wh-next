import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import TrackedLink from "@/components/TrackedLink";
import type { Article } from "@/lib/articles";
import { getStaticArticleBySlug } from "@/lib/constants/articles";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ja-JP");
}

function getPartnerLinkLabel(article: Article, partnerUrl: string) {
  if (partnerUrl.includes("/partners/insurance") || article.category === "海外保険") {
    return "海外保険比較を見る";
  }
  if (partnerUrl.includes("/partners/sim-esim") || article.category === "SIM/eSIM") {
    return "SIM/eSIM比較を見る";
  }
  if (
    partnerUrl.includes("/partners/flights-transport") ||
    article.category === "航空券・移動"
  ) {
    return "航空券・移動比較を見る";
  }
  if (partnerUrl.includes("/partners/electricity") || article.category === "電気") {
    return "電気会社比較を見る";
  }
  if (partnerUrl.includes("/partners/internet") || article.category === "インターネット") {
    return "インターネット比較を見る";
  }
  if (partnerUrl.includes("/partners/furniture") || article.category === "家具・生活用品") {
    return "家具・生活用品比較を見る";
  }
  if (partnerUrl.includes("/partners/language-school") || article.category === "語学学校") {
    return "語学学校比較を見る";
  }
  if (partnerUrl.includes("/partners/study-agency") || article.category === "留学エージェント") {
    return "留学エージェント比較を見る";
  }
  return "比較ページを見る";
}

async function getArticle(slug: string) {
  const staticArticle = getStaticArticleBySlug(slug);
  if (staticArticle) return staticArticle;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await client
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .in("status", ["published", "approved"])
    .maybeSingle();

  return (data as Article | null) || null;
}

function renderBlock(block: string, index: number) {
  if (block.startsWith("# ")) {
    return (
      <h1 key={index} className="text-2xl font-bold leading-tight md:text-4xl">
        {block.replace(/^# /, "")}
      </h1>
    );
  }

  if (block.startsWith("## ")) {
    return (
      <h2 key={index} className="pt-4 text-xl font-bold leading-8 md:text-2xl">
        {block.replace(/^## /, "")}
      </h2>
    );
  }

  if (block.startsWith("### ")) {
    return (
      <h3 key={index} className="pt-2 text-lg font-bold leading-7">
        {block.replace(/^### /, "")}
      </h3>
    );
  }

  if (block.split("\n").every((line) => line.startsWith("* "))) {
    return (
      <ul key={index} className="list-disc space-y-2 pl-5 font-medium leading-8 text-gray-800">
        {block.split("\n").map((line) => (
          <li key={line}>{line.replace(/^\* /, "")}</li>
        ))}
      </ul>
    );
  }

  return (
    <p key={index} className="whitespace-pre-wrap font-medium leading-8 text-gray-800">
      {block}
    </p>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const blocks = article.content.split(/\n{2,}/).filter(Boolean);
  const relatedPartnerUrl = article.related_partner_url || "/partners";
  const relatedChecklistUrl = article.related_checklist_url || "/mypage/checklist";
  const partnerLinkLabel = getPartnerLinkLabel(article, relatedPartnerUrl);
  const showSimLink = article.category === "航空券・移動";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10">
      <ArticleViewTracker slug={slug} />
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {article.category}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
              {article.country_code || "NZ"}
            </span>
            {article.is_sponsored || article.is_affiliate ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                広告・紹介リンク
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-tight md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-600">
            更新 {formatDate(article.updated_at)}
          </p>

          <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm font-medium leading-6 text-gray-700">
            この記事には広告・紹介リンクが含まれる場合があります。料金、プラン、対応エリア、条件は変更される可能性があるため、申込前に必ず公式サイトで最新情報をご確認ください。
          </p>

          {article.excerpt ? (
            <p className="mt-6 border-l-4 border-blue-600 pl-4 font-medium leading-7 text-gray-800">
              {article.excerpt}
            </p>
          ) : null}

          <div className="mt-8 space-y-5">{blocks.map(renderBlock)}</div>

          <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-lg font-bold">関連リンク</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TrackedLink
                href={relatedPartnerUrl}
                eventName="article_related_partner_click"
                targetType="article"
                targetId={article.slug}
                pagePath={`/articles/${article.slug}`}
                metadata={{
                  slug: article.slug,
                  title: article.title,
                  category: article.category,
                  targetUrl: relatedPartnerUrl,
                }}
                className="rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
              >
                {partnerLinkLabel}
              </TrackedLink>
              {showSimLink ? (
                <Link
                  href="/partners/sim-esim"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
                >
                  SIM/eSIM比較へ
                </Link>
              ) : null}
              <TrackedLink
                href={relatedChecklistUrl}
                eventName="article_related_checklist_click"
                targetType="article"
                targetId={article.slug}
                pagePath={`/articles/${article.slug}`}
                metadata={{
                  slug: article.slug,
                  title: article.title,
                  category: article.category,
                  targetUrl: relatedChecklistUrl,
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
              >
                チェックリストへ
              </TrackedLink>
              <Link
                href="/partners"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
              >
                比較トップへ
              </Link>
            </div>
          </section>

          {article.related_checklist_items?.length ? (
            <section className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold">関連するチェックリスト</h2>
              <ul className="mt-3 space-y-2">
                {article.related_checklist_items.map((item) => (
                  <li key={item} className="rounded-lg bg-gray-50 px-3 py-2 font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-10 space-y-4 border-t border-gray-200 pt-6">
            <Link href="/articles" className="inline-block font-bold text-blue-700">
              役立ち情報一覧へ戻る
            </Link>
            <div className="flex justify-end">
              <Link
                href="/mypage"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
              >
                マイページへ戻る
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
