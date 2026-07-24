import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  dbRowToLocationOption,
  mergeLocationOptions,
} from "@/lib/locations/locationMaster";

export async function GET() {
  const { data, error } = await supabase
    .from("nz_locations")
    .select(
      "id, location_key, region, territorial_authority, major_name, suburb_locality, additional_names, is_active, display_order",
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("region", { ascending: true })
    .order("major_name", { ascending: true })
    .order("suburb_locality", { ascending: true });

  if (error) {
    return NextResponse.json({
      locations: mergeLocationOptions([]),
      warning: error.message,
    });
  }

  return NextResponse.json({
    locations: mergeLocationOptions((data || []).map(dbRowToLocationOption)),
  });
}
