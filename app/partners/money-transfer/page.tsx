import Link from "next/link";
import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import MoneyTransferSimulator from "@/components/partners/MoneyTransferSimulator";
import {
  moneyTransferComparisonFields,
  moneyTransferFilters,
  moneyTransferRecommendations,
  moneyTransferServices,
} from "@/lib/constants/partners/moneyTransferServices";

export default function MoneyTransferComparisonPage() {
  return (
    <PartnerCategoryPage
      title="海外送金比較"
      description="日本からニュージーランドへの送金を、手数料、為替レート、着金速度、送金方法で比較できます。"
      categoryPath="/partners/money-transfer"
      services={moneyTransferServices}
      filters={moneyTransferFilters}
      comparisonFields={moneyTransferComparisonFields}
      recommendations={moneyTransferRecommendations}
    >
      <MoneyTransferSimulator services={moneyTransferServices} />

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連カテゴリ</h2>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-bold text-blue-700">銀行口座</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            送金先のNZ銀行口座も確認する
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            送金方法を決めたら、給与受取や家賃支払いに使うNZ銀行口座・多通貨サービスも確認しておきましょう。
          </p>
          <Link
            href="/partners/bank"
            className="mt-4 inline-flex w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800 sm:w-auto"
          >
            送金先のNZ銀行口座も確認する
          </Link>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <h2 className="text-xl font-bold text-gray-900">関連記事</h2>
        <article className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-bold text-blue-700">海外送金</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            ニュージーランドワーホリにおすすめの海外送金サービス比較
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            海外送金が必要になる場面、手数料・為替レート・送金速度の見方を整理します。
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/articles/nz-working-holiday-money-transfer-guide"
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
