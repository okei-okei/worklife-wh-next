import Link from "next/link";
import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import PartnerBreadcrumbJsonLd from "@/components/seo/PartnerBreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo";
import {
  furnitureComparisonFields,
  furnitureFilters,
  furnitureRecommendations,
  furnitureServices,
} from "@/lib/constants/partners/furnitureServices";

export const metadata = createPageMetadata({
  title: "ニュージーランド生活向け家具・生活用品比較 | WorkLife WH",
  description:
    "到着直後や入居後に必要な家具、寝具、生活用品の購入先を比較できます。",
  path: "/partners/furniture",
});

export default function FurnitureComparisonPage() {
  return (
    <>
      <PartnerBreadcrumbJsonLd label="家具・生活用品" path="/partners/furniture" />
      <PartnerCategoryPage
        title="家具・生活用品比較"
        description="住居が決まった後や到着直後に必要な寝具、キッチン用品、家具、家電、生活用品の購入先を比較できます。"
        categoryPath="/partners/furniture"
        services={furnitureServices}
        filters={furnitureFilters}
        comparisonFields={furnitureComparisonFields}
        recommendations={furnitureRecommendations}
        noticeText="掲載サービスには広告・紹介リンクが含まれる場合があります。価格、在庫、配送条件、返品条件は変更される場合があるため、必ず公式サイトで最新情報をご確認ください。中古品を購入する場合は、商品の状態、受け渡し場所、支払い方法、安全性を必ず確認してください。"
      >
      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連記事</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          到着直後に必要になりやすい生活用品と、中古購入時の注意点を整理しています。
        </p>
        <Link
          href="/articles/nz-arrival-furniture-daily-items-guide"
          className="mt-4 inline-flex w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800 sm:w-auto"
        >
          家具・生活用品の記事を見る
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連カテゴリ</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          入居後は生活用品だけでなく、電気、インターネット、物件条件もあわせて確認しておくと安心です。
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/partners/electricity"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            電気契約も確認する
          </Link>
          <Link
            href="/partners/internet"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            インターネット契約も確認する
          </Link>
          <Link
            href="/properties"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            物件探しに戻る
          </Link>
        </div>
      </section>
      </PartnerCategoryPage>
    </>
  );
}
