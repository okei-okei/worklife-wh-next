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

  if (user.email !== adminEmail) {
    return { error: createErrorResponse("Forbidden.", 403) };
  }

  return { error: null };
}

async function approveSubmission(submission: ListingSubmission) {
  const serviceClient = createServiceClient();

  if (submission.type === "job") {
    const { error } = await serviceClient.from("public_jobs").upsert(
      {
        source_submission_id: submission.id,
        title: submission.title,
        company: submission.company_or_owner,
        contact_email: submission.email,
        description: submission.description,
        apply_url: submission.url,
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
    .update({ status: "approved" })
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
        "id, user_id, type, title, company_or_owner, email, description, url, status, created_at",
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
    | { id?: string; action?: SubmissionAction }
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
        "id, user_id, type, title, company_or_owner, email, description, url, status, created_at",
      )
      .eq("id", body.id)
      .single<ListingSubmission>();

    if (error) throw error;

    if (data.status !== "pending") {
      return createErrorResponse("Submission is not pending.", 409);
    }

    if (body.action === "approve") {
      await approveSubmission(data);
    } else {
      const { error: updateError } = await serviceClient
        .from("listing_submissions")
        .update({ status: "rejected" })
        .eq("id", data.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return createErrorResponse("Failed to update submission.", 500);
  }
}
