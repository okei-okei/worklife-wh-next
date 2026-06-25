import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/server/adminAuth";

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

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const jobQuery = admin.serviceClient
    .from("public_jobs")
    .select(
      "id, title, company, city, area, address, hourly_rate, hourly_rate_min, hourly_rate_max, work_hours, weekly_hours, description, application_method, apply_url, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  const propertyQuery = admin.serviceClient
    .from("public_properties")
    .select(
      "id, title, owner_name, city, area, address, rent_weekly, description, inquiry_method, url, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  const [jobsResult, propertiesResult] = await Promise.all([
    jobQuery,
    propertyQuery,
  ]);

  const jobs =
    jobsResult.error && isMissingColumnError(jobsResult.error)
      ? await admin.serviceClient
          .from("public_jobs")
          .select(
            "id, title, company, city, address, hourly_rate, work_hours, description, apply_url, is_active, created_at",
          )
          .order("created_at", { ascending: false })
      : jobsResult;

  const properties =
    propertiesResult.error && isMissingColumnError(propertiesResult.error)
      ? await admin.serviceClient
          .from("public_properties")
          .select(
            "id, title, owner_name, city, area, address, rent_weekly, description, url, is_active, created_at",
          )
          .order("created_at", { ascending: false })
      : propertiesResult;

  if (jobs.error) return jsonError(jobs.error.message, 500);
  if (properties.error) return jsonError(properties.error.message, 500);

  return NextResponse.json({
    jobs: jobs.data || [],
    properties: properties.data || [],
  });
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

  const result = await admin.serviceClient
    .from(table)
    .update(payload)
    .eq("id", body.id);

  if (!result.error) return NextResponse.json({ ok: true });

  if (isMissingColumnError(result.error)) {
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

    const fallback = await admin.serviceClient
      .from(table)
      .update(fallbackPayload)
      .eq("id", body.id);

    if (!fallback.error) return NextResponse.json({ ok: true });
    return jsonError(fallback.error.message, 500);
  }

  return jsonError(result.error.message, 500);
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
  const result = await admin.serviceClient.from(table).delete().eq("id", id);

  if (result.error) return jsonError(result.error.message, 500);
  return NextResponse.json({ ok: true });
}
