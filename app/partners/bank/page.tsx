import Link from "next/link";
import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  bankComparisonFields,
  bankFilters,
  bankRecommendations,
  bankServices,
} from "@/lib/constants/partners/bankServices";

export default function BankComparisonPage() {
  return (
    <PartnerCategoryPage
      title="銀行口座比較"
      description="NZ到着後の給与受取や生活費管理に使う銀行口座、送金と相性のよい補助サービスを比較できます。"
      categoryPath="/partners/bank"
      services={bankServices}
      filters={bankFilters}
      comparisonFields={bankComparisonFields}
      recommendations={bankRecommendations}
      noticeText="掲載サービスには広告・紹介リンクが含まれる場合があります。口座開設条件、手数料、本人確認、対応サービスは変更される場合があるため、必ず公式サイトで最新情報をご確認ください。"
    >
      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連カテゴリ</h2>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-bold text-blue-700">海外送金</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            日本からNZへの送金方法も比較する
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            銀行口座を準備する前に、生活費や初期費用をどう送るかも確認しておくと安心です。
          </p>
          <Link
            href="/partners/money-transfer"
            className="mt-4 inline-flex w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800 sm:w-auto"
          >
            日本からNZへの送金方法も比較する
          </Link>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連記事</h2>
        <article className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-bold text-blue-700">銀行口座</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            ニュージーランドワーホリで銀行口座は必要？開設前に知るべきこと
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            給与受取、家賃支払い、生活費管理、海外送金との使い分けを整理します。
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/articles/nz-working-holiday-bank-account-guide"
              className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800 sm:w-auto"
            >
              記事を読む
            </Link>
            <Link
              href="/mypage/checklist"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
            >
              チェックリストを見る
            </Link>
          </div>
        </article>
      </section>
    </PartnerCategoryPage>
  );
}
