import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeNullableUuid } from "@/lib/uuid";

type ResolveValidLocationMasterIdOptions = {
  referencedTable?: "nz_locations";
};

export async function resolveValidLocationMasterId(
  client: SupabaseClient,
  candidate: unknown,
  options: ResolveValidLocationMasterIdOptions = {},
) {
  const locationMasterId = normalizeNullableUuid(candidate);
  if (!locationMasterId) return null;

  const referencedTable = options.referencedTable || "nz_locations";
  const { data, error } = await client
    .from(referencedTable)
    .select("id")
    .eq("id", locationMasterId)
    .maybeSingle();

  if (error) {
    console.warn("Location master id validation failed", {
      referencedTable,
      reason: error.message,
    });
    return null;
  }

  return data?.id === locationMasterId ? locationMasterId : null;
}
