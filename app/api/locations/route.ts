import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  dbRowToLocationOption,
  mergeLocationOptions,
  optionRowToLocationOption,
} from "@/lib/locations/locationMaster";
import {
  locationOptionFromResolved,
  resolveLocation,
} from "@/lib/locations/resolveLocation";

export async function GET() {
  const [masterResult, optionResult, jobResult, propertyResult] =
    await Promise.all([
    supabase
      .from("nz_locations")
      .select(
        "id, location_key, region, territorial_authority, major_name, suburb_locality, additional_names, is_active, display_order",
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("region", { ascending: true })
      .order("major_name", { ascending: true })
      .order("suburb_locality", { ascending: true }),
    supabase
      .from("location_options")
      .select("id, level, name, parent_region, parent_city_district, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("public_jobs")
      .select(
        "location_master_id, region_normalized, territorial_authority_normalized, major_name_normalized, suburb_locality_normalized, region, city, district, area, suburb, custom_locality",
      )
      .eq("is_active", true),
    supabase
      .from("public_properties")
      .select(
        "location_master_id, region_normalized, territorial_authority_normalized, major_name_normalized, suburb_locality_normalized, region, city, district, area, suburb, custom_locality",
      )
      .eq("is_active", true),
    ]);

  const masterLocations = masterResult.error
    ? []
    : (masterResult.data || []).map(dbRowToLocationOption);
  const addedLocations = optionResult.error
    ? []
    : (optionResult.data || []).map(optionRowToLocationOption);
  const existingListingLocations = [
    ...(jobResult.error ? [] : jobResult.data || []),
    ...(propertyResult.error ? [] : propertyResult.data || []),
  ]
    .map((row) =>
      locationOptionFromResolved(
        resolveLocation(row, [...masterLocations, ...addedLocations]),
      ),
    )
    .filter((location): location is NonNullable<typeof location> =>
      Boolean(location),
    );

  return NextResponse.json({
    locations: mergeLocationOptions([
      ...masterLocations,
      ...addedLocations,
      ...existingListingLocations,
    ]),
    warning: masterResult.error?.message || optionResult.error?.message || null,
  });
}
