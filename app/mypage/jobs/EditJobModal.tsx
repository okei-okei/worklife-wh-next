"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Job } from "./types";
import { geocodeAddress } from "@/lib/geocoder";
import NzLocationPicker from "@/components/NzLocationPicker";

type Props = {
  job: Job | null;
  userId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

function isMissingColumnError(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("column") ||
      error?.message?.includes("schema cache"),
  );
}

export default function EditJobModal({
  job,
  userId,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [accommodationAvailable, setAccommodationAvailable] = useState("");
  const [status, setStatus] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!job) return;

    const timer = window.setTimeout(() => {
      setTitle(job.title || "");
      setCompany(job.company || "");
      setUrl(job.url || "");
      setLocation(job.location || "");
      setEmploymentType(job.employment_type || "");
      setHourlyRate(job.hourly_rate?.toString() || "");
      setWorkHours(job.work_hours?.toString() || "");
      setAccommodationAvailable(
        job.accommodation_available == null
          ? ""
          : String(job.accommodation_available),
      );
      setStatus(job.status || "気になる");
      setAddress(job.address || "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [job]);

  if (!job) return null;

  const handleUpdate = async () => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    const confirmed = window.confirm("更新しますか？");
    if (!confirmed) return;

    let latitude = job.latitude;
    let longitude = job.longitude;

    const locationText = [address, location, "New Zealand"]
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part, index, all) => all.indexOf(part) === index)
      .join(", ");

    if (locationText) {
      const geo = await geocodeAddress(locationText);

      if (geo.latitude && geo.longitude) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const fullPayload = {
      title,
      company: company || null,
      url,
      location: location || null,
      employment_type: employmentType || null,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      work_hours: workHours ? Number(workHours) : null,
      accommodation_available:
        accommodationAvailable === ""
          ? null
          : accommodationAvailable === "true",
      status,
      address,
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    };

    const basicPayload = {
      title,
      company: company || null,
      url,
      location: location || null,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      work_hours: workHours ? Number(workHours) : null,
      status,
      address,
      latitude,
      longitude,
    };

    const { error } = await supabase
      .from("saved_jobs")
      .update(fullPayload)
      .eq("id", job.id)
      .eq("user_id", userId)
      .select();

    if (error && isMissingColumnError(error)) {
      const { error: fallbackError } = await supabase
        .from("saved_jobs")
        .update(basicPayload)
        .eq("id", job.id)
        .eq("user_id", userId)
        .select();

      if (fallbackError) {
        alert(fallbackError.message);
        return;
      }

      alert("更新しました");
      await onUpdated();
      onClose();
      return;
    }

    if (error) {
      alert(error.message);
      return;
    }

    alert("更新しました");

    await onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 text-gray-900 shadow-xl md:p-6">
        <h2 className="text-xl font-bold">求人編集</h2>
        <p className="mt-1 text-sm font-medium text-gray-700">
          公開求人カードに近い項目で保存内容を整理できます。
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-gray-900">求人タイトル</span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-900">会社名</span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-gray-900">求人URL</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>

        <div className="mt-4">
          <NzLocationPicker
            label="地域"
            value={location}
            onChange={setLocation}
            onSelectionChange={(selection) => setLocation(selection.label)}
            showCurrentLocation={false}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="text-sm font-bold text-gray-900">時給</span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-900">週勤務時間</span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              type="number"
              min="0"
              step="0.5"
              value={workHours}
              onChange={(e) => setWorkHours(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-900">採用形態</span>
            <select
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">未設定</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Casual">Casual</option>
              <option value="Seasonal">Seasonal</option>
              <option value="Fixed-term">Fixed-term</option>
              <option value="Internship">Internship</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-900">住み込み</span>
            <select
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
              value={accommodationAvailable}
              onChange={(e) => setAccommodationAvailable(e.target.value)}
            >
              <option value="">要確認</option>
              <option value="true">可</option>
              <option value="false">なし</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-gray-900">住所</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-gray-900">ステータス</span>
          <select
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="気になる">気になる</option>
            <option value="応募予定">応募予定</option>
            <option value="応募済み">応募済み</option>
            <option value="返信待ち">返信待ち</option>
            <option value="面接予定">面接予定</option>
            <option value="トライアル予定">トライアル予定</option>
            <option value="採用">採用</option>
            <option value="不採用">不採用</option>
            <option value="辞退">辞退</option>
          </select>
        </label>

        <div className="mt-6 flex flex-col justify-end gap-2 sm:flex-row">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            キャンセル
          </button>

          <button
            onClick={handleUpdate}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 sm:w-auto"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
}
