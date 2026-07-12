import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import AuthAwareCta from "@/components/AuthAwareCta";
import TrackedLink from "@/components/TrackedLink";
import ArticleAffiliateSection from "@/components/articles/ArticleAffiliateSection";
import ArticleBottomNavigation from "@/components/articles/ArticleBottomNavigation";
import ArticleChecklistCTA from "@/components/articles/ArticleChecklistCTA";
import ArticleComparisonTable, {
  type ArticleTableData,
} from "@/components/articles/ArticleComparisonTable";
import ArticleEditorInfo from "@/components/articles/ArticleEditorInfo";
import ArticleExperience from "@/components/articles/ArticleExperience";
import ArticleFAQ, { type ArticleFaqItem } from "@/components/articles/ArticleFAQ";
import ArticleHero from "@/components/articles/ArticleHero";
import ArticlePlannerCTA from "@/components/articles/ArticlePlannerCTA";
import ArticleRelated from "@/components/articles/ArticleRelated";
import ArticleSummary from "@/components/articles/ArticleSummary";
import ArticleTOC, { type TocItem } from "@/components/articles/ArticleTOC";
import ArticleUpdateHistory from "@/components/articles/ArticleUpdateHistory";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import type { Article } from "@/lib/articles";
import { getStaticArticleBySlug, staticArticles } from "@/lib/constants/articles";
import { absoluteUrl, createBreadcrumbJsonLd, createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function calculateReadingMinutes(content: string) {
  const plainText = content.replace(/[#*|`>\-\n]/g, "");
  const japaneseUnits = Math.max(plainText.length / 450, 1);
  return Math.max(1, Math.ceil(japaneseUnits));
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: "記事が見つかりません｜ニュージーランドワーホリ情報｜WorkLife WH",
      description: "指定された記事は見つかりませんでした。",
      path: `/articles/${slug}`,
    });
  }

  return createPageMetadata({
    title: `${article.title}｜ニュージーランドワーホリ情報｜WorkLife WH`,
    description:
      article.excerpt ||
      "ニュージーランドワーホリの仕事探し、家探し、生活準備に役立つ情報です。",
    path: `/articles/${article.slug}`,
    image: article.cover_image_url,
    type: "article",
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    keywords: [
      "ニュージーランド",
      "ワーホリ",
      "ワーキングホリデー",
      article.category,
      "仕事探し",
      "家探し",
      "生活準備",
    ],
  });
}

export function generateStaticParams() {
  return staticArticles.map((article) => ({ slug: article.slug }));
}

function getRelatedArticles(article: Article) {
  const related = staticArticles.filter(
    (item) =>
      item.slug !== article.slug &&
      (item.category === article.category ||
        Boolean(item.country_code && item.country_code === article.country_code)),
  );

  const fallback = staticArticles.filter(
    (item) => item.slug !== article.slug && !related.some((rel) => rel.slug === item.slug),
  );

  return [...related, ...fallback].slice(0, 5);
}

