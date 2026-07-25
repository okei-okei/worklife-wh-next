import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/server/adminAuth";
import {
  cleanLocationText,
  dbRowToLocationOption,
  isUuid,
  locationCompareKey,
  mergeLocationOptions,
  optionRowToLocationOption,
  type LocationOption,
} from "@/lib/locations/locationMaster";
import {
  locationOptionFromResolved,
  resolveLocation,
} from "@/lib/locations/resolveLocation";

type AddLocationBody = {
  level?: "region" | "city_district" | "locality";
  name?: string | null;
  parentRegion?: string | null;
  parentCityDistrict?: string | null;
};

type DeleteLocationBody = {
  id?: string | null;
};

type ListingUsageRow = {
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
  custom_locality?: string | null;
};

export type AdminLocationOption = LocationOption & {
  jobUsageCount: number;
  propertyUsageCount: number;
  canDelete: boolean;
  deleteReason: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function revalidateLocationConsumers() {
  [
    "/jobs",
    "/properties",
    "/admin/locations",
    "/admin/listings",
    "/company/submit",
  ].forEach((path) => revalidatePath(path));
}

function normalizeBody(body: AddLocationBody | null) {
  return {
    level: body?.level,
    name: cleanLocationText(body?.name),
    parentRegion: cleanLocationText(body?.parentRegion),
    parentCityDistrict: cleanLocationText(body?.parentCityDistrict),
  };
}

function validateBody(input: ReturnType<typeof normalizeBody>) {
  if (
    input.level !== "region" &&
    input.level !== "city_district" &&
    input.level !== "locality"
  ) {
    return "追加する階層を確認してください。";
  }
  if (!input.name) return "追加する名称を入力してください。";
  if (input.name.length > 120) return "名称は120文字以内で入力してください。";
  if (input.level !== "region" && !input.parentRegion) {
    return "Regionを選択してください。";
  }
  if (input.level === "locality" && !input.parentCityDistrict) {
    return "City / Districtを選択してください。";
  }
  return null;
}

function isDuplicate(input: ReturnType<typeof normalizeBody>, options: LocationOption[]) {
  if (input.level === "region") {
    return options.some(
      (option) =>
        locationCompareKey(option.region, "", "") ===
        locationCompareKey(input.name, "", ""),
    );
  }

  if (input.level === "city_district") {
    return options.some(
      (option) =>
        locationCompareKey(option.region, option.cityDistrict, "") ===
        locationCompareKey(input.parentRegion, input.name, ""),
    );
  }

  return options.some(
    (option) =>
      locationCompareKey(option.region, option.cityDistrict, option.locality) ===
      locationCompareKey(input.parentRegion, input.parentCityDistrict, input.name),
  );
}

function addUsage(
  usageMap: Map<string, number>,
  rows: ListingUsageRow[],
  baseOptions: LocationOption[],
) {
  for (const row of rows) {
    const resolved = resolveLocation(row, baseOptions);
    if (!resolved.region) continue;
    const key = locationCompareKey(
      resolved.region,
      resolved.cityDistrict,
      resolved.locality,
    );
    usageMap.set(key, (usageMap.get(key) || 0) + 1);
  }
}

function hasChildLocation(location: LocationOption, allLocations: LocationOption[]) {
  if (location.level === "locality") return false;

  return allLocations.some((candidate) => {
    if (!candidate.isActive) return false;
    if (candidate.key === location.key) return false;

    if (location.level === "region") {
      return (
        locationCompareKey(candidate.region, "", "") ===
          locationCompareKey(location.region, "", "") &&
        Boolean(candidate.cityDistrict || candidate.locality)
      );
    }

    return (
      locationCompareKey(candidate.region, candidate.cityDistrict, "") ===
        locationCompareKey(location.region, location.cityDistrict, "") &&
      Boolean(candidate.locality)
    );
  });
}

function decorateAdminLocations(
  locations: LocationOption[],
  jobUsage: Map<string, number>,
  propertyUsage: Map<string, number>,
): AdminLocationOption[] {
  return locations.map((location) => {
    const key = locationCompareKey(
      location.region,
      location.cityDistrict,
      location.locality,
    );
    const jobUsageCount = jobUsage.get(key) || 0;
    const propertyUsageCount = propertyUsage.get(key) || 0;
    const usageCount = jobUsageCount + propertyUsageCount;
    const hasChildren = hasChildLocation(location, locations);
    let deleteReason = "";

    if (usageCount > 0) {
      deleteReason = `求人${jobUsageCount}件・物件${propertyUsageCount}件で使用中`;
    } else if (hasChildren) {
      deleteReason = "下位の地域が登録されているため削除できません。";
    } else if (location.origin !== "admin" || !location.databaseId) {
      deleteReason = "この地域は基本選択肢のため削除できません。";
    }

    return {
      ...location,
      jobUsageCount,
      propertyUsageCount,
      canDelete: !deleteReason,
      deleteReason,
    };
  });
}

async function loadAllLocationOptions(admin: Awaited<ReturnType<typeof getAdminContext>>) {
  if (!admin.ok) return [];

  const [masterResult, optionResult, jobResult, propertyResult] = await Promise.all([
    admin.serviceClient
      .from("nz_locations")
      .select(
        "id, location_key, region, territorial_authority, major_name, suburb_locality, additional_names, is_active, display_order",
      )
      .order("region", { ascending: true })
      .order("major_name", { ascending: true })
      .order("suburb_locality", { ascending: true }),
    admin.serviceClient
      .from("location_options")
      .select("id, level, name, parent_region, parent_city_district, is_active, created_at, created_by")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    admin.serviceClient
      .from("public_jobs")
      .select(
        "location_master_id, region_normalized, territorial_authority_normalized, major_name_normalized, suburb_locality_normalized, region, city, district, area, suburb, custom_locality",
      )
      .eq("is_active", true),
    admin.serviceClient
      .from("public_properties")
      .select(
        "location_master_id, region_normalized, territorial_authority_normalized, major_name_normalized, suburb_locality_normalized, region, city, district, area, suburb, custom_locality",
      )
      .eq("is_active", true),
  ]);

  const baseOptions = [
    ...(masterResult.error ? [] : (masterResult.data || []).map(dbRowToLocationOption)),
    ...(optionResult.error ? [] : (optionResult.data || []).map(optionRowToLocationOption)),
  ];
  const jobRows = jobResult.error ? [] : (jobResult.data || []);
  const propertyRows = propertyResult.error ? [] : (propertyResult.data || []);
  const listingOptions = [...jobRows, ...propertyRows]
    .map((row) => locationOptionFromResolved(resolveLocation(row, baseOptions)))
    .filter((location): location is LocationOption => Boolean(location));
  const jobUsage = new Map<string, number>();
  const propertyUsage = new Map<string, number>();

  addUsage(jobUsage, jobRows, baseOptions);
  addUsage(propertyUsage, propertyRows, baseOptions);

  return decorateAdminLocations(
    mergeLocationOptions([...baseOptions, ...listingOptions], true),
    jobUsage,
    propertyUsage,
  );
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const locations = await loadAllLocationOptions(admin);
  return NextResponse.json({ locations });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json().catch(() => null)) as AddLocationBody | null;
  const input = normalizeBody(body);
  const validationError = validateBody(input);
  if (validationError) return jsonError(validationError);

  const options = await loadAllLocationOptions(admin);
  if (isDuplicate(input, options)) {
    return jsonError("同じ地域がすでに選択肢に存在します。", 409);
  }

  const { data, error } = await admin.serviceClient
    .from("location_options")
    .insert({
      level: input.level,
      name: input.name,
      parent_region: input.level === "region" ? null : input.parentRegion,
      parent_city_district:
        input.level === "locality" ? input.parentCityDistrict : null,
      is_active: true,
      created_by: admin.user.id,
    })
    .select("id, level, name, parent_region, parent_city_district, is_active, created_at, created_by")
    .single();

  if (error) return jsonError(error.message, 500);

  revalidateLocationConsumers();
  return NextResponse.json({ location: optionRowToLocationOption(data) });
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json().catch(() => null)) as DeleteLocationBody | null;
  const id = cleanLocationText(body?.id);
  if (!isUuid(id)) return jsonError("削除する地域を確認してください。");

  const locations = await loadAllLocationOptions(admin);
  const target = locations.find((location) => location.databaseId === id);
  if (!target) return jsonError("対象の地域が見つかりません。", 404);
  if (!target.canDelete) {
    return jsonError(target.deleteReason || "この地域は削除できません。", 409);
  }

  const { error } = await admin.serviceClient
    .from("location_options")
    .update({ is_active: false })
    .eq("id", id)
    .eq("is_active", true);

  if (error) return jsonError(error.message, 500);

  revalidateLocationConsumers();
  return NextResponse.json({ ok: true });
}
