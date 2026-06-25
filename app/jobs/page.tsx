"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ListMapToggle from "@/components/ListMapToggle";
import NzLocationPicker from "@/components/NzLocationPicker";
import { supabase } from "@/lib/supabase";
import { trackMetric } from "@/lib/analytics";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type PublicJob = {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  address: string | null;
  hourly_rate: number | null;
  work_hours: number | null;
  description: string | null;
  application_method?: string | null;
  visa_support: boolean | null;
  japanese_ok: boolean | null;
  accommodation_available: boolean | null;
  english_level?: string | null;
  visa_conditions?: string | null;
  apply_url: string | null;
  latitude: number | null;
  longitude: number | null;
  employment_type?: string | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  area?: string | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  weekly_hours?: number | null;
  start_date?: string | null;
  image_url?: string | null;
};

function isMissingColumnError(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("column") ||
      error?.message?.includes("schema cache"),
  );
}

function buildLoginRedirect(path: string) {
  return `/login?redirect=${encodeURIComponent(path)}`;
}

function calculateDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  useEffect(() => { trackMetric("public_job_view", { eventType: "page_view", pagePath: "/jobs" }); }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [filterCoordinates, setFilterCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [minHourlyRate, setMinHourlyRate] = useState("");
  const [minWorkHours, setMinWorkHours] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [japaneseSupport, setJapaneseSupport] = useState("");
  const [englishLevel, setEnglishLevel] = useState("");
  const [visaCondition, setVisaCondition] = useState("");
  const [accommodationOnly, setAccommodationOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [expandedJobIds, setExpandedJobIds] = useState<string[]>([]);
  const handledPendingActionRef = useRef(false);
  const pendingActionHandlersRef = useRef<{
    apply?: (job: PublicJob) => void;
    save?: (job: PublicJob) => void;
  }>({});

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);

      const extendedResult = await supabase
        .from("public_jobs")
        .select(
          "id, title, company, city, address, hourly_rate, work_hours, description, application_method, visa_support, japanese_ok, accommodation_available, english_level, visa_conditions, apply_url, latitude, longitude, employment_type, country_code, region, district, suburb, area, hourly_rate_min, hourly_rate_max, weekly_hours, start_date, image_url",
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      const { data, error } =
        extendedResult.error && isMissingColumnError(extendedResult.error)
          ? await supabase
              .from("public_jobs")
              .select(
                "id, title, company, city, address, hourly_rate, work_hours, description, visa_support, japanese_ok, accommodation_available, apply_url, latitude, longitude",
              )
              .eq("is_active", true)
              .order("created_at", {
                ascending: false,
              })
          : extendedResult;

      if (error) {
        console.error(error);
        setMessage("求人情報の読み込みに失敗しました。");
        setJobs([]);
      } else {
        setJobs((data || []) as PublicJob[]);
      }

      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  const ensureSavedJob = async (job: PublicJob, authRedirectPath: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(buildLoginRedirect(authRedirectPath));
      return;
    }

    const saveUrl = job.apply_url || "";
    const { data: existingJob, error: existingError } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", user.id)
      .eq("url", saveUrl)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      throw new Error(
        "保存状況の確認に失敗しました。時間をおいて再度お試しください。",
      );
    }

    if (existingJob) {
      return { id: existingJob.id as string, alreadySaved: true };
    }

    const extendedPayload = {
      user_id: user.id,
      title: job.title,
      company: job.company,
      url: saveUrl,
      apply_url: job.apply_url,
      hourly_rate: job.hourly_rate,
      work_hours: job.work_hours,
      status: "気になる",
      address: job.address || job.city || "",
      latitude: job.latitude,
      longitude: job.longitude,
      source_type: "public",
      public_job_id: job.id,
    };

    const { data: insertedJob, error } = await supabase
      .from("saved_jobs")
      .insert(extendedPayload)
      .select("id")
      .single();

    if (!error) {
      return { id: insertedJob.id as string, alreadySaved: false };
    }

    if (!isMissingColumnError(error)) {
      console.error(error);
      throw new Error("保存に失敗しました。時間をおいて再度お試しください。");
    }

    const { data: fallbackJob, error: fallbackError } = await supabase
      .from("saved_jobs")
      .insert({
        user_id: user.id,
        title: job.title,
        url: saveUrl,
        hourly_rate: job.hourly_rate,
        work_hours: job.work_hours,
        status: "気になる",
        address: job.address || job.city || "",
        latitude: job.latitude,
        longitude: job.longitude,
      })
      .select("id")
      .single();

    if (fallbackError) {
      console.error(fallbackError);
      throw new Error("保存に失敗しました。時間をおいて再度お試しください。");
    }

    return { id: fallbackJob.id as string, alreadySaved: false };
  };

  const handleSaveJob = async (job: PublicJob) => {
    setMessage("");
    setSavingJobId(job.id);

    try {
      const result = await ensureSavedJob(
        job,
        `/jobs?action=save&public_job_id=${job.id}`,
      );

      if (!result) return;

      setMessage(
        result.alreadySaved
          ? "すでに保存済みです。"
          : "マイページの保存リストに追加しました。",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "保存に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setSavingJobId(null);
    }
  };

  const handleApplyJob = async (job: PublicJob) => {
    setMessage("");
    setSavingJobId(job.id);

    try {
      const result = await ensureSavedJob(
        job,
        `/jobs?action=apply&public_job_id=${job.id}`,
      );

      if (!result) return;

      router.push(`/mypage/job-application?saved_job_id=${result.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "応募準備に失敗しました。時間をおいて再度お試しください。",
      );
      setSavingJobId(null);
    }
  };

  useEffect(() => {
    pendingActionHandlersRef.current = {
      apply: handleApplyJob,
      save: handleSaveJob,
    };
  });

  useEffect(() => {
    if (isLoading || handledPendingActionRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const publicJobId = params.get("public_job_id");

    if (!action || !publicJobId) return;

    const job = jobs.find((item) => item.id === publicJobId);

    if (!job) return;

    handledPendingActionRef.current = true;

    const timer = window.setTimeout(() => {
      if (action === "apply") {
        pendingActionHandlersRef.current.apply?.(job);
        return;
      }

      if (action === "save") {
        pendingActionHandlersRef.current.save?.(job);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isLoading, jobs]);

  const formatHourlyRate = (hourlyRate: number | null) => {
    if (hourlyRate === null) {
      return "時給未設定";
    }

    return `時給 $${hourlyRate.toLocaleString()}`;
  };

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedLocations = locationFilters.map((location) =>
      location.trim().toLowerCase(),
    );
    const minimumHourlyRate = minHourlyRate ? Number(minHourlyRate) : null;
    const minimumWorkHours = minWorkHours ? Number(minWorkHours) : null;

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.description,
        job.city,
        job.region,
        job.district,
        job.suburb,
        job.area,
        job.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (normalizedQuery && !searchableText.includes(normalizedQuery)) {
        return false;
      }

      if (
        normalizedLocations.length > 0 &&
        !normalizedLocations.includes("現在地")
      ) {
        const jobLocationText = [
          job.region,
          job.district,
          job.suburb,
          job.area,
          job.city,
          job.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesLocation = normalizedLocations.some((location) => {
          const parts = location
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean);

          return parts.some((part) => jobLocationText.includes(part));
        });

        if (!matchesLocation) {
          return false;
        }
      }

      if (
        normalizedLocations.includes("現在地") &&
        filterCoordinates.latitude &&
        filterCoordinates.longitude &&
        job.latitude &&
        job.longitude
      ) {
        const distanceKm = calculateDistanceKm(
          {
            latitude: filterCoordinates.latitude,
            longitude: filterCoordinates.longitude,
          },
          {
            latitude: job.latitude,
            longitude: job.longitude,
          },
        );

        if (distanceKm > 50) return false;
      }

      if (
        minimumHourlyRate !== null &&
        ((job.hourly_rate_min ?? job.hourly_rate) === null ||
          (job.hourly_rate_min ?? job.hourly_rate)! < minimumHourlyRate)
      ) {
        return false;
      }

      if (
        minimumWorkHours !== null &&
        ((job.weekly_hours ?? job.work_hours) === null ||
          (job.weekly_hours ?? job.work_hours)! < minimumWorkHours)
      ) {
        return false;
      }

      if (accommodationOnly && !job.accommodation_available) {
        return false;
      }

      if (employmentType && job.employment_type !== employmentType) {
        return false;
      }

      if (japaneseSupport === "yes" && !job.japanese_ok) {
        return false;
      }

      if (japaneseSupport === "no" && job.japanese_ok) {
        return false;
      }

      if (englishLevel && job.english_level !== englishLevel) {
        return false;
      }

      if (visaCondition) {
        const visaText = [job.visa_conditions, job.visa_support ? "ワーホリビザ可" : ""]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!visaText.includes(visaCondition.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [
    accommodationOnly,
    employmentType,
    englishLevel,
    filterCoordinates,
    jobs,
    japaneseSupport,
    locationFilters,
    minHourlyRate,
    minWorkHours,
    searchQuery,
    visaCondition,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setLocationFilters([]);
    setFilterCoordinates({ latitude: null, longitude: null });
    setMinHourlyRate("");
    setMinWorkHours("");
    setEmploymentType("");
    setJapaneseSupport("");
    setEnglishLevel("");
    setVisaCondition("");
    setAccommodationOnly(false);
  };

  const mapJobs = useMemo(
    () =>
      filteredJobs
        .filter(
          (job) =>
            typeof job.latitude === "number" &&
            typeof job.longitude === "number",
        )
        .map((job) => ({
          id: job.id,
          lat: job.latitude as number,
          lng: job.longitude as number,
          label: job.title,
          subtitle: `${job.company || "掲載企業未設定"} / ${
            job.area || job.suburb || job.district || job.city || "地域未設定"
          }`,
          details: [
            job.employment_type || "採用形態未設定",
            formatHourlyRate(job.hourly_rate_min ?? job.hourly_rate),
          ],
          href: job.apply_url || `/jobs#job-${job.id}`,
        })),
    [filteredJobs],
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 公開求人
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">
              ワーホリ向け求人
            </h1>
            <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
              ニュージーランドでの仕事探しに使える公開求人を確認できます。気になる求人は保存して、応募文の作成に進めます。
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href="/mypage"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50 sm:w-auto"
            >
              マイページ
            </Link>
            <Link
              href="/company/submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
            >
              掲載申請
            </Link>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 font-bold text-blue-800">
            {message}
          </div>
        )}

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">求人を探す</h2>
              <p className="mt-1 text-sm font-medium text-gray-600">
                地域、時給、勤務時間、採用形態で絞り込めます。
              </p>
            </div>
            <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              {filteredJobs.length}件
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-gray-900">検索</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900 placeholder:text-gray-600"
                placeholder="求人名、会社名、仕事内容、地域、住所で検索"
              />
            </label>

          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <NzLocationPicker
              label="地域"
              multiple
              values={locationFilters}
              onValuesChange={setLocationFilters}
              onCoordinatesChange={setFilterCoordinates}
            />
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">
                時給の下限
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minHourlyRate}
                onChange={(event) => setMinHourlyRate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
                placeholder="例: 25"
              />
            </label>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">
                週勤務時間の下限
              </span>
              <input
                type="number"
                min="0"
                value={minWorkHours}
                onChange={(event) => setMinWorkHours(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
                placeholder="例: 30"
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">採用形態</span>
              <select
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
              >
                <option value="">全て</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Casual">Casual</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Fixed-term">Fixed-term</option>
                <option value="Internship">Internship</option>
              </select>
            </label>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">日本語対応</span>
              <select
                value={japaneseSupport}
                onChange={(event) => setJapaneseSupport(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
              >
                <option value="">全て</option>
                <option value="yes">日本語対応あり</option>
                <option value="no">日本語対応なし</option>
              </select>
            </label>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">英語レベル</span>
              <select
                value={englishLevel}
                onChange={(event) => setEnglishLevel(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
              >
                <option value="">全て</option>
                <option value="初級">初級</option>
                <option value="中級">中級</option>
                <option value="上級">上級</option>
              </select>
            </label>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">ビザ条件</span>
              <select
                value={visaCondition}
                onChange={(event) => setVisaCondition(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
              >
                <option value="">全て</option>
                <option value="ワーホリビザ可">ワーホリビザ可</option>
                <option value="学生ビザ可">学生ビザ可</option>
                <option value="就労可能なビザ必須">就労可能なビザ必須</option>
              </select>
            </label>
            <label className="flex min-h-[74px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 font-bold text-gray-900">
              <input
                type="checkbox"
                checked={accommodationOnly}
                onChange={(event) => setAccommodationOnly(event.target.checked)}
                className="h-5 w-5"
              />
              住み込み可のみ
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
            >
              条件をリセット
            </button>
          </div>
        </section>

        <div className="flex justify-end">
          <ListMapToggle value={viewMode} onChange={setViewMode} />
        </div>

        {isLoading ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="font-medium text-gray-800">
              求人情報を読み込み中です...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">公開求人は準備中です</h2>
            <p className="mt-2 leading-7 text-gray-800">
              掲載申請が承認されると、このページに求人が表示されます。
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">
              条件に合う求人が見つかりません
            </h2>
            <p className="mt-2 leading-7 text-gray-800">
              検索キーワードやフィルター条件を変更して再度お試しください。
            </p>
          </div>
        ) : viewMode === "map" ? (
          <section className="rounded-2xl bg-white p-3 shadow md:p-4">
            {mapJobs.length ? (
              <MapView jobs={mapJobs} properties={[]} />
            ) : (
              <p className="p-4 font-medium text-gray-700">
                地図に表示できる座標付き求人がありません。リスト表示ではすべての求人を確認できます。
              </p>
            )}
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <article
                id={`job-${job.id}`}
                key={job.id}
                className="flex min-h-full flex-col overflow-hidden rounded-2xl bg-white shadow"
              >
                {job.image_url ? (
                  // Supabase Storage URLs are configured at runtime.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.image_url}
                    alt=""
                    className="h-28 w-full object-cover sm:h-32 md:h-36"
                  />
                ) : null}
                <div className="flex flex-1 flex-col p-4 md:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold text-gray-900 md:text-2xl">
                      {job.title}
                    </h2>
                    <p className="mt-1 font-medium text-gray-800">
                      {job.company || "掲載企業未設定"}
                      {job.area || job.suburb || job.district || job.city
                        ? ` / ${job.area || job.suburb || job.district || job.city}`
                        : ""}
                    </p>
                  </div>

                  <div className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                    {job.hourly_rate_max
                      ? `$${job.hourly_rate_min ?? job.hourly_rate ?? 0} - $${job.hourly_rate_max}/時`
                      : formatHourlyRate(job.hourly_rate_min ?? job.hourly_rate)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.visa_support && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      ワーホリ歓迎
                    </span>
                  )}
                  {job.japanese_ok && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                      日本語OK
                    </span>
                  )}
                  {job.english_level ? (
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">
                      英語{job.english_level}
                    </span>
                  ) : null}
                  {job.visa_conditions ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      {job.visa_conditions}
                    </span>
                  ) : null}
                  {job.accommodation_available && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                      住み込み可能
                    </span>
                  )}
                  {(job.weekly_hours ?? job.work_hours) != null && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                      週{job.weekly_hours ?? job.work_hours}時間
                    </span>
                  )}
                  {job.employment_type ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                      {job.employment_type}
                    </span>
                  ) : null}
                </div>

                {expandedJobIds.includes(job.id) ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-800">
                    <div>
                      <p className="font-bold text-gray-900">職務内容</p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {job.description || "職務内容は未設定です。"}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">応募方法</p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {job.application_method ||
                          (job.apply_url
                            ? "外部ページから応募内容を確認してください。"
                            : "応募方法は未設定です。")}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedJobIds((current) =>
                        current.includes(job.id)
                          ? current.filter((id) => id !== job.id)
                          : [...current, job.id],
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
                  >
                    {expandedJobIds.includes(job.id)
                      ? "詳細を閉じる"
                      : "詳細を見る"}
                  </button>
                  <button
                    onClick={() => handleSaveJob(job)}
                    disabled={savingJobId === job.id}
                    className="w-full rounded-lg border border-blue-600 bg-white px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 sm:w-auto"
                  >
                    {savingJobId === job.id ? "保存中..." : "保存する"}
                  </button>

                  <button
                    onClick={() => handleApplyJob(job)}
                    disabled={savingJobId === job.id}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 sm:w-auto"
                  >
                    {savingJobId === job.id ? "準備中..." : "応募する"}
                  </button>

                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
                    >
                      外部ページを見る
                    </a>
                  )}
                </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
