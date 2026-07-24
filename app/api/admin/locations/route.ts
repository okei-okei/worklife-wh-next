import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminContext } from "@/lib/server/adminAuth";
import {
  cleanLocationText,
  createLocationKey,
  dbRowToLocationMasterRecord,
  locationCompareKey,
  normalizeNullableUuid,
  parseAliases,
} from "@/lib/locations/locationMaster";

type LocationBody = {
  id?: string | null;
  region?: string | null;
  cityDistrict?: string | null;
  locality?: string | null;
  aliases?: string[] | string | null;
  displayOrder?: number | string | null;
  isActive?: boolean | null;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isPermissionDenied(error: { message?: string; code?: string } | null) {
  return (
    error?.code === "42501" ||
    Boolean(error?.message?.toLowerCase().includes("permission denied"))
  );
}

function normalizeBody(body: LocationBody) {
  const region = cleanLocationText(body.region);
  const cityDistrict = cleanLocationText(body.cityDistrict);
  const locality = cleanLocationText(body.locality);
  const aliases = parseAliases(body.aliases);
  const displayOrder = Number(body.displayOrder ?? 0);

  return {
    region,
    cityDistrict,
    locality,
    aliases,
    displayOrder: Number.isFinite(displayOrder) ? Math.trunc(displayOrder) : 0,
    isActive: body.isActive !== false,
    key: createLocationKey(region, cityDistrict, locality),
  };
}

function validateLocation(input: ReturnType<typeof normalizeBody>) {
  if (!input.region) return "Regionを入力してください。";
  if (!input.cityDistrict) return "City / Districtを入力してください。";
  if (!input.locality) return "Area / Suburbを入力してください。";
  if (input.region.length > 80) return "Regionは80文字以内で入力してください。";
  if (input.cityDistrict.length > 120) {
    return "City / Districtは120文字以内で入力してください。";
  }
  if (input.locality.length > 120) {
    return "Area / Suburbは120文字以内で入力してください。";
  }
  if (!input.key) return "地域キーを生成できませんでした。";
  return null;
}

async function usageCounts(client: SupabaseClient, ids: string[]) {
  const counts = new Map<string, { jobs: number; properties: number }>();
  ids.forEach((id) => counts.set(id, { jobs: 0, properties: 0 }));

  await Promise.all(
    ids.map(async (id) => {
      const [jobs, properties] = await Promise.all([
        client
          .from("public_jobs")
          .select("id", { count: "exact", head: true })
          .eq("location_master_id", id),
        client
          .from("public_properties")
          .select("id", { count: "exact", head: true })
          .eq("location_master_id", id),
      ]);
      counts.set(id, {
        jobs: jobs.count || 0,
        properties: properties.count || 0,
      });
    }),
  );

  return counts;
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

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const region = cleanLocationText(searchParams.get("region"));
  const cityDistrict = cleanLocationText(searchParams.get("cityDistrict"));
  const search = cleanLocationText(searchParams.get("search"));
  const active = searchParams.get("active");

  let query = admin.serviceClient
    .from("nz_locations")
    .select(
      "id, location_key, region, territorial_authority, major_name, suburb_locality, additional_names, is_active, display_order, created_at, updated_at, created_by",
    )
    .order("display_order", { ascending: true })
    .order("region", { ascending: true })
    .order("major_name", { ascending: true })
    .order("suburb_locality", { ascending: true });

  if (region) query = query.eq("region", region);
  if (cityDistrict) query = query.eq("major_name", cityDistrict);
  if (active === "active") query = query.eq("is_active", true);
  if (active === "inactive") query = query.eq("is_active", false);
  if (search) {
    query = query.or(
      `suburb_locality.ilike.%${search}%,major_name.ilike.%${search}%,region.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    if (isPermissionDenied(error)) {
      return NextResponse.json({
        locations: [],
        warning:
          "nz_locationsの権限設定が未反映です。supabase/location_management.sql のGRANT/RLSを実行してください。",
      });
    }
    return jsonError(error.message, 500);
  }

  const records = (data || []).map(dbRowToLocationMasterRecord);
  const counts = await usageCounts(
    admin.serviceClient,
    records.map((record) => record.id).filter(Boolean),
  );

  return NextResponse.json({
    locations: records.map((record) => ({
      ...record,
      usage: counts.get(record.id) || { jobs: 0, properties: 0 },
    })),
  });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json().catch(() => null)) as LocationBody | null;
  if (!body) return jsonError("入力内容を確認してください。");

  const input = normalizeBody(body);
  const validationError = validateLocation(input);
  if (validationError) return jsonError(validationError);

  const compareKey = locationCompareKey(
    input.region,
    input.cityDistrict,
    input.locality,
  );
  const { data: existing, error: existingError } = await admin.serviceClient
    .from("nz_locations")
    .select("id, region, major_name, suburb_locality")
    .eq("region", input.region)
    .eq("major_name", input.cityDistrict)
    .eq("suburb_locality", input.locality)
    .maybeSingle();

  if (existingError) return jsonError(existingError.message, 500);
  if (
    existing &&
    locationCompareKey(
      existing.region,
      existing.major_name,
      existing.suburb_locality,
    ) === compareKey
  ) {
    return jsonError("同じ地域がすでに登録されています。", 409);
  }

  const { data, error } = await admin.serviceClient
    .from("nz_locations")
    .insert({
      location_key: input.key,
      linz_id: input.key,
      country_code: "NZ",
      region: input.region,
      territorial_authority: input.cityDistrict,
      major_name: input.cityDistrict,
      suburb_locality: input.locality,
      additional_names: input.aliases,
      is_active: input.isActive,
      display_order: input.displayOrder,
      source: "admin",
      created_by: admin.user.id,
    })
    .select(
      "id, location_key, region, territorial_authority, major_name, suburb_locality, additional_names, is_active, display_order, created_at, updated_at, created_by",
    )
    .single();

  if (error) return jsonError(error.message, 500);
  revalidateLocationConsumers();

  return NextResponse.json({ location: dbRowToLocationMasterRecord(data) });
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json().catch(() => null)) as LocationBody | null;
  const id = normalizeNullableUuid(body?.id || null);
  if (!body || !id) return jsonError("地域IDを確認してください。");

  const input = normalizeBody(body);
  const validationError = validateLocation(input);
  if (validationError) return jsonError(validationError);

  const { data: duplicate, error: duplicateError } = await admin.serviceClient
    .from("nz_locations")
    .select("id")
    .eq("region", input.region)
    .eq("major_name", input.cityDistrict)
    .eq("suburb_locality", input.locality)
    .neq("id", id)
    .maybeSingle();

  if (duplicateError) return jsonError(duplicateError.message, 500);
  if (duplicate) return jsonError("同じ地域がすでに登録されています。", 409);

  const { data, error } = await admin.serviceClient
    .from("nz_locations")
    .update({
      location_key: input.key,
      region: input.region,
      territorial_authority: input.cityDistrict,
      major_name: input.cityDistrict,
      suburb_locality: input.locality,
      additional_names: input.aliases,
      is_active: input.isActive,
      display_order: input.displayOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      "id, location_key, region, territorial_authority, major_name, suburb_locality, additional_names, is_active, display_order, created_at, updated_at, created_by",
    )
    .single();

  if (error) return jsonError(error.message, 500);
  revalidateLocationConsumers();

  return NextResponse.json({ location: dbRowToLocationMasterRecord(data) });
}
