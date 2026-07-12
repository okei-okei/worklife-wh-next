import Hero from "../components/Hero";
import Features from "../components/Features";
import Link from "next/link";
import AuthAwareCta from "@/components/AuthAwareCta";
import JsonLd from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";
import { staticArticles } from "@/lib/constants/articles";

const homeDescription =
  "ニュージーランドワーホリの仕事探し、家探し、SIM・eSIM、銀行、海外送金、海外保険、生活費、チェックリスト、ライフプランナーまでサポートする総合情報サイトです。";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリ総合情報サイト｜WorkLife WH",
  description: homeDescription,
  path: "/",
  keywords: [
    "ニュージーランド",
    "ワーホリ",
    "ワーキングホリデー",
    "仕事探し",
    "家探し",
    "SIM",
    "銀行",
    "海外送金",
    "海外保険",
    "ライフプランナー",
  ],
});

const heroLinks = [
  {
    title: "仕事探し",
    description: "ニュージーランドの公開求人を探す",
    href: "/jobs",
  },
  {
    title: "家探し",
    description: "公開物件から住まい候補を探す",
    href: "/properties",
  },
  {
    title: "比較サービス",
    description: "SIM、保険、銀行、送金を比較する",
    href: "/partners",
  },
  {
    title: "役立ち情報",
    description: "NZワーホリ準備の記事を読む",
    href: "/articles",
  },
  {
    title: "ライフプランナー",
    description: "仕事と住まいの収支を試す",
    href: "/planner",
  },
];

const popularCategories = [
  { title: "仕事", href: "/jobs", description: "求人一覧、保存、応募文作成へ" },
  { title: "物件", href: "/properties", description: "家探し、保存、問い合わせ文作成へ" },
  { title: "SIM・eSIM", href: "/partners/sim-esim", description: "渡航前後の通信手段を比較" },
  { title: "海外保険", href: "/partners/insurance", description: "医療費や補償内容を整理" },
  { title: "銀行", href: "/partners/bank", description: "給与受取や生活費管理の準備" },
  { title: "海外送金", href: "/partners/money-transfer", description: "日本とNZ間のお金の移動を比較" },
];

const popularComparisons = [
  {
    title: "SIM/eSIM比較",
    href: "/partners/sim-esim",
    description: "到着直後に使えるeSIMとNZ現地SIMを比較できます。",
  },
  {
    title: "海外保険比較",
    href: "/partners/insurance",
    description: "ワーホリ・留学向けの補償内容を整理できます。",
  },
  {
    title: "海外送金比較",
    href: "/partners/money-transfer",
    description: "手数料、為替レート、着金速度を比較できます。",
  },
];

const latestArticles = staticArticles.slice(0, 3);

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    email: siteConfig.supportEmail,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: homeDescription,
    inLanguage: "ja",
  };

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-gray-50 text-gray-900">
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd
        data={createBreadcrumbJsonLd([{ label: "ホーム", href: "/" }])}
      />
      <Hero />

      <section className="bg-gray-50 px-4 py-5 md:px-6 md:py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-lg font-bold text-gray-900 md:text-2xl">
            まずは目的から選ぶ
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {heroLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 md:p-4"
              >
                <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-6 md:px-6 md:py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 md:gap-5 md:p-6">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold text-blue-700 md:text-sm">
              WorkLife WH Demo
            </p>
            <h2 className="text-xl font-bold text-gray-900 md:text-4xl">
              海外の暮らしを設計する
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-800 md:mt-3 md:text-base md:leading-7">
              仕事と住まいを選んで、月いくら残るか試せます。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/jobs"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 sm:w-auto md:px-5 md:py-3 md:text-base"
            >
              求人を探す
            </Link>
            <Link
              href="/properties"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50 sm:w-auto md:px-5 md:py-3 md:text-base"
            >
              物件を探す
            </Link>
            <Link
              href="/demo-planner"
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto md:px-5 md:py-3 md:text-base"
            >
              生活プランを試す
            </Link>
          </div>
        </div>
      </section>

      <Features />

      <section className="bg-gray-50 px-4 py-6 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold text-blue-700 md:text-sm">
              人気カテゴリー
            </p>
            <h2 className="mt-2 text-xl font-bold text-gray-900 md:text-3xl">
              ニュージーランドワーホリ準備をカテゴリ別に確認
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularCategories.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:bg-blue-50 md:p-4"
              >
                <h3 className="text-base font-bold text-gray-900 md:text-lg">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-6 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                人気記事
              </h2>
              <Link href="/articles" className="text-sm font-bold text-blue-700">
                一覧へ
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {latestArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block rounded-xl border border-gray-200 bg-white p-3 hover:bg-blue-50"
                >
                  <p className="text-[11px] font-bold text-blue-700">
                    {article.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-base font-bold text-gray-900">
                    {article.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                比較おすすめ
              </h2>
              <Link href="/partners" className="text-sm font-bold text-blue-700">
                一覧へ
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {popularComparisons.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl border border-gray-200 bg-white p-3 hover:bg-blue-50"
                >
                  <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-6 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold text-blue-700 md:text-sm">準備を進める</p>
            <h2 className="mt-2 text-xl font-bold text-gray-900 md:text-3xl">
              ワーホリ準備に必要なページへ
            </h2>
            <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700 md:mt-3 md:line-clamp-none md:text-base md:leading-7">
              チェックリストで抜け漏れを確認し、比較ページや役立ち情報で条件を整理しながら、生活プランまでつなげられます。
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:mt-6 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {[
              {
                title: "チェックリスト",
                description: "渡航前、到着後、仕事・住まい探しの準備を確認します。",
                href: "/mypage/checklist",
              },
              {
                title: "比較・おすすめ",
                description: "SIM、保険、送金、銀行、生活インフラを比較できます。",
                href: "/partners",
              },
              {
                title: "役立ち情報",
                description: "NZワーホリ準備に必要な確認ポイントを記事で整理します。",
                href: "/articles",
              },
              {
                title: "公開求人",
                description: "公開中の求人を探し、気になる仕事を保存できます。",
                href: "/jobs",
              },
              {
                title: "公開物件",
                description: "住まい候補を探し、生活プランの検討につなげられます。",
                href: "/properties",
              },
              {
                title: "ライフプランナー",
                description: "仕事と住まいを組み合わせて収支を比較できます。",
                href: "/planner",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm hover:bg-blue-50 md:p-4"
              >
                <h3 className="text-base font-bold text-gray-900 md:text-lg">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-gray-700 md:mt-2">
                  {item.description}
                </p>
                <span className="mt-auto pt-3 text-sm font-bold text-blue-700 md:pt-4">
                  開く
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 md:mt-8">
            <AuthAwareCta
              title="準備した内容を保存して進める"
              description="チェックリスト、求人・物件、生活プランを保存すると、後からマイページでまとめて確認できます。"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
