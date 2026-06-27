import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";
import { geocodeAddress } from "@/lib/geocoder";
import type { SupabaseClient } from "@supabase/supabase-js";

type ListingType = "job" | "property";

type UpdateBody = {
  type?: ListingType;
  id?: string;
  title?: string;
  company?: string | null;
  owner_name?: string | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  description?: string | null;
  application_method?: string | null;
  inquiry_method?: string | null;
  apply_url?: string | null;
  url?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  hourly_rate?: number | null;
  weekly_hours?: number | null;
  work_hours?: number | null;
  employment_type?: string | null;
  start_date?: string | null;
  accommodation_available?: boolean | null;
  japanese_ok?: boolean | null;
  english_level?: string | null;
  visa_conditions?: string | null;
  visa_support?: boolean | null;
  rent_weekly?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  available_from?: string | null;
  pets_allowed?: boolean | null;
  smoking_allowed?: boolean | null;
  furnished?: boolean | null;
  utilities_included?: boolean | null;
  bills_included?: boolean | null;
  is_active?: boolean;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isMissingColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    Boolean(
      error.message?.includes("column") ||
        error.message?.includes("schema cache"),
    )
  );
}

function getMissingColumnName(error: { message?: string }) {
  const message = error.message || "";
  return (
    message.match(/'([^']+)' column/)?.[1] ||
    message.match(/column "([^"]+)"/)?.[1] ||
    null
  );
}

async function resolveCoordinates(body: UpdateBody) {
  if (typeof body.latitude === "number" && typeof body.longitude === "number") {
    return { latitude: body.latitude, longitude: body.longitude };
  }

  const addressParts = [
    body.address,
    body.suburb || body.area,
    body.district || body.city,
    body.region,
    body.country_code || "NZ",
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  if (!addressParts.length) {
    return { latitude: null, longitude: null };
  }

  return geocodeAddress(addressParts.join(", "));
}

function adminDbClients(admin: Extract<Awaited<ReturnType<typeof getAdminContext>>, { ok: true }>) {
  return [
    { label: "service_role", client: admin.serviceClient },
    { label: "admin_jwt", client: admin.userClient },
  ];
}

async function selectListings(
  clients: Array<{ label: string; client: SupabaseClient }>,
  table: "public_jobs" | "public_properties",
  primaryColumns: string,
  fallbackColumns: string,
) {
  const errors: string[] = [];

  for (const { label, client } of clients) {
    const primary = await client
      .from(table)
      .select(primaryColumns)
      .order("created_at", { ascending: false });

    if (!primary.error) return primary.data || [];
    errors.push(`${label}: ${primary.error.message}`);

    if (
      isMissingColumnError(primary.error) ||
      primary.error.message.toLowerCase().includes("permission denied")
    ) {
      const fallback = await client
        .from(table)
        .select(fallbackColumns)
        .order("created_at", { ascending: false });

      if (!fallback.error) return fallback.data || [];
      errors.push(`${label} fallback: ${fallback.error.message}`);
    }
  }

  throw new Error(errors.join(" / "));
}

async function updateListing(
  clients: Array<{ label: string; client: SupabaseClient }>,
  table: "public_jobs" | "public_properties",
  id: string,
  payload: Record<string, unknown>,
  fallbackPayload: Record<string, unknown>,
) {
  const errors: string[] = [];

  for (const { label, client } of clients) {
    let currentPayload = { ...payload };

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const result = await client.from(table).update(currentPayload).eq("id", id);
      if (!result.error) return;
      errors.push(`${label}: ${result.error.message}`);

      const missingColumn = getMissingColumnName(result.error);
      if (!isMissingColumnError(result.error) || !missingColumn) {
        break;
      }

      currentPayload = { ...currentPayload };
      delete currentPayload[missingColumn];
    }

    let currentFallbackPayload = { ...fallbackPayload };
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const fallback = await client.from(table).update(currentFallbackPayload).eq("id", id);
      if (!fallback.error) return;
      errors.push(`${label} fallback: ${fallback.error.message}`);

      const missingColumn = getMissingColumnName(fallback.error);
      if (!isMissingColumnError(fallback.error) || !missingColumn) {
        break;
      }

      currentFallbackPayload = { ...currentFallbackPayload };
      delete currentFallbackPayload[missingColumn];
    }
  }

  throw new Error(errors.join(" / "));
}

