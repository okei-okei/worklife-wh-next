import Link from "next/link";
import SimEsimComparison from "@/components/partners/SimEsimComparison";
import AuthAwareCta from "@/components/AuthAwareCta";
import RelatedArticles from "@/components/articles/RelatedArticles";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import SeoFaqSection from "@/components/seo/SeoFaqSection";
import type { Article } from "@/lib/articles";
import { getStaticArticleBySlug } from "@/lib/constants/articles";
import { getPartnerFaqs } from "@/lib/constants/partnerFaqs";
import { createBreadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリ向けSIM/eSIM比較 | WorkLife WH",
  description:
    "ニュージーランド渡航前後に使えるSIM/eSIM、現地SIM、通信サービスを比較できます。",
  path: "/partners/sim-esim",
});

export default function SimEsimComparisonPage() {
  const relatedArticles = [
    getStaticArticleBySlug("nz-working-holiday-sim-esim-comparison"),
  ].filter((article): article is Article => article !== null);

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <JsonLd
        data={createBreadcrumbJsonLd([
          { label: "ホーム", href: "/" },
          { label: "比較・おすすめ", href: "/partners" },
          { label: "SIM/eSIM", href: "/partners/sim-esim" },
        ])}
      />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "ホーム", href: "/" },
                { label: "比較・おすすめ", href: "/partners" },
                { label: "SIM/eSIM" },
              ]}
            />
          </div>
          <p className="mb-2 text-sm font-bold text-blue-700">
            WorkLife WH 比較・おすすめ
          </p>
          <h1 className="text-2xl font-bold md:text-4xl">
            SIM・eSIM比較
          </h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
            ニュージーランド渡航前後に使いやすい通信サービスを比較できます。出発前に使えるeSIMと、現地生活向けのNZ SIMを分けて確認できます。
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-700">
          <p>
            このページには広告・紹介リンクが含まれる場合があります。掲載サービスの一部は、申込・購入によりWorkLife
            WHが報酬を受け取ることがあります。
          </p>
          <p className="mt-2">
            料金・データ容量・対応エリアは変更される場合があります。契約前に必ず公式サイトで最新情報をご確認ください。
          </p>
        </section>

        <SimEsimComparison />

        <RelatedArticles
          articles={relatedArticles}
        />

        <SeoFaqSection items={getPartnerFaqs("/partners/sim-esim")} />

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            次に比較すべきカテゴリ
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            通信手段とあわせて、渡航前に必要な保険や到着後のお金まわりも確認しておくと安心です。
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              {
                href: "/partners/insurance",
                title: "海外保険比較",
                description: "医療費や携行品補償など、渡航前に確認したい条件を整理します。",
              },
              {
                href: "/partners/bank",
                title: "銀行口座比較",
                description: "給与受取や生活費管理に使う口座を確認します。",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-blue-50"
              >
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <AuthAwareCta
          title="通信手段を決めたら生活準備へ"
          description="無料登録すると、チェックリスト、保存した求人・物件、生活プランをマイページでまとめて確認できます。"
        />

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-700 md:p-5">
          <p>
            このページには広告・紹介リンクが含まれる場合があります。掲載内容は、料金、利用条件、対応エリア、ワーホリ・海外生活との相性などをもとにWorkLife
            WHの基準で整理しています。契約前には必ず各サービスの公式サイトをご確認ください。
          </p>
          <Link
            href="/legal/affiliate-disclosure"
            className="mt-3 inline-flex font-bold text-blue-700 hover:text-blue-800"
          >
            広告・紹介リンク開示を確認する
          </Link>
        </section>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          <Link
            href="/partners"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            比較・おすすめへ戻る
          </Link>
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
