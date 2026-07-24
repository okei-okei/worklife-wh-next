"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ListMapToggle from "@/components/ListMapToggle";
import NzLocationPicker from "@/components/NzLocationPicker";
import ResponsiveJobImage, {
  getSafeJobImageUrl,
} from "@/components/jobs/ResponsiveJobImage";
import { supabase } from "@/lib/supabase";
import { trackMetric } from "@/lib/analytics";
import {
  getCurrentLocation,
  getGeolocationFailureMessage,
  type UserCoordinates,
} from "@/lib/geolocation";
import { resolveNzAddressApproximateCoordinates } from "@/lib/locationCoordinates";
import { getLocationDisplayName } from "@/lib/locationDisplay";

const PublicListingsMap = dynamic(
  () => import("@/components/maps/PublicListingsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-center font-bold text-gray-800 md:h-[520px]">
        地図を読み込み中...
      </div>
    ),
  },
);

const pageSize = 20;
const maxMapPoints = 100;

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
  location_master_id?: string | null;
  region_normalized?: string | null;
  territorial_authority_normalized?: string | null;
  major_name_normalized?: string | null;
  suburb_locality_normalized?: string | null;
  custom_locality?: string | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  weekly_hours?: number | null;
  start_date?: string | null;
  image_url?: string | null;
};

type Coordinates = {
  latitude: number | null;
  longitude: number | null;
};

type GeocodedCoordinates = Record<string, { latitude: number; longitude: number }>;

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

function getJobGeocodeQuery(job: PublicJob) {
  return [job.address, job.country_code === "NZ" ? "New Zealand" : job.country_code]
    .map((part) => part?.trim())
    .filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(", ");
}

function hasValidCoordinates(latitude: unknown, longitude: unknown) {
  const numericLatitude =
    typeof latitude === "string" ? Number(latitude) : latitude;
  const numericLongitude =
    typeof longitude === "string" ? Number(longitude) : longitude;

  return (
    typeof numericLatitude === "number" &&
    typeof numericLongitude === "number" &&
    Number.isFinite(numericLatitude) &&
    Number.isFinite(numericLongitude) &&
    numericLatitude !== 0 &&
    numericLongitude !== 0
  );
}

async function fetchCoordinates(query: string): Promise<Coordinates> {
  if (!query) return { latitude: null, longitude: null };

  const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  if (!response.ok) return { latitude: null, longitude: null };

  return response.json() as Promise<Coordinates>;
}

