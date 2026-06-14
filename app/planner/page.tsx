"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlannerInputPanel } from "./_components/PlannerInputPanel";
import { PlannerMapSection } from "./_components/PlannerMapSection";
import { PlanRankingList } from "./_components/PlanRankingList";
import { RecommendedPlanCard } from "./_components/RecommendedPlanCard";
import { usePlannerSavedItems } from "./_hooks/usePlannerSavedItems";
import { usePlannerSettings } from "./_hooks/usePlannerSettings";
import {
  calculateMonthlyLivingCost,
  calculatePlannerResults,
} from "./_lib/plannerCalculations";
import {
  getHighlightedLine,
  getJobPoints,
  getPropertyPoints,
  getResultLines,
} from "./_lib/mapHelpers";
import type { PlannerInputConfig } from "./_lib/types";

export default function PlannerPage() {
  const [maxWeeklyRent, setMaxWeeklyRent] = useState("");
  const [maxCommuteMinutes, setMaxCommuteMinutes] = useState("");
  const [minHourlyRate, setMinHourlyRate] = useState("");
  const [selectedResultKey, setSelectedResultKey] = useState<string | null>(
    null,
  );

  const {
    currentUserId,
    jobs,
    properties,
    lastUpdatedAt,
    isRefreshing,
    refresh,
  } = usePlannerSavedItems();

  const {
    monthlyFoodCost,
    setMonthlyFoodCost,
    monthlyTransportCost,
    setMonthlyTransportCost,
    monthlyPhoneCost,
    setMonthlyPhoneCost,
    monthlyOtherCost,
    setMonthlyOtherCost,
    plannedStayMonths,
    setPlannedStayMonths,
    settingsSaveStatus,
  } = usePlannerSettings(currentUserId);

  const monthlyLivingCost = calculateMonthlyLivingCost({
    monthlyFoodCost,
    monthlyTransportCost,
    monthlyPhoneCost,
    monthlyOtherCost,
  });

  const results = useMemo(() => {
    return calculatePlannerResults({
      jobs,
      properties,
      maxWeeklyRent,
      maxCommuteMinutes,
      minHourlyRate,
      monthlyFoodCost,
      monthlyTransportCost,
      monthlyPhoneCost,
      monthlyOtherCost,
    });
  }, [
    jobs,
    properties,
    maxWeeklyRent,
    maxCommuteMinutes,
    minHourlyRate,
    monthlyFoodCost,
    monthlyTransportCost,
    monthlyPhoneCost,
    monthlyOtherCost,
  ]);

  const activeFilterCount = [
    maxWeeklyRent,
    maxCommuteMinutes,
    minHourlyRate,
  ].filter((value) => value.trim() !== "").length;

  const selectedResult = useMemo(() => {
    if (!selectedResultKey) return results[0];

    return (
      results.find(
        (result) =>
          `${result.job.id}-${result.property.id}` === selectedResultKey,
      ) || results[0]
    );
  }, [results, selectedResultKey]);

  const topResult = results[0];
  const stayMonths = Math.max(Number(plannedStayMonths || 0), 0);

  const filterSummary = activeFilterCount
    ? `${activeFilterCount}件の条件を適用中`
    : "すべての候補を表示中";

  const emptyMessage = activeFilterCount
    ? "条件に合う組み合わせがありません"
    : "データを追加すると最適プランが表示されます";

  const plannerSettingsStatusLabel =
    settingsSaveStatus === "loading"
      ? "保存内容を読込中"
      : settingsSaveStatus === "saving"
        ? "保存中..."
        : settingsSaveStatus === "local"
          ? "この端末に保存中"
          : "アカウントに保存済み";

  const settingsStatusClassName =
    settingsSaveStatus === "local"
      ? "text-sm font-bold text-orange-600"
      : "text-sm font-bold text-green-700";

  const lastUpdatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "未取得";

  const jobPoints = useMemo(() => getJobPoints(jobs), [jobs]);
  const propertyPoints = useMemo(
    () => getPropertyPoints(properties),
    [properties],
  );
  const lines = useMemo(() => getResultLines(results), [results]);
  const highlightedLine = useMemo(
    () => getHighlightedLine(selectedResult),
    [selectedResult],
  );

  const matchedJobIds = useMemo(() => {
    return new Set(results.map((result) => result.job.id));
  }, [results]);

  const matchedPropertyIds = useMemo(() => {
    return new Set(results.map((result) => result.property.id));
  }, [results]);

  const visibleJobPoints = useMemo(() => {
    if (!activeFilterCount || !results.length) return jobPoints;

    return jobPoints.filter((job) => matchedJobIds.has(job.id));
  }, [activeFilterCount, jobPoints, matchedJobIds, results.length]);

  const visiblePropertyPoints = useMemo(() => {
    if (!activeFilterCount || !results.length) return propertyPoints;

    return propertyPoints.filter((property) =>
      matchedPropertyIds.has(property.id),
    );
  }, [
    activeFilterCount,
    matchedPropertyIds,
    propertyPoints,
    results.length,
  ]);

  const filterInputs: PlannerInputConfig[] = [
    {
      id: "max-rent",
      label: "週家賃上限",
      prefix: "$",
      suffix: "/ week",
      value: maxWeeklyRent,
      placeholder: "300",
      onChange: setMaxWeeklyRent,
    },
    {
      id: "max-commute",
      label: "通勤時間上限",
      suffix: "分",
      value: maxCommuteMinutes,
      placeholder: "30",
      onChange: setMaxCommuteMinutes,
    },
    {
      id: "min-hourly",
      label: "最低時給",
      prefix: "$",
      suffix: "/ hour",
      value: minHourlyRate,
      placeholder: "25",
      onChange: setMinHourlyRate,
    },
  ];

  const livingCostInputs: PlannerInputConfig[] = [
    {
      id: "food-cost",
      label: "食費",
      prefix: "$",
      suffix: "/ month",
      value: monthlyFoodCost,
      onChange: setMonthlyFoodCost,
    },
    {
      id: "phone-cost",
      label: "通信費",
      prefix: "$",
      suffix: "/ month",
      value: monthlyPhoneCost,
      onChange: setMonthlyPhoneCost,
    },
    {
      id: "transport-cost",
      label: "交通費",
      prefix: "$",
      suffix: "/ month",
      value: monthlyTransportCost,
      onChange: setMonthlyTransportCost,
    },
    {
      id: "other-cost",
      label: "その他",
      prefix: "$",
      suffix: "/ month",
      value: monthlyOtherCost,
      onChange: setMonthlyOtherCost,
    },
    {
      id: "stay-months",
      label: "滞在予定",
      suffix: "か月",
      value: plannedStayMonths,
      onChange: setPlannedStayMonths,
    },
  ];

  const resetFilters = () => {
    setMaxWeeklyRent("");
    setMaxCommuteMinutes("");
    setMinHourlyRate("");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">ライフプランナー（最適化AI）</h1>

          <Link
            href="/mypage"
            className="rounded-lg bg-gray-500 px-4 py-2 text-white"
          >
            ← マイページ
          </Link>
        </div>

        <PlannerInputPanel
          title="条件フィルター"
          summary={filterSummary}
          inputs={filterInputs}
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!activeFilterCount}
            >
              リセット
            </button>
          }
        />

        <PlannerInputPanel
          title="生活費シミュレーション"
          inputs={livingCostInputs}
          columnsClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          action={
            <>
              <div className="text-sm font-bold text-blue-700">
                月間生活費: ${monthlyLivingCost.toFixed(0)}
              </div>

              <div className={settingsStatusClassName}>
                {plannerSettingsStatusLabel}
              </div>
            </>
          }
        />

        {topResult ? <RecommendedPlanCard result={topResult} /> : null}

        <PlannerMapSection
          jobs={visibleJobPoints}
          properties={visiblePropertyPoints}
          lines={lines}
          selectedResult={selectedResult}
          highlightedLine={highlightedLine}
          isRefreshing={isRefreshing}
          lastUpdatedLabel={lastUpdatedLabel}
          canRefresh={Boolean(currentUserId)}
          onRefresh={refresh}
        />

        <PlanRankingList
          results={results}
          selectedResult={selectedResult}
          stayMonths={stayMonths}
          emptyMessage={emptyMessage}
          onSelectResult={setSelectedResultKey}
        />
      </div>
    </main>
  );
}
