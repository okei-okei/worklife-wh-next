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
  image_urls?: string[] | null;
};

type SubmissionAction = "approve" | "reject";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail =
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "worklife.wh@gmail.com";

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
  const details = submission.structured_data || {};

  if (submission.type === "job") {
    const extendedPayload = {
      source_submission_id: submission.id,
      title: submission.title,
      company: submission.company_or_owner,
      contact_email: submission.email,
      description: submission.description,
      apply_url: submission.url,
      application_method: details.application_method,
      country_code: details.country_code,
      region: details.region,
      city: details.district,
      district: details.district,
      suburb: details.suburb,
      area: details.area,
      address: details.address,
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
      image_url: submission.image_urls?.[0] || null,
      is_active: true,
    };
    const fallbackPayload = {
      source_submission_id: submission.id,
      title: submission.title,
      company: submission.company_or_owner,
      contact_email: submission.email,
      description: submission.description,
      apply_url: submission.url,
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
      image_url: submission.image_urls?.[0] || null,
      is_active: true,
    };
    const errors: string[] = [];

    for (const { label, client } of clients) {
      const extended = await client
        .from("public_jobs")
        .upsert(extendedPayload, { onConflict: "source_submission_id" });

      if (!extended.error) {
        errors.length = 0;
        break;
      }

      errors.push(`${label}: ${extended.error.message}`);

      if (isMissingColumnError(extended.error)) {
        const fallback = await client
          .from("public_jobs")
          .upsert(fallbackPayload, { onConflict: "source_submission_id" });
        if (!fallback.error) {
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
      title: submission.title,
      owner_name: submission.company_or_owner,
      contact_email: submission.email,
      description: submission.description,
      url: submission.url,
      inquiry_method: details.inquiry_method,
      country_code: details.country_code,
      region: details.region,
      city: details.district,
      district: details.district,
      suburb: details.suburb,
      area: details.area,
      address: details.address,
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
      image_urls: submission.image_urls || [],
      is_active: true,
    };
    const fallbackPropertyPayload = {
      source_submission_id: submission.id,
      title: submission.title,
      owner_name: submission.company_or_owner,
      contact_email: submission.email,
      description: submission.description,
      url: submission.url,
      country_code: details.country_code,
      region: details.region,
      city: details.district,
      district: details.district,
      suburb: details.suburb,
      area: details.area,
      address: details.address,
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
      image_urls: submission.image_urls || [],
      is_active: true,
    };
    const errors: string[] = [];

    for (const { label, client } of clients) {
      const result = await client
        .from("public_properties")
        .upsert(propertyPayload, { onConflict: "source_submission_id" });

      if (!result.error) {
        errors.length = 0;
        break;
      }

      errors.push(`${label}: ${result.error.message}`);

      if (isMissingColumnError(result.error)) {
        const fallback = await client
          .from("public_properties")
          .upsert(fallbackPropertyPayload, {
            onConflict: "source_submission_id",
          });
        if (!fallback.error) {
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
    const result = await client
      .from("listing_submissions")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
      })
      .eq("id", submission.id);

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
      .select(
        "id, user_id, type, title, company_or_owner, email, description, url, status, created_at, structured_data, image_urls",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const result =
      extendedResult.error && isMissingColumnError(extendedResult.error)
        ? await serviceClient
            .from("listing_submissions")
            .select(
              "id, user_id, type, title, company_or_owner, email, description, url, status, created_at",
            )
            .eq("status", "pending")
            .order("created_at", { ascending: false })
        : extendedResult;

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
      const fallback = await userClient
        .from("listing_submissions")
        .select(
          "id, user_id, type, title, company_or_owner, email, description, url, status, created_at, structured_data, image_urls",
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

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
      .select(
        "id, user_id, type, title, company_or_owner, email, description, url, status, created_at, structured_data, image_urls",
      )
      .eq("id", body.id)
      .single<ListingSubmission>();

    const result =
      extendedResult.error && isMissingColumnError(extendedResult.error)
        ? await serviceClient
            .from("listing_submissions")
            .select(
              "id, user_id, type, title, company_or_owner, email, description, url, status, created_at",
            )
            .eq("id", body.id)
            .single<ListingSubmission>()
        : extendedResult;

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
        const result = await client
          .from("listing_submissions")
          .update({
            status: "rejected",
            rejected_reason: body.rejectedReason?.trim() || null,
          })
          .eq("id", data.id);

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
