"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { getRouteInfo, type RouteInfo } from "@/lib/services/routeService";

const pageSize = 12;
const weeksPerMonth = 4.33;

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
  hourly_rate_max?: number | null;
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

type ExpenseField =
  | "food"
  | "transport"
  | "phone"
  | "insurance"
  | "daily"
  | "other";

const initialExpenses: Record<ExpenseField, string> = {
  food: "500",
  transport: "160",
  phone: "50",
  insurance: "120",
  daily: "250",
  other: "150",
};

const expenseLabels: Array<[ExpenseField, string]> = [
  ["food", "食費（月額）"],
  ["transport", "交通費（月額）"],
  ["phone", "通信費（月額）"],
  ["insurance", "保険（月額）"],
  ["daily", "日用品・娯楽費（月額）"],
  ["other", "その他（月額）"],
];

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
  if (trimmed.length <= 54) return trimmed;
  return `${trimmed.slice(0, 54)}...`;
}

function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

function hasCoordinates(
  item: Pick<PublicJobOption | PublicPropertyOption, "latitude" | "longitude">,
) {
  return Boolean(
    typeof item.latitude === "number" &&
      typeof item.longitude === "number" &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude) &&
      item.latitude !== 0 &&
      item.longitude !== 0,
  );
}

function SelectionBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[11px] font-black ${
        active ? "bg-[#244C43] text-white" : "bg-gray-100 text-gray-700"
      }`}
    >
      {active ? "選択中" : "未選択"}
    </span>
  );
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
  const [expenses, setExpenses] =
    useState<Record<ExpenseField, string>>(initialExpenses);
  const [overrideHourlyRate, setOverrideHourlyRate] = useState("");
  const [overrideWorkHours, setOverrideWorkHours] = useState("");
  const [overrideRentWeekly, setOverrideRentWeekly] = useState("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      setJobError("");

      let query = supabase
        .from("public_jobs")
        .select(
          "id,title,company,city,region,district,suburb,area,address,hourly_rate,hourly_rate_min,hourly_rate_max,work_hours,weekly_hours,employment_type,latitude,longitude",
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
      if (!selectedJob || !selectedProperty) return;
      if (!hasCoordinates(selectedJob) || !hasCoordinates(selectedProperty)) {
        return;
      }

      setIsLoadingRoute(true);
      const result = await getRouteInfo({
        origin: {
          latitude: selectedProperty.latitude!,
          longitude: selectedProperty.longitude!,
        },
        destination: {
          latitude: selectedJob.latitude!,
          longitude: selectedJob.longitude!,
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
  }, [selectedJob, selectedProperty]);

  const calculation = useMemo(() => {
    const hourlyRate =
      toNumber(selectedJob?.hourly_rate) ??
      toNumber(selectedJob?.hourly_rate_min) ??
      toNumber(overrideHourlyRate);
    const workHours =
      toNumber(selectedJob?.work_hours) ??
      toNumber(selectedJob?.weekly_hours) ??
      toNumber(overrideWorkHours);
    const rentWeekly =
      toNumber(selectedProperty?.rent_weekly) ?? toNumber(overrideRentWeekly);
    const monthlyExpenses = expenseLabels.reduce((sum, [field]) => {
      return sum + Math.max(toNumber(expenses[field]) ?? 0, 0);
    }, 0);

    const missing: string[] = [];
    if (!selectedJob) missing.push("求人");
    if (!selectedProperty) missing.push("物件");
    if (selectedJob && hourlyRate === null) missing.push("時給");
    if (selectedJob && workHours === null) missing.push("週勤務時間");
    if (selectedProperty && rentWeekly === null) missing.push("週家賃");

    if (
      missing.length ||
      hourlyRate === null ||
      workHours === null ||
      rentWeekly === null
    ) {
      return {
        canCalculate: false,
        missing,
        monthlyIncome: null,
        monthlyRent: null,
        monthlyExpenses,
        monthlyBalance: null,
        weeklyBalance: null,
      };
    }

    const monthlyIncome = hourlyRate * workHours * weeksPerMonth;
    const monthlyRent = rentWeekly * weeksPerMonth;
    const monthlyBalance = monthlyIncome - monthlyRent - monthlyExpenses;

    return {
      canCalculate: true,
      missing,
      monthlyIncome,
      monthlyRent,
      monthlyExpenses,
      monthlyBalance,
      weeklyBalance: monthlyBalance / weeksPerMonth,
    };
  }, [
    expenses,
    overrideHourlyRate,
    overrideRentWeekly,
    overrideWorkHours,
    selectedJob,
    selectedProperty,
  ]);

  const updateExpense = (field: ExpenseField, value: string) => {
    setExpenses((current) => ({ ...current, [field]: value }));
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
    setOverrideHourlyRate("");
    setOverrideWorkHours("");
  };

  const handleSelectProperty = (property: PublicPropertyOption) => {
    setSelectedProperty(property);
    setOverrideRentWeekly("");
  };

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          Trial simulation
        </p>
        <h2 className="mt-2 text-xl font-black text-gray-950 md:text-2xl">
          公開求人と物件で、海外生活を試算する
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
          求人と物件を一つずつ選び、生活費を入力して毎月の収支を確認できます。会員登録前の試算内容は保存されません。
        </p>
      </div>

      <div className="sticky top-16 z-20 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-sm backdrop-blur md:top-20 md:p-4">
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div>
            <p className="text-xs font-bold text-gray-600">選択中の求人</p>
            <p className="mt-1 line-clamp-1 font-black text-gray-950">
              {selectedJob?.title || "未選択"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">選択中の物件</p>
            <p className="mt-1 line-clamp-1 font-black text-gray-950">
              {selectedProperty?.title || "未選択"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">月間残額</p>
            <p
              className={`mt-1 font-black ${
                calculation.monthlyBalance === null
                  ? "text-gray-950"
                  : calculation.monthlyBalance < 0
                    ? "text-red-600"
                    : "text-emerald-700"
              }`}
            >
              {calculation.monthlyBalance === null
                ? "未計算"
                : money(calculation.monthlyBalance)}
            </p>
          </div>
        </div>
      </div>

      <StepBlock
        step="1"
        title="求人を選ぶ"
        description="収支計算には時給と週勤務時間が必要です。"
      >
        <div className="grid gap-2 md:grid-cols-[1fr_220px]">
          <SearchInput
            value={jobSearch}
            onChange={handleJobSearchChange}
            placeholder="求人名・会社名・地域で検索"
          />
          <RegionSelect value={jobRegion} onChange={handleJobRegionChange} />
        </div>
        {jobError ? <ErrorMessage>{jobError}</ErrorMessage> : null}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {jobs.map((job) => {
            const hourlyRate =
              toNumber(job.hourly_rate) ?? toNumber(job.hourly_rate_min);
            const workHours =
              toNumber(job.work_hours) ?? toNumber(job.weekly_hours);
            const isSelected = selectedJob?.id === job.id;

            return (
              <button
                key={job.id}
                type="button"
                onClick={() => handleSelectJob(job)}
                className={`rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                  isSelected
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
                  <SelectionBadge active={isSelected} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Fact
                    label="時給"
                    value={hourlyRate ? `${money(hourlyRate)}/h` : "未入力"}
                  />
                  <Fact
                    label="週勤務"
                    value={workHours ? `${workHours}時間` : "未入力"}
                  />
                  <Fact
                    label="地域"
                    value={formatLocation(
                      job.region,
                      job.district,
                      job.suburb,
                      job.area,
                      job.city,
                    )}
                  />
                  <Fact
                    label="雇用形態"
                    value={job.employment_type || "要確認"}
                  />
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-medium text-gray-600">
                  {formatAddress(job.address)}
                </p>
                {!hourlyRate || !workHours ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                    収支計算に必要な情報が不足しています
                  </p>
                ) : null}
              </button>
            );
          })}
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
        title="物件を選ぶ"
        description="収支計算には週家賃が必要です。"
      >
        <div className="grid gap-2 md:grid-cols-[1fr_220px]">
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
        {propertyError ? <ErrorMessage>{propertyError}</ErrorMessage> : null}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {properties.map((property) => {
            const rentWeekly = toNumber(property.rent_weekly);
            const isSelected = selectedProperty?.id === property.id;
            const utilities =
              property.utilities_included ?? property.bills_included;

            return (
              <button
                key={property.id}
                type="button"
                onClick={() => handleSelectProperty(property)}
                className={`rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                  isSelected
                    ? "border-[#244C43] bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-base font-black text-gray-950">
                    {property.title}
                  </h3>
                  <SelectionBadge active={isSelected} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Fact
                    label="週家賃"
                    value={rentWeekly ? `${money(rentWeekly)}/w` : "未入力"}
                  />
                  <Fact
                    label="光熱費"
                    value={
                      utilities === true
                        ? "込み"
                        : utilities === false
                          ? "別"
                          : "要確認"
                    }
                  />
                  <Fact
                    label="地域"
                    value={formatLocation(
                      property.region,
                      property.district,
                      property.suburb,
                      property.area,
                      property.city,
                    )}
                  />
                  <Fact label="住所" value={formatAddress(property.address)} />
                </div>
                {!rentWeekly ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                    収支計算に必要な家賃情報がありません
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
        {isLoadingProperties ? <LoadingText /> : null}
        {!isLoadingProperties && !properties.length ? (
          <EmptyText>条件に合う公開物件が見つかりません。</EmptyText>
        ) : null}
        {properties.length >= propertyPage * pageSize ? (
          <LoadMoreButton onClick={() => setPropertyPage((page) => page + 1)} />
        ) : null}
      </StepBlock>

      <StepBlock
        step="3"
        title="生活費を入力"
        description="初期値は目安です。自分の生活に合わせて変更できます。"
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {expenseLabels.map(([field, label]) => (
            <MoneyInput
              key={field}
              label={label}
              value={expenses[field]}
              onChange={(value) => updateExpense(field, value)}
            />
          ))}
        </div>
        {selectedJob && calculation.missing.includes("時給") ? (
          <MoneyInput
            label="時給を仮入力して試算"
            value={overrideHourlyRate}
            onChange={setOverrideHourlyRate}
          />
        ) : null}
        {selectedJob && calculation.missing.includes("週勤務時間") ? (
          <NumberInput
            label="週勤務時間を仮入力して試算"
            value={overrideWorkHours}
            onChange={setOverrideWorkHours}
          />
        ) : null}
        {selectedProperty && calculation.missing.includes("週家賃") ? (
          <MoneyInput
            label="週家賃を仮入力して試算"
            value={overrideRentWeekly}
            onChange={setOverrideRentWeekly}
          />
        ) : null}
      </StepBlock>

      <StepBlock
        step="4"
        title="結果を見る"
        description="税金・勤務時間・生活状況で変わるため、簡易試算として確認してください。"
      >
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
            <p className="text-sm font-bold text-gray-700">月間残額</p>
            <p
              className={`mt-1 text-3xl font-black ${
                calculation.monthlyBalance! < 0
                  ? "text-red-600"
                  : "text-emerald-700"
              }`}
            >
              {money(calculation.monthlyBalance!)}
            </p>
            <p
              className={`mt-2 text-sm font-bold leading-6 ${
                calculation.monthlyBalance! < 0
                  ? "text-red-700"
                  : "text-emerald-800"
              }`}
            >
              {calculation.monthlyBalance! < 0
                ? `この条件では毎月約${money(Math.abs(calculation.monthlyBalance!))}不足する試算です。`
                : `この条件では毎月約${money(calculation.monthlyBalance!)}残る試算です。`}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <Fact
                label="月間総収入"
                value={money(calculation.monthlyIncome!)}
              />
              <Fact label="月間家賃" value={money(calculation.monthlyRent!)} />
              <Fact
                label="その他生活費"
                value={money(calculation.monthlyExpenses)}
              />
              <Fact
                label="週単位の目安"
                value={money(calculation.weeklyBalance!)}
              />
            </dl>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-black text-gray-950">通勤距離・時間</h3>
          {isLoadingRoute ? (
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

        <div className="rounded-2xl border border-[#244C43]/20 bg-white p-4">
          <h3 className="text-lg font-black text-gray-950">
            この生活プランを保存しますか？
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            会員登録すると、求人と物件を保存し、あとから条件を比較できます。
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#244C43] px-4 py-2 text-sm font-black text-white hover:bg-[#173d35]"
            >
              無料で会員登録して保存する
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-950 hover:border-[#244C43]"
            >
              ログインして保存する
            </Link>
          </div>
          <p className="mt-3 text-xs font-bold text-gray-600">
            会員登録前はシミュレーション結果を保存しません。
          </p>
        </div>
      </StepBlock>
    </section>
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

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-700">{label}</span>
      <div className="mt-1 flex h-10 items-center rounded-xl border border-gray-300 bg-white px-3 focus-within:border-[#244C43] focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="text-sm font-black text-gray-600">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-2 text-sm font-bold text-gray-950 outline-none"
        />
      </div>
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-700">{label}</span>
      <input
        type="number"
        min="0"
        step="0.5"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-bold text-gray-950 outline-none focus:border-[#244C43] focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-2 py-2">
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
