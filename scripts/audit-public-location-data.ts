import { createClient } from "@supabase/supabase-js";
import {
  resolveLocation,
  type LocationSourceRecord,
} from "../lib/locations/resolveLocation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const columns = [
  "id",
  "title",
  "location_master_id",
  "region_normalized",
  "territorial_authority_normalized",
  "major_name_normalized",
  "suburb_locality_normalized",
  "region",
  "city",
  "district",
  "area",
  "suburb",
  "custom_locality",
].join(", ");

async function auditTable(table: "public_jobs" | "public_properties") {
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data || []) as unknown as Array<LocationSourceRecord & { id: string; title?: string | null }>).map((record) => {
    const resolved = resolveLocation(record);
    const hasNormalized =
      Boolean(record.region_normalized) &&
      Boolean(record.territorial_authority_normalized) &&
      Boolean(record.suburb_locality_normalized);

    return {
      table,
      id: record.id,
      title: record.title,
      current: {
        region_normalized: record.region_normalized,
        territorial_authority_normalized:
          record.territorial_authority_normalized,
        suburb_locality_normalized: record.suburb_locality_normalized,
        region: record.region,
        city: record.city,
        district: record.district,
        area: record.area,
        suburb: record.suburb,
        custom_locality: record.custom_locality,
      },
      resolved: {
        region: resolved.region,
        cityDistrict: resolved.cityDistrict,
        locality: resolved.locality,
        source: resolved.source,
      },
      updateCandidate:
        resolved.isComplete && !resolved.needsReview && !hasNormalized,
      needsReview: resolved.needsReview || !resolved.isComplete,
      conflictFields: resolved.conflictFields,
    };
  });
}

async function main() {
  const [jobs, properties] = await Promise.all([
    auditTable("public_jobs"),
    auditTable("public_properties"),
  ]);
  const rows = [...jobs, ...properties];

  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary: {
          total: rows.length,
          updateCandidates: rows.filter((row) => row.updateCandidate).length,
          needsReview: rows.filter((row) => row.needsReview).length,
        },
        rows,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
