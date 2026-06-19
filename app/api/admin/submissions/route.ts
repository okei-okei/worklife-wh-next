import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

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

async function verifyAdmin(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: createErrorResponse("Supabase configuration is missing.", 500) };
  }

  if (!supabaseServiceRoleKey) {
    return { error: createErrorResponse("SUPABASE_SERVICE_ROLE_KEY is missing.", 500) };
  }

  if (!adminEmail) {
    return { error: createErrorResponse("NEXT_PUBLIC_ADMIN_EMAIL is missing.", 500) };
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

  if (!hasAdminRole && user.email !== adminEmail) {
    return { error: createErrorResponse("Forbidden.", 403) };
  }

  return { error: null, user };
}

async function approveSubmission(
  submission: ListingSubmission,
  approvedBy: string,
) {
  const serviceClient = createServiceClient();
  const details = submission.structured_data || {};

  if (submission.type === "job") {
    const { error } = await serviceClient.from("public_jobs").upsert(
      {
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
        hourly_rate: details.hourly_rate_min,
        hourly_rate_min: details.hourly_rate_min,
        hourly_rate_max: details.hourly_rate_max,
        work_hours: details.weekly_hours,
        weekly_hours: details.weekly_hours,
        accommodation_available: details.accommodation_available,
        start_date: details.start_date,
        image_url: submission.image_urls?.[0] || null,
        is_active: true,
      },
      {
        onConflict: "source_submission_id",
      },
    );

    if (error) throw error;
  }

  if (submission.type === "property") {
    const { error } = await serviceClient.from("public_properties").upsert(
      {
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
        furnished: details.furnished,
        bills_included: details.utilities_included,
        image_urls: submission.image_urls || [],
        is_active: true,
      },
      {
        onConflict: "source_submission_id",
      },
    );

    if (error) throw error;
  }

  const { error } = await serviceClient
    .from("listing_submissions")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    })
    .eq("id", submission.id);

  if (error) throw error;
}

export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);

  if (adminCheck.error) {
    return adminCheck.error;
  }

  try {
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("listing_submissions")
      .select(
        "id, user_id, type, title, company_or_owner, email, description, url, status, created_at, structured_data, image_urls",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ submissions: data || [] });
  } catch (error) {
    console.error(error);
    return createErrorResponse("Failed to load submissions.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);

  if (adminCheck.error) {
    return adminCheck.error;
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: string; action?: SubmissionAction; rejectedReason?: string }
    | null;

  if (!body?.id || !body.action) {
    return createErrorResponse("id and action are required.", 400);
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return createErrorResponse("Invalid action.", 400);
  }

  try {
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("listing_submissions")
      .select(
        "id, user_id, type, title, company_or_owner, email, description, url, status, created_at, structured_data, image_urls",
      )
      .eq("id", body.id)
      .single<ListingSubmission>();

    if (error) throw error;

    if (data.status !== "pending") {
      return createErrorResponse("Submission is not pending.", 409);
    }

    if (body.action === "approve") {
      await approveSubmission(data, adminCheck.user.id);
    } else {
      const { error: updateError } = await serviceClient
        .from("listing_submissions")
        .update({
          status: "rejected",
          rejected_reason: body.rejectedReason?.trim() || null,
        })
        .eq("id", data.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return createErrorResponse("Failed to update submission.", 500);
  }
}
