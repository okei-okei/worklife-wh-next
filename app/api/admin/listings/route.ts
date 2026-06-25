import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";
import type { SupabaseClient } from "@supabase/supabase-js";

type ListingType = "job" | "property";

type UpdateBody = {
  type?: ListingType;
  id?: string;
  title?: string;
  company?: string | null;
  owner_name?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  description?: string | null;
  application_method?: string | null;
  inquiry_method?: string | null;
  apply_url?: string | null;
  url?: string | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  hourly_rate?: number | null;
  weekly_hours?: number | null;
  work_hours?: number | null;
  rent_weekly?: number | null;
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
    const result = await client.from(table).update(payload).eq("id", id);
    if (!result.error) return;
    errors.push(`${label}: ${result.error.message}`);

    if (
      isMissingColumnError(result.error) ||
      result.error.message.toLowerCase().includes("permission denied")
    ) {
      const fallback = await client
        .from(table)
        .update(fallbackPayload)
        .eq("id", id);
      if (!fallback.error) return;
      errors.push(`${label} fallback: ${fallback.error.message}`);
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
      "id, title, company, city, area, address, hourly_rate, hourly_rate_min, hourly_rate_max, work_hours, weekly_hours, description, application_method, apply_url, is_active, created_at",
        "id, title, company, city, address, hourly_rate, work_hours, description, apply_url, is_active, created_at",
      ),
      selectListings(
        clients,
        "public_properties",
      "id, title, owner_name, city, area, address, rent_weekly, description, inquiry_method, url, is_active, created_at",
        "id, title, owner_name, city, area, address, rent_weekly, description, url, is_active, created_at",
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
  const payload =
    body.type === "job"
      ? {
          title: body.title.trim(),
          company: body.company?.trim() || null,
          city: body.city?.trim() || null,
          area: body.area?.trim() || null,
          address: body.address?.trim() || null,
          hourly_rate: body.hourly_rate ?? body.hourly_rate_min ?? null,
          hourly_rate_min: body.hourly_rate_min ?? null,
          hourly_rate_max: body.hourly_rate_max ?? null,
          work_hours: body.work_hours ?? body.weekly_hours ?? null,
          weekly_hours: body.weekly_hours ?? null,
          description: body.description?.trim() || null,
          application_method: body.application_method?.trim() || null,
          apply_url: body.apply_url?.trim() || null,
          is_active: body.is_active !== false,
        }
      : {
          title: body.title.trim(),
          owner_name: body.owner_name?.trim() || null,
          city: body.city?.trim() || null,
          area: body.area?.trim() || null,
          address: body.address?.trim() || null,
          rent_weekly: body.rent_weekly ?? null,
          description: body.description?.trim() || null,
          inquiry_method: body.inquiry_method?.trim() || null,
          url: body.url?.trim() || null,
          is_active: body.is_active !== false,
        };

  const fallbackPayload =
    body.type === "job"
      ? {
          title: body.title.trim(),
          company: body.company?.trim() || null,
          city: body.city?.trim() || null,
          address: body.address?.trim() || null,
          hourly_rate: body.hourly_rate ?? body.hourly_rate_min ?? null,
          work_hours: body.work_hours ?? body.weekly_hours ?? null,
          description: body.description?.trim() || null,
          apply_url: body.apply_url?.trim() || null,
          is_active: body.is_active !== false,
        }
      : {
          title: body.title.trim(),
          owner_name: body.owner_name?.trim() || null,
          city: body.city?.trim() || null,
          area: body.area?.trim() || null,
          address: body.address?.trim() || null,
          rent_weekly: body.rent_weekly ?? null,
          description: body.description?.trim() || null,
          url: body.url?.trim() || null,
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
