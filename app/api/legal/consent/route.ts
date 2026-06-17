import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ConsentRequest = {
  userId?: string;
  email?: string;
  sourcePage?: string;
  documents: Array<{
    documentKey: string;
    version: string;
  }>;
};

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ConsentRequest;
  const supabase = getSupabaseAdminClient();

  if (!body.userId || !Array.isArray(body.documents) || body.documents.length === 0) {
    return NextResponse.json(
      { ok: false, message: "同意を保存するユーザー情報が不足しています。" },
      { status: 400 },
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabaseの管理設定が不足しています。" },
      { status: 200 },
    );
  }

  const userAgent = request.headers.get("user-agent");
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const rows = body.documents.map((document) => ({
    user_id: body.userId,
    document_key: document.documentKey,
    consent_version: document.version,
    consented: true,
    source_page: body.sourcePage || "unknown",
    ip_address: ipAddress,
    user_agent: userAgent,
  }));

  const { error } = await supabase
    .from("user_consents")
    .upsert(rows, { onConflict: "user_id,document_key,consent_version" });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true });
}
