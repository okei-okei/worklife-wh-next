import Link from "next/link";
import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  internetComparisonFields,
  internetFilters,
  internetRecommendations,
  internetServices,
} from "@/lib/constants/partners/internetServices";

export default function InternetComparisonPage() {
  return (
    <PartnerCategoryPage
      title="インターネット比較"
      description="住居決定後に必要になるインターネット契約を、光回線、ワイヤレス、データ無制限、契約期間、電気セットで比較できます。"
      categoryPath="/partners/internet"
      services={internetServices}
      filters={internetFilters}
      comparisonFields={internetComparisonFields}
      recommendations={internetRecommendations}
      noticeText="掲載サービスには広告・紹介リンクが含まれる場合があります。月額料金、契約条件、提供エリア、開通時期、解約手数料は変更される場合があるため、必ず公式サイトで最新情報をご確認ください。"
    >
      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連カテゴリ</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          電気とインターネットをまとめて契約できる場合があります。セット契約の料金や解約条件は必ず公式サイトで確認してください。
        </p>
        <Link
          href="/partners/electricity"
          className="mt-4 inline-flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
        >
          電気契約も確認する
        </Link>
      </section>
    </PartnerCategoryPage>
  );
}
