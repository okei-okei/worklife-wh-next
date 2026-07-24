"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ListMapToggle from "@/components/ListMapToggle";
import NzLocationPicker from "@/components/NzLocationPicker";
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

type PublicProperty = {
  id: string;
  title: string;
  city: string | null;
  area: string | null;
  address: string | null;
  rent_weekly: number | null;
  description: string | null;
  inquiry_method?: string | null;
  url: string | null;
  latitude: number | null;
  longitude: number | null;
  room_type?: string | null;
  available_from?: string | null;
  furnished?: boolean | null;
  bills_included?: boolean | null;
  utilities_included?: boolean | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  pets_allowed?: boolean | null;
  smoking_allowed?: boolean | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  location_master_id?: string | null;
  region_normalized?: string | null;
  territorial_authority_normalized?: string | null;
  major_name_normalized?: string | null;
  suburb_locality_normalized?: string | null;
  custom_locality?: string | null;
  image_urls?: string[] | null;
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

function getPropertyGeocodeQuery(property: PublicProperty) {
  return [
    property.address,
    property.country_code === "NZ" ? "New Zealand" : property.country_code,
  ]
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

function resolvePropertyCoordinates(
  property: PublicProperty,
  geocodedCoordinates: GeocodedCoordinates,
): { latitude: number; longitude: number } | null {
  if (geocodedCoordinates[property.id]) {
    return geocodedCoordinates[property.id];
  }

  return resolveNzAddressApproximateCoordinates(property);
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
    <div className="rounded-xl bg-gray-50 px-2 py-2 md:px-3">
      <p className="text-[11px] font-bold text-gray-600 md:text-xs">{label}</p>
      <p className="mt-1 text-xs font-bold text-gray-900 md:text-sm">{value}</p>
    </div>
  );
}

function formatUtilitiesIncluded(property: PublicProperty) {
  const value = property.utilities_included ?? property.bills_included;

  if (value === true) return "込み";
  if (value === false) return "別";
  return "要確認";
}

function formatNullableBoolean(value: boolean | null | undefined) {
  if (value === true) return "可";
  if (value === false) return "不可";
  return "要確認";
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
  const [currentLocation, setCurrentLocation] =
    useState<UserCoordinates | null>(null);
  const [currentLocationFocusKey, setCurrentLocationFocusKey] = useState(0);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(false);
  const [currentLocationMessage, setCurrentLocationMessage] = useState("");
  const [minRentWeekly, setMinRentWeekly] = useState("");
  const [maxRentWeekly, setMaxRentWeekly] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [maxBedrooms, setMaxBedrooms] = useState("");
  const [minBathrooms, setMinBathrooms] = useState("");
  const [maxBathrooms, setMaxBathrooms] = useState("");
  const [minParkingSpaces, setMinParkingSpaces] = useState("");
  const [maxParkingSpaces, setMaxParkingSpaces] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [petsFilter, setPetsFilter] = useState<
    "all" | "allowed" | "not_allowed" | "unknown"
  >("all");
  const [smokingFilter, setSmokingFilter] = useState<
    "all" | "allowed" | "not_allowed" | "unknown"
  >("all");
  const [utilitiesFilter, setUtilitiesFilter] = useState<
    "all" | "included" | "excluded"
  >("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPropertyIds, setExpandedPropertyIds] = useState<string[]>([]);
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<
    string | null
  >(null);
  const [geocodedPropertyCoordinates, setGeocodedPropertyCoordinates] =
    useState<GeocodedCoordinates>({});
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
          "id, title, city, area, address, rent_weekly, description, inquiry_method, url, latitude, longitude, bedrooms, bathrooms, parking_spaces, pets_allowed, smoking_allowed, utilities_included, bills_included, available_from, country_code, region, district, suburb, location_master_id, region_normalized, territorial_authority_normalized, major_name_normalized, suburb_locality_normalized, custom_locality, image_urls",
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
                "id, title, city, area, address, rent_weekly, description, inquiry_method, url, latitude, longitude, bedrooms, bathrooms, parking_spaces, pets_allowed, utilities_included, bills_included, available_from, country_code, region, district, suburb, image_urls",
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

    const saveUrl = property.url || `/properties#property-${property.id}`;
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
      location: getLocationDisplayName(property),
      location_master_id: property.location_master_id || null,
      region_normalized: property.region_normalized || null,
      territorial_authority_normalized:
        property.territorial_authority_normalized || null,
      major_name_normalized: property.major_name_normalized || null,
      suburb_locality_normalized: property.suburb_locality_normalized || null,
      address: property.address || property.area || property.city || "",
      rent_weekly: property.rent_weekly,
      status: "気になる",
      latitude: property.latitude,
      longitude: property.longitude,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking_spaces: property.parking_spaces,
      available_from: property.available_from,
      pets_allowed: property.pets_allowed,
      smoking_allowed: property.smoking_allowed,
      image_urls: property.image_urls || [],
      source_type: "public",
      public_property_id: property.id,
      utilities_included:
        property.utilities_included ?? property.bills_included ?? null,
    };

    const compatiblePayload = {
      user_id: user.id,
      title: property.title,
      url: saveUrl,
      location: getLocationDisplayName(property),
      location_master_id: property.location_master_id || null,
      region_normalized: property.region_normalized || null,
      territorial_authority_normalized:
        property.territorial_authority_normalized || null,
      major_name_normalized: property.major_name_normalized || null,
      suburb_locality_normalized: property.suburb_locality_normalized || null,
      address: property.address || property.area || property.city || "",
      rent_weekly: property.rent_weekly,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking_spaces: property.parking_spaces,
      available_from: property.available_from,
      pets_allowed: property.pets_allowed,
      utilities_included:
        property.utilities_included ?? property.bills_included ?? null,
      bills_included:
        property.utilities_included ?? property.bills_included ?? null,
      image_urls: property.image_urls || [],
      status: "気になる",
      latitude: property.latitude,
      longitude: property.longitude,
    };

    const basicPayload = {
      user_id: user.id,
      title: property.title,
      url: saveUrl,
      location: property.area || property.city || "",
      address: property.address || property.area || property.city || "",
      rent_weekly: property.rent_weekly,
      status: "気になる",
      latitude: property.latitude,
      longitude: property.longitude,
    };

    const insertAttempts: Array<Record<string, unknown>> = [
      extendedPayload,
      compatiblePayload,
      basicPayload,
    ];
    const insertErrors: string[] = [];

    for (const payload of insertAttempts) {
      const { data: insertedProperty, error } = await supabase
        .from("saved_properties")
        .insert(payload)
        .select("id")
        .single();

      if (!error) {
        return { id: insertedProperty.id as string, alreadySaved: false };
      }

      insertErrors.push(error.message);

      if (!isMissingColumnError(error)) {
        break;
      }
    }

    console.error("saved_properties insert failed:", insertErrors);

    const minimalRetryPayload = {
        user_id: user.id,
        title: property.title,
        url: saveUrl,
        location: property.area || property.city || "",
        address: property.address || property.area || property.city || "",
        rent_weekly: property.rent_weekly,
        status: "気になる",
      };

    const { data: fallbackProperty, error: fallbackError } = await supabase
      .from("saved_properties")
      .insert(minimalRetryPayload)
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
        property.region_normalized,
        property.district,
        property.territorial_authority_normalized,
        property.major_name_normalized,
        property.suburb_locality_normalized,
        property.custom_locality,
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
          property.region_normalized,
          property.territorial_authority_normalized,
          property.major_name_normalized,
          property.suburb_locality_normalized,
          property.custom_locality,
          property.region,
          property.district,
          property.suburb,
          property.area,
          property.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesLocation = normalizedLocations.some((location) => {
          const parts = location
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean);

          return parts.every((part) => propertyLocationText.includes(part));
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

      if (petsFilter === "allowed" && property.pets_allowed !== true) {
        return false;
      }

      if (petsFilter === "not_allowed" && property.pets_allowed !== false) {
        return false;
      }

      if (petsFilter === "unknown" && property.pets_allowed != null) {
        return false;
      }

      if (smokingFilter === "allowed" && property.smoking_allowed !== true) {
        return false;
      }

      if (smokingFilter === "not_allowed" && property.smoking_allowed !== false) {
        return false;
      }

      if (smokingFilter === "unknown" && property.smoking_allowed != null) {
        return false;
      }

      const utilitiesIncluded =
        property.utilities_included ?? property.bills_included ?? null;

      if (utilitiesFilter === "included" && utilitiesIncluded !== true) {
        return false;
      }

      if (utilitiesFilter === "excluded" && utilitiesIncluded !== false) {
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
    petsFilter,
    properties,
    searchQuery,
    smokingFilter,
    utilitiesFilter,
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
    setPetsFilter("all");
    setSmokingFilter("all");
    setUtilitiesFilter("all");
    setCurrentPage(1);
    setSelectedMapPropertyId(null);
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
      minRentWeekly,
      maxRentWeekly,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minParkingSpaces,
      maxParkingSpaces,
      availableFrom,
    ].filter(Boolean).length +
    (petsFilter !== "all" ? 1 : 0) +
    (smokingFilter !== "all" ? 1 : 0) +
    (utilitiesFilter !== "all" ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProperties = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProperties.slice(start, start + pageSize);
  }, [safeCurrentPage, filteredProperties]);

  useEffect(() => {
    if (viewMode !== "map") return;

    const targets = filteredProperties
      .filter(
        (property) =>
          !geocodedPropertyCoordinates[property.id] &&
          getPropertyGeocodeQuery(property),
      )
      .slice(0, 50);

    if (!targets.length) return;

    let isCancelled = false;

    const run = async () => {
      const entries = await Promise.all(
        targets.map(async (property) => {
          const coordinates = await fetchCoordinates(
            getPropertyGeocodeQuery(property),
          );
          if (
            typeof coordinates.latitude === "number" &&
            typeof coordinates.longitude === "number" &&
            hasValidCoordinates(coordinates.latitude, coordinates.longitude)
          ) {
            return [property.id, coordinates] as const;
          }
          return null;
        }),
      );

      if (isCancelled) return;

      setGeocodedPropertyCoordinates((current) => {
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
  }, [filteredProperties, geocodedPropertyCoordinates, viewMode]);

  const mapProperties = useMemo(
    () =>
      filteredProperties
        .slice(0, maxMapPoints)
        .map((property) => {
          const coordinates = resolvePropertyCoordinates(
            property,
            geocodedPropertyCoordinates,
          );
          if (!coordinates) return null;

          return {
            id: property.id,
            type: "property" as const,
            title: property.title,
            locationLabel: getLocationDisplayName(property),
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            priceLabel: formatRent(property.rent_weekly),
            metaLabel:
              property.bedrooms === null || property.bedrooms === undefined
                ? "ベッドルーム未設定"
                : `${property.bedrooms} bed`,
          };
        })
        .filter((property): property is NonNullable<typeof property> =>
          Boolean(property),
        ),
    [filteredProperties, geocodedPropertyCoordinates],
  );

  const propertiesWithoutCoordinates =
    Math.min(filteredProperties.length, maxMapPoints) - mapProperties.length;

  const selectedMapProperty = useMemo(
    () =>
      filteredProperties.find(
        (property) => property.id === selectedMapPropertyId,
      ) || null,
    [filteredProperties, selectedMapPropertyId],
  );

  useEffect(() => {
    if (viewMode !== "map") return;
    void trackMetric("public_property_map_view", {
      eventType: "map_view",
      targetType: "public_properties",
      pagePath: "/properties",
      metadata: {
        visibleCount: mapProperties.length,
        withoutCoordinates: propertiesWithoutCoordinates,
      },
    });
  }, [mapProperties.length, propertiesWithoutCoordinates, viewMode]);

  const handleSelectMapProperty = (id: string) => {
    setSelectedMapPropertyId(id);
    const selected = filteredProperties.find((property) => property.id === id);
    void trackMetric("public_property_pin_select", {
      eventType: "map_pin_select",
      targetType: "public_property",
      targetId: id,
      pagePath: "/properties",
      metadata: {
        propertyId: id,
        title: selected?.title || null,
        address: selected?.address || null,
        rentWeekly: selected?.rent_weekly || null,
      },
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 公開物件
            </p>
            <h1 className="break-words text-2xl font-bold md:text-4xl">
              ワーホリ向け物件
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-800 md:text-base md:leading-7">
              ニュージーランドでの住まい探しに使える公開物件を確認できます。気になる物件は保存して、問い合わせ文の作成に進めます。
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
              className="w-full rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-800 sm:w-auto md:px-4 md:py-3"
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

        <section className="rounded-2xl bg-white p-3 shadow md:p-6">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between md:mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">物件を探す</h2>
              <p className="mt-1 text-xs font-medium text-gray-700 md:text-sm">
                エリア、家賃、部屋数などで絞り込めます。
              </p>
            </div>
            <p className="w-fit rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 md:px-3 md:text-sm">
              {filteredProperties.length}件
            </p>
          </div>

          <div>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">検索</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:py-3 md:text-base"
                placeholder="物件名、エリア、住所、説明で検索"
              />
            </label>
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

          <div className={`${isFilterOpen ? "grid" : "hidden"} mt-3 grid-cols-2 gap-3 md:mt-4 md:grid lg:grid-cols-5 lg:gap-4`}>
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
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
              />
            </label>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">
                ペット
              </span>
              <select
                value={petsFilter}
                onChange={(event) =>
                  setPetsFilter(
                    event.target.value as
                      | "all"
                      | "allowed"
                      | "not_allowed"
                      | "unknown",
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
              >
                <option value="all">全て</option>
                <option value="allowed">ペット可</option>
                <option value="not_allowed">ペット不可</option>
                <option value="unknown">要確認</option>
              </select>
            </label>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">
                喫煙
              </span>
              <select
                value={smokingFilter}
                onChange={(event) =>
                  setSmokingFilter(
                    event.target.value as
                      | "all"
                      | "allowed"
                      | "not_allowed"
                      | "unknown",
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
              >
                <option value="all">全て</option>
                <option value="allowed">喫煙可</option>
                <option value="not_allowed">喫煙不可</option>
                <option value="unknown">要確認</option>
              </select>
            </label>
            <label className="block rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-bold text-gray-900">
                光熱費込み
              </span>
              <select
                value={utilitiesFilter}
                onChange={(event) =>
                  setUtilitiesFilter(
                    event.target.value as "all" | "included" | "excluded",
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:py-3 md:text-base"
              >
                <option value="all">全て</option>
                <option value="included">光熱費込み</option>
                <option value="excluded">光熱費別</option>
              </select>
            </label>
          </div>

          <div className={`${isFilterOpen ? "flex" : "hidden"} mt-3 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-4 md:flex`}>
            <p className="text-xs font-medium text-gray-700 md:text-sm">
              条件に合う物件だけを表示しています。
            </p>
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
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-3 shadow md:p-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1 text-sm font-bold text-gray-700 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    地図上のピンを選択すると、下に選択中の物件を1件だけ表示します。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      一覧表示中: {paginatedProperties.length}件
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      地図表示中: {mapProperties.length}件
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      条件に一致: {filteredProperties.length}件
                    </span>
                    {propertiesWithoutCoordinates > 0 ? (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                        位置情報なし: {propertiesWithoutCoordinates}件
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
                  points={mapProperties}
                  selectedId={selectedMapProperty?.id}
                  onSelect={handleSelectMapProperty}
                  type="property"
                  currentLocation={currentLocation}
                  currentLocationFocusKey={currentLocationFocusKey}
                />
                {!mapProperties.length ? (
                  <div className="space-y-2 rounded-xl border border-dashed border-gray-300 p-4 font-medium text-gray-700">
                  <p>
                    地図に表示できる座標付き物件がありません。リスト表示ではすべての物件を確認できます。
                  </p>
                  <p className="text-sm">
                    位置情報がないため地図に表示されない項目: {propertiesWithoutCoordinates}件
                    <br />
                    地図表示は条件に合う座標付き物件を最大100件まで表示します。
                  </p>
                  </div>
                ) : null}
              </div>
            </section>

            {selectedMapProperty ? (
              <article
                id={`property-${selectedMapProperty.id}`}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                {selectedMapProperty.image_urls?.length ? (
                  <div className="flex gap-2 overflow-x-auto bg-gray-50 p-2">
                    {selectedMapProperty.image_urls.map((imageUrl, index) => (
                      <div
                        key={`${selectedMapProperty.id}-map-${imageUrl}`}
                        className="relative h-24 w-40 flex-none overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 md:h-28 md:w-48"
                      >
                        {/* Supabase Storage URLs are configured at runtime. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={`${selectedMapProperty.title}の画像${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-700">
                        選択中の物件
                      </p>
                      <h2 className="mt-1 break-words text-lg font-bold text-gray-900 md:text-xl">
                        {selectedMapProperty.title}
                      </h2>
                      <p className="mt-1 font-medium text-gray-800">
                        {selectedMapProperty.city || "都市未設定"}
                        {selectedMapProperty.area
                          ? ` / ${selectedMapProperty.area}`
                          : ""}
                      </p>
                      {selectedMapProperty.address ? (
                        <p className="mt-1 break-words text-sm font-medium text-gray-700">
                          住所: {selectedMapProperty.address}
                        </p>
                      ) : null}
                    </div>
                    <div className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
                      {formatRent(selectedMapProperty.rent_weekly)}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <PropertyFact
                      label="ベッド"
                      value={
                        selectedMapProperty.bedrooms === null ||
                        selectedMapProperty.bedrooms === undefined
                          ? "未設定"
                          : `${selectedMapProperty.bedrooms}`
                      }
                    />
                    <PropertyFact
                      label="バス"
                      value={
                        selectedMapProperty.bathrooms === null ||
                        selectedMapProperty.bathrooms === undefined
                          ? "未設定"
                          : `${selectedMapProperty.bathrooms}`
                      }
                    />
                    <PropertyFact
                      label="駐車場"
                      value={
                        selectedMapProperty.parking_spaces === null ||
                        selectedMapProperty.parking_spaces === undefined
                          ? "未設定"
                          : `${selectedMapProperty.parking_spaces}`
                      }
                    />
                    <PropertyFact
                      label="光熱費"
                      value={formatUtilitiesIncluded(selectedMapProperty)}
                    />
                    <PropertyFact
                      label="ペット"
                      value={formatNullableBoolean(
                        selectedMapProperty.pets_allowed,
                      )}
                    />
                    <PropertyFact
                      label="喫煙"
                      value={formatNullableBoolean(
                        selectedMapProperty.smoking_allowed,
                      )}
                    />
                  </div>

                  <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-800">
                    <div>
                      <p className="font-bold text-gray-900">物件説明</p>
                      <p className="mt-1 whitespace-pre-wrap break-words">
                        {selectedMapProperty.description ||
                          "物件説明は未設定です。"}
                      </p>
                    </div>
                    {selectedMapProperty.inquiry_method ? (
                      <div>
                        <p className="font-bold text-gray-900">問い合わせ方法</p>
                        <p className="mt-1 whitespace-pre-wrap break-words">
                          {selectedMapProperty.inquiry_method}
                        </p>
                      </div>
                    ) : null}
                    {selectedMapProperty.address ? (
                      <div>
                        <p className="font-bold text-gray-900">住所</p>
                        <p className="mt-1 whitespace-pre-wrap break-words">
                          {selectedMapProperty.address}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      onClick={() => handleSaveProperty(selectedMapProperty)}
                      disabled={savingPropertyId === selectedMapProperty.id}
                      className="w-full rounded-lg border border-blue-700 bg-white px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 sm:w-auto"
                    >
                      {savingPropertyId === selectedMapProperty.id
                        ? "保存中..."
                        : "保存する"}
                    </button>
                    <button
                      onClick={() => handleInquiryProperty(selectedMapProperty)}
                      disabled={savingPropertyId === selectedMapProperty.id}
                      className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:bg-gray-300 sm:w-auto"
                    >
                      {savingPropertyId === selectedMapProperty.id
                        ? "準備中..."
                        : "問い合わせる"}
                    </button>
                    {selectedMapProperty.url ? (
                      <a
                        href={selectedMapProperty.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
                      >
                        物件ページを見る
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ) : mapProperties.length ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm font-bold text-gray-700">
                表示したい物件のピンを地図上で選択してください。
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProperties.map((property) => (
              <article
                id={`property-${property.id}`}
                key={property.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow"
              >
                {property.image_urls?.length ? (
                  <div className="flex gap-2 overflow-x-auto bg-gray-50 p-2">
                    {property.image_urls.map((imageUrl, index) => (
                      <div
                        key={`${property.id}-${imageUrl}`}
                        className={`relative flex-none overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 ${
                          expandedPropertyIds.includes(property.id)
                            ? "h-40 w-64 sm:h-44 sm:w-72 md:h-48 md:w-80"
                            : "h-20 w-32 sm:h-24 sm:w-40 md:h-28 md:w-44"
                        }`}
                      >
                        {/* Supabase Storage URLs are configured at runtime. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={`${property.title}の画像${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-3 md:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-bold text-gray-900 md:text-xl">
                      {property.title}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-gray-800 md:text-base">
                      {property.city || "都市未設定"}
                      {property.area ? ` / ${property.area}` : ""}
                    </p>
                  </div>

                  <div className="w-fit rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 md:px-3 md:py-1.5 md:text-sm">
                    {formatRent(property.rent_weekly)}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-3">
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
                    label="光熱費"
                    value={formatUtilitiesIncluded(property)}
                  />
                  <PropertyFact
                    label="ペット"
                    value={formatNullableBoolean(property.pets_allowed)}
                  />
                  <PropertyFact
                    label="喫煙"
                    value={formatNullableBoolean(property.smoking_allowed)}
                  />
                </div>

                <div className="mt-2 grid gap-1.5 text-xs font-medium text-gray-800 md:mt-3 md:text-sm">
                  {property.available_from ? (
                    <p>入居可能日: {property.available_from}</p>
                  ) : null}
                  {property.address ? (
                    <p className="line-clamp-2 break-words">住所: {property.address}</p>
                  ) : null}
                </div>

                {expandedPropertyIds.includes(property.id) ? (
                  <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-800 md:mt-4 md:p-4 md:leading-7">
                    <div>
                      <p className="font-bold text-gray-900">物件説明</p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {property.description || "物件説明は未設定です。"}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">問い合わせ方法</p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {property.inquiry_method ||
                          (property.url
                            ? "外部ページから問い合わせ方法を確認してください。"
                            : "問い合わせ方法は未設定です。")}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap md:pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPropertyIds((current) =>
                        current.includes(property.id)
                          ? current.filter((id) => id !== property.id)
                          : [...current, property.id],
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto md:px-4 md:py-3"
                  >
                    {expandedPropertyIds.includes(property.id)
                      ? "詳細を閉じる"
                      : "詳細を見る"}
                  </button>
                  <button
                    onClick={() => handleSaveProperty(property)}
                    disabled={savingPropertyId === property.id}
                    className="w-full rounded-lg border border-blue-700 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 sm:w-auto md:px-4 md:py-3"
                  >
                    {savingPropertyId === property.id ? "保存中..." : "保存する"}
                  </button>

                  <button
                    onClick={() => handleInquiryProperty(property)}
                    disabled={savingPropertyId === property.id}
                    className="w-full rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:bg-gray-300 sm:w-auto md:px-4 md:py-3"
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto md:px-4 md:py-3"
                    >
                      物件ページを見る
                    </a>
                  )}
                </div>
                </div>
              </article>
            ))}
            <div className="rounded-2xl bg-white p-3 shadow md:col-span-2 xl:col-span-3">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm font-bold text-gray-700">
                  {filteredProperties.length}件中 {(safeCurrentPage - 1) * pageSize + 1}
                  〜{Math.min(safeCurrentPage * pageSize, filteredProperties.length)}件を表示
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