function getPartnerLinkLabel(article: Article, partnerUrl: string) {
  if (partnerUrl.includes("/partners/insurance") || article.category === "海外保険") {
    return "海外保険比較を見る";
  }
  if (partnerUrl.includes("/partners/sim-esim") || article.category === "SIM/eSIM") {
    return "SIM/eSIM比較を見る";
  }
  if (partnerUrl.includes("/partners/money-transfer") || article.category === "海外送金") {
    return "海外送金比較を見る";
  }
  if (partnerUrl.includes("/partners/bank") || article.category === "銀行口座") {
    return "銀行口座比較を見る";
  }
  if (partnerUrl.includes("/partners/flights-transport") || article.category === "航空券・移動") {
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

function getComparisonLinks(article: Article, primaryHref: string, primaryLabel: string) {
  const links = [{ href: primaryHref, label: primaryLabel }];
  const add = (href: string, label: string) => {
    if (!links.some((link) => link.href === href)) links.push({ href, label });
  };

  if (article.category === "銀行口座") add("/partners/money-transfer", "海外送金比較を見る");
  if (article.category === "海外送金") add("/partners/bank", "銀行口座比較を見る");
  if (article.category === "電気") add("/partners/internet", "インターネット比較を見る");
  if (article.category === "インターネット") add("/partners/electricity", "電気会社比較を見る");
  if (article.category === "航空券・移動") add("/partners/sim-esim", "SIM/eSIM比較を見る");
  if (article.category === "語学学校") add("/partners/study-agency", "留学エージェント比較を見る");
  if (article.category === "留学エージェント") add("/partners/language-school", "語学学校比較を見る");

  return links;
}

function parseMarkdownTable(block: string): ArticleTableData | null {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (
    lines.length < 3 ||
    !lines.every((line) => line.startsWith("|") && line.endsWith("|"))
  ) {
    return null;
  }

  const toCells = (line: string) =>
    line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());

  const separatorCells = toCells(lines[1]);
  if (!separatorCells.every((cell) => /^:?-{3,}:?$/.test(cell))) return null;

  return {
    headers: toCells(lines[0]),
    rows: lines.slice(2).map(toCells),
  };
}

function getBlocks(content: string) {
  return content.split(/\n{2,}/).filter(Boolean);
}

function getTocItems(blocks: string[]) {
  return blocks
    .map((block) => {
      if (block.startsWith("## ")) {
        const title = block.replace(/^## /, "");
        return { id: slugify(title), title, level: 2 as const };
      }
      if (block.startsWith("### ")) {
        const title = block.replace(/^### /, "");
        return { id: slugify(title), title, level: 3 as const };
      }
      return null;
    })
    .filter((item): item is TocItem => Boolean(item));
}

function getLearnings(article: Article, headings: TocItem[]) {
  const headingItems = headings.slice(0, 4).map((item) => item.title);
  return [
    ...headingItems,
    `${article.category}で失敗しにくい確認ポイント`,
    "比較ページやチェックリストへの進み方",
  ].slice(0, 6);
}

function getConclusions(article: Article) {
  return [
    `${article.category}は、料金や条件だけでなく生活動線との相性まで確認するのが大切です。`,
    "公式サイトで最新条件を確認し、必要なら複数サービスを比較してから決めると安心です。",
    "迷った場合はチェックリストとライフプランナーで、自分の準備状況に合わせて整理しましょう。",
  ];
}

function getFaqItems(article: Article): ArticleFaqItem[] {
  return [
    {
      question: `${article.category}はニュージーランドワーホリ前に確認すべきですか？`,
      answer:
        "渡航前に大まかな選択肢を確認しておくと、到着後に慌てず行動できます。料金や条件は変わるため、申込前には公式サイトで最新情報を確認してください。",
    },
    {
      question: "比較ページはどのように使えばよいですか？",
      answer:
        "料金、対応エリア、サポート内容、注意点を横並びで見て、自分の滞在期間や目的に合うものを絞り込むために使ってください。",
    },
    {
      question: "記事の情報だけで申し込んでも大丈夫ですか？",
      answer:
        "記事は判断材料の整理を目的としています。契約や申込の前には、必ず公式サイトや公的機関の最新情報を確認してください。",
    },
    {
      question: "チェックリストと一緒に使うメリットはありますか？",
      answer:
        "記事で理解した内容をチェックリストに落とし込むと、渡航前・到着後にやることの抜け漏れを減らせます。",
    },
    {
      question: "生活費への影響も確認できますか？",
      answer:
        "ライフプランナーで仕事、住まい、生活費を組み合わせると、月ごとの収支や帰国時点の残高を確認しやすくなります。",
    },
  ];
}

function renderBlock(block: string, index: number) {
  const table = parseMarkdownTable(block);
  if (table) return <ArticleComparisonTable key={index} table={table} />;

  if (block.startsWith("# ")) {
    return (
      <h2 key={index} className="text-xl font-bold leading-8 text-gray-900 md:text-2xl">
        {block.replace(/^# /, "")}
      </h2>
    );
  }

  if (block.startsWith("## ")) {
    const title = block.replace(/^## /, "");
    return (
      <h2
        key={index}
        id={slugify(title)}
        className="scroll-mt-24 pt-3 text-xl font-bold leading-8 text-gray-900 md:text-2xl"
      >
        {title}
      </h2>
    );
  }

  if (block.startsWith("### ")) {
    const title = block.replace(/^### /, "");
    return (
      <h3
        key={index}
        id={slugify(title)}
        className="scroll-mt-24 pt-2 text-lg font-bold leading-7 text-gray-900"
      >
        {title}
      </h3>
    );
  }

  if (block.split("\n").every((line) => line.startsWith("* "))) {
    return (
      <ul
        key={index}
        className="list-disc space-y-1.5 pl-5 text-sm font-medium leading-7 text-gray-800 md:text-base"
      >
        {block.split("\n").map((line) => (
          <li key={line}>{line.replace(/^\* /, "")}</li>
        ))}
      </ul>
    );
  }

  return (
    <p
      key={index}
      className="whitespace-pre-wrap text-sm font-medium leading-7 text-gray-800 md:text-base md:leading-8"
    >
      {block}
    </p>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const blocks = getBlocks(article.content);
  const tocItems = getTocItems(blocks);
  const readingMinutes = calculateReadingMinutes(article.content);
  const relatedPartnerUrl = article.related_partner_url || "/partners";
  const relatedChecklistUrl = article.related_checklist_url || "/mypage/checklist";
  const partnerLinkLabel = getPartnerLinkLabel(article, relatedPartnerUrl);
  const comparisonLinks = getComparisonLinks(article, relatedPartnerUrl, partnerLinkLabel);
  const relatedArticles = getRelatedArticles(article);
  const faqItems = getFaqItems(article);
  const learnings = getLearnings(article, tocItems);
  const conclusions = getConclusions(article);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.title,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: { "@type": "Organization", name: "WorkLife WH 編集部" },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-4 text-gray-900 md:px-6 md:py-8">
      <ArticleViewTracker slug={slug} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd
        data={createBreadcrumbJsonLd([
          { label: "ホーム", href: "/" },
          { label: "役立ち情報", href: "/articles" },
          { label: article.title, href: `/articles/${article.slug}` },
        ])}
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-3">
          <Breadcrumbs
            items={[
              { label: "ホーム", href: "/" },
              { label: "役立ち情報", href: "/articles" },
              { label: article.title },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-4">
            <ArticleHero article={article} readingMinutes={readingMinutes} />

            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-900 md:text-sm md:leading-6">
              この記事には広告・紹介リンクが含まれる場合があります。リンク先で登録・申込を行うと、WorkLife WH運営者が報酬または紹介特典を受け取る場合があります。
            </p>

            <ArticleSummary learnings={learnings} conclusions={conclusions} />
            <ArticleEditorInfo />
            <div className="md:hidden">
              <ArticleTOC items={tocItems} />
            </div>

            <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
              <div className="space-y-5">{blocks.map(renderBlock)}</div>
            </article>

            <ArticleExperience category={article.category} />
            <ArticleAffiliateSection article={article} />

            <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
              <h2 className="text-lg font-bold text-gray-900">関連する比較ページ</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {comparisonLinks.map((link, index) => (
                  <TrackedLink
                    key={link.href}
                    href={link.href}
                    eventName="article_related_partner_click"
                    targetType="article"
                    targetId={article.slug}
                    pagePath={`/articles/${article.slug}`}
                    metadata={{
                      slug: article.slug,
                      title: article.title,
                      category: article.category,
                      targetUrl: link.href,
                    }}
                    className={
                      index === 0
                        ? "rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-bold text-white hover:bg-blue-800"
                        : "rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
                    }
                  >
                    {link.label}
                  </TrackedLink>
                ))}
              </div>
            </section>

            <ArticleChecklistCTA
              href={relatedChecklistUrl}
              articleSlug={article.slug}
              category={article.category}
            />
            <ArticlePlannerCTA articleSlug={article.slug} category={article.category} />
            <ArticleFAQ items={faqItems} />

            <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
              <h2 className="text-lg font-bold text-gray-900">まとめ</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-6 text-gray-700">
                <li>{article.category}は、渡航前に選択肢を比較しておくと判断しやすくなります。</li>
                <li>料金や条件は変わるため、契約前に公式サイトで最新情報を確認してください。</li>
                <li>比較ページ、チェックリスト、ライフプランナーを組み合わせると準備を進めやすくなります。</li>
              </ul>
            </section>

            <ArticleRelated articles={relatedArticles} />

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-3 md:p-4">
              <h2 className="text-lg font-bold text-gray-900">この記事について</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
                この記事は WorkLife WH 編集部が、ニュージーランドでのワーキングホリデー経験と公式情報をもとに作成しています。情報は定期的に更新しています。
              </p>
              <Link
                href="/about"
                className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                運営者情報を見る
              </Link>
            </section>

            <AuthAwareCta
              title="無料で生活設計を始める"
              description="チェックリスト、保存した求人・物件、生活プランをマイページでまとめて管理できます。"
            />
            <ArticleUpdateHistory updatedAt={article.updated_at} />
            <ArticleBottomNavigation />
          </div>

          <div className="hidden md:block">
            <ArticleTOC items={tocItems} />
          </div>
        </div>
      </div>
    </main>
  );
}
