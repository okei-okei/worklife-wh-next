import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocoder";

type SavePropertyParams = {
  userId: string;
  title: string;
  url: string;
  location: string;
  rentWeekly: number | null;
  address: string;
};

export async function fetchProperties() {
  const { data, error } = await supabase
    .from("saved_properties")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveProperty({
  userId,
  title,
  url,
  location,
  rentWeekly,
  address,
}: SavePropertyParams) {
  const coordinates = await geocodeAddress(address);

  const { error } = await supabase.from("saved_properties").insert({
    user_id: userId,
    title,
    url,
    location,
    rent_weekly: rentWeekly,
    address,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });

  if (error) {
    throw error;
  }
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from("saved_properties")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
