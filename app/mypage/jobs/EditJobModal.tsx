"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Job } from "./types";
import { geocodeAddress } from "@/lib/geocoder";

type Props = {
  job: Job | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditJobModal({ job, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [status, setStatus] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!job) return;

    setTitle(job.title || "");
    setUrl(job.url || "");
    setHourlyRate(job.hourly_rate?.toString() || "");
    setWorkHours(job.work_hours?.toString() || "");
    setStatus(job.status || "気になる");
    setAddress(job.address || "");
  }, [job]);

  if (!job) return null;

  const handleUpdate = async () => {
    const confirmed = window.confirm("更新しますか？");
    if (!confirmed) return;

    let latitude = job.latitude;
    let longitude = job.longitude;

    if (address && address.trim() !== "") {
      const geo = await geocodeAddress(address);

      if (geo.latitude && geo.longitude) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const { data, error } = await supabase
      .from("saved_jobs")
      .update({
        title,
        url,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        work_hours: workHours ? Number(workHours) : null,
        status,
        address,
        latitude,
        longitude,
      })
      .eq("id", job.id)
      .select();

    console.log("update result", data);
    console.log("update error", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("更新しました");

    await onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-[500px] space-y-3">
        <h2 className="text-xl font-bold">求人編集</h2>

        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="number"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="number"
          value={workHours}
          onChange={(e) => setWorkHours(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="気になる">気になる</option>
          <option value="応募予定">応募予定</option>
          <option value="応募済み">応募済み</option>
          <option value="面接予定">面接予定</option>
          <option value="採用">採用</option>
          <option value="不採用">不採用</option>
        </select>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            キャンセル
          </button>

          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
}
