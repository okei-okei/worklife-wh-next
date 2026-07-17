/**
 * Review-only scaffold for safely backfilling location_master_id.
 *
 * Rules:
 * - dry-run is mandatory in the current scaffold
 * - never changes address, latitude, longitude, location, region, city, area, suburb
 * - only proposes normalized column updates
 * - address-only inference is not allowed
 */

type ListingLike = {
  id: string;
  region?: string | null;
  city?: string | null;
  district?: string | null;
  area?: string | null;
  suburb?: string | null;
  location?: string | null;
  address?: string | null;
};

type MasterLocation = {
  id: string;
  region: string | null;
  territorial_authority: string | null;
  major_name: string | null;
  suburb_locality: string;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export function findSafeLocationMatch(
  record: ListingLike,
  locations: MasterLocation[],
) {
  const existingSuburb = normalize(record.suburb || record.area);
  const existingCity = normalize(record.city || record.district || record.location);

  if (!existingSuburb || !existingCity) {
    return { status: "review_required" as const, reason: "missing suburb/city" };
  }

  const matches = locations.filter((location) => {
    const suburbMatches = normalize(location.suburb_locality) === existingSuburb;
    const cityMatches = [
      location.territorial_authority,
      location.major_name,
    ].some((value) => normalize(value) === existingCity);

    return suburbMatches && cityMatches;
  });

  if (matches.length === 1) {
    return { status: "safe_match" as const, location: matches[0] };
  }

  return {
    status: "review_required" as const,
    reason: matches.length ? "ambiguous matches" : "no exact match",
    matches,
  };
}

async function main() {
  if (!process.argv.includes("--dry-run")) {
    throw new Error("Only --dry-run is supported. Manual review is required before writes.");
  }

  console.log("Backfill scaffold ready.");
  console.log("Next step: load candidate rows and nz_locations via Supabase service role in a controlled script.");
  console.log("Only exact suburb + city/TA matches with a single candidate may be proposed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