async function deleteListing(
  clients: Array<{ label: string; client: SupabaseClient }>,
  table: "public_jobs" | "public_properties",
  id: string,
) {
  const errors: string[] = [];

  for (const { label, client } of clients) {
    const result = await client.from(table).delete().eq("id", id);
    if (!result.error) return;
    errors.push(`${label}: ${result.error.message}`);

    const softDelete = await client
      .from(table)
      .update({ is_active: false })
      .eq("id", id);
    if (!softDelete.error) return;
    errors.push(`${label} soft delete: ${softDelete.error.message}`);
  }

  throw new Error(errors.join(" / "));
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const clients = adminDbClients(admin);
    const [jobs, properties] = await Promise.all([
      selectListings(
        clients,
        "public_jobs",
        "id, title, company, country_code, region, district, suburb, city, area, address, latitude, longitude, hourly_rate, hourly_rate_min, hourly_rate_max, work_hours, weekly_hours, employment_type, start_date, accommodation_available, japanese_ok, english_level, visa_conditions, visa_support, description, application_method, apply_url, image_url, is_active, created_at",
        "id, title, company, city, address, latitude, longitude, hourly_rate, work_hours, description, apply_url, is_active, created_at",
      ),
      selectListings(
        clients,
        "public_properties",
        "id, title, owner_name, country_code, region, district, suburb, city, area, address, latitude, longitude, rent_weekly, bedrooms, bathrooms, parking_spaces, available_from, pets_allowed, smoking_allowed, furnished, utilities_included, bills_included, description, inquiry_method, url, image_urls, is_active, created_at",
        "id, title, owner_name, city, area, address, latitude, longitude, rent_weekly, description, url, image_urls, is_active, created_at",
      ),
    ]);

    return NextResponse.json({ jobs, properties });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "公開掲載を取得できませんでした。",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json().catch(() => null)) as UpdateBody | null;
  if (!body?.id || (body.type !== "job" && body.type !== "property")) {
    return jsonError("id and type are required.");
  }

  if (!body.title?.trim()) {
    return jsonError("タイトルを入力してください。");
  }

  const table = body.type === "job" ? "public_jobs" : "public_properties";
  const coordinates = await resolveCoordinates(body);
  const payload =
    body.type === "job"
      ? {
          title: body.title.trim(),
          company: body.company?.trim() || null,
          country_code: body.country_code?.trim() || "NZ",
          region: body.region?.trim() || null,
          district: body.district?.trim() || null,
          suburb: body.suburb?.trim() || null,
          city: body.city?.trim() || null,
          area: body.area?.trim() || null,
          address: body.address?.trim() || null,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          hourly_rate: body.hourly_rate ?? body.hourly_rate_min ?? null,
          hourly_rate_min: body.hourly_rate_min ?? null,
          hourly_rate_max: body.hourly_rate_max ?? null,
          work_hours: body.work_hours ?? body.weekly_hours ?? null,
          weekly_hours: body.weekly_hours ?? null,
          employment_type: body.employment_type?.trim() || null,
          start_date: body.start_date || null,
          accommodation_available: Boolean(body.accommodation_available),
          japanese_ok: Boolean(body.japanese_ok),
          english_level: body.english_level?.trim() || null,
          visa_conditions: body.visa_conditions?.trim() || null,
          visa_support:
            body.visa_support ??
            /ワーホリ|working holiday|work visa|就労/i.test(
              body.visa_conditions || "",
            ),
          description: body.description?.trim() || null,
          application_method: body.application_method?.trim() || null,
          apply_url: body.apply_url?.trim() || null,
          image_url: body.image_url || null,
          is_active: body.is_active !== false,
        }
      : {
          title: body.title.trim(),
          owner_name: body.owner_name?.trim() || null,
          country_code: body.country_code?.trim() || "NZ",
          region: body.region?.trim() || null,
          district: body.district?.trim() || null,
          suburb: body.suburb?.trim() || null,
          city: body.city?.trim() || null,
          area: body.area?.trim() || null,
          address: body.address?.trim() || null,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          rent_weekly: body.rent_weekly ?? null,
          bedrooms: body.bedrooms ?? null,
          bathrooms: body.bathrooms ?? null,
          parking_spaces: body.parking_spaces ?? null,
          available_from: body.available_from || null,
          pets_allowed: body.pets_allowed ?? null,
          smoking_allowed: body.smoking_allowed ?? null,
          furnished: Boolean(body.furnished),
          utilities_included: body.utilities_included ?? null,
          bills_included: body.bills_included ?? body.utilities_included ?? null,
          description: body.description?.trim() || null,
          inquiry_method: body.inquiry_method?.trim() || null,
          url: body.url?.trim() || null,
          image_urls: body.image_urls || [],
          is_active: body.is_active !== false,
        };

  const fallbackPayload =
    body.type === "job"
      ? {
          title: body.title.trim(),
          company: body.company?.trim() || null,
          city: body.city?.trim() || null,
          address: body.address?.trim() || null,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          hourly_rate: body.hourly_rate ?? body.hourly_rate_min ?? null,
          work_hours: body.work_hours ?? body.weekly_hours ?? null,
          description: body.description?.trim() || null,
          apply_url: body.apply_url?.trim() || null,
          image_url: body.image_url || null,
          is_active: body.is_active !== false,
        }
      : {
          title: body.title.trim(),
          owner_name: body.owner_name?.trim() || null,
          city: body.city?.trim() || null,
          area: body.area?.trim() || null,
          address: body.address?.trim() || null,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          rent_weekly: body.rent_weekly ?? null,
          description: body.description?.trim() || null,
          url: body.url?.trim() || null,
          image_urls: body.image_urls || [],
          is_active: body.is_active !== false,
        };

  try {
    await updateListing(
      adminDbClients(admin),
      table,
      body.id,
      payload,
      fallbackPayload,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "掲載内容を更新できませんでした。",
      500,
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ListingType | null;
  const id = searchParams.get("id");

  if (!id || (type !== "job" && type !== "property")) {
    return jsonError("id and type are required.");
  }

  const table = type === "job" ? "public_jobs" : "public_properties";

  try {
    await deleteListing(adminDbClients(admin), table, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "掲載を削除できませんでした。",
      500,
    );
  }
}
