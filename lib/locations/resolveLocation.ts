import {
  cleanLocationText,
  locationCompareKey,
  type LocationOption,
} from "@/lib/locations/locationMaster";

export type LocationSourceRecord = {
  location_master_id?: string | null;
  region_normalized?: string | null;
  territorial_authority_normalized?: string | null;
  major_name_normalized?: string | null;
  suburb_locality_normalized?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
  area?: string | null;
  suburb?: string | null;
  locality?: string | null;
  location?: string | null;
  custom_locality?: string | null;
  submission_payload?: unknown;
};

export type ResolvedLocation = {
  region: string;
  cityDistrict: string;
  locality: string;
  label: string;
  source: {
    region: string | null;
    cityDistrict: string | null;
    locality: string | null;
  };
  isComplete: boolean;
  needsReview: boolean;
  conflictFields: string[];
};

function useful(value: unknown) {
  if (typeof value !== "string") return "";
  const cleaned = cleanLocationText(value);
  if (!cleaned) return "";
  if (["null", "undefined"].includes(cleaned.toLowerCase())) return "";
  return cleaned;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function payloadLocation(record: LocationSourceRecord) {
  const payload = asRecord(record.submission_payload);
  const location = asRecord(payload.location);
  return { payload, location };
}

function firstCandidate(candidates: Array<[string, unknown]>) {
  for (const [source, value] of candidates) {
    const text = useful(value);
    if (text) return { source, value: text };
  }
  return { source: null, value: "" };
}

function conflicts(candidates: Array<[string, unknown]>) {
  const values = candidates
    .map(([source, value]) => ({ source, value: useful(value) }))
    .filter((item) => item.value);
  const unique = new Map<string, string[]>();

  for (const item of values) {
    const key = locationCompareKey(item.value, "", "");
    unique.set(key, [...(unique.get(key) || []), item.source]);
  }

  return unique.size > 1
    ? Array.from(unique.values())
        .flat()
        .filter(Boolean)
    : [];
}

export function resolveLocation(
  record: LocationSourceRecord,
  locationOptions: LocationOption[] = [],
): ResolvedLocation {
  const master = record.location_master_id
    ? locationOptions.find(
        (location) => location.databaseId === record.location_master_id,
      )
    : null;
  const { payload, location } = payloadLocation(record);

  const regionCandidates: Array<[string, unknown]> = [
    ["location_master_id", master?.region],
    ["region_normalized", record.region_normalized],
    ["region", record.region],
    ["payload.region", payload.region],
    ["payload.location.region", location.region],
  ];
  const cityCandidates: Array<[string, unknown]> = [
    ["location_master_id", master?.cityDistrict],
    ["territorial_authority_normalized", record.territorial_authority_normalized],
    ["city", record.city],
    ["district", record.district],
    ["major_name_normalized", record.major_name_normalized],
    ["payload.district", payload.district],
    ["payload.city", payload.city],
    ["payload.location.district", location.district],
  ];
  const localityCandidates: Array<[string, unknown]> = [
    ["location_master_id", master?.locality],
    ["suburb_locality_normalized", record.suburb_locality_normalized],
    ["suburb", record.suburb],
    ["locality", record.locality],
    ["area", record.area],
    ["custom_locality", record.custom_locality],
    ["payload.suburb", payload.suburb],
    ["payload.area", payload.area],
    ["payload.location.suburb", location.suburb],
    ["payload.location.area", location.area],
  ];

  const region = firstCandidate(regionCandidates);
  const cityDistrict = firstCandidate(cityCandidates);
  const locality = firstCandidate(localityCandidates);
  const conflictFields = [
    ...conflicts(regionCandidates),
    ...conflicts(cityCandidates),
    ...conflicts(localityCandidates),
  ];

  const label = [region.value, cityDistrict.value, locality.value]
    .filter(Boolean)
    .join("・");

  return {
    region: region.value,
    cityDistrict: cityDistrict.value,
    locality: locality.value,
    label,
    source: {
      region: region.source,
      cityDistrict: cityDistrict.source,
      locality: locality.source,
    },
    isComplete: Boolean(region.value && cityDistrict.value && locality.value),
    needsReview: conflictFields.length > 0,
    conflictFields,
  };
}

export function locationOptionFromResolved(
  resolved: ResolvedLocation,
): LocationOption | null {
  if (!resolved.region) return null;

  return {
    databaseId: null,
    key: [
      resolved.region,
      resolved.cityDistrict || "unknown-city",
      resolved.locality || "unknown-area",
    ]
      .join("-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    level: resolved.locality
      ? "locality"
      : resolved.cityDistrict
        ? "city_district"
        : "region",
    origin: "listing",
    region: resolved.region,
    cityDistrict: resolved.cityDistrict,
    locality: resolved.locality,
    aliases: [],
    isActive: true,
    displayOrder: 0,
  };
}
