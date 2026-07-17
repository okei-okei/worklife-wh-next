import type { NzLocation } from "@/lib/constants/nzLocations";

export type LocationLikeRecord = {
  location_master_id?: string | null;
  region_normalized?: string | null;
  territorial_authority_normalized?: string | null;
  major_name_normalized?: string | null;
  suburb_locality_normalized?: string | null;
  region?: string | null;
  district?: string | null;
  city?: string | null;
  area?: string | null;
  suburb?: string | null;
  location?: string | null;
};

export type NormalizedLocationPayload = {
  location_master_id: string | null;
  region_normalized: string | null;
  territorial_authority_normalized: string | null;
  major_name_normalized: string | null;
  suburb_locality_normalized: string | null;
};

export function getLocationDisplayName(record: LocationLikeRecord) {
  return (
    record.suburb_locality_normalized ||
    record.major_name_normalized ||
    record.suburb ||
    record.area ||
    record.location ||
    record.city ||
    record.district ||
    record.region ||
    "地域未設定"
  );
}

export function getNormalizedLocationPayload(
  location: NzLocation | null,
): NormalizedLocationPayload {
  return {
    location_master_id: location?.id || null,
    region_normalized: location?.region || null,
    territorial_authority_normalized:
      location?.territorialAuthority || location?.district || null,
    major_name_normalized: location?.majorName || null,
    suburb_locality_normalized: location?.suburbLocality || location?.area || null,
  };
}

export function getLocationLabelFromNormalized(location: NzLocation | null) {
  if (!location) return "";

  return [
    location.region,
    location.territorialAuthority || location.district,
    location.suburbLocality || location.area,
  ]
    .filter(Boolean)
    .join(" / ");
}
