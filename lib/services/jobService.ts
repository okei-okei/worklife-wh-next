import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocoder";

type SaveJobParams = {
  userId: string;
  title: string;
  url: string;
  hourlyRate: number | null;
  workHours: number | null;
  status: string;
  address: string;
};

export async function fetchJobs(userId: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveJob({
  userId,
  title,
  url,
  hourlyRate,
  workHours,
  status,
  address,
}: SaveJobParams) {
  const coordinates = await geocodeAddress(address);

  const { error } = await supabase.from("saved_jobs").insert({
    user_id: userId,
    title,
    url,
    hourly_rate: hourlyRate,
    work_hours: workHours,
    status,
    address,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });

  if (error) {
    throw error;
  }
}

export async function deleteJob(id: string, userId: string) {
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
