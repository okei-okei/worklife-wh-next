"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocoder";

export default function JobForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [status, setStatus] = useState("気になる");
  const [address, setAddress] = useState("");
  const [isFetchingLink, setIsFetchingLink] = useState(false);

  const handleFetchFromUrl = async () => {
    if (!url) {
      alert("URLを入力してください");
      return;
    }

    setIsFetchingLink(true);

    try {
      const response = await fetch("/api/link-preview", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url,
          kind: "job",
        }),
      });

      const data = (await response.json()) as {
        title?: string;
        hourlyRate?: number | null;
        address?: string;
        error?: string;
      };

      if (!response.ok) {
        alert(data.error || "URLから情報を取得できませんでした");
        return;
      }

      if (data.title && !title) setTitle(data.title);
      if (data.hourlyRate && !hourlyRate) setHourlyRate(String(data.hourlyRate));
      if (data.address && !address) setAddress(data.address);
    } finally {
      setIsFetchingLink(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert("ログインしてください");

    const geo = await geocodeAddress(address);

    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      title,
      url,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      work_hours: workHours ? Number(workHours) : null,
      status,
      address,
      latitude: geo.latitude,
      longitude: geo.longitude,
    });

    if (error) return alert(error.message);

    setTitle("");
    setUrl("");
    setHourlyRate("");
    setWorkHours("");
    setStatus("気になる");
    setAddress("");

    onSaved();
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <input
        className="w-full border p-3 rounded"
        placeholder="求人タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        className="w-full border p-3 rounded"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />

      <button
        type="button"
        onClick={handleFetchFromUrl}
        disabled={isFetchingLink}
        className="rounded-lg border border-blue-600 px-4 py-2 font-bold text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isFetchingLink ? "取得中..." : "URLから求人内容を取得"}
      </button>

      <input
        className="w-full border p-3 rounded"
        placeholder="時給"
        type="number"
        value={hourlyRate}
        onChange={(e) => setHourlyRate(e.target.value)}
      />

      <input
        className="w-full border p-3 rounded"
        placeholder="週勤務時間"
        type="number"
        value={workHours}
        onChange={(e) => setWorkHours(e.target.value)}
      />

      <input
        className="w-full border p-3 rounded"
        placeholder="住所"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <select
        className="w-full border p-3 rounded"
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

      <button className="bg-blue-600 text-white px-6 py-3 rounded">保存</button>
    </form>
  );
}
