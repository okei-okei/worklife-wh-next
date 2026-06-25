import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail =
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "worklife.wh@gmail.com";

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

export async function getAdminContext(request: NextRequest) {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { ok: false as const, status: 500, error: "管理者API設定が不足しています。" };
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return { ok: false as const, status: 401, error: "ログインが必要です。" };
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { ok: false as const, status: 401, error: "ログインが必要です。" };
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const hasRole = profile?.role === "admin" || profile?.role === "owner";

  if (!hasRole && normalizeEmail(user.email) !== normalizeEmail(adminEmail)) {
    return { ok: false as const, status: 403, error: "権限がありません。" };
  }

  return { ok: true as const, user, serviceClient, userClient, token };
}
