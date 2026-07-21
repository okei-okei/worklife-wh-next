import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type ListingSubmission = {
  id: string;
  user_id: string | null;
  type: "job" | "property";
  title: string;
  company_or_owner: string | null;
  email: string | null;
  description: string | null;
  url: string | null;
  status: string;
  created_at: string;
  structured_data?: Record<string, unknown> | null;
  submission_payload?: Record<string, unknown> | null;
  image_urls?: string[] | null;
  published_record_id?: string | null;
  published_table?: string | null;
};

type SubmissionAction = "approve" | "reject";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail =
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "worklife.wh@gmail.com";
const extendedSubmissionSelect =
  "id, user_id, type, title, company_or_owner, email, description, url, status, created_at, structured_data, submission_payload, image_urls, published_record_id, published_table";
const legacySubmissionSelect =
  "id, user_id, type, title, company_or_owner, email, description, url, status, created_at, structured_data, image_urls";
const minimalSubmissionSelect =
  "id, user_id, type, title, company_or_owner, email, description, url, status, created_at";

type SupabaseQueryResult<T> = {
  data: T | null;
  error: { code?: string; message: string } | null;
};

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

function isMissingColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    Boolean(error.message?.includes("column"))
  );
}

function getErrorDetail(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Unknown error";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstValue(...values: unknown[]) {
  return values.find((value) => value !== null && value !== undefined && value !== "");
}

function textValue(...values: unknown[]) {
  const value = firstValue(...values);
  return typeof value === "string" ? value : value == null ? null : String(value);
}

