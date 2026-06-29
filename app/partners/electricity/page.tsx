import Link from "next/link";
import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import RelatedArticles from "@/components/articles/RelatedArticles";
import PartnerBreadcrumbJsonLd from "@/components/seo/PartnerBreadcrumbJsonLd";
import { getStaticArticleBySlug } from "@/lib/constants/articles";
import { createPageMetadata } from "@/lib/seo";
import {
  electricityComparisonFields,
  electricityFilters,
  electricityRecommendations,
  electricityServices,
} from "@/lib/constants/partners/electricityServices";

export const metadata = createPageMetadata({
  title: "ニュージーランド生活向け電気会社比較 | WorkLife WH",
  description:
    "ニュージーランドで住居が決まった後に必要な電気会社を、料金や契約条件で比較できます。",
  path: "/partners/electricity",
});

export default function ElectricityComparisonPage() {
  const relatedArticles = [
    getStaticArticleBySlug("nz-flat-electricity-provider-guide"),
  ].filter((article) => article !== null);

  return (
    <>
      <PartnerBreadcrumbJsonLd label="電気" path="/partners/electricity" />
      <PartnerCategoryPage
        title="電気サービス比較"
        description="入居後に必要な電気契約を、料金の見方、契約期間、アプリ管理、フラット向きかどうかで比較できます。"
        categoryPath="/partners/electricity"
        services={electricityServices}
        filters={electricityFilters}
        comparisonFields={electricityComparisonFields}
        recommendations={electricityRecommendations}
        noticeText="掲載サービスには広告・紹介リンクが含まれる場合があります。電気料金、契約条件、提供エリア、解約手数料は変更される場合があるため、必ず公式サイトで最新情報をご確認ください。"
      >
        <RelatedArticles articles={relatedArticles} />

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連カテゴリ</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          入居後は電気だけでなく、Wi-Fiやホームインターネットの開通時期も確認しておくと安心です。
        </p>
        <Link
          href="/partners/internet"
          className="mt-4 inline-flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
        >
          インターネット契約も確認する
        </Link>
      </section>
      </PartnerCategoryPage>
    </>
  );
}
