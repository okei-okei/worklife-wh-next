import { nzLocations, type NzLocation } from "@/lib/constants/nzLocations";

export type LocationMasterRecord = {
  id: string;
  key: string;
  region: string;
  cityDistrict: string;
  locality: string;
  aliases: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
};

export type LocationOption = {
  databaseId: string | null;
  key: string;
  level?: "region" | "city_district" | "locality";
  region: string;
  cityDistrict: string;
  locality: string;
  aliases: string[];
  isActive: boolean;
  displayOrder: number;
};

export type ThreeLevelLocationValue = {
  locationMasterId: string | null;
  locationKey: string | null;
  region: string;
  cityDistrict: string;
  locality: string;
};

type NzLocationRow = {
  id?: string | null;
  location_key?: string | null;
  key?: string | null;
  linz_id?: string | null;
  region?: string | null;
  territorial_authority?: string | null;
  major_name?: string | null;
  suburb_locality?: string | null;
  additional_names?: string[] | null;
  aliases?: string[] | null;
  is_active?: boolean | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
};

export type LocationOptionRow = {
  id?: string | null;
  level?: "region" | "city_district" | "locality" | null;
  name?: string | null;
  parent_region?: string | null;
  parent_city_district?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  created_by?: string | null;
};

export function cleanLocationText(value: string | null | undefined) {
  return (value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeLocationForCompare(value: string | null | undefined) {
  return cleanLocationText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function createLocationKey(
  region: string,
  cityDistrict: string,
  locality: string,
) {
  return [region, cityDistrict, locality]
    .map(cleanLocationText)
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isUuid(value: string | null | undefined) {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

export function normalizeNullableUuid(value: string | null | undefined) {
  return isUuid(value) ? value || null : null;
}

export function locationCompareKey(
  region: string | null | undefined,
  cityDistrict: string | null | undefined,
  locality: string | null | undefined,
) {
  return [
    normalizeLocationForCompare(region),
    normalizeLocationForCompare(cityDistrict),
    normalizeLocationForCompare(locality),
  ].join("|");
}

export function parseAliases(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value.map(cleanLocationText).filter(Boolean);
  }

  return cleanLocationText(value)
    .split(",")
    .map(cleanLocationText)
    .filter(Boolean);
}

export function dbRowToLocationOption(row: NzLocationRow): LocationOption {
  const region = cleanLocationText(row.region);
  const cityDistrict = cleanLocationText(
    row.major_name || row.territorial_authority,
  );
  const locality = cleanLocationText(row.suburb_locality);
  const key =
    cleanLocationText(row.location_key || row.key) ||
    createLocationKey(region, cityDistrict, locality);

  return {
    databaseId: normalizeNullableUuid(row.id || null),
    key,
    level: "locality",
    region,
    cityDistrict,
    locality,
    aliases: parseAliases(row.aliases || row.additional_names || []),
    isActive: row.is_active !== false,
    displayOrder: row.display_order ?? 0,
  };
}

export function optionRowToLocationOption(row: LocationOptionRow): LocationOption {
  const level = row.level || "locality";
  const name = cleanLocationText(row.name);
  const region =
    level === "region" ? name : cleanLocationText(row.parent_region);
  const cityDistrict =
    level === "city_district"
      ? name
      : level === "locality"
        ? cleanLocationText(row.parent_city_district)
        : "";
  const locality = level === "locality" ? name : "";
  const key = createLocationKey(region, cityDistrict || level, locality || name);

  return {
    databaseId: normalizeNullableUuid(row.id || null),
    key,
    level,
    region,
    cityDistrict,
    locality,
    aliases: [],
    isActive: row.is_active !== false,
    displayOrder: 0,
  };
}

export function dbRowToLocationMasterRecord(
  row: NzLocationRow,
): LocationMasterRecord {
  const option = dbRowToLocationOption(row);
  return {
    id: option.databaseId || "",
    key: option.key,
    region: option.region,
    cityDistrict: option.cityDistrict,
    locality: option.locality,
    aliases: option.aliases,
    isActive: option.isActive,
    displayOrder: option.displayOrder,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    createdBy: row.created_by || null,
  };
}

export function staticLocationToOption(location: NzLocation): LocationOption {
  return {
    databaseId: normalizeNullableUuid(location.databaseId || location.id),
    level: "locality",
    key:
      location.key ||
      createLocationKey(location.region, location.district, location.area),
    region: location.region,
    cityDistrict: location.cityDistrict || location.district,
    locality: location.locality || location.area,
    aliases: location.aliases || location.additionalNames || [],
    isActive: location.isActive,
    displayOrder: 0,
  };
}

export function optionToNzLocation(option: LocationOption): NzLocation {
  const searchText = [
    option.region,
    option.cityDistrict,
    option.locality,
    ...option.aliases,
    "New Zealand",
    "NZ",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: option.databaseId || option.key,
    key: option.key,
    databaseId: option.databaseId,
    linzId: null,
    countryCode: "NZ",
    region: option.region,
    district: option.cityDistrict,
    cityDistrict: option.cityDistrict,
    area: option.locality,
    locality: option.locality,
    territorialAuthority: option.cityDistrict,
    majorName: option.cityDistrict,
    suburbLocality: option.locality,
    aliases: option.aliases,
    additionalNames: option.aliases,
    latitude: null,
    longitude: null,
    label: [option.region, option.cityDistrict, option.locality]
      .filter(Boolean)
      .join(" / "),
    searchText,
    isActive: option.isActive,
  };
}

export function mergeLocationOptions(
  dynamicOptions: LocationOption[],
  includeInactive = false,
) {
  const merged = new Map<string, LocationOption>();

  for (const location of nzLocations) {
    const option = staticLocationToOption(location);
    merged.set(
      locationCompareKey(option.region, option.cityDistrict, option.locality),
      option,
    );
  }

  for (const option of dynamicOptions) {
    if (!option.region) continue;
    if (!includeInactive && !option.isActive) continue;
    merged.set(
      locationCompareKey(option.region, option.cityDistrict, option.locality),
      option,
    );
  }

  return Array.from(merged.values()).sort((a, b) => {
    const order = a.displayOrder - b.displayOrder;
    if (order) return order;
    return `${a.region} ${a.cityDistrict} ${a.locality}`.localeCompare(
      `${b.region} ${b.cityDistrict} ${b.locality}`,
    );
  });
}

export function getStaticLocationOptions() {
  return nzLocations.map(staticLocationToOption);
}
