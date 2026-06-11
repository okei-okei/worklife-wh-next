"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-white rounded-2xl shadow">
      地図を読み込み中...
    </div>
  ),
});

import {
  calculateDistanceKm,
  estimateTravelTimeMinutes,
} from "@/lib/services/distanceService";

type Job = {
  id: string;
  title: string;
  hourly_rate: number | null;
  work_hours: number | null;
  latitude: number | null;
  longitude: number | null;
};

type Property = {
  id: string;
  title: string;
  rent_weekly: number | null;
  latitude: number | null;
  longitude: number | null;
};

type ScoreResult = {
  job: Job;
  property: Property;
  distance: number | null;
  travelMin: number | null;
  monthlyIncome: number;
  monthlyRent: number;
  score: number;
};

export default function PlannerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [results, setResults] = useState<ScoreResult[]>([]);

  const loadData = async () => {
    const { data: jobsData } = await supabase.from("saved_jobs").select("*");

    const { data: propData } = await supabase
      .from("saved_properties")
      .select("*");

    if (jobsData) setJobs(jobsData);
    if (propData) setProperties(propData);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!jobs.length || !properties.length) return;

    const scored: ScoreResult[] = [];

    for (const job of jobs) {
      for (const property of properties) {
        const distance = calculateDistanceKm(
          {
            latitude: job.latitude,
            longitude: job.longitude,
          },
          {
            latitude: property.latitude,
            longitude: property.longitude,
          },
        );

        const travel = estimateTravelTimeMinutes(distance);

        const monthlyIncome =
          (job.hourly_rate || 0) * (job.work_hours || 0) * 4.33;

        const monthlyRent = (property.rent_weekly || 0) * 4.33;

        const baseSavings = monthlyIncome - monthlyRent;

        const commutePenalty = (travel?.drive || 0) * 2;

        const score = baseSavings - commutePenalty;

        scored.push({
          job,
          property,
          distance,
          travelMin: travel?.drive || null,
          monthlyIncome,
          monthlyRent,
          score,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    setResults(scored.slice(0, 10));
  }, [jobs, properties]);

  // =========================
  // 地図用データ
  // =========================

  const jobPoints = useMemo(
    () =>
      jobs
        .filter((j) => j.latitude && j.longitude)
        .map((j) => ({
          id: j.id,
          lat: j.latitude!,
          lng: j.longitude!,
          label: j.title,
        })),
    [jobs],
  );

  const propertyPoints = useMemo(
    () =>
      properties
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({
          id: p.id,
          lat: p.latitude!,
          lng: p.longitude!,
          label: p.title,
        })),
    [properties],
  );

  const lines = useMemo(() => {
    const arr: any[] = [];

    for (const job of jobs) {
      for (const property of properties) {
        if (
          job.latitude &&
          job.longitude &&
          property.latitude &&
          property.longitude
        ) {
          arr.push({
            from: {
              lat: job.latitude,
              lng: job.longitude,
            },
            to: {
              lat: property.latitude,
              lng: property.longitude,
            },
          });
        }
      }
    }

    return arr;
  }, [jobs, properties]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">ライフプランナー（最適化AI）</h1>

          <Link
            href="/mypage"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            ← マイページ
          </Link>
        </div>

        {/* 地図セクション */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">地図ビュー（仕事 × 住居）</h2>

          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            最新情報に更新
          </button>
        </div>

        {/* ⭐ここが重要（抜けていた部分） */}
        <div className="bg-white p-4 rounded-2xl shadow mb-6">
          <MapView jobs={jobPoints} properties={propertyPoints} lines={lines} />
        </div>

        {/* ランキング */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">最適プラン TOP10</h2>

          {results.map((r, i) => (
            <div
              key={`${r.job.id}-${r.property.id}`}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    #{i + 1} {r.job.title} × {r.property.title}
                  </h3>

                  <p>月収: ${r.monthlyIncome.toFixed(0)}</p>
                  <p>家賃: ${r.monthlyRent.toFixed(0)}</p>

                  <p>
                    通勤距離:{" "}
                    {r.distance ? `${r.distance.toFixed(2)} km` : "不明"}
                  </p>

                  <p>通勤時間: {r.travelMin ? `${r.travelMin} 分` : "不明"}</p>

                  <p className="font-bold text-green-600">
                    スコア: {r.score.toFixed(0)}
                  </p>
                </div>

                <div className="text-right text-sm text-gray-500">最適候補</div>
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="bg-white p-6 rounded-2xl text-center text-gray-500">
              データを追加すると最適プランが表示されます
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
