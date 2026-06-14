"use client";

import { useEffect, useMemo, useState } from "react";
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
  createPlannerRouteKey,
} from "./_lib/plannerCalculations";
import {
  getHighlightedLine,
  getJobPoints,
  getPropertyPoints,
  getResultLines,
} from "./_lib/mapHelpers";
import type { PlannerInputConfig } from "./_lib/types";
import {
  getRouteInfo,
  type RouteInfo,
  type RouteMode,
} from "@/lib/services/routeService";

const travelModeOptions: Array<{
  value: RouteMode;
  label: string;
  description: string;
}> = [
  {
    value: "walking",
    label: "徒歩",
    description: "徒歩経路の推定距離・時間",
  },
  {
    value: "driving",
    label: "車",
    description: "道路経路の推定距離・時間",
  },
  {
    value: "transit",
    label: "公共交通",
    description: "Google Maps連携後に対応予定",
  },
];

export default function PlannerPage() {
  const [maxWeeklyRent, setMaxWeeklyRent] = useState("");
  const [maxCommuteMinutes, setMaxCommuteMinutes] = useState("");
  const [minHourlyRate, setMinHourlyRate] = useState("");
  const [selectedResultKey, setSelectedResultKey] = useState<string | null>(
    null,
  );
  const [travelMode, setTravelMode] = useState<RouteMode>("driving");
  const [routeInfoByKey, setRouteInfoByKey] = useState<
    Record<string, RouteInfo>
  >({});
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeStatusMessage, setRouteStatusMessage] = useState("");

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

  const fallbackResults = useMemo(() => {
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
      travelMode,
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
    travelMode,
  ]);

  useEffect(() => {
    let isActive = true;

    const loadRouteInfo = async () => {
      if (travelMode === "transit") {
        setIsLoadingRoutes(false);
        setRouteStatusMessage("公共交通はGoogle Maps連携後に対応予定です。");
        return;
      }

      const routeTargets = fallbackResults
        .filter(
          (result) =>
            result.job.latitude &&
            result.job.longitude &&
            result.property.latitude &&
            result.property.longitude,
        )
        .slice(0, 10);

      const missingTargets = routeTargets.filter((result) => {
        const key = createPlannerRouteKey(result.job.id, result.property.id);
        return !routeInfoByKey[key];
      });

      if (!missingTargets.length) {
        setIsLoadingRoutes(false);
        setRouteStatusMessage(
          routeTargets.length
            ? "推定経路距離・推定移動時間を表示中です。"
            : "",
        );
        return;
      }

      setIsLoadingRoutes(true);
      setRouteStatusMessage("推定経路距離・推定移動時間を取得中です...");

      const entries = await Promise.all(
        missingTargets.map(async (result) => {
          const key = createPlannerRouteKey(result.job.id, result.property.id);
          const routeInfo = await getRouteInfo({
            origin: {
              latitude: result.job.latitude,
              longitude: result.job.longitude,
            },
            destination: {
              latitude: result.property.latitude,
              longitude: result.property.longitude,
            },
            mode: travelMode,
          });

          return [key, routeInfo] as const;
        }),
      );

      if (!isActive) return;

      setRouteInfoByKey((current) => {
        const next = { ...current };

        for (const [key, routeInfo] of entries) {
          next[key] = routeInfo;
        }

        return next;
      });
      setIsLoadingRoutes(false);
      setRouteStatusMessage(
        entries.some(([, routeInfo]) => routeInfo.isFallback)
          ? "一部の経路はAPI結果を取得できなかったため、直線距離をフォールバック表示しています。"
          : "推定経路距離・推定移動時間を表示中です。",
      );
    };

    loadRouteInfo();

    return () => {
      isActive = false;
    };
  }, [fallbackResults, routeInfoByKey, travelMode]);

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
      travelMode,
      routeInfoByKey,
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
    travelMode,
    routeInfoByKey,
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

  const handleTravelModeChange = (mode: RouteMode) => {
    setTravelMode(mode);
    setRouteInfoByKey({});
    setSelectedResultKey(null);
    setRouteStatusMessage("");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl min-w-0">
        <div className="mb-8">
          <h1 className="min-w-0 whitespace-normal break-words text-2xl font-bold md:text-4xl">
            ライフプランナー（最適化AI）
          </h1>
        </div>

        <PlannerInputPanel
          title="条件フィルター"
          summary={filterSummary}
          inputs={filterInputs}
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
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
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <div className="text-sm font-bold text-blue-700">
                月間生活費: ${monthlyLivingCost.toFixed(0)}
              </div>

              <div className={settingsStatusClassName}>
                {plannerSettingsStatusLabel}
              </div>
            </div>
          }
        />

        <section className="mb-6 rounded-2xl bg-white p-4 text-gray-900 shadow md:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-bold md:text-2xl">移動手段</h2>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                直線距離ではなく、推定経路距離と推定移動時間で比較します。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {travelModeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTravelModeChange(option.value)}
                className={
                  travelMode === option.value
                    ? "rounded-xl border-2 border-blue-600 bg-blue-50 p-4 text-left text-gray-900"
                    : "rounded-xl border border-gray-300 bg-white p-4 text-left text-gray-900"
                }
              >
                <span className="block text-lg font-bold">{option.label}</span>
                <span className="mt-1 block text-sm font-semibold text-gray-800">
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          {routeStatusMessage ? (
            <p
              className={
                travelMode === "transit"
                  ? "mt-4 rounded-xl bg-orange-50 p-3 text-sm font-bold text-orange-700"
                  : "mt-4 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-700"
              }
            >
              {isLoadingRoutes ? "取得中: " : ""}
              {routeStatusMessage}
            </p>
          ) : null}
        </section>

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

        <div className="mt-6 flex justify-center">
          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            ← マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
