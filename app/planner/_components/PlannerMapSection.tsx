"use client";

import dynamic from "next/dynamic";
import type { MapLine, ScoreResult } from "../_lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center rounded-2xl bg-white p-4 text-center font-bold text-gray-800 shadow md:h-[500px]">
      地図を読み込み中...
    </div>
  ),
});

type Point = {
  id: string;
  lat: number;
  lng: number;
  label: string;
};

type PlannerMapSectionProps = {
  jobs: Point[];
  properties: Point[];
  lines: MapLine[];
  selectedResult?: ScoreResult;
  highlightedLine: MapLine | null;
  isRefreshing: boolean;
  lastUpdatedLabel: string;
  canRefresh: boolean;
  onRefresh: () => void;
};

export function PlannerMapSection({
  jobs,
  properties,
  lines,
  selectedResult,
  highlightedLine,
  isRefreshing,
  lastUpdatedLabel,
  canRefresh,
  onRefresh,
}: PlannerMapSectionProps) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
            地図ビュー（仕事 × 住居）
          </h2>

          <p className="text-sm font-semibold text-gray-800">
            {isRefreshing
              ? "最新データを取得中..."
              : `自動更新: ON / 最終更新 ${lastUpdatedLabel}`}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
          disabled={isRefreshing || !canRefresh}
        >
          {isRefreshing ? "更新中..." : "最新情報に更新"}
        </button>
      </div>

      {selectedResult ? (
        <div className="mb-4 min-w-0 rounded-2xl border-2 border-orange-300 bg-orange-50 p-4 shadow md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-orange-700">
                選択中の最適経路
              </p>

              <h3 className="break-words text-lg font-bold text-gray-900">
                {selectedResult.job.title} × {selectedResult.property.title}
              </h3>
            </div>

            <div className="text-sm font-bold text-gray-900 sm:text-right">
              推定経路距離:{" "}
              {selectedResult.distance
                ? `${selectedResult.distance.toFixed(2)} km`
                : "距離不明"}{" "}
              /{" "}
              推定移動時間:{" "}
              {selectedResult.travelMin
                ? `${selectedResult.travelMin} 分`
                : "時間不明"}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl bg-white p-3 shadow md:p-4">
        <MapView
          jobs={jobs}
          properties={properties}
          lines={lines}
          highlightedJobId={selectedResult?.job.id}
          highlightedPropertyId={selectedResult?.property.id}
          highlightedLine={highlightedLine}
        />
      </div>
    </>
  );
}
