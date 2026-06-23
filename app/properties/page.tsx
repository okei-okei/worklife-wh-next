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

type PublicProperty = {
  id: string;
  title: string;
  city: string | null;
  area: string | null;
  address: string | null;
  rent_weekly: number | null;
  description: string | null;
  url: string | null;
  latitude: number | null;
  longitude: number | null;
  room_type?: string | null;
  available_from?: string | null;
  furnished?: boolean | null;
  bills_included?: boolean | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  pets_allowed?: boolean | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  image_urls?: string[] | null;
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

function RangeNumberInput({
  label,
  prefix = "",
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder,
  maxPlaceholder,
}: {
  label: string;
  prefix?: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  minPlaceholder: string;
  maxPlaceholder: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <label className="min-w-0">
          <span className="sr-only">{label} 下限</span>
          <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3">
            {prefix && (
              <span className="shrink-0 text-sm font-bold text-gray-700">
                {prefix}
              </span>
            )}
            <input
              type="number"
              min="0"
              value={minValue}
              onChange={(event) => onMinChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2 py-3 font-medium text-gray-900 outline-none placeholder:text-gray-500"
              placeholder={minPlaceholder}
            />
          </div>
        </label>
        <span className="text-sm font-bold text-gray-600">〜</span>
        <label className="min-w-0">
          <span className="sr-only">{label} 上限</span>
          <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3">
            {prefix && (
              <span className="shrink-0 text-sm font-bold text-gray-700">
                {prefix}
              </span>
            )}
            <input
              type="number"
              min="0"
              value={maxValue}
              onChange={(event) => onMaxChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2 py-3 font-medium text-gray-900 outline-none placeholder:text-gray-500"
              placeholder={maxPlaceholder}
            />
          </div>
        </label>
      </div>
    </div>
  );
}

function PropertyFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-xs font-bold text-gray-600">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function PropertiesPage() {
  const router = useRouter();
  useEffect(() => { trackMetric("public_property_view", { eventType: "page_view", pagePath: "/properties" }); }, []);
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingPropertyId, setSavingPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [filterCoordinates, setFilterCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [minRentWeekly, setMinRentWeekly] = useState("");
  const [maxRentWeekly, setMaxRentWeekly] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [maxBedrooms, setMaxBedrooms] = useState("");
  const [minBathrooms, setMinBathrooms] = useState("");
  const [maxBathrooms, setMaxBathrooms] = useState("");
  const [minParkingSpaces, setMinParkingSpaces] = useState("");
  const [maxParkingSpaces, setMaxParkingSpaces] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [petsAllowedOnly, setPetsAllowedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const handledPendingActionRef = useRef(false);
  const pendingActionHandlersRef = useRef<{
    inquiry?: (property: PublicProperty) => void;
    save?: (property: PublicProperty) => void;
  }>({});

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);

      const extendedResult = await supabase
        .from("public_properties")
        .select(
          "id, title, city, area, address, rent_weekly, description, url, latitude, longitude, bedrooms, bathrooms, parking_spaces, pets_allowed, available_from, country_code, region, district, suburb, image_urls",
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      const { data, error } =
        extendedResult.error && isMissingColumnError(extendedResult.error)
          ? await supabase
              .from("public_properties")
              .select(
                "id, title, city, area, address, rent_weekly, description, url, latitude, longitude",
              )
              .eq("is_active", true)
              .order("created_at", {
                ascending: false,
              })
          : extendedResult;

      if (error) {
        console.error(error);
        setMessage("物件情報の読み込みに失敗しました。");
        setProperties([]);
      } else {
        setProperties((data || []) as PublicProperty[]);
      }

      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  const ensureSavedProperty = async (
    property: PublicProperty,
    authRedirectPath: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(buildLoginRedirect(authRedirectPath));
      return;
    }

    const saveUrl = property.url || "";
    const { data: existingProperty, error: existingError } = await supabase
      .from("saved_properties")
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

    if (existingProperty) {
      return { id: existingProperty.id as string, alreadySaved: true };
    }

    const extendedPayload = {
      user_id: user.id,
      title: property.title,
      url: saveUrl,
      inquiry_url: property.url,
      location: property.area || property.city || "",
      address: property.address || property.area || property.city || "",
      rent_weekly: property.rent_weekly,
      status: "気になる",
      latitude: property.latitude,
      longitude: property.longitude,
      source_type: "public",
      public_property_id: property.id,
    };

    const { data: insertedProperty, error } = await supabase
      .from("saved_properties")
      .insert(extendedPayload)
      .select("id")
      .single();

    if (!error) {
      return { id: insertedProperty.id as string, alreadySaved: false };
    }

    if (!isMissingColumnError(error)) {
      console.error(error);
      throw new Error("保存に失敗しました。時間をおいて再度お試しください。");
    }

    const { data: fallbackProperty, error: fallbackError } = await supabase
      .from("saved_properties")
      .insert({
        user_id: user.id,
        title: property.title,
        url: saveUrl,
        location: property.area || property.city || "",
        address: property.address || property.area || property.city || "",
        rent_weekly: property.rent_weekly,
        status: "気になる",
        latitude: property.latitude,
        longitude: property.longitude,
      })
      .select("id")
      .single();

    if (fallbackError) {
      console.error(fallbackError);
      throw new Error("保存に失敗しました。時間をおいて再度お試しください。");
    }

    return { id: fallbackProperty.id as string, alreadySaved: false };
  };

  const handleSaveProperty = async (property: PublicProperty) => {
    setMessage("");
    setSavingPropertyId(property.id);

    try {
      const result = await ensureSavedProperty(
        property,
        `/properties?action=save&public_property_id=${property.id}`,
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
      setSavingPropertyId(null);
    }
  };

  const handleInquiryProperty = async (property: PublicProperty) => {
    setMessage("");
    setSavingPropertyId(property.id);

    try {
      const result = await ensureSavedProperty(
        property,
        `/properties?action=inquiry&public_property_id=${property.id}`,
      );

      if (!result) return;

      router.push(`/mypage/property-inquiry?saved_property_id=${result.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "問い合わせ準備に失敗しました。時間をおいて再度お試しください。",
      );
      setSavingPropertyId(null);
    }
  };

  useEffect(() => {
    pendingActionHandlersRef.current = {
      inquiry: handleInquiryProperty,
      save: handleSaveProperty,
    };
  });

  useEffect(() => {
    if (isLoading || handledPendingActionRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const publicPropertyId = params.get("public_property_id");

    if (!action || !publicPropertyId) return;

    const property = properties.find((item) => item.id === publicPropertyId);

    if (!property) return;

    handledPendingActionRef.current = true;

    const timer = window.setTimeout(() => {
      if (action === "inquiry") {
        pendingActionHandlersRef.current.inquiry?.(property);
        return;
      }

      if (action === "save") {
        pendingActionHandlersRef.current.save?.(property);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isLoading, properties]);

  const formatRent = (rentWeekly: number | null) => {
    if (rentWeekly === null) {
      return "家賃未設定";
    }

    return `週 $${rentWeekly.toLocaleString()}`;
  };

  const filteredProperties = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedLocations = locationFilters.map((location) =>
      location.trim().toLowerCase(),
    );
    const minimumRent = minRentWeekly ? Number(minRentWeekly) : null;
    const maximumRent = maxRentWeekly ? Number(maxRentWeekly) : null;
    const minimumBedrooms = minBedrooms ? Number(minBedrooms) : null;
    const maximumBedrooms = maxBedrooms ? Number(maxBedrooms) : null;
    const minimumBathrooms = minBathrooms ? Number(minBathrooms) : null;
    const maximumBathrooms = maxBathrooms ? Number(maxBathrooms) : null;
    const minimumParkingSpaces = minParkingSpaces
      ? Number(minParkingSpaces)
      : null;
    const maximumParkingSpaces = maxParkingSpaces
      ? Number(maxParkingSpaces)
      : null;

    return properties.filter((property) => {
      const searchableText = [
        property.title,
        property.city,
        property.area,
        property.region,
        property.district,
        property.suburb,
        property.address,
        property.description,
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
        const propertyLocationText = [
          property.city,
          property.area,
          property.region,
          property.district,
          property.suburb,
          property.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesLocation = normalizedLocations.some((location) => {
          const parts = location
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean);

          return parts.some((part) => propertyLocationText.includes(part));
        });

        if (!matchesLocation) {
          return false;
        }
      }

      if (
        normalizedLocations.includes("現在地") &&
        filterCoordinates.latitude &&
        filterCoordinates.longitude &&
        property.latitude &&
        property.longitude
      ) {
        const distanceKm = calculateDistanceKm(
          {
            latitude: filterCoordinates.latitude,
            longitude: filterCoordinates.longitude,
          },
          {
            latitude: property.latitude,
            longitude: property.longitude,
          },
        );

        if (distanceKm > 50) return false;
      }

      if (
        minimumRent !== null &&
        (property.rent_weekly === null || property.rent_weekly < minimumRent)
      ) {
        return false;
      }

      if (
        maximumRent !== null &&
        (property.rent_weekly === null || property.rent_weekly > maximumRent)
      ) {
        return false;
      }

      if (
        minimumBedrooms !== null &&
        (property.bedrooms === null ||
          property.bedrooms === undefined ||
          property.bedrooms < minimumBedrooms)
      ) {
        return false;
      }

      if (
        maximumBedrooms !== null &&
        (property.bedrooms === null ||
          property.bedrooms === undefined ||
          property.bedrooms > maximumBedrooms)
      ) {
        return false;
      }

      if (
        minimumBathrooms !== null &&
        (property.bathrooms === null ||
          property.bathrooms === undefined ||
          property.bathrooms < minimumBathrooms)
      ) {
        return false;
      }

      if (
        maximumBathrooms !== null &&
        (property.bathrooms === null ||
          property.bathrooms === undefined ||
          property.bathrooms > maximumBathrooms)
      ) {
        return false;
      }

      if (
        minimumParkingSpaces !== null &&
        (property.parking_spaces === null ||
          property.parking_spaces === undefined ||
          property.parking_spaces < minimumParkingSpaces)
      ) {
        return false;
      }

      if (
        maximumParkingSpaces !== null &&
        (property.parking_spaces === null ||
          property.parking_spaces === undefined ||
          property.parking_spaces > maximumParkingSpaces)
      ) {
        return false;
      }

      if (availableFrom && property.available_from) {
        const availableDate = new Date(property.available_from);
        const desiredDate = new Date(availableFrom);

        if (availableDate > desiredDate) return false;
      }

      if (petsAllowedOnly && !property.pets_allowed) {
        return false;
      }

      return true;
    });
  }, [
    availableFrom,
    filterCoordinates,
    locationFilters,
    maxRentWeekly,
    maxBathrooms,
    maxBedrooms,
    maxParkingSpaces,
    minRentWeekly,
    minBathrooms,
    minBedrooms,
    minParkingSpaces,
    petsAllowedOnly,
    properties,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setLocationFilters([]);
    setFilterCoordinates({ latitude: null, longitude: null });
    setMinRentWeekly("");
    setMaxRentWeekly("");
    setMinBedrooms("");
    setMaxBedrooms("");
    setMinBathrooms("");
    setMaxBathrooms("");
    setMinParkingSpaces("");
    setMaxParkingSpaces("");
    setAvailableFrom("");
    setPetsAllowedOnly(false);
  };

  const mapProperties = useMemo(
    () =>
      filteredProperties
        .filter(
          (property) =>
            typeof property.latitude === "number" &&
            typeof property.longitude === "number",
        )
        .map((property) => ({
          id: property.id,
          lat: property.latitude as number,
          lng: property.longitude as number,
          label: property.title,
          subtitle:
            property.area ||
            property.suburb ||
            property.district ||
            property.city ||
            "地域未設定",
          details: [
            formatRent(property.rent_weekly),
            `ベッドルーム: ${property.bedrooms ?? "未設定"}`,
            `入居可能日: ${property.available_from || "要確認"}`,
          ],
          href: property.url || `/properties#property-${property.id}`,
        })),
    [filteredProperties],
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 公開物件
            </p>
            <h1 className="break-words text-2xl font-bold md:text-4xl">
              ワーホリ向け物件
            </h1>
            <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
              ニュージーランドでの住まい探しに使える公開物件を確認できます。気になる物件は保存して、問い合わせ文の作成に進めます。
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
              className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-800 sm:w-auto"
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
              <h2 className="text-xl font-bold text-gray-900">物件を探す</h2>
              <p className="mt-1 text-sm font-medium text-gray-700">
                エリア、家賃、部屋数などで絞り込めます。
              </p>
            </div>
            <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              {filteredProperties.length}件
            </p>
          </div>

          <div>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">検索</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900 placeholder:text-gray-600"
                placeholder="物件名、エリア、住所、説明で検索"
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
            <RangeNumberInput
              label="週家賃"
              prefix="$"
              minValue={minRentWeekly}
              maxValue={maxRentWeekly}
              onMinChange={setMinRentWeekly}
              onMaxChange={setMaxRentWeekly}
              minPlaceholder="200"
              maxPlaceholder="450"
            />
            <RangeNumberInput
              label="ベッドルーム数"
              minValue={minBedrooms}
              maxValue={maxBedrooms}
              onMinChange={setMinBedrooms}
              onMaxChange={setMaxBedrooms}
              minPlaceholder="1"
              maxPlaceholder="3"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <RangeNumberInput
              label="バスルーム数"
              minValue={minBathrooms}
              maxValue={maxBathrooms}
              onMinChange={setMinBathrooms}
              onMaxChange={setMaxBathrooms}
              minPlaceholder="1"
              maxPlaceholder="2"
            />
            <RangeNumberInput
              label="駐車場数"
              minValue={minParkingSpaces}
              maxValue={maxParkingSpaces}
              onMinChange={setMinParkingSpaces}
              onMaxChange={setMaxParkingSpaces}
              minPlaceholder="0"
              maxPlaceholder="1"
            />
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">
                入居可能日
              </span>
              <input
                type="date"
                value={availableFrom}
                onChange={(event) => setAvailableFrom(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
              />
            </label>
            <label className="flex min-h-[74px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 font-bold text-gray-900">
              <input
                type="checkbox"
                checked={petsAllowedOnly}
                onChange={(event) => setPetsAllowedOnly(event.target.checked)}
                className="h-5 w-5"
              />
              ペット可
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-700">
              条件に合う物件だけを表示しています。
            </p>
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
              物件情報を読み込み中です...
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">公開物件は準備中です</h2>
            <p className="mt-2 leading-7 text-gray-800">
              掲載申請が承認されると、このページに物件が表示されます。
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">
              条件に合う物件が見つかりません
            </h2>
            <p className="mt-2 leading-7 text-gray-800">
              検索キーワードやフィルター条件を変更して再度お試しください。
            </p>
          </div>
        ) : viewMode === "map" ? (
          <section className="rounded-2xl bg-white p-3 shadow md:p-4">
            {mapProperties.length ? (
              <MapView jobs={[]} properties={mapProperties} />
            ) : (
              <p className="p-4 font-medium text-gray-700">
                地図に表示できる座標付き物件がありません。リスト表示ではすべての物件を確認できます。
              </p>
            )}
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredProperties.map((property) => (
              <article
                id={`property-${property.id}`}
                key={property.id}
                className="flex min-h-full flex-col overflow-hidden rounded-2xl bg-white shadow"
              >
                {property.image_urls?.[0] ? (
                  // Supabase Storage URLs are configured at runtime.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={property.image_urls[0]}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : null}
                <div className="flex flex-1 flex-col p-4 md:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold text-gray-900 md:text-2xl">
                      {property.title}
                    </h2>
                    <p className="mt-1 font-medium text-gray-800">
                      {property.city || "都市未設定"}
                      {property.area ? ` / ${property.area}` : ""}
                    </p>
                  </div>

                  <div className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                    {formatRent(property.rent_weekly)}
                  </div>
                </div>

                {property.description && (
                  <p className="mt-4 line-clamp-4 text-sm font-medium leading-7 text-gray-800">
                    {property.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <PropertyFact
                    label="ベッド"
                    value={
                      property.bedrooms === null ||
                      property.bedrooms === undefined
                        ? "未設定"
                        : `${property.bedrooms}`
                    }
                  />
                  <PropertyFact
                    label="バス"
                    value={
                      property.bathrooms === null ||
                      property.bathrooms === undefined
                        ? "未設定"
                        : `${property.bathrooms}`
                    }
                  />
                  <PropertyFact
                    label="駐車場"
                    value={
                      property.parking_spaces === null ||
                      property.parking_spaces === undefined
                        ? "未設定"
                        : `${property.parking_spaces}`
                    }
                  />
                  <PropertyFact
                    label="ペット"
                    value={property.pets_allowed ? "可" : "要確認"}
                  />
                </div>

                <div className="mt-4 grid gap-2 text-sm font-medium text-gray-800">
                  {property.available_from ? (
                    <p>入居可能日: {property.available_from}</p>
                  ) : null}
                  {property.address ? (
                    <p className="break-words">住所: {property.address}</p>
                  ) : null}
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row sm:flex-wrap">
                  <button
                    onClick={() => handleSaveProperty(property)}
                    disabled={savingPropertyId === property.id}
                    className="w-full rounded-lg border border-blue-700 bg-white px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 sm:w-auto"
                  >
                    {savingPropertyId === property.id ? "保存中..." : "保存する"}
                  </button>

                  <button
                    onClick={() => handleInquiryProperty(property)}
                    disabled={savingPropertyId === property.id}
                    className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:bg-gray-300 sm:w-auto"
                  >
                    {savingPropertyId === property.id
                      ? "準備中..."
                      : "問い合わせる"}
                  </button>

                  {property.url && (
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
                    >
                      物件ページを見る
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
