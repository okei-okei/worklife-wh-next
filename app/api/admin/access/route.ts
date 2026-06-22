import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail =
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "worklife.wh@gmail.com";

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  if (normalizeEmail(user.email) === normalizeEmail(adminEmail)) {
    return NextResponse.json({ isAdmin: true });
  }

  if (serviceRoleKey) {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin" || profile?.role === "owner") {
      return NextResponse.json({ isAdmin: true });
    }
  }

  return NextResponse.json({ isAdmin: false }, { status: 403 });
}
