import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type SubmissionType = "job" | "property";

type ListingSubmissionPayload = {
  user_id?: string | null;
  type?: SubmissionType;
  title?: string;
  company_or_owner?: string | null;
  email?: string | null;
  description?: string | null;
  url?: string | null;
  status?: string;
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
  location_source?: string | null;
  location_review_status?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  structured_data?: Record<string, unknown>;
  submission_payload?: Record<string, unknown>;
  image_urls?: string[];
  consent_versions?: Record<string, unknown>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isMissingColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    Boolean(error.message?.includes("column") || error.message?.includes("schema cache"))
  );
}

function isLikelyLegacyColumnError(error: { code?: string; message?: string }) {
  return (
    isMissingColumnError(error) ||
    Boolean(error.message?.toLowerCase().includes("schema cache"))
  );
}

function createInsertClients(token: string | null) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing.");
  }

  const clients: Array<{
    label: string;
    client: SupabaseClient;
  }> = [];

  if (supabaseServiceRoleKey) {
    clients.push({
      label: "service_role",
      client: createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    });
  }

  clients.push({
    label: token ? "authenticated_anon" : "anon",
    client: createClient(supabaseUrl, supabaseAnonKey, {
      global: token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  });

  return clients;
}

async function getUserId(token: string | null) {
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
  } = await authClient.auth.getUser(token);

  return user?.id || null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ListingSubmissionPayload | null;

  if (!body) return jsonError("Invalid request body.");
  if (body.type !== "job" && body.type !== "property") {
    return jsonError("掲載種別が不正です。");
  }
  if (!body.title?.trim() || !body.email?.trim()) {
    return jsonError("タイトルと連絡先メールを入力してください。");
  }

  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || null;
    const userId = await getUserId(token);
    const clients = createInsertClients(token);
    const extendedPayload = {
      user_id: userId,
      submitted_by: userId,
      type: body.type,
      title: body.title.trim(),
      company_or_owner: body.company_or_owner?.trim() || null,
      email: body.email.trim(),
      description: body.description?.trim() || null,
      url: body.url?.trim() || null,
      status: "pending",
      country_code: body.country_code || "NZ",
      region: body.region || null,
      district: body.district || null,
      suburb: body.suburb || null,
      area: body.area || null,
      location_master_id: body.location_master_id || null,
      region_normalized: body.region_normalized || null,
      territorial_authority_normalized:
        body.territorial_authority_normalized || null,
      major_name_normalized: body.major_name_normalized || null,
      suburb_locality_normalized: body.suburb_locality_normalized || null,
      custom_locality: body.custom_locality?.trim() || null,
      location_source: body.location_source || null,
      location_review_status: body.location_review_status || null,
      address: body.address || null,
      latitude: typeof body.latitude === "number" ? body.latitude : null,
      longitude: typeof body.longitude === "number" ? body.longitude : null,
      hourly_rate:
        body.type === "job" &&
        typeof body.structured_data?.hourly_rate_min === "number"
          ? body.structured_data.hourly_rate_min
          : null,
      work_hours:
        body.type === "job" &&
        typeof body.structured_data?.weekly_hours === "number"
          ? body.structured_data.weekly_hours
          : null,
      rent_weekly:
        body.type === "property" &&
        typeof body.structured_data?.rent_weekly === "number"
          ? body.structured_data.rent_weekly
          : null,
      utilities_included:
        body.type === "property" &&
        typeof body.structured_data?.utilities_included === "boolean"
          ? body.structured_data.utilities_included
          : null,
      available_from:
        body.type === "property" &&
        typeof body.structured_data?.available_from === "string"
          ? body.structured_data.available_from
          : null,
      employment_type:
        body.type === "job" &&
        typeof body.structured_data?.employment_type === "string"
          ? body.structured_data.employment_type
          : null,
      submission_payload: body.submission_payload || {
        schemaVersion: 1,
        type: body.type,
        submittedAt: new Date().toISOString(),
        common: {
          title: body.title.trim(),
          companyOrOwner: body.company_or_owner?.trim() || null,
          email: body.email.trim(),
          url: body.url?.trim() || null,
          description: body.description?.trim() || null,
        },
        location: {
          countryCode: body.country_code || "NZ",
          region: body.region || null,
          district: body.district || null,
          area: body.area || body.suburb || null,
          address: body.address || null,
          latitude: typeof body.latitude === "number" ? body.latitude : null,
          longitude: typeof body.longitude === "number" ? body.longitude : null,
        },
        details: body.structured_data || {},
      },
      structured_data: body.structured_data || {},
      image_urls: body.image_urls || [],
      consent_versions: body.consent_versions || {},
    };

    const snapshotPayload = {
      user_id: userId,
      submitted_by: userId,
      type: body.type,
      title: body.title.trim(),
      company_or_owner: body.company_or_owner?.trim() || null,
      email: body.email.trim(),
      description: body.description?.trim() || null,
      url: body.url?.trim() || null,
      status: "pending",
      country_code: body.country_code || "NZ",
      region: body.region || null,
      district: body.district || null,
      suburb: body.suburb || null,
      area: body.area || null,
      address: body.address || null,
      structured_data: body.structured_data || {},
      submission_payload: extendedPayload.submission_payload,
      image_urls: body.image_urls || [],
      consent_versions: body.consent_versions || {},
    };

    const compatiblePayload = {
      user_id: userId,
      submitted_by: userId,
      type: body.type,
      title: body.title.trim(),
      company_or_owner: body.company_or_owner?.trim() || null,
      email: body.email.trim(),
      description: body.description?.trim() || null,
      url: body.url?.trim() || null,
      status: "pending",
      country_code: body.country_code || "NZ",
      region: body.region || null,
      district: body.district || null,
      suburb: body.suburb || null,
      area: body.area || null,
      address: body.address || null,
      structured_data: {
        ...(body.structured_data || {}),
        submission_payload: extendedPayload.submission_payload,
      },
      image_urls: body.image_urls || [],
      consent_versions: body.consent_versions || {},
    };

    const minimalPayload = {
      user_id: userId,
      type: body.type,
      title: body.title.trim(),
      company_or_owner: body.company_or_owner?.trim() || null,
      email: body.email.trim(),
      description: body.description?.trim() || null,
      url: body.url?.trim() || null,
      status: "pending",
    };

    const errors: string[] = [];

    for (const { label, client } of clients) {
      const extendedResult = await client
        .from("listing_submissions")
        .insert(extendedPayload);

      if (!extendedResult.error) {
        return NextResponse.json({ ok: true, mode: `${label}:extended` });
      }

      errors.push(`${label}: ${extendedResult.error.message}`);

      const shouldTryMinimal =
        isMissingColumnError(extendedResult.error) ||
        extendedResult.error.message.toLowerCase().includes("permission denied") ||
        extendedResult.error.message.toLowerCase().includes("row-level security") ||
        extendedResult.error.message.toLowerCase().includes("api key");

      if (!shouldTryMinimal) continue;

      const snapshotResult = await client
        .from("listing_submissions")
        .insert(snapshotPayload);

      if (!snapshotResult.error) {
        return NextResponse.json({ ok: true, mode: `${label}:snapshot` });
      }

      errors.push(`${label} snapshot: ${snapshotResult.error.message}`);

      if (isLikelyLegacyColumnError(snapshotResult.error)) {
        const compatibleResult = await client
          .from("listing_submissions")
          .insert(compatiblePayload);

        if (!compatibleResult.error) {
          return NextResponse.json({
            ok: true,
            mode: `${label}:structured_snapshot`,
          });
        }

        errors.push(
          `${label} structured snapshot: ${compatibleResult.error.message}`,
        );
      }

      const shouldTryLegacyMinimal =
        isMissingColumnError(snapshotResult.error) ||
        snapshotResult.error.message.toLowerCase().includes("permission denied") ||
        snapshotResult.error.message.toLowerCase().includes("row-level security");

      if (!shouldTryLegacyMinimal) continue;

      const minimalResult = await client
        .from("listing_submissions")
        .insert(minimalPayload);

      if (!minimalResult.error) {
        return NextResponse.json({ ok: true, mode: `${label}:minimal` });
      }

      errors.push(`${label} minimal: ${minimalResult.error.message}`);
    }

    throw new Error(errors.join(" / "));
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "掲載申請を送信できませんでした。";
    return jsonError(`掲載申請を送信できませんでした: ${message}`, 500);
  }
}
