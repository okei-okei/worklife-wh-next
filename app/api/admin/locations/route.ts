import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/server/adminAuth";
import {
  cleanLocationText,
  dbRowToLocationOption,
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
  const listingOptions = [
    ...(jobResult.error ? [] : jobResult.data || []),
    ...(propertyResult.error ? [] : propertyResult.data || []),
  ]
    .map((row) => locationOptionFromResolved(resolveLocation(row, baseOptions)))
    .filter((location): location is LocationOption => Boolean(location));

  return mergeLocationOptions([...baseOptions, ...listingOptions], true);
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
    return jsonError("同じ選択肢がすでに登録されています。", 409);
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