function numberValue(...values: unknown[]) {
  const value = firstValue(...values);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function booleanValue(...values: unknown[]) {
  const value = firstValue(...values);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return null;
}

function getSubmissionPayload(submission: ListingSubmission) {
  const structuredData = asRecord(submission.structured_data);
  return asRecord(
    submission.submission_payload || structuredData.submission_payload,
  );
}

function getSubmissionDetails(submission: ListingSubmission) {
  const structuredData = asRecord(submission.structured_data);
  const payload = getSubmissionPayload(submission);
  const common = asRecord(payload.common);
  const location = asRecord(payload.location);
  const typeDetails =
    submission.type === "job" ? asRecord(payload.job) : asRecord(payload.property);

  return {
    country_code: textValue(
      structuredData.country_code,
      location.countryCode,
      "NZ",
    ),
    region: textValue(structuredData.region, location.region),
    district: textValue(structuredData.district, location.district),
    suburb: textValue(structuredData.suburb, location.suburb, location.area),
    area: textValue(structuredData.area, location.area, location.suburb),
    location_master_id: textValue(
      structuredData.location_master_id,
      location.locationMasterId,
    ),
    region_normalized: textValue(
      structuredData.region_normalized,
      location.regionNormalized,
    ),
    territorial_authority_normalized: textValue(
      structuredData.territorial_authority_normalized,
      location.territorialAuthorityNormalized,
    ),
    major_name_normalized: textValue(
      structuredData.major_name_normalized,
      location.majorNameNormalized,
    ),
    suburb_locality_normalized: textValue(
      structuredData.suburb_locality_normalized,
      location.suburbLocalityNormalized,
    ),
    custom_locality: textValue(
      structuredData.custom_locality,
      location.customLocality,
    ),
    location_source: textValue(
      structuredData.location_source,
      location.locationSource,
    ),
    location_review_status: textValue(
      structuredData.location_review_status,
      location.locationReviewStatus,
    ),
    address: textValue(structuredData.address, location.address),
    latitude: numberValue(structuredData.latitude, location.latitude),
    longitude: numberValue(structuredData.longitude, location.longitude),
    employment_type: textValue(
      structuredData.employment_type,
      typeDetails.employmentType,
    ),
    japanese_ok: booleanValue(structuredData.japanese_ok, typeDetails.japaneseOk),
    english_level: textValue(structuredData.english_level, typeDetails.englishLevel),
    visa_conditions: textValue(
      structuredData.visa_conditions,
      typeDetails.visaConditions,
    ),
    visa_support:
      booleanValue(structuredData.visa_support) ??
      /ワーホリ|working holiday|work visa|就労/i.test(
        textValue(structuredData.visa_conditions, typeDetails.visaConditions) || "",
      ),
    hourly_rate_min: numberValue(
      structuredData.hourly_rate_min,
      typeDetails.hourlyRateMin,
    ),
    hourly_rate_max: numberValue(
      structuredData.hourly_rate_max,
      typeDetails.hourlyRateMax,
    ),
    weekly_hours: numberValue(structuredData.weekly_hours, typeDetails.weeklyHours),
    accommodation_available:
      booleanValue(
        structuredData.accommodation_available,
        typeDetails.accommodationAvailable,
      ) ?? false,
    start_date: textValue(structuredData.start_date, typeDetails.startDate),
    application_method: textValue(
      structuredData.application_method,
      typeDetails.applicationMethod,
    ),
    rent_weekly: numberValue(structuredData.rent_weekly, typeDetails.rentWeekly),
    bedrooms: numberValue(structuredData.bedrooms, typeDetails.bedrooms),
    bathrooms: numberValue(structuredData.bathrooms, typeDetails.bathrooms),
    parking_spaces: numberValue(
      structuredData.parking_spaces,
      typeDetails.parkingSpaces,
    ),
    available_from: textValue(
      structuredData.available_from,
      typeDetails.availableFrom,
    ),
    pets_allowed: booleanValue(structuredData.pets_allowed, typeDetails.petsAllowed),
    smoking_allowed: booleanValue(
      structuredData.smoking_allowed,
      typeDetails.smokingAllowed,
    ),
    furnished: booleanValue(structuredData.furnished, typeDetails.furnished),
    utilities_included: booleanValue(
      structuredData.utilities_included,
      typeDetails.utilitiesIncluded,
    ),
    inquiry_method: textValue(
      structuredData.inquiry_method,
      typeDetails.inquiryMethod,
    ),
    common,
    payload,
  };
}

function getImageUrls(submission: ListingSubmission) {
  if (Array.isArray(submission.image_urls)) return submission.image_urls;
  const payload = getSubmissionPayload(submission);
  return Array.isArray(payload.imageUrls)
    ? payload.imageUrls.filter((value): value is string => typeof value === "string")
    : [];
}

async function updateSubmissionWithFallback(
  client: SupabaseClient,
  submissionId: string,
  fullPayload: Record<string, unknown>,
  fallbackPayload: Record<string, unknown>,
) {
  const result = await client
    .from("listing_submissions")
    .update(fullPayload)
    .eq("id", submissionId);

  if (!result.error) return result;
  if (!isMissingColumnError(result.error)) return result;

  return client
    .from("listing_submissions")
    .update(fallbackPayload)
    .eq("id", submissionId);
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase service role configuration is missing.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function createUserClient(token: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getAdminDbClients(token: string) {
  const clients: Array<{ label: string; client: SupabaseClient }> = [];

  if (supabaseUrl && supabaseServiceRoleKey) {
    clients.push({ label: "service_role", client: createServiceClient() });
  }

  clients.push({ label: "admin_jwt", client: createUserClient(token) });

  return clients;
}

async function verifyAdmin(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: createErrorResponse("Supabase configuration is missing.", 500) };
  }

  if (!supabaseServiceRoleKey) {
    return { error: createErrorResponse("SUPABASE_SERVICE_ROLE_KEY is missing.", 500) };
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return { error: createErrorResponse("Unauthorized.", 401) };
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { error: createErrorResponse("Unauthorized.", 401) };
  }

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const hasAdminRole =
    profile?.role === "admin" || profile?.role === "owner";

  if (
    !hasAdminRole &&
    normalizeEmail(user.email) !== normalizeEmail(adminEmail)
  ) {
    return { error: createErrorResponse("Forbidden.", 403) };
  }

  return { error: null, user, token };
}

async function approveSubmission(
  submission: ListingSubmission,
  approvedBy: string,
  token: string,
): Promise<{ statusUpdated: boolean; warning?: string }> {
  const clients = getAdminDbClients(token);
  const details = getSubmissionDetails(submission);
  const imageUrls = getImageUrls(submission);
  let publishedRecordId: string | null = null;
  let publishedTable: string | null = null;

  if (submission.type === "job") {
    const extendedPayload = {
      source_submission_id: submission.id,
      title: textValue(details.common.title, submission.title) || submission.title,
      company:
        textValue(details.common.companyOrOwner, submission.company_or_owner) ||
        submission.company_or_owner,
      contact_email: textValue(details.common.email, submission.email),
      description: textValue(details.common.description, submission.description),
      apply_url: textValue(details.common.url, submission.url),
      application_method: details.application_method,
      country_code: details.country_code,
      region: details.region,
      city: details.district,
      district: details.district,
      suburb: details.suburb,
      area: details.area,
      address: details.address,
      location_master_id: details.location_master_id,
      region_normalized: details.region_normalized,
      territorial_authority_normalized:
        details.territorial_authority_normalized,
      major_name_normalized: details.major_name_normalized,
      suburb_locality_normalized: details.suburb_locality_normalized,
      custom_locality: details.custom_locality,
      location_source: details.location_source,
      location_review_status: details.location_review_status,
      latitude: details.latitude,
      longitude: details.longitude,
      employment_type: details.employment_type,
      japanese_ok: details.japanese_ok,
      english_level: details.english_level,
      visa_conditions: details.visa_conditions,
      visa_support: details.visa_support,
      hourly_rate: details.hourly_rate_min,
      hourly_rate_min: details.hourly_rate_min,
      hourly_rate_max: details.hourly_rate_max,
      work_hours: details.weekly_hours,
      weekly_hours: details.weekly_hours,
      accommodation_available: details.accommodation_available,
      start_date: details.start_date,
      image_url: imageUrls[0] || null,
      is_active: true,
    };
    const fallbackPayload = {
      source_submission_id: submission.id,
      title: textValue(details.common.title, submission.title) || submission.title,
      company:
        textValue(details.common.companyOrOwner, submission.company_or_owner) ||
        submission.company_or_owner,
      contact_email: textValue(details.common.email, submission.email),
      description: textValue(details.common.description, submission.description),
      apply_url: textValue(details.common.url, submission.url),
      country_code: details.country_code,
      region: details.region,
      city: details.district,
      district: details.district,
      suburb: details.suburb,
      area: details.area,
      address: details.address,
      employment_type: details.employment_type,
      japanese_ok: details.japanese_ok,
      visa_support: details.visa_support,
      hourly_rate: details.hourly_rate_min,
      hourly_rate_min: details.hourly_rate_min,
      hourly_rate_max: details.hourly_rate_max,
      work_hours: details.weekly_hours,
      weekly_hours: details.weekly_hours,
      accommodation_available: details.accommodation_available,
      start_date: details.start_date,
      latitude: details.latitude,
      longitude: details.longitude,
      image_url: imageUrls[0] || null,
      is_active: true,
    };
    const errors: string[] = [];

    for (const { label, client } of clients) {
      const extended = await client
        .from("public_jobs")
        .upsert(extendedPayload, { onConflict: "source_submission_id" })
        .select("id")
        .maybeSingle();

      if (!extended.error) {
        publishedRecordId = extended.data?.id || null;
        publishedTable = "public_jobs";
        errors.length = 0;
        break;
      }

      errors.push(`${label}: ${extended.error.message}`);

      if (isMissingColumnError(extended.error)) {
        const fallback = await client
          .from("public_jobs")
          .upsert(fallbackPayload, { onConflict: "source_submission_id" })
          .select("id")
          .maybeSingle();
        if (!fallback.error) {
          publishedRecordId = fallback.data?.id || null;
          publishedTable = "public_jobs";
          errors.length = 0;
          break;
        }
        errors.push(`${label} fallback: ${fallback.error.message}`);
      }
    }

    if (errors.length) throw new Error(errors.join(" / "));
  }

  if (submission.type === "property") {
    const propertyPayload = {
      source_submission_id: submission.id,
      title: textValue(details.common.title, submission.title) || submission.title,
      owner_name:
        textValue(details.common.companyOrOwner, submission.company_or_owner) ||
        submission.company_or_owner,
      contact_email: textValue(details.common.email, submission.email),
      description: textValue(details.common.description, submission.description),
      url: textValue(details.common.url, submission.url),
      inquiry_method: details.inquiry_method,
      country_code: details.country_code,
      region: details.region,
      city: details.district,
      district: details.district,
      suburb: details.suburb,
      area: details.area,
      address: details.address,
      location_master_id: details.location_master_id,
      region_normalized: details.region_normalized,
      territorial_authority_normalized:
        details.territorial_authority_normalized,
      major_name_normalized: details.major_name_normalized,
      suburb_locality_normalized: details.suburb_locality_normalized,
      custom_locality: details.custom_locality,
      location_source: details.location_source,
      location_review_status: details.location_review_status,
      latitude: details.latitude,
      longitude: details.longitude,
      rent_weekly: details.rent_weekly,
      bedrooms: details.bedrooms,
      bathrooms: details.bathrooms,
      parking_spaces: details.parking_spaces,
      available_from: details.available_from,
      pets_allowed: details.pets_allowed,
      smoking_allowed: details.smoking_allowed,
      furnished: details.furnished,
      bills_included: details.utilities_included,
      utilities_included: details.utilities_included,
      image_urls: imageUrls,
      is_active: true,
    };
    const fallbackPropertyPayload = {
      source_submission_id: submission.id,
      title: textValue(details.common.title, submission.title) || submission.title,
      owner_name:
        textValue(details.common.companyOrOwner, submission.company_or_owner) ||
        submission.company_or_owner,
      contact_email: textValue(details.common.email, submission.email),
      description: textValue(details.common.description, submission.description),
      url: textValue(details.common.url, submission.url),
      country_code: details.country_code,
      region: details.region,
      city: details.district,
      district: details.district,
      suburb: details.suburb,
      area: details.area,
      address: details.address,
      latitude: details.latitude,
      longitude: details.longitude,
      rent_weekly: details.rent_weekly,
      bedrooms: details.bedrooms,
      bathrooms: details.bathrooms,
      parking_spaces: details.parking_spaces,
      available_from: details.available_from,
      pets_allowed: details.pets_allowed,
      smoking_allowed: details.smoking_allowed,
      furnished: details.furnished,
      bills_included: details.utilities_included,
      utilities_included: details.utilities_included,
      image_urls: imageUrls,
      is_active: true,
    };
    const errors: string[] = [];

    for (const { label, client } of clients) {
      const result = await client
        .from("public_properties")
        .upsert(propertyPayload, { onConflict: "source_submission_id" })
        .select("id")
        .maybeSingle();

      if (!result.error) {
        publishedRecordId = result.data?.id || null;
        publishedTable = "public_properties";
        errors.length = 0;
        break;
      }

      errors.push(`${label}: ${result.error.message}`);

      if (isMissingColumnError(result.error)) {
        const fallback = await client
          .from("public_properties")
          .upsert(fallbackPropertyPayload, {
            onConflict: "source_submission_id",
          })
          .select("id")
          .maybeSingle();
        if (!fallback.error) {
          publishedRecordId = fallback.data?.id || null;
          publishedTable = "public_properties";
          errors.length = 0;
          break;
        }
        errors.push(`${label} fallback: ${fallback.error.message}`);
      }
    }

    if (errors.length) throw new Error(errors.join(" / "));
  }

  const errors: string[] = [];
  for (const { label, client } of clients) {
    const now = new Date().toISOString();
    const result = await updateSubmissionWithFallback(
      client,
      submission.id,
      {
        status: "approved",
        approved_at: now,
        approved_by: approvedBy,
        reviewed_at: now,
        reviewed_by: approvedBy,
        published_record_id: publishedRecordId,
        published_table: publishedTable,
      },
      {
        status: "approved",
        approved_at: now,
        approved_by: approvedBy,
      },
    );

    if (!result.error) return { statusUpdated: true };
    errors.push(`${label}: ${result.error.message}`);
  }

  const warning = errors.join(" / ");
  console.warn(
    `Listing ${submission.id} was published, but listing_submissions status could not be updated: ${warning}`,
  );

  return { statusUpdated: false, warning };
}

async function filterAlreadyPublishedSubmissions(
  submissions: ListingSubmission[],
  token: string,
) {
  const ids = submissions.map((submission) => submission.id);
  if (ids.length === 0) return submissions;

  for (const { client } of getAdminDbClients(token)) {
    const [jobsResult, propertiesResult] = await Promise.all([
      client
        .from("public_jobs")
        .select("source_submission_id")
        .in("source_submission_id", ids),
      client
        .from("public_properties")
        .select("source_submission_id")
        .in("source_submission_id", ids),
    ]);

    if (jobsResult.error && propertiesResult.error) continue;

    const publishedIds = new Set<string>();
    (jobsResult.data || []).forEach((item) => {
      if (item.source_submission_id) publishedIds.add(item.source_submission_id);
    });
    (propertiesResult.data || []).forEach((item) => {
      if (item.source_submission_id) publishedIds.add(item.source_submission_id);
    });

    return submissions.filter((submission) => !publishedIds.has(submission.id));
  }

  return submissions;
}

export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);

  if (adminCheck.error) {
    return adminCheck.error;
  }

  try {
    const serviceClient = createServiceClient();
    const extendedResult = await serviceClient
      .from("listing_submissions")
      .select(extendedSubmissionSelect)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    let result: SupabaseQueryResult<unknown[]> = extendedResult;
    if (result.error && isMissingColumnError(result.error)) {
      result = await serviceClient
        .from("listing_submissions")
        .select(legacySubmissionSelect)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
    }
    if (result.error && isMissingColumnError(result.error)) {
      result = await serviceClient
        .from("listing_submissions")
        .select(minimalSubmissionSelect)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
    }

    if (
      result.error &&
      result.error.message?.toLowerCase().includes("permission denied") &&
      supabaseUrl &&
      supabaseAnonKey &&
      adminCheck.token
    ) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${adminCheck.token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      let fallback: SupabaseQueryResult<unknown[]> = await userClient
        .from("listing_submissions")
        .select(extendedSubmissionSelect)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (fallback.error && isMissingColumnError(fallback.error)) {
        fallback = await userClient
          .from("listing_submissions")
          .select(legacySubmissionSelect)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
      }

      if (fallback.error && isMissingColumnError(fallback.error)) {
        fallback = await userClient
          .from("listing_submissions")
          .select(minimalSubmissionSelect)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
      }

      if (fallback.error) throw fallback.error;
      const submissions = await filterAlreadyPublishedSubmissions(
        (fallback.data || []) as ListingSubmission[],
        adminCheck.token,
      );
      return NextResponse.json({ submissions });
    }

    if (result.error) throw result.error;

    const submissions = await filterAlreadyPublishedSubmissions(
      (result.data || []) as ListingSubmission[],
      adminCheck.token,
    );

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error(error);
    const detail = getErrorDetail(error);
    return createErrorResponse(`掲載申請を取得できませんでした: ${detail}`, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);

  if (adminCheck.error) {
    return adminCheck.error;
  }

  const body = (await request.json().catch(() => null)) as
    | {
        id?: string;
        action?: SubmissionAction;
        rejectedReason?: string;
        submission?: ListingSubmission;
      }
    | null;

  if (!body?.id || !body.action) {
    return createErrorResponse("id and action are required.", 400);
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return createErrorResponse("Invalid action.", 400);
  }

  try {
    const serviceClient = createServiceClient();
    const extendedResult = await serviceClient
      .from("listing_submissions")
      .select(extendedSubmissionSelect)
      .eq("id", body.id)
      .single<ListingSubmission>();

    let result: SupabaseQueryResult<unknown> = extendedResult;
    if (result.error && isMissingColumnError(result.error)) {
      result = await serviceClient
        .from("listing_submissions")
        .select(legacySubmissionSelect)
        .eq("id", body.id)
        .single<ListingSubmission>();
    }
    if (result.error && isMissingColumnError(result.error)) {
      result = await serviceClient
        .from("listing_submissions")
        .select(minimalSubmissionSelect)
        .eq("id", body.id)
        .single<ListingSubmission>();
    }

    if (result.error && !body.submission) throw result.error;
    const data = (result.error ? body.submission : result.data) as
      | ListingSubmission
      | undefined;

    if (!data || data.id !== body.id) {
      throw result.error || new Error("Submission data could not be resolved.");
    }

    if (data.status !== "pending") {
      return createErrorResponse("Submission is not pending.", 409);
    }

    let warning: string | undefined;
    if (body.action === "approve") {
      const approvalResult = await approveSubmission(
        data,
        adminCheck.user.id,
        adminCheck.token,
      );
      warning = approvalResult.warning;
    } else {
      const errors: string[] = [];
      for (const { label, client } of getAdminDbClients(adminCheck.token)) {
        const now = new Date().toISOString();
        const result = await updateSubmissionWithFallback(
          client,
          data.id,
          {
            status: "rejected",
            rejected_reason: body.rejectedReason?.trim() || null,
            review_note: body.rejectedReason?.trim() || null,
            reviewed_at: now,
            reviewed_by: adminCheck.user.id,
          },
          {
            status: "rejected",
            rejected_reason: body.rejectedReason?.trim() || null,
          },
        );

        if (!result.error) {
          errors.length = 0;
          break;
        }
        errors.push(`${label}: ${result.error.message}`);
      }

      if (errors.length) throw new Error(errors.join(" / "));
    }

    return NextResponse.json({ ok: true, warning: warning || null });
  } catch (error) {
    console.error(error);
    const detail = getErrorDetail(error);
    return createErrorResponse(`申請を更新できませんでした: ${detail}`, 500);
  }
}
