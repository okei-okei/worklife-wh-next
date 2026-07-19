"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { geocodeAddress } from "@/lib/geocoder";
import { supabase } from "@/lib/supabase";
import { getRouteInfo, type RouteInfo } from "@/lib/services/routeService";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center text-sm font-bold text-gray-700 md:h-[360px]">
      地図を読み込み中...
    </div>
  ),
});

const pageSize = 10;
const weeksPerMonth = 4.33;
const taxRate = 0.15;
const standardLivingCosts = {
  food: 500,
  transport: 150,
  phone: 40,
  other: 300,
};
const monthlyStandardLivingCost = Object.values(standardLivingCosts).reduce(
  (sum, value) => sum + value,
  0,
);

type PublicJobOption = {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  area?: string | null;
  address: string | null;
  hourly_rate: number | null;
  hourly_rate_min?: number | null;
  work_hours: number | null;
  weekly_hours?: number | null;
  employment_type?: string | null;
  latitude: number | null;
  longitude: number | null;
};

type PublicPropertyOption = {
  id: string;
  title: string;
  city: string | null;
  area: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  address: string | null;
  rent_weekly: number | null;
  utilities_included?: boolean | null;
  bills_included?: boolean | null;
  latitude: number | null;
  longitude: number | null;
};

type RecordWithLocation = {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ResolvedCoordinates = {
  latitude: number;
  longitude: number;
  source: "saved" | "address";
  address?: string;
};

const regionOptions = [
  "Auckland",
  "Wellington",
  "Canterbury",
  "Otago",
  "Waikato",
  "Bay of Plenty",
  "Northland",
  "Hawke's Bay",
  "Manawatu-Wanganui",
  "Nelson",
  "Tasman",
  "Marlborough",
  "Southland",
  "Taranaki",
  "Gisborne",
  "West Coast",
];

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function money(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLocation(...parts: Array<string | null | undefined>) {
  const value = parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(" / ");

  return value || "地域未設定";
}

function formatAddress(address: string | null) {
  if (!address) return "住所未設定";
  const trimmed = address.trim();
  if (trimmed.length <= 56) return trimmed;
  return `${trimmed.slice(0, 56)}...`;
}

function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

function isValidCoordinatePair(latitude: unknown, longitude: unknown) {
  return Boolean(
    typeof latitude === "number" &&
      typeof longitude === "number" &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude !== 0 &&
      longitude !== 0,
  );
}

function buildNzGeocodeQuery(address: string) {
  const normalized = address.trim();

  if (/new zealand|ニュージーランド/i.test(normalized)) {
    return normalized;
  }

  return `${normalized}, New Zealand`;
}

async function resolveTemporaryCoordinates(
  record: RecordWithLocation,
  cache: Map<string, ResolvedCoordinates | null>,
): Promise<ResolvedCoordinates | null> {
  if (isValidCoordinatePair(record.latitude, record.longitude)) {
    return {
      latitude: record.latitude!,
      longitude: record.longitude!,
      source: "saved",
    };
  }

  const address = record.address?.trim();
  if (!address) return null;

  const query = buildNzGeocodeQuery(address);
  if (cache.has(query)) return cache.get(query) ?? null;

  const result = await geocodeAddress(query);
  if (!isValidCoordinatePair(result.latitude, result.longitude)) {
    cache.set(query, null);
    return null;
  }

  const coordinates = {
    latitude: result.latitude!,
    longitude: result.longitude!,
    source: "address" as const,
    address: query,
  };

  cache.set(query, coordinates);
  return coordinates;
}

function resolveWeeklyWorkHours(
  workHours: number | null | undefined,
  weeklyHours?: number | null,
) {
  const primary = toNumber(workHours);
  if (primary !== null && primary > 0) {
    return {
      hours: primary,
      usedDefault: false,
    };
  }

  const fallback = toNumber(weeklyHours);
  if (fallback !== null && fallback > 0) {
    return {
      hours: fallback,
      usedDefault: false,
    };
  }

  return {
    hours: 20,
    usedDefault: true,
  };
}

export default function PublicLifeSimulator() {
  const [jobSearch, setJobSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [jobRegion, setJobRegion] = useState("");
  const [propertyRegion, setPropertyRegion] = useState("");
  const debouncedJobSearch = useDebouncedValue(jobSearch);
  const debouncedPropertySearch = useDebouncedValue(propertySearch);
  const debouncedJobRegion = useDebouncedValue(jobRegion, 150);
  const debouncedPropertyRegion = useDebouncedValue(propertyRegion, 150);
  const [jobPage, setJobPage] = useState(1);
  const [propertyPage, setPropertyPage] = useState(1);
  const [jobs, setJobs] = useState<PublicJobOption[]>([]);
  const [properties, setProperties] = useState<PublicPropertyOption[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [jobError, setJobError] = useState("");
  const [propertyError, setPropertyError] = useState("");
  const [selectedJob, setSelectedJob] = useState<PublicJobOption | null>(null);
  const [selectedProperty, setSelectedProperty] =
    useState<PublicPropertyOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [jobCoordinates, setJobCoordinates] =
    useState<ResolvedCoordinates | null>(null);
  const [propertyCoordinates, setPropertyCoordinates] =
    useState<ResolvedCoordinates | null>(null);
  const [isResolvingCoordinates, setIsResolvingCoordinates] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const coordinateCacheRef = useRef(new Map<string, ResolvedCoordinates | null>());

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      setJobError("");

      let query = supabase
        .from("public_jobs")
        .select(
          "id,title,company,city,region,district,suburb,area,address,hourly_rate,hourly_rate_min,work_hours,weekly_hours,employment_type,latitude,longitude",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(0, jobPage * pageSize - 1);

      const keyword = debouncedJobSearch.trim().replaceAll(",", " ");
      if (keyword) {
        query = query.or(
          `title.ilike.%${keyword}%,company.ilike.%${keyword}%,city.ilike.%${keyword}%,region.ilike.%${keyword}%,district.ilike.%${keyword}%,suburb.ilike.%${keyword}%,area.ilike.%${keyword}%,address.ilike.%${keyword}%`,
        );
      }

      const region = debouncedJobRegion.trim();
      if (region) {
        query = query.or(
          `city.ilike.%${region}%,region.ilike.%${region}%,district.ilike.%${region}%,suburb.ilike.%${region}%,area.ilike.%${region}%,address.ilike.%${region}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setJobs([]);
        setJobError("公開求人を取得できませんでした。");
      } else {
        setJobs((data || []) as PublicJobOption[]);
      }

      setIsLoadingJobs(false);
    };

    fetchJobs();
  }, [debouncedJobRegion, debouncedJobSearch, jobPage]);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoadingProperties(true);
      setPropertyError("");

      let query = supabase
        .from("public_properties")
        .select(
          "id,title,city,area,region,district,suburb,address,rent_weekly,utilities_included,bills_included,latitude,longitude",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(0, propertyPage * pageSize - 1);

      const keyword = debouncedPropertySearch.trim().replaceAll(",", " ");
      if (keyword) {
        query = query.or(
          `title.ilike.%${keyword}%,city.ilike.%${keyword}%,area.ilike.%${keyword}%,region.ilike.%${keyword}%,district.ilike.%${keyword}%,suburb.ilike.%${keyword}%,address.ilike.%${keyword}%`,
        );
      }

      const region = debouncedPropertyRegion.trim();
      if (region) {
        query = query.or(
          `city.ilike.%${region}%,area.ilike.%${region}%,region.ilike.%${region}%,district.ilike.%${region}%,suburb.ilike.%${region}%,address.ilike.%${region}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setProperties([]);
        setPropertyError("公開物件を取得できませんでした。");
      } else {
        setProperties((data || []) as PublicPropertyOption[]);
      }

      setIsLoadingProperties(false);
    };

    fetchProperties();
  }, [debouncedPropertyRegion, debouncedPropertySearch, propertyPage]);

  useEffect(() => {
    let isActive = true;

    const fetchRoute = async () => {
      setRouteInfo(null);
      setIsLoadingRoute(false);
      if (!showResult || !selectedJob || !selectedProperty) return;
      if (!jobCoordinates || !propertyCoordinates) {
        return;
      }

      setIsLoadingRoute(true);
      const result = await getRouteInfo({
        origin: {
          latitude: propertyCoordinates.latitude,
          longitude: propertyCoordinates.longitude,
        },
        destination: {
          latitude: jobCoordinates.latitude,
          longitude: jobCoordinates.longitude,
        },
        mode: "driving",
      });

      if (!isActive) return;
      setRouteInfo(result);
      setIsLoadingRoute(false);
    };

    fetchRoute();

    return () => {
      isActive = false;
    };
  }, [jobCoordinates, propertyCoordinates, selectedJob, selectedProperty, showResult]);

  const calculation = useMemo(() => {
    const hourlyRate =
      toNumber(selectedJob?.hourly_rate) ?? toNumber(selectedJob?.hourly_rate_min);
    const resolvedWorkHours = selectedJob
      ? resolveWeeklyWorkHours(selectedJob.work_hours, selectedJob.weekly_hours)
      : { hours: null, usedDefault: false };
    const rentWeekly = toNumber(selectedProperty?.rent_weekly);
    const missing: string[] = [];

    if (!selectedJob) missing.push("求人");
    if (!selectedProperty) missing.push("物件");
    if (selectedJob && hourlyRate === null) missing.push("時給");
    if (selectedProperty && rentWeekly === null) missing.push("週家賃");

    if (missing.length || hourlyRate === null || rentWeekly === null) {
      return {
        canCalculate: false,
        missing,
        resolvedWorkHours,
        monthlyGrossIncome: null,
        monthlyNetIncome: null,
        monthlyRent: null,
        monthlyLivingCost: monthlyStandardLivingCost,
        monthlyBalance: null,
      };
    }

    const monthlyGrossIncome = hourlyRate * resolvedWorkHours.hours! * weeksPerMonth;
    const monthlyNetIncome = monthlyGrossIncome * (1 - taxRate);
    const monthlyRent = rentWeekly * weeksPerMonth;
    const monthlyBalance =
      monthlyNetIncome - monthlyRent - monthlyStandardLivingCost;

    return {
      canCalculate: true,
      missing,
      resolvedWorkHours,
      monthlyGrossIncome,
      monthlyNetIncome,
      monthlyRent,
      monthlyLivingCost: monthlyStandardLivingCost,
      monthlyBalance,
    };
  }, [selectedJob, selectedProperty]);

  const mapData = useMemo(() => {
    if (!selectedJob || !selectedProperty) return null;
    if (!jobCoordinates && !propertyCoordinates) {
      return null;
    }

    const jobPoint = jobCoordinates
      ? {
          id: selectedJob.id,
          lat: jobCoordinates.latitude,
          lng: jobCoordinates.longitude,
          label: "求人",
          subtitle: selectedJob.title,
          details: [
            selectedJob.company || "会社名未設定",
            formatLocation(
              selectedJob.region,
              selectedJob.district,
              selectedJob.suburb,
              selectedJob.area,
              selectedJob.city,
            ),
            jobCoordinates.source === "address"
              ? "住所から一時的に位置を確認"
              : "登録済みの位置情報",
          ],
        }
      : null;
    const propertyPoint = propertyCoordinates
      ? {
          id: selectedProperty.id,
          lat: propertyCoordinates.latitude,
          lng: propertyCoordinates.longitude,
          label: "物件",
          subtitle: selectedProperty.title,
          details: [
            formatLocation(
              selectedProperty.region,
              selectedProperty.district,
              selectedProperty.suburb,
              selectedProperty.area,
              selectedProperty.city,
            ),
            selectedProperty.rent_weekly
              ? `週家賃 ${money(selectedProperty.rent_weekly)}`
              : "週家賃未入力",
            propertyCoordinates.source === "address"
              ? "住所から一時的に位置を確認"
              : "登録済みの位置情報",
          ],
        }
      : null;
    const fallbackLine =
      jobCoordinates && propertyCoordinates
        ? {
            from: {
              lat: propertyCoordinates.latitude,
              lng: propertyCoordinates.longitude,
            },
            to: { lat: jobCoordinates.latitude, lng: jobCoordinates.longitude },
          }
        : null;

    return {
      jobs: jobPoint ? [jobPoint] : [],
      properties: propertyPoint ? [propertyPoint] : [],
      highlightedLine: fallbackLine
        ? routeInfo?.coordinates?.length
          ? {
              ...fallbackLine,
              coordinates: routeInfo.coordinates.map((coordinate) => ({
                lat: coordinate.latitude,
                lng: coordinate.longitude,
              })),
            }
          : fallbackLine
        : null,
    };
  }, [jobCoordinates, propertyCoordinates, routeInfo, selectedJob, selectedProperty]);

  const resetResult = () => {
    setShowResult(false);
    setJobCoordinates(null);
    setPropertyCoordinates(null);
    setIsResolvingCoordinates(false);
    setRouteInfo(null);
  };

  const handleJobSearchChange = (value: string) => {
    setJobSearch(value);
    setJobPage(1);
  };

  const handlePropertySearchChange = (value: string) => {
    setPropertySearch(value);
    setPropertyPage(1);
  };

  const handleJobRegionChange = (value: string) => {
    setJobRegion(value);
    setJobPage(1);
  };

  const handlePropertyRegionChange = (value: string) => {
    setPropertyRegion(value);
    setPropertyPage(1);
  };

  const handleSelectJob = (job: PublicJobOption) => {
    setSelectedJob(job);
    resetResult();
  };

  const handleSelectProperty = (property: PublicPropertyOption) => {
    setSelectedProperty(property);
    resetResult();
  };

  const handleShowResult = async () => {
    if (!selectedJob || !selectedProperty || isResolvingCoordinates) return;

    setShowResult(true);
    setRouteInfo(null);
    setIsResolvingCoordinates(true);
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    const [resolvedJob, resolvedProperty] = await Promise.all([
      resolveTemporaryCoordinates(selectedJob, coordinateCacheRef.current),
      resolveTemporaryCoordinates(selectedProperty, coordinateCacheRef.current),
    ]);

    setJobCoordinates(resolvedJob);
    setPropertyCoordinates(resolvedProperty);
    setIsResolvingCoordinates(false);
  };

  const canShowResult = Boolean(selectedJob && selectedProperty);

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          Trial simulation
        </p>
        <h2 className="mt-2 text-xl font-black text-gray-950 md:text-2xl">
          公開求人と物件で、月に残るお金を確認する
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700 md:max-w-3xl">
          求人と物件を一つずつ選ぶだけで、月に残るお金と仕事・住まいの位置関係を確認できます。
          会員登録前の結果は保存されません。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StepBlock
          step="1"
          title="求人を一つ選ぶ"
          description="時給と週勤務時間がある求人を選ぶと計算できます。"
        >
          <div className="grid gap-2 md:grid-cols-[1fr_190px]">
            <SearchInput
              value={jobSearch}
              onChange={handleJobSearchChange}
              placeholder="求人名・会社名・地域で検索"
            />
            <RegionSelect value={jobRegion} onChange={handleJobRegionChange} />
          </div>
          <SelectedMiniCard
            label="選択中の求人"
            title={selectedJob?.title || "未選択"}
            description={
              selectedJob
                ? `${selectedJob.company || "会社名未設定"} / ${formatLocation(
                    selectedJob.region,
                    selectedJob.district,
                    selectedJob.suburb,
                    selectedJob.area,
                    selectedJob.city,
                  )}`
                : "求人を一つ選んでください。"
            }
          />
          {jobError ? <ErrorMessage>{jobError}</ErrorMessage> : null}
          <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {jobs.map((job) => (
              <JobOptionCard
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onSelect={() => handleSelectJob(job)}
              />
            ))}
          </div>
          {isLoadingJobs ? <LoadingText /> : null}
          {!isLoadingJobs && !jobs.length ? (
            <EmptyText>条件に合う公開求人が見つかりません。</EmptyText>
          ) : null}
          {jobs.length >= jobPage * pageSize ? (
            <LoadMoreButton onClick={() => setJobPage((page) => page + 1)} />
          ) : null}
        </StepBlock>

        <StepBlock
          step="2"
          title="物件を一つ選ぶ"
          description="週家賃がある物件を選ぶと計算できます。"
        >
          <div className="grid gap-2 md:grid-cols-[1fr_190px]">
            <SearchInput
              value={propertySearch}
              onChange={handlePropertySearchChange}
              placeholder="物件名・地域・住所で検索"
            />
            <RegionSelect
              value={propertyRegion}
              onChange={handlePropertyRegionChange}
            />
          </div>
          <SelectedMiniCard
            label="選択中の物件"
            title={selectedProperty?.title || "未選択"}
            description={
              selectedProperty
                ? formatLocation(
                    selectedProperty.region,
                    selectedProperty.district,
                    selectedProperty.suburb,
                    selectedProperty.area,
                    selectedProperty.city,
                  )
                : "物件を一つ選んでください。"
            }
          />
          {propertyError ? <ErrorMessage>{propertyError}</ErrorMessage> : null}
          <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {properties.map((property) => (
              <PropertyOptionCard
                key={property.id}
                property={property}
                selected={selectedProperty?.id === property.id}
                onSelect={() => handleSelectProperty(property)}
              />
            ))}
          </div>
          {isLoadingProperties ? <LoadingText /> : null}
          {!isLoadingProperties && !properties.length ? (
            <EmptyText>条件に合う公開物件が見つかりません。</EmptyText>
          ) : null}
          {properties.length >= propertyPage * pageSize ? (
            <LoadMoreButton
              onClick={() => setPropertyPage((page) => page + 1)}
            />
          ) : null}
        </StepBlock>
      </div>

      <StepBlock
        step="3"
        title="結果を見る"
        description="生活費はサイトの標準設定を使用しています。"
      >
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-700">
          標準生活費: {money(monthlyStandardLivingCost)} / 月
          <span className="mt-1 block text-xs font-medium text-gray-600">
            食費、交通費、通信費、日用品などの既定値を合計しています。
          </span>
        </div>
        <button
          type="button"
          disabled={!canShowResult || isResolvingCoordinates}
          onClick={handleShowResult}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#244C43] px-4 py-2 text-sm font-black text-white transition hover:bg-[#173d35] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 sm:w-auto"
        >
          {isResolvingCoordinates ? "地図の位置を確認しています" : "結果を見る"}
        </button>

        {showResult ? (
          <div ref={resultRef} className="mt-4 scroll-mt-24">
            <ResultPanel
              calculation={calculation}
              selectedJob={selectedJob}
              selectedProperty={selectedProperty}
              routeInfo={routeInfo}
              isLoadingRoute={isLoadingRoute}
              isResolvingCoordinates={isResolvingCoordinates}
              jobCoordinates={jobCoordinates}
              propertyCoordinates={propertyCoordinates}
              mapData={mapData}
            />
          </div>
        ) : null}
      </StepBlock>
    </section>
  );
}

function JobOptionCard({
  job,
  selected,
  onSelect,
}: {
  job: PublicJobOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const hourlyRate = toNumber(job.hourly_rate) ?? toNumber(job.hourly_rate_min);
  const workHours = resolveWeeklyWorkHours(job.work_hours, job.weekly_hours);
  const isMissing = hourlyRate === null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
        selected
          ? "border-[#244C43] bg-emerald-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-black text-gray-950">
            {job.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-600">
            {job.company || "会社名未設定"}
          </p>
        </div>
        <SelectionBadge active={selected} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <Fact label="時給" value={hourlyRate ? `${money(hourlyRate)}/h` : "未入力"} />
        <Fact
          label="週勤務"
          value={`${workHours.hours}時間${workHours.usedDefault ? "（標準）" : ""}`}
        />
      </div>
      <p className="mt-2 line-clamp-1 text-xs font-medium text-gray-600">
        {formatLocation(job.region, job.district, job.suburb, job.area, job.city)}
      </p>
      <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-600">
        {formatAddress(job.address)}
      </p>
      {isMissing ? (
        <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
          月に残るお金の計算に必要な時給が不足しています
        </p>
      ) : workHours.usedDefault ? (
        <p className="mt-2 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">
          勤務時間未設定のため、週20時間で計算します
        </p>
      ) : null}
    </button>
  );
}

function PropertyOptionCard({
  property,
  selected,
  onSelect,
}: {
  property: PublicPropertyOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const rentWeekly = toNumber(property.rent_weekly);
  const utilities = property.utilities_included ?? property.bills_included;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
        selected
          ? "border-[#244C43] bg-emerald-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-base font-black text-gray-950">
          {property.title}
        </h3>
        <SelectionBadge active={selected} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <Fact
          label="週家賃"
          value={rentWeekly ? `${money(rentWeekly)}/w` : "未入力"}
        />
        <Fact
          label="光熱費"
          value={
            utilities === true ? "込み" : utilities === false ? "別" : "要確認"
          }
        />
      </div>
      <p className="mt-2 line-clamp-1 text-xs font-medium text-gray-600">
        {formatLocation(
          property.region,
          property.district,
          property.suburb,
          property.area,
          property.city,
        )}
      </p>
      <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-600">
        {formatAddress(property.address)}
      </p>
      {!rentWeekly ? (
        <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
          月に残るお金の計算に必要な家賃情報がありません
        </p>
      ) : null}
    </button>
  );
}

function ResultPanel({
  calculation,
  selectedJob,
  selectedProperty,
  routeInfo,
  isLoadingRoute,
  isResolvingCoordinates,
  jobCoordinates,
  propertyCoordinates,
  mapData,
}: {
  calculation: {
    canCalculate: boolean;
    missing: string[];
    resolvedWorkHours: {
      hours: number | null;
      usedDefault: boolean;
    };
    monthlyGrossIncome: number | null;
    monthlyNetIncome: number | null;
    monthlyRent: number | null;
    monthlyLivingCost: number;
    monthlyBalance: number | null;
  };
  selectedJob: PublicJobOption | null;
  selectedProperty: PublicPropertyOption | null;
  routeInfo: RouteInfo | null;
  isLoadingRoute: boolean;
  isResolvingCoordinates: boolean;
  jobCoordinates: ResolvedCoordinates | null;
  propertyCoordinates: ResolvedCoordinates | null;
  mapData: {
    jobs: Array<{
      id: string;
      lat: number;
      lng: number;
      label: string;
      subtitle?: string;
      details?: string[];
    }>;
    properties: Array<{
      id: string;
      lat: number;
      lng: number;
      label: string;
      subtitle?: string;
      details?: string[];
    }>;
    highlightedLine: {
      from: { lat: number; lng: number };
      to: { lat: number; lng: number };
      coordinates?: Array<{ lat: number; lng: number }>;
    } | null;
  } | null;
}) {
  const hasBothCoordinates = Boolean(jobCoordinates && propertyCoordinates);
  const hasOneCoordinate = Boolean(jobCoordinates || propertyCoordinates);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        {!calculation.canCalculate ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
            不足項目: {calculation.missing.join("、") || "未入力項目"}
          </div>
        ) : (
          <div
            className={`rounded-2xl border p-4 ${
              calculation.monthlyBalance! < 0
                ? "border-red-200 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <p className="text-sm font-bold text-gray-700">月に残るお金</p>
            <p
              className={`mt-1 text-4xl font-black tracking-tight ${
                calculation.monthlyBalance! < 0
                  ? "text-red-600"
                  : "text-emerald-700"
              }`}
            >
              約 {money(Math.abs(calculation.monthlyBalance!))}
            </p>
            <p
              className={`mt-2 text-sm font-bold leading-6 ${
                calculation.monthlyBalance! < 0
                  ? "text-red-700"
                  : "text-emerald-800"
              }`}
            >
              {calculation.monthlyBalance! < 0
                ? `この組み合わせでは、月に約${money(Math.abs(calculation.monthlyBalance!))}不足する計算です。`
                : `この組み合わせでは、月に約${money(calculation.monthlyBalance!)}残る計算です。`}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Fact
                label="月の収入"
                value={money(calculation.monthlyNetIncome!)}
              />
              <Fact label="月の家賃" value={money(calculation.monthlyRent!)} />
              <Fact
                label="標準生活費"
                value={money(calculation.monthlyLivingCost)}
              />
              <Fact
                label="税引前収入"
                value={money(calculation.monthlyGrossIncome!)}
              />
              <Fact
                label="週勤務時間"
                value={`${calculation.resolvedWorkHours.hours}時間${
                  calculation.resolvedWorkHours.usedDefault ? "（標準設定）" : ""
                }`}
              />
            </div>
            {calculation.resolvedWorkHours.usedDefault ? (
              <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold leading-5 text-blue-800">
                勤務時間未設定のため、週20時間で計算しています。
              </p>
            ) : null}
            <p className="mt-3 text-xs font-medium leading-5 text-gray-700">
              実際の収入、税金、勤務時間、生活費によって結果は変わります。
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-[#244C43]/20 bg-white p-4">
          <h3 className="text-lg font-black text-gray-950">
            この組み合わせを保存しますか？
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            会員登録すると、求人と物件を保存し、あとからほかの組み合わせと比較できます。
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#244C43] px-4 py-2 text-sm font-black text-white hover:bg-[#173d35]"
            >
              無料で会員登録する
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-950 hover:border-[#244C43]"
            >
              ログインする
            </Link>
          </div>
          <p className="mt-3 text-xs font-bold text-gray-600">
            会員登録前は、この結果を保存しません。
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-black text-gray-950">
            仕事と住まいの位置関係
          </h3>
          {isResolvingCoordinates ? (
            <p className="mt-2 rounded-xl bg-blue-50 px-3 py-3 text-sm font-bold leading-6 text-blue-800">
              地図の位置を確認しています
            </p>
          ) : mapData ? (
            <div className="mt-3 overflow-hidden rounded-2xl">
              <MapView
                jobs={mapData.jobs}
                properties={mapData.properties}
                highlightedJobId={selectedJob?.id}
                highlightedPropertyId={selectedProperty?.id}
                highlightedLine={mapData.highlightedLine || undefined}
              />
              {!hasBothCoordinates && hasOneCoordinate ? (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
                  もう一方の住所から位置を取得できなかったため、2地点の経路は表示できません。
                </p>
              ) : null}
              {hasBothCoordinates &&
              (jobCoordinates?.source === "address" ||
                propertyCoordinates?.source === "address") ? (
                <p className="mt-2 text-xs font-bold leading-5 text-gray-600">
                  住所から取得した位置情報はこの画面内だけで使用し、既存データには保存しません。
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 rounded-xl bg-gray-50 px-3 py-3 text-sm font-bold leading-6 text-gray-700">
              求人または物件の住所から位置を取得できませんでした。
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-black text-gray-950">通勤しやすさ</h3>
          {isResolvingCoordinates ? (
            <p className="mt-2 text-sm font-bold text-gray-700">
              地図の位置を確認しています。
            </p>
          ) : isLoadingRoute ? (
            <p className="mt-2 text-sm font-bold text-gray-700">
              経路を確認中です...
            </p>
          ) : routeInfo?.distanceKm ? (
            <p className="mt-2 text-sm font-bold leading-6 text-gray-700">
              車移動の目安: 約{routeInfo.distanceKm.toFixed(1)}km /{" "}
              {routeInfo.durationMin
                ? `約${Math.round(routeInfo.durationMin)}分`
                : "時間は取得できませんでした"}
              {routeInfo.isFallback ? "（直線距離をもとにした推定）" : ""}
            </p>
          ) : selectedJob && selectedProperty ? (
            <p className="mt-2 text-sm font-bold leading-6 text-gray-700">
              住所情報が不足しているため、通勤時間を計算できません。
            </p>
          ) : (
            <p className="mt-2 text-sm font-bold leading-6 text-gray-700">
              求人と物件を選ぶと、位置情報がある場合のみ通勤目安を表示します。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBlock({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#244C43] text-sm font-black text-white">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-black text-gray-950 md:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-950 outline-none focus:border-[#244C43] focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function RegionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">地域で絞り込み</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-gray-950 outline-none focus:border-[#244C43] focus:ring-2 focus:ring-emerald-100"
      >
        <option value="">すべての地域</option>
        {regionOptions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectedMiniCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-black text-gray-600">{label}</p>
      <p className="mt-1 line-clamp-1 text-sm font-black text-gray-950">
        {title}
      </p>
      <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-600">
        {description}
      </p>
    </div>
  );
}

function SelectionBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[11px] font-black ${
        active ? "bg-[#244C43] text-white" : "bg-gray-100 text-gray-700"
      }`}
    >
      {active ? "選択中" : "選択"}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/80 px-2 py-2 ring-1 ring-black/5">
      <p className="text-[11px] font-bold text-gray-600">{label}</p>
      <p className="mt-1 break-words text-xs font-black text-gray-950">
        {value}
      </p>
    </div>
  );
}

function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
      {children}
    </p>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 rounded-xl bg-gray-50 px-3 py-3 text-sm font-bold text-gray-700">
      {children}
    </p>
  );
}

function LoadingText() {
  return (
    <p className="mt-3 rounded-xl bg-gray-50 px-3 py-3 text-sm font-bold text-gray-700">
      読み込み中...
    </p>
  );
}

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-950 hover:border-[#244C43] sm:w-auto"
    >
      さらに表示
    </button>
  );
}
