"use client";

import { useState } from "react";
import NzLocationPicker from "@/components/NzLocationPicker";
import { geocodeAddress } from "@/lib/geocoder";
import { supabase } from "@/lib/supabase";

type SaveState = "idle" | "geocoding" | "saving";

function isMissingColumnError(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("column") ||
      error?.message?.includes("schema cache"),
  );
}

function buildNzGeocodeQuery(address: string) {
  const trimmed = address.trim();
  if (/\b(new zealand|nz)\b/i.test(trimmed)) return trimmed;

  return `${trimmed}, New Zealand`;
}

function RequiredMark() {
  return (
    <>
      <span
        className="ml-1 text-xs font-semibold text-red-600"
        aria-hidden="true"
      >
        *
      </span>
      <span className="sr-only">必須</span>
    </>
  );
}

export default function JobForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [accommodationAvailable, setAccommodationAvailable] = useState("");
  const [status, setStatus] = useState("気になる");
  const [address, setAddress] = useState("");
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [titleError, setTitleError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const isSaving = saveState !== "idle";

  const handleFetchFromUrl = async () => {
    if (!url.trim()) {
      setFormError("URLを入力してください。");
      return;
    }

    setFormError("");
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
        setFormError(data.error || "URLから情報を取得できませんでした。");
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
    setTitleError("");
    setAddressError("");
    setFormError("");
    setMessage("");

    const trimmedTitle = title.trim();
    const trimmedAddress = address.trim();
    const trimmedUrl = url.trim();
    const trimmedCompany = company.trim();
    const trimmedLocation = location.trim();

    if (!trimmedTitle) {
      setTitleError("求人タイトルを入力してください");
      return;
    }

    if (!trimmedAddress) {
      setAddressError("住所を入力してください");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFormError("ログインしてください。");
      return;
    }

    let latitude: number | null = null;
    let longitude: number | null = null;
    let geocodeFailed = false;

    setSaveState("geocoding");

    try {
      const geo = await geocodeAddress(buildNzGeocodeQuery(trimmedAddress));
      latitude = geo.latitude ?? null;
      longitude = geo.longitude ?? null;
      geocodeFailed = latitude == null || longitude == null;
    } catch {
      geocodeFailed = true;
    }

    setSaveState("saving");

    const fullPayload = {
      user_id: user.id,
      title: trimmedTitle,
      company: trimmedCompany || null,
      url: trimmedUrl || null,
      location: trimmedLocation || null,
      employment_type: employmentType || null,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      work_hours: workHours ? Number(workHours) : null,
      accommodation_available:
        accommodationAvailable === ""
          ? null
          : accommodationAvailable === "true",
      status: status || null,
      address: trimmedAddress,
      latitude,
      longitude,
    };

    const basicPayload = {
      user_id: user.id,
      title: trimmedTitle,
      company: trimmedCompany || null,
      url: trimmedUrl || null,
      location: trimmedLocation || null,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      work_hours: workHours ? Number(workHours) : null,
      status: status || null,
      address: trimmedAddress,
      latitude,
      longitude,
    };

    const { error } = await supabase.from("saved_jobs").insert(fullPayload);

    if (error && isMissingColumnError(error)) {
      const { error: fallbackError } = await supabase
        .from("saved_jobs")
        .insert(basicPayload);

      if (fallbackError) {
        setSaveState("idle");
        setFormError(fallbackError.message);
        return;
      }
    } else if (error) {
      setSaveState("idle");
      setFormError(error.message);
      return;
    }

    setTitle("");
    setCompany("");
    setUrl("");
    setLocation("");
    setEmploymentType("");
    setHourlyRate("");
    setWorkHours("");
    setAccommodationAvailable("");
    setStatus("気になる");
    setAddress("");
    setSaveState("idle");
    setMessage(
      geocodeFailed
        ? "求人を保存しましたが、住所から地図上の位置を取得できませんでした。住所を確認して編集してください。"
        : "求人を保存しました。時給や勤務時間は、保存した求人の編集画面から追加できます。",
    );

    onSaved();
  };

  return (
    <form
      onSubmit={handleSave}
      noValidate
      className="space-y-4 rounded-2xl bg-white p-3 text-gray-900 shadow md:p-6"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">
          求人を保存する
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-700">
          <span className="font-bold text-red-600">*</span>{" "}
          は必須項目です。その他の項目は未入力でも保存できます。
        </p>
      </div>

      {formError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {formError}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">
          {message}
        </p>
      ) : null}

      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">
            求人タイトル
            <RequiredMark />
          </span>
          <input
            id="saved-job-title"
            className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base ${
              titleError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="例: Cafe Staff"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? "saved-job-title-error" : undefined}
          />
          {titleError ? (
            <p id="saved-job-title-error" className="mt-1 text-xs font-bold text-red-600">
              {titleError}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">会社名</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base"
            placeholder="例: WorkLife Cafe"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-gray-900">求人URL</span>
        <input
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>

      <button
        type="button"
        onClick={handleFetchFromUrl}
        disabled={isFetchingLink || isSaving}
        className="w-full rounded-lg border border-blue-600 px-3 py-2 text-sm font-bold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2 md:px-4 md:py-3 md:text-base"
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

      <div className="grid gap-3 md:gap-4 md:grid-cols-4">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">時給</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base"
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
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
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
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            value={accommodationAvailable}
            onChange={(e) => setAccommodationAvailable(e.target.value)}
          >
            <option value="">要確認</option>
            <option value="true">可</option>
            <option value="false">なし</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-gray-900">
          住所
          <RequiredMark />
        </span>
        <input
          id="saved-job-address"
          className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base ${
            addressError ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="例: Hornby, Christchurch"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={240}
          required
          aria-invalid={Boolean(addressError)}
          aria-describedby={
            addressError ? "saved-job-address-error" : undefined
          }
        />
        {addressError ? (
          <p id="saved-job-address-error" className="mt-1 text-xs font-bold text-red-600">
            {addressError}
          </p>
        ) : null}
      </label>

      <label className="block">
        <span className="text-sm font-bold text-gray-900">ステータス</span>
        <select
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
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

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {saveState === "geocoding"
          ? "住所を確認中..."
          : saveState === "saving"
            ? "保存中..."
            : "求人を保存"}
      </button>
    </form>
  );
}
