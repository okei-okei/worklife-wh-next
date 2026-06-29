import Link from "next/link";
import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import PartnerBreadcrumbJsonLd from "@/components/seo/PartnerBreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo";
import {
  languageSchoolComparisonFields,
  languageSchoolFilters,
  languageSchoolRecommendations,
  languageSchoolServices,
} from "@/lib/constants/partners/languageSchoolServices";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリ向け語学学校比較 | WorkLife WH",
  description:
    "英語学習、IELTS対策、仕事探し準備に使えるニュージーランドの語学学校を比較できます。",
  path: "/partners/language-school",
});

export default function LanguageSchoolComparisonPage() {
  return (
    <>
      <PartnerBreadcrumbJsonLd label="語学学校" path="/partners/language-school" />
      <PartnerCategoryPage
        title="語学学校比較"
        description="英語学習、IELTS対策、仕事探し準備に使えるニュージーランドの語学学校を比較できます。"
        categoryPath="/partners/language-school"
        services={languageSchoolServices}
        filters={languageSchoolFilters}
        comparisonFields={languageSchoolComparisonFields}
        recommendations={languageSchoolRecommendations}
        noticeText="掲載サービスには広告・紹介リンクが含まれる場合があります。学費、コース内容、サポート内容、入学条件は変更される場合があるため、必ず公式サイトで最新情報をご確認ください。"
      >
      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連記事</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          ワーホリで語学学校に通うメリット、注意点、比較ポイントを整理しています。
        </p>
        <Link
          href="/articles/nz-working-holiday-language-school-guide"
          className="mt-4 inline-flex w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800 sm:w-auto"
        >
          語学学校の選び方を見る
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連カテゴリ</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          到着前後の準備では、通信、履歴書、仕事探しの導線もあわせて確認すると進めやすくなります。
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/partners/sim-esim"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            SIM/eSIMも確認する
          </Link>
          <Link
            href="/mypage/resume"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            履歴書管理へ
          </Link>
          <Link
            href="/jobs"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            求人を見る
          </Link>
        </div>
      </section>
      </PartnerCategoryPage>
    </>
  );
}
