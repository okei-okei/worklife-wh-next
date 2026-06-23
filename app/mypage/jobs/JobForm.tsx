"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocoder";
import NzLocationPicker from "@/components/NzLocationPicker";

export default function JobForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [accommodationAvailable, setAccommodationAvailable] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
      image_urls: imageUrl ? [imageUrl] : null,
      status,
      address,
      latitude: geo.latitude,
      longitude: geo.longitude,
    });

    if (error) return alert(error.message);

    setTitle("");
    setCompany("");
    setUrl("");
    setLocation("");
    setEmploymentType("");
    setHourlyRate("");
    setWorkHours("");
    setAccommodationAvailable("");
    setImageUrl("");
    setStatus("気になる");
    setAddress("");

    onSaved();
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-5 rounded-2xl bg-white p-4 text-gray-900 shadow md:p-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">求人を保存する</h2>
        <p className="mt-1 text-sm font-medium text-gray-700">
          外部サイトで見つけた求人を、公開求人カードと近い項目で保存できます。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">求人タイトル</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="例: Cafe Staff"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">会社名</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="例: WorkLife Cafe"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-gray-900">求人URL</span>
        <input
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </label>

      <button
        type="button"
        onClick={handleFetchFromUrl}
        disabled={isFetchingLink}
        className="w-full rounded-lg border border-blue-600 px-4 py-3 font-bold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
      >
        {isFetchingLink ? "取得中..." : "URLから求人内容を取得"}
      </button>

      <NzLocationPicker
        label="地域"
        value={location}
        onChange={setLocation}
        onSelectionChange={(selection) => setLocation(selection.label)}
        showCurrentLocation={false}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">時給</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="23.50"
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
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="30"
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
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-base font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-base font-medium text-gray-900"
            value={accommodationAvailable}
            onChange={(e) => setAccommodationAvailable(e.target.value)}
          >
            <option value="">要確認</option>
            <option value="true">可</option>
            <option value="false">なし</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">住所</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="地図・通勤計算に使う住所"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">画像URL</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="任意。カード上部に表示します"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-gray-900">ステータス</span>
        <select
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-base font-medium text-gray-900"
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

      <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white sm:w-auto">
        求人を保存
      </button>
    </form>
  );
}
