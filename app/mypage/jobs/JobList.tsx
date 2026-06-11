"use client";

import { supabase } from "@/lib/supabase";
import { Job } from "./types";
import { geocodeAddress } from "@/lib/geocoder";

type Props = {
  jobs: Job[];
  onRefresh: () => void;
  onEdit: (job: Job) => void;
};

export default function JobList({ jobs, onRefresh, onEdit }: Props) {
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("この求人を削除しますか？");
    if (!confirmed) return;

    const { error } = await supabase.from("saved_jobs").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    onRefresh();
  };

  // 🔥 Re-geocode existing job (fix missing latitude/longitude)
  const handleReGeocode = async (job: Job) => {
    if (!job.address) {
      alert("住所がないためジオコードできません");
      return;
    }

    const geo = await geocodeAddress(job.address);

    const { error } = await supabase
      .from("saved_jobs")
      .update({
        latitude: geo.latitude,
        longitude: geo.longitude,
      })
      .eq("id", job.id);

    if (error) {
      alert(error.message);
      return;
    }

    onRefresh();
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white p-6 rounded-2xl shadow flex justify-between"
        >
          {/* LEFT SIDE */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{job.title}</h2>

            <p className="text-sm text-gray-600">
              ステータス: {job.status || "-"}
            </p>

            <p className="text-sm text-gray-600">
              時給: {job.hourly_rate ? `$${job.hourly_rate}` : "未設定"}
            </p>

            <p className="text-sm text-gray-600">
              週時間: {job.work_hours ?? "未設定"}
            </p>

            <p className="text-sm text-gray-600">
              住所: {job.address || "未設定"}
            </p>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 break-all text-sm"
            >
              {job.url}
            </a>

            {/* Debug: coordinate status */}
            <p className="text-xs text-gray-400">
              {job.latitude && job.longitude
                ? `📍 Geocoded`
                : `⚠️ No coordinates`}
            </p>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex flex-col gap-2">
            {/* EDIT */}
            <button
              onClick={() => onEdit(job)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              編集
            </button>

            {/* DELETE */}
            <button
              onClick={() => handleDelete(job.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              削除
            </button>
          </div>
        </div>
      ))}

      {jobs.length === 0 && (
        <div className="bg-white p-6 rounded-2xl text-center text-gray-500">
          求人がまだありません
        </div>
      )}
    </div>
  );
}
