import Link from "next/link";
import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  studyAgencyComparisonFields,
  studyAgencyFilters,
  studyAgencyRecommendations,
  studyAgencyServices,
} from "@/lib/constants/partners/studyAgencyServices";

export default function StudyAgencyComparisonPage() {
  return (
    <PartnerCategoryPage
      title="留学エージェント比較"
      description="無料相談、語学学校紹介、ワーホリサポート、現地サポートを比較できます。"
      categoryPath="/partners/study-agency"
      services={studyAgencyServices}
      filters={studyAgencyFilters}
      comparisonFields={studyAgencyComparisonFields}
      recommendations={studyAgencyRecommendations}
      noticeText="掲載内容・サポート内容・手数料・紹介学校は変更される場合があります。必ず公式サイトで最新情報をご確認ください。"
    >
      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連記事</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          留学エージェントを使うメリット、注意点、学校へ直接申し込む場合との違いを整理しています。
        </p>
        <Link
          href="/articles/nz-working-holiday-study-agency-guide"
          className="mt-4 inline-flex w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800 sm:w-auto"
        >
          留学エージェントの選び方を見る
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連カテゴリ</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          エージェント相談とあわせて、語学学校、仕事探し、チェックリストも確認しておくと準備が進めやすくなります。
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/partners/language-school"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            語学学校を比較する
          </Link>
          <Link
            href="/jobs"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            求人を見る
          </Link>
          <Link
            href="/mypage/checklist"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            チェックリストへ戻る
          </Link>
        </div>
      </section>
    </PartnerCategoryPage>
  );
}
