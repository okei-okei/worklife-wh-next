import {
  formatCurrency,
  formatLifeRating,
} from "../_lib/plannerCalculations";
import type { ScoreResult } from "../_lib/types";

type RecommendedPlanCardProps = {
  result: ScoreResult;
};

export function RecommendedPlanCard({ result }: RecommendedPlanCardProps) {
  return (
    <section className="mb-6 rounded-2xl border-2 border-blue-300 bg-white p-6 shadow-lg">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-700">
            おすすめ生活プラン
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            {result.job.title} × {result.property.title}
          </h2>
        </div>

        <div className="rounded-xl bg-blue-50 px-4 py-3 text-right">
          <div className="text-sm font-bold text-blue-700">生活評価</div>
          <div className="text-2xl font-bold text-yellow-500">
            {formatLifeRating(result.lifeRating)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-500">月貯金予測</p>
          <p
            className={
              result.monthlySavings >= 0
                ? "mt-1 text-3xl font-bold text-blue-700"
                : "mt-1 text-3xl font-bold text-red-600"
            }
          >
            {formatCurrency(result.monthlySavings)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-500">月手取り</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {formatCurrency(result.monthlyNetIncome)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            PAYE {formatCurrency(result.paye)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-500">通勤距離</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {result.distance ? `${result.distance.toFixed(2)} km` : "不明"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-500">通勤時間</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {result.travelMin ? `${result.travelMin} 分` : "不明"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm font-medium text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
        <p>月収総額: {formatCurrency(result.monthlyGrossIncome)}</p>
        <p>月家賃: {formatCurrency(result.monthlyRent)}</p>
        <p>月生活費: {formatCurrency(result.monthlyLivingCost)}</p>
        <p>スコア: {result.score.toFixed(0)}</p>
      </div>
    </section>
  );
}
