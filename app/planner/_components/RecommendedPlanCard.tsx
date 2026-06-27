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
    <section className="mb-6 min-w-0 rounded-2xl border-2 border-blue-300 bg-white p-4 text-gray-900 shadow-lg md:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-blue-700">
            おすすめ生活プラン
          </p>

          <h2 className="mt-1 break-words text-2xl font-bold md:text-3xl">
            {result.job.title} × {result.property.title}
          </h2>
        </div>

        <div className="w-full rounded-xl bg-blue-50 px-4 py-3 text-left sm:w-auto sm:text-right">
          <div className="text-sm font-bold text-blue-700">生活評価</div>
          <div className="text-2xl font-bold text-yellow-500">
            {formatLifeRating(result.lifeRating)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-800">月貯金予測</p>
          <p
            className={
              result.monthlySavings >= 0
                ? "mt-1 text-2xl font-bold text-blue-700 md:text-3xl"
                : "mt-1 text-2xl font-bold text-red-600 md:text-3xl"
            }
          >
            {formatCurrency(result.monthlySavings)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-800">月手取り</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
            {formatCurrency(result.monthlyNetIncome)}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            PAYE {formatCurrency(result.paye)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-800">推定経路距離</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
            {result.distance ? `${result.distance.toFixed(2)} km` : "不明"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-800">推定移動時間</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
            {result.travelMin ? `${result.travelMin} 分` : "不明"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 text-sm font-bold text-gray-800 sm:grid-cols-2 lg:grid-cols-4">
        <p>月収総額: {formatCurrency(result.monthlyGrossIncome)}</p>
        <p>月家賃: {formatCurrency(result.monthlyRent)}</p>
        <p>月生活費: {formatCurrency(result.monthlyLivingCost)}</p>
        <p>移動手段: {result.travelMode}</p>
      </div>

      <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-800">
        経路: {result.travelMode}
        {result.isRouteFallback ? " / 推定表示" : " / 道路経路"}
        {result.routeMessage ? ` / ${result.routeMessage}` : ""}
      </div>
    </section>
  );
}
