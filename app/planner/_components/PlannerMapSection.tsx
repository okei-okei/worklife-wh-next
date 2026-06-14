 "use client";

import dynamic from "next/dynamic";
import type { MapLine, ScoreResult } from "../_lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl bg-white shadow">
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">地図ビュー（仕事 × 住居）</h2>

          <p className="text-sm text-gray-600">
            {isRefreshing
              ? "最新データを取得中..."
              : `自動更新: ON / 最終更新 ${lastUpdatedLabel}`}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing || !canRefresh}
        >
          {isRefreshing ? "更新中..." : "最新情報に更新"}
        </button>
      </div>

      {selectedResult ? (
        <div className="mb-4 rounded-2xl border-2 border-orange-300 bg-orange-50 p-4 shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-orange-700">
                選択中の最適経路
              </p>

              <h3 className="text-lg font-bold">
                {selectedResult.job.title} × {selectedResult.property.title}
              </h3>
            </div>

            <div className="text-sm font-bold text-gray-700">
              {selectedResult.distance
                ? `${selectedResult.distance.toFixed(2)} km`
                : "距離不明"}{" "}
              /{" "}
              {selectedResult.travelMin
                ? `${selectedResult.travelMin} 分`
                : "時間不明"}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl bg-white p-4 shadow">
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
