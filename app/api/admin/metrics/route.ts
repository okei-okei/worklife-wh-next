import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type LeadClickRow = {
  category: string | null;
};

type MetricResponse = {
  registeredUsers: number;
  savedJobs: number;
  savedProperties: number;
  completedChecklistItems: number;
  activePartners: number;
  pendingListingSubmissions: number;
  leadClicksByCategory: {
    category: string;
    count: number;
  }[];
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function countRows(
  tableName: string,
  filters?: (query: ReturnType<typeof serviceClientForCount>) => ReturnType<
    typeof serviceClientForCount
  >,
) {
  const query = serviceClientForCount(tableName);
  const filteredQuery = filters ? filters(query) : query;
  const { count, error } = await filteredQuery;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

function serviceClientForCount(tableName: string) {
  return createServiceClient()
    .from(tableName)
    .select("*", { count: "exact", head: true });
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

async function countRegisteredUsers() {
  const serviceClient = createServiceClient();
  const perPage = 1000;
  let page = 1;
  let total = 0;

  while (true) {
    const { data, error } = await serviceClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const users = data.users || [];
    total += users.length;

    if (users.length < perPage) {
      return total;
    }

    page += 1;
  }
}

async function getLeadClicksByCategory() {
  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("lead_clicks")
    .select("category");

  if (error) {
    throw error;
  }

  const counts = ((data || []) as LeadClickRow[]).reduce<
    Record<string, number>
  >((acc, row) => {
    const category = row.category || "unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createErrorResponse("Supabase configuration is missing.", 500);
  }

  if (!supabaseServiceRoleKey) {
    return createErrorResponse("SUPABASE_SERVICE_ROLE_KEY is missing.", 500);
  }

  if (!adminEmail) {
    return createErrorResponse("NEXT_PUBLIC_ADMIN_EMAIL is missing.", 500);
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return createErrorResponse("Unauthorized.", 401);
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return createErrorResponse("Unauthorized.", 401);
  }

  if (user.email !== adminEmail) {
    return createErrorResponse("Forbidden.", 403);
  }

  try {
    const [
      registeredUsers,
      savedJobs,
      savedProperties,
      completedChecklistItems,
      activePartners,
      pendingListingSubmissions,
      leadClicksByCategory,
    ] = await Promise.all([
      countRegisteredUsers(),
      countRows("saved_jobs"),
      countRows("saved_properties"),
      countRows("user_checklist_items", (query) =>
        query.eq("is_completed", true),
      ),
      countRows("partners", (query) => query.eq("is_active", true)),
      countRows("listing_submissions", (query) =>
        query.eq("status", "pending"),
      ),
      getLeadClicksByCategory(),
    ]);

    const metrics: MetricResponse = {
      registeredUsers,
      savedJobs,
      savedProperties,
      completedChecklistItems,
      activePartners,
      pendingListingSubmissions,
      leadClicksByCategory,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error(error);
    return createErrorResponse("Failed to load admin metrics.", 500);
  }
}
