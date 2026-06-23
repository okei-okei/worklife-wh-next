"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { trackMetric } from "@/lib/analytics";
import {
  calculateDistanceKm,
  estimateTravelTimeMinutes,
} from "@/lib/services/distanceService";

type PublicJob = {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  address: string | null;
  hourly_rate: number | null;
  work_hours: number | null;
  latitude: number | null;
  longitude: number | null;
};

type PublicProperty = {
  id: string;
  title: string;
  city: string | null;
  area: string | null;
  address: string | null;
  rent_weekly: number | null;
  latitude: number | null;
  longitude: number | null;
};

const payeRate = 0.15;
const weeksPerMonth = 4.33;

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatNumber(value: number | null) {
  if (value === null) return "不明";

  return value.toFixed(1);
}

export default function DemoPlannerPage() {
  const hasTrackedUse = useRef(false);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [foodCost, setFoodCost] = useState(500);
  const [phoneCost, setPhoneCost] = useState(40);
  const [transportCost, setTransportCost] = useState(150);
  const [otherCost, setOtherCost] = useState(300);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { trackMetric("planner_trial_view", { eventType: "page_view", pagePath: "/demo-planner" }); }, []);

  useEffect(() => {
    const loadPublicData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const [jobsResponse, propertiesResponse] = await Promise.all([
        supabase
          .from("public_jobs")
          .select(
            "id, title, company, city, address, hourly_rate, work_hours, latitude, longitude",
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("public_properties")
          .select(
            "id, title, city, area, address, rent_weekly, latitude, longitude",
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      if (jobsResponse.error || propertiesResponse.error) {
        setErrorMessage("公開求人・物件の読み込みに失敗しました。");
        setJobs([]);
        setProperties([]);
        setIsLoading(false);
        return;
      }

      const loadedJobs = (jobsResponse.data || []) as PublicJob[];
      const loadedProperties =
        (propertiesResponse.data || []) as PublicProperty[];

      setJobs(loadedJobs);
      setProperties(loadedProperties);
      setSelectedJobId((current) => current || loadedJobs[0]?.id || "");
      setSelectedPropertyId(
        (current) => current || loadedProperties[0]?.id || "",
      );
      setIsLoading(false);
    };

    loadPublicData();
  }, []);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  const selectedProperty = useMemo(() => {
    return (
      properties.find((property) => property.id === selectedPropertyId) || null
    );
  }, [properties, selectedPropertyId]);

  useEffect(() => {
    if (!selectedJob || !selectedProperty || hasTrackedUse.current) return;
    hasTrackedUse.current = true;
    trackMetric("planner_calculation", {
      eventType: "feature",
      pagePath: "/demo-planner",
      metadata: { demo: true },
    });
  }, [selectedJob, selectedProperty]);

  const monthlyGrossIncome =
    (selectedJob?.hourly_rate || 0) *
    (selectedJob?.work_hours || 0) *
    weeksPerMonth;
  const paye = monthlyGrossIncome * payeRate;
  const monthlyNetIncome = monthlyGrossIncome - paye;
  const monthlyRent = (selectedProperty?.rent_weekly || 0) * weeksPerMonth;
  const monthlyLivingCost = foodCost + phoneCost + transportCost + otherCost;
  const monthlyTotalExpense = monthlyRent + monthlyLivingCost;
  const monthlySavings = monthlyNetIncome - monthlyTotalExpense;

  const distanceKm =
    selectedJob && selectedProperty
      ? calculateDistanceKm(
          {
            latitude: selectedJob.latitude,
            longitude: selectedJob.longitude,
          },
          {
            latitude: selectedProperty.latitude,
            longitude: selectedProperty.longitude,
          },
        )
      : null;
  const travelTime = estimateTravelTimeMinutes(distanceKm);

  const costInputs = [
    {
      label: "食費",
      value: foodCost,
      onChange: setFoodCost,
    },
    {
      label: "通信費",
      value: phoneCost,
      onChange: setPhoneCost,
    },
    {
      label: "交通費",
      value: transportCost,
      onChange: setTransportCost,
    },
    {
      label: "雑費",
      value: otherCost,
      onChange: setOtherCost,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="text-2xl font-bold md:text-4xl">
            海外の暮らしを設計する
          </h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
            公開求人と公開物件を選んで、NZで月いくら残るかを簡単に試せます。保存・応募支援・履歴書PDF管理は会員登録後に使えます。
          </p>
        </section>

        {errorMessage ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {errorMessage}
          </section>
        ) : null}

        {isLoading ? (
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <p className="font-medium text-gray-800">読み込み中...</p>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-900">
                    公開求人
                  </span>
                  <select
                    value={selectedJobId}
                    onChange={(event) => setSelectedJobId(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {jobs.length ? (
                      jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))
                    ) : (
                      <option value="">公開求人は準備中です</option>
                    )}
                  </select>
                </label>

                <div className="mt-4 space-y-2 text-sm font-medium text-gray-800">
                  <p>会社: {selectedJob?.company || "未設定"}</p>
                  <p>都市: {selectedJob?.city || "未設定"}</p>
                  <p>
                    時給:{" "}
                    {selectedJob?.hourly_rate
                      ? `$${selectedJob.hourly_rate}`
                      : "未設定"}
                  </p>
                  <p>
                    週勤務時間:{" "}
                    {selectedJob?.work_hours
                      ? `${selectedJob.work_hours}時間`
                      : "未設定"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-900">
                    公開物件
                  </span>
                  <select
                    value={selectedPropertyId}
                    onChange={(event) =>
                      setSelectedPropertyId(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {properties.length ? (
                      properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title}
                        </option>
                      ))
                    ) : (
                      <option value="">公開物件は準備中です</option>
                    )}
                  </select>
                </label>

                <div className="mt-4 space-y-2 text-sm font-medium text-gray-800">
                  <p>
                    エリア:{" "}
                    {selectedProperty?.area ||
                      selectedProperty?.city ||
                      "未設定"}
                  </p>
                  <p>
                    週家賃:{" "}
                    {selectedProperty?.rent_weekly
                      ? `$${selectedProperty.rent_weekly}`
                      : "未設定"}
                  </p>
                  <p>住所: {selectedProperty?.address || "未設定"}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <h2 className="text-xl font-bold md:text-2xl">月間生活費</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {costInputs.map((input) => (
                  <label key={input.label} className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-900">
                      {input.label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={input.value}
                      onChange={(event) =>
                        input.onChange(Number(event.target.value))
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <p className="text-sm font-bold text-gray-700">月収</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(monthlyGrossIncome)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <p className="text-sm font-bold text-gray-700">
                  税引後月収（PAYE 15%）
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(monthlyNetIncome)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <p className="text-sm font-bold text-gray-700">月家賃</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(monthlyRent)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <p className="text-sm font-bold text-gray-700">月支出</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(monthlyTotalExpense)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <p className="text-sm font-bold text-gray-700">月貯金予測</p>
                <p
                  className={`mt-2 text-3xl font-bold ${
                    monthlySavings >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {formatCurrency(monthlySavings)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow md:p-6">
                <p className="text-sm font-bold text-gray-700">
                  通勤距離・時間
                </p>
                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNumber(distanceKm)} km
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  車目安:{" "}
                  {travelTime?.drive ? `${travelTime.drive}分` : "不明"}
                  {" / "}
                  徒歩目安:{" "}
                  {travelTime?.walk ? `${travelTime.walk}分` : "不明"}
                </p>
              </div>
            </section>

            <section className="rounded-2xl bg-blue-600 p-4 text-white shadow md:p-6">
              <h2 className="text-xl font-bold md:text-2xl">
                このプランを保存するには会員登録
              </h2>
              <p className="mt-2 font-medium leading-7">
                会員登録すると、この組み合わせを保存し、応募メール・カバーレター作成や履歴書PDF管理につなげられます。
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="w-full rounded-lg bg-white px-4 py-3 text-center font-bold text-blue-700 sm:w-auto"
                >
                  このプランを保存するには会員登録
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-lg border border-white px-4 py-3 text-center font-bold text-white sm:w-auto"
                >
                  ログインして保存
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