function resolveJobCoordinates(
  job: PublicJob,
  geocodedCoordinates: GeocodedCoordinates,
): { latitude: number; longitude: number } | null {
  if (geocodedCoordinates[job.id]) {
    return geocodedCoordinates[job.id];
  }

  return resolveNzAddressApproximateCoordinates(job);
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
  const [currentLocation, setCurrentLocation] =
    useState<UserCoordinates | null>(null);
  const [currentLocationFocusKey, setCurrentLocationFocusKey] = useState(0);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(false);
  const [currentLocationMessage, setCurrentLocationMessage] = useState("");
  const [minHourlyRate, setMinHourlyRate] = useState("");
  const [minWorkHours, setMinWorkHours] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [japaneseSupport, setJapaneseSupport] = useState("");
  const [englishLevel, setEnglishLevel] = useState("");
  const [visaCondition, setVisaCondition] = useState("");
  const [accommodationOnly, setAccommodationOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedJobIds, setExpandedJobIds] = useState<string[]>([]);
  const [selectedMapJobId, setSelectedMapJobId] = useState<string | null>(null);
  const [geocodedJobCoordinates, setGeocodedJobCoordinates] =
    useState<GeocodedCoordinates>({});
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
          "id, title, company, city, address, hourly_rate, work_hours, description, application_method, visa_support, japanese_ok, accommodation_available, english_level, visa_conditions, apply_url, latitude, longitude, employment_type, country_code, region, district, suburb, area, location_master_id, region_normalized, territorial_authority_normalized, major_name_normalized, suburb_locality_normalized, custom_locality, hourly_rate_min, hourly_rate_max, weekly_hours, start_date, image_url",
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

    const saveUrl = job.apply_url || `/jobs#job-${job.id}`;
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
      hourly_rate_min: job.hourly_rate_min ?? job.hourly_rate,
      hourly_rate_max: job.hourly_rate_max,
      work_hours: job.work_hours,
      weekly_hours: job.weekly_hours ?? job.work_hours,
      employment_type: job.employment_type,
      accommodation_available: job.accommodation_available,
      japanese_ok: job.japanese_ok,
      english_level: job.english_level,
      visa_conditions: job.visa_conditions,
      start_date: job.start_date,
      status: "気になる",
      location: getLocationDisplayName(job),
      location_master_id: job.location_master_id || null,
      region_normalized: job.region_normalized || null,
      territorial_authority_normalized:
        job.territorial_authority_normalized || null,
      major_name_normalized: job.major_name_normalized || null,
      suburb_locality_normalized: job.suburb_locality_normalized || null,
      address:
        job.address || job.area || job.suburb || job.district || job.city || "",
      latitude: job.latitude,
      longitude: job.longitude,
      source_type: "public",
      public_job_id: job.id,
    };

    const compatiblePayload = {
      user_id: user.id,
      title: job.title,
      company: job.company,
      url: saveUrl,
      hourly_rate: job.hourly_rate_min ?? job.hourly_rate,
      work_hours: job.weekly_hours ?? job.work_hours,
      employment_type: job.employment_type,
      status: "気になる",
      location: getLocationDisplayName(job),
      location_master_id: job.location_master_id || null,
      region_normalized: job.region_normalized || null,
      territorial_authority_normalized:
        job.territorial_authority_normalized || null,
      major_name_normalized: job.major_name_normalized || null,
      suburb_locality_normalized: job.suburb_locality_normalized || null,
      address:
        job.address || job.area || job.suburb || job.district || job.city || "",
      latitude: job.latitude,
      longitude: job.longitude,
    };

    const basicPayload = {
      user_id: user.id,
      title: job.title,
      url: saveUrl,
      hourly_rate: job.hourly_rate_min ?? job.hourly_rate,
      work_hours: job.weekly_hours ?? job.work_hours,
      status: "気になる",
      address:
        job.address || job.area || job.suburb || job.district || job.city || "",
      latitude: job.latitude,
      longitude: job.longitude,
    };

    const insertAttempts: Array<Record<string, unknown>> = [
      extendedPayload,
      compatiblePayload,
      basicPayload,
    ];
    const insertErrors: string[] = [];

    for (const payload of insertAttempts) {
      const { data: insertedJob, error } = await supabase
        .from("saved_jobs")
        .insert(payload)
        .select("id")
        .single();

      if (!error) {
        return { id: insertedJob.id as string, alreadySaved: false };
      }

      insertErrors.push(error.message);

      if (!isMissingColumnError(error)) {
        break;
      }
    }

    console.error("saved_jobs insert failed:", insertErrors);

    const { data: fallbackJob, error: fallbackError } = await supabase
      .from("saved_jobs")
      .insert({
        user_id: user.id,
        title: job.title,
        url: saveUrl,
        hourly_rate: job.hourly_rate_min ?? job.hourly_rate,
        work_hours: job.weekly_hours ?? job.work_hours,
        status: "気になる",
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
        job.region_normalized,
        job.district,
        job.territorial_authority_normalized,
        job.major_name_normalized,
        job.suburb_locality_normalized,
        job.custom_locality,
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
          job.region_normalized,
          job.territorial_authority_normalized,
          job.major_name_normalized,
          job.suburb_locality_normalized,
          job.custom_locality,
          job.region,
          job.district,
          job.suburb,
          job.area,
          job.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesLocation = normalizedLocations.some((location) => {
          const parts = location
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean);

          return parts.every((part) => jobLocationText.includes(part));
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
    setCurrentPage(1);
    setSelectedMapJobId(null);
    setCurrentLocation(null);
    setCurrentLocationMessage("");
  };

  const handleLocationCoordinatesChange = (coords: {
    latitude: number | null;
    longitude: number | null;
  }) => {
    setFilterCoordinates(coords);

    if (typeof coords.latitude === "number" && typeof coords.longitude === "number") {
      setCurrentLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: null,
      });
      setCurrentLocationFocusKey((current) => current + 1);
      return;
    }

    setCurrentLocation(null);
    setCurrentLocationMessage("");
  };

  const handleShowCurrentLocation = async () => {
    setCurrentLocationMessage("");
    setIsGettingCurrentLocation(true);

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setCurrentLocationFocusKey((current) => current + 1);
      setCurrentLocationMessage("現在地を表示中");
    } catch (error) {
      setCurrentLocationMessage(getGeolocationFailureMessage(error));
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  const activeFilterCount =
    locationFilters.length +
    [
      searchQuery,
      minHourlyRate,
      minWorkHours,
      employmentType,
      japaneseSupport,
      englishLevel,
      visaCondition,
    ].filter(Boolean).length +
    (accommodationOnly ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedJobs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [safeCurrentPage, filteredJobs]);

  useEffect(() => {
    if (viewMode !== "map") return;

    const targets = filteredJobs
      .filter(
        (job) =>
          !geocodedJobCoordinates[job.id] &&
          getJobGeocodeQuery(job),
      )
      .slice(0, 50);

    if (!targets.length) return;

    let isCancelled = false;

    const run = async () => {
      const entries = await Promise.all(
        targets.map(async (job) => {
          const coordinates = await fetchCoordinates(getJobGeocodeQuery(job));
          if (
            typeof coordinates.latitude === "number" &&
            typeof coordinates.longitude === "number" &&
            hasValidCoordinates(coordinates.latitude, coordinates.longitude)
          ) {
            return [job.id, coordinates] as const;
          }
          return null;
        }),
      );

      if (isCancelled) return;

      setGeocodedJobCoordinates((current) => {
        const validEntries = entries.filter(
          (entry): entry is NonNullable<typeof entry> => Boolean(entry),
        );
        if (!validEntries.length) return current;

        const next = { ...current };
        validEntries.forEach((entry) => {
          next[entry[0]] = {
            latitude: entry[1].latitude as number,
            longitude: entry[1].longitude as number,
          };
        });
        return next;
      });
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, [filteredJobs, geocodedJobCoordinates, viewMode]);

  const mapJobs = useMemo(
    () =>
      filteredJobs
        .slice(0, maxMapPoints)
        .map((job) => {
          const coordinates = resolveJobCoordinates(job, geocodedJobCoordinates);
          if (!coordinates) return null;

          return {
            id: job.id,
            type: "job" as const,
            title: job.title,
            subtitle: job.company || "掲載企業未設定",
            locationLabel: getLocationDisplayName(job),
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            imageUrl: getSafeJobImageUrl(job.image_url),
            priceLabel: formatHourlyRate(job.hourly_rate_min ?? job.hourly_rate),
            metaLabel: job.employment_type || "採用形態未設定",
          };
        })
        .filter((job): job is NonNullable<typeof job> => Boolean(job)),
    [filteredJobs, geocodedJobCoordinates],
  );

  const jobsWithoutCoordinates = Math.min(filteredJobs.length, maxMapPoints) - mapJobs.length;

  const selectedMapJob = useMemo(
    () => filteredJobs.find((job) => job.id === selectedMapJobId) || null,
    [filteredJobs, selectedMapJobId],
  );

  useEffect(() => {
    if (viewMode !== "map") return;
    void trackMetric("public_job_map_view", {
      eventType: "map_view",
      targetType: "public_jobs",
      pagePath: "/jobs",
      metadata: {
        visibleCount: mapJobs.length,
        withoutCoordinates: jobsWithoutCoordinates,
      },
    });
  }, [jobsWithoutCoordinates, mapJobs.length, viewMode]);

  const handleSelectMapJob = (id: string) => {
    setSelectedMapJobId(id);
    const selected = filteredJobs.find((job) => job.id === id);
    void trackMetric("public_job_pin_select", {
      eventType: "map_pin_select",
      targetType: "public_job",
      targetId: id,
      pagePath: "/jobs",
      metadata: {
        jobId: id,
        title: selected?.title || null,
        company: selected?.company || null,
        address: selected?.address || null,
      },
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 公開求人
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">
              ワーホリ向け求人
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-800 md:text-base md:leading-7">
              ニュージーランドでの仕事探しに使える公開求人を確認できます。気になる求人は保存して、応募文の作成に進めます。
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href="/mypage"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50 sm:w-auto md:px-4 md:py-3"
            >
              マイページ
            </Link>
            <Link
              href="/company/submit"
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700 sm:w-auto md:px-4 md:py-3"
            >
              掲載申請
            </Link>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-blue-800 md:p-4 md:text-base">
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:p-5 lg:p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between md:mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">条件を絞り込む</h2>
              <p className="mt-1 text-xs font-medium text-gray-600 md:text-sm">
                地域、時給、勤務時間、採用形態で絞り込めます。
              </p>
            </div>
            <p className="w-fit rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 md:px-3 md:text-sm">
              {filteredJobs.length}件
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-end">
            <label className="block">
              <span className="text-sm font-bold text-gray-900">検索</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:py-3 md:text-base"
                placeholder="求人名、会社名、仕事内容、地域、住所で検索"
              />
            </label>
            <button
              type="button"
              onClick={resetFilters}
              className="hidden h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-bold text-gray-900 hover:bg-gray-50 lg:inline-flex lg:items-center lg:justify-center"
            >
              条件をクリア
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen((current) => !current)}
            className="mt-3 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 md:hidden"
          >
            <span>絞り込み</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
              {activeFilterCount}件適用中
            </span>
          </button>

          <div className={`${isFilterOpen ? "grid" : "hidden"} mt-3 grid-cols-1 gap-3 md:mt-4 md:grid lg:grid-cols-3 lg:gap-4`}>
            <NzLocationPicker
              label="地域"
              multiple
              values={locationFilters}
              onValuesChange={setLocationFilters}
              onCoordinatesChange={handleLocationCoordinatesChange}
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
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
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
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
                placeholder="例: 30"
              />
            </label>
          </div>

          <div className={`${isFilterOpen ? "grid" : "hidden"} mt-3 grid-cols-2 gap-3 md:mt-4 md:grid lg:grid-cols-4 lg:gap-4`}>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">採用形態</span>
              <select
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
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
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
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
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
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
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
              >
                <option value="">全て</option>
                <option value="ワーホリビザ可">ワーホリビザ可</option>
                <option value="学生ビザ可">学生ビザ可</option>
                <option value="就労可能なビザ必須">就労可能なビザ必須</option>
              </select>
            </label>
            <label className="flex min-h-[58px] items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 md:min-h-[74px] md:gap-3 md:text-base">
              <input
                type="checkbox"
                checked={accommodationOnly}
                onChange={(event) => setAccommodationOnly(event.target.checked)}
                className="h-5 w-5"
              />
              住み込み可のみ
            </label>
          </div>

          <div className={`${isFilterOpen ? "flex" : "hidden"} mt-3 justify-end md:mt-4 md:flex`}>
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto md:px-4 md:py-3"
            >
              条件をリセット
            </button>
          </div>
        </section>

        <div className="flex justify-end">
          <ListMapToggle value={viewMode} onChange={setViewMode} />
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-2xl bg-white shadow"
              />
            ))}
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
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-3 shadow md:p-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1 text-sm font-bold text-gray-700 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    地図上のピンを選択すると、下に選択中の求人を1件だけ表示します。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      一覧表示中: {paginatedJobs.length}件
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      地図表示中: {mapJobs.length}件
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      条件に一致: {filteredJobs.length}件
                    </span>
                    {jobsWithoutCoordinates > 0 ? (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                        位置情報なし: {jobsWithoutCoordinates}件
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-gray-900">
                      現在地を地図に表示
                    </p>
                    {currentLocationMessage ? (
                      <p className="mt-1 text-xs text-gray-700">
                        {currentLocationMessage}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-600">
                        現在地はこの画面内だけで使用し、保存しません。
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleShowCurrentLocation}
                    disabled={isGettingCurrentLocation}
                    className="min-h-11 w-full rounded-lg border border-green-700 bg-white px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-400 sm:w-auto"
                  >
                    {isGettingCurrentLocation
                      ? "現在地を確認中"
                      : currentLocation
                        ? "現在地を更新"
                        : "現在地を表示"}
                  </button>
                </div>
                <PublicListingsMap
                  points={mapJobs}
                  selectedId={selectedMapJob?.id}
                  onSelect={handleSelectMapJob}
                  type="job"
                  currentLocation={currentLocation}
                  currentLocationFocusKey={currentLocationFocusKey}
                />
                {!mapJobs.length ? (
                  <div className="space-y-2 rounded-xl border border-dashed border-gray-300 p-4 font-medium text-gray-700">
                  <p>
                    地図に表示できる座標付き求人がありません。リスト表示ではすべての求人を確認できます。
                  </p>
                  <p className="text-sm">
                    位置情報がないため地図に表示されない項目: {jobsWithoutCoordinates}件
                    <br />
                    地図表示は条件に合う座標付き求人を最大100件まで表示します。
                  </p>
                  </div>
                ) : null}
              </div>
            </section>

            {selectedMapJob ? (
              <article
                id={`job-${selectedMapJob.id}`}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                <div>
                  <ResponsiveJobImage
                    src={selectedMapJob.image_url}
                    alt={`${selectedMapJob.title}の求人画像`}
                    mode="map"
                  />
                  <div className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-blue-700">
                          選択中の求人
                        </p>
                        <h2 className="mt-1 line-clamp-2 break-words text-lg font-bold text-gray-900 [text-wrap:pretty] md:text-xl">
                          {selectedMapJob.title}
                        </h2>
                        <p className="mt-1 font-medium text-gray-800">
                          {selectedMapJob.company || "掲載企業未設定"}
                          {selectedMapJob.area ||
                          selectedMapJob.suburb ||
                          selectedMapJob.district ||
                          selectedMapJob.city
                            ? ` / ${
                                selectedMapJob.area ||
                                selectedMapJob.suburb ||
                                selectedMapJob.district ||
                                selectedMapJob.city
                              }`
                            : ""}
                        </p>
                        {selectedMapJob.address ? (
                          <p className="mt-1 break-words text-sm font-medium text-gray-700">
                            住所: {selectedMapJob.address}
                          </p>
                        ) : null}
                      </div>
                      <div className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
                        {selectedMapJob.hourly_rate_max
                          ? `$${selectedMapJob.hourly_rate_min ?? selectedMapJob.hourly_rate ?? 0} - $${selectedMapJob.hourly_rate_max}/時`
                          : formatHourlyRate(
                              selectedMapJob.hourly_rate_min ??
                                selectedMapJob.hourly_rate,
                            )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {selectedMapJob.employment_type ? (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                          {selectedMapJob.employment_type}
                        </span>
                      ) : null}
                      {selectedMapJob.japanese_ok ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          日本語OK
                        </span>
                      ) : null}
                      {selectedMapJob.visa_conditions ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {selectedMapJob.visa_conditions}
                        </span>
                      ) : null}
                      {(selectedMapJob.weekly_hours ??
                        selectedMapJob.work_hours) != null ? (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                          週
                          {selectedMapJob.weekly_hours ??
                            selectedMapJob.work_hours}
                          時間
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-800">
                      <div>
                        <p className="font-bold text-gray-900">職務内容</p>
                        <p className="mt-1 whitespace-pre-wrap break-words">
                          {selectedMapJob.description ||
                            "職務内容は未設定です。"}
                        </p>
                      </div>
                      {selectedMapJob.application_method ? (
                        <div>
                          <p className="font-bold text-gray-900">応募方法</p>
                          <p className="mt-1 whitespace-pre-wrap break-words">
                            {selectedMapJob.application_method}
                          </p>
                        </div>
                      ) : null}
                      {selectedMapJob.address ? (
                        <div>
                          <p className="font-bold text-gray-900">住所</p>
                          <p className="mt-1 whitespace-pre-wrap break-words">
                            {selectedMapJob.address}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        onClick={() => handleSaveJob(selectedMapJob)}
                        disabled={savingJobId === selectedMapJob.id}
                        className="w-full rounded-lg border border-blue-600 bg-white px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 sm:w-auto"
                      >
                        {savingJobId === selectedMapJob.id
                          ? "保存中..."
                          : "保存する"}
                      </button>
                      <button
                        onClick={() => handleApplyJob(selectedMapJob)}
                        disabled={savingJobId === selectedMapJob.id}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 sm:w-auto"
                      >
                        {savingJobId === selectedMapJob.id
                          ? "準備中..."
                          : "応募する"}
                      </button>
                      {selectedMapJob.apply_url ? (
                        <a
                          href={selectedMapJob.apply_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
                        >
                          外部ページを見る
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ) : mapJobs.length ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm font-bold text-gray-700">
                表示したい求人のピンを地図上で選択してください。
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
            {paginatedJobs.map((job) => (
              <article
                id={`job-${job.id}`}
                key={job.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow"
              >
                <ResponsiveJobImage
                  src={job.image_url}
                  alt={`${job.title}の求人画像`}
                  mode="card"
                />
                <div className="flex flex-1 flex-col p-3 md:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 break-words text-base font-bold text-gray-900 [text-wrap:pretty] md:text-xl">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-gray-800 md:text-base">
                      {job.company || "掲載企業未設定"}
                      {job.area || job.suburb || job.district || job.city
                        ? ` / ${job.area || job.suburb || job.district || job.city}`
                        : ""}
                    </p>
                    {job.address ? (
                      <p className="mt-1 line-clamp-2 break-words text-xs font-medium text-gray-700 md:text-sm">
                        住所: {job.address}
                      </p>
                    ) : null}
                  </div>

                  <div className="w-fit rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 md:px-3 md:py-1.5 md:text-sm">
                    {job.hourly_rate_max
                      ? `$${job.hourly_rate_min ?? job.hourly_rate ?? 0} - $${job.hourly_rate_max}/時`
                      : formatHourlyRate(job.hourly_rate_min ?? job.hourly_rate)}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3">
                  {job.visa_support && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      ワーホリ歓迎
                    </span>
                  )}
                  {job.japanese_ok && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      日本語OK
                    </span>
                  )}
                  {job.english_level ? (
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                      英語{job.english_level}
                    </span>
                  ) : null}
                  {job.visa_conditions ? (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {job.visa_conditions}
                    </span>
                  ) : null}
                  {job.accommodation_available && (
                    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                      住み込み可能
                    </span>
                  )}
                  {(job.weekly_hours ?? job.work_hours) != null && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                      週{job.weekly_hours ?? job.work_hours}時間
                    </span>
                  )}
                  {job.employment_type ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                      {job.employment_type}
                    </span>
                  ) : null}
                </div>

                {expandedJobIds.includes(job.id) ? (
                  <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-800 md:mt-4 md:p-4 md:leading-7">
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

                <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap md:pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedJobIds((current) =>
                        current.includes(job.id)
                          ? current.filter((id) => id !== job.id)
                          : [...current, job.id],
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto md:px-4 md:py-3"
                  >
                    {expandedJobIds.includes(job.id)
                      ? "詳細を閉じる"
                      : "詳細を見る"}
                  </button>
                  <button
                    onClick={() => handleSaveJob(job)}
                    disabled={savingJobId === job.id}
                    className="w-full rounded-lg border border-blue-600 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 sm:w-auto md:px-4 md:py-3"
                  >
                    {savingJobId === job.id ? "保存中..." : "保存する"}
                  </button>

                  <button
                    onClick={() => handleApplyJob(job)}
                    disabled={savingJobId === job.id}
                    className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 sm:w-auto md:px-4 md:py-3"
                  >
                    {savingJobId === job.id ? "準備中..." : "応募する"}
                  </button>

                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto md:px-4 md:py-3"
                    >
                      外部ページを見る
                    </a>
                  )}
                </div>
                </div>
              </article>
            ))}
            <div className="rounded-2xl bg-white p-3 shadow md:col-span-2 xl:col-span-3">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm font-bold text-gray-700">
                  {filteredJobs.length}件中 {(safeCurrentPage - 1) * pageSize + 1}
                  〜{Math.min(safeCurrentPage * pageSize, filteredJobs.length)}件を表示
                </p>
                <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 disabled:opacity-40"
                  >
                    前へ
                  </button>
                  <span className="text-sm font-bold text-gray-700">
                    {safeCurrentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 disabled:opacity-40"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
