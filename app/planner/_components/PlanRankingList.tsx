"use client";

import {
  formatCurrency,
  formatLifeRating,
} from "../_lib/plannerCalculations";
import type { ScoreResult } from "../_lib/types";

type PlanRankingListProps = {
  results: ScoreResult[];
  selectedResult?: ScoreResult;
  stayMonths: number;
  emptyMessage: string;
  onSelectResult: (resultKey: string) => void;
};

export function PlanRankingList({
  results,
  selectedResult,
  stayMonths,
  emptyMessage,
  onSelectResult,
}: PlanRankingListProps) {
  return (
    <div className="space-y-4">
      <h2 className="min-w-0 whitespace-normal break-words text-2xl font-bold text-gray-900 md:text-3xl">
        生活プラン TOP10
      </h2>

      {results.map((result, index) => {
        const isSelected =
          selectedResult?.job.id === result.job.id &&
          selectedResult.property.id === result.property.id;

        return (
          <div
            key={`${result.job.id}-${result.property.id}`}
            className={
              isSelected
                ? "rounded-2xl border-2 border-orange-400 bg-orange-50 p-4 text-gray-900 shadow-lg md:p-6"
                : "rounded-2xl bg-white p-4 text-gray-900 shadow md:p-6"
            }
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="break-words text-lg font-bold md:text-xl">
                    #{index + 1} {result.job.title} × {result.property.title}
                  </h3>

                  {index === 0 ? (
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                      おすすめNo.1
                    </span>
                  ) : null}

                  {isSelected ? (
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                      選択中
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-1 text-sm font-semibold text-gray-800 sm:grid-cols-2 md:text-base">
                  <p>月収総額: {formatCurrency(result.monthlyGrossIncome)}</p>
                  <p>PAYE 15%: {formatCurrency(result.paye)}</p>
                  <p>月手取り: {formatCurrency(result.monthlyNetIncome)}</p>
                  <p>家賃: {formatCurrency(result.monthlyRent)}</p>
                  <p>生活費: {formatCurrency(result.monthlyLivingCost)}</p>
                  <p
                    className={
                      result.monthlySavings >= 0
                        ? "font-bold text-blue-700"
                        : "font-bold text-red-600"
                    }
                  >
                    月間貯金予測: {formatCurrency(result.monthlySavings)}
                  </p>
                  <p
                    className={
                      result.monthlySavings >= 0
                        ? "font-bold text-blue-700"
                        : "font-bold text-red-600"
                    }
                  >
                    帰国時予測:{" "}
                    {formatCurrency(result.monthlySavings * stayMonths)}
                  </p>

                  <p>
                    推定経路距離:{" "}
                    {result.distance
                      ? `${result.distance.toFixed(2)} km`
                      : "不明"}
                  </p>
                  <p>
                    推定移動時間:{" "}
                    {result.travelMin ? `${result.travelMin} 分` : "不明"}
                  </p>
                  <p>通勤ペナルティ: -{result.commutePenalty.toFixed(0)}</p>
                  <p className="font-bold text-yellow-600">
                    生活評価: {formatLifeRating(result.lifeRating)}
                  </p>
                  <p className="font-bold text-green-700">
                    スコア: {result.score.toFixed(0)}
                  </p>
                  <p>
                    経路: {result.routeMode} / {result.routeProvider}
                    {result.isRouteFallback ? " / フォールバック" : ""}
                  </p>
                </div>
              </div>

              <div
                className={
                  isSelected
                    ? "text-sm font-bold text-orange-700 sm:text-right"
                    : "text-sm font-bold text-gray-800 sm:text-right"
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    onSelectResult(`${result.job.id}-${result.property.id}`)
                  }
                  className="w-full rounded-lg bg-gray-900 px-4 py-3 font-bold text-white sm:w-auto sm:py-2"
                >
                  経路を表示
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {results.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-center font-medium text-gray-700 md:p-6">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  );
}
