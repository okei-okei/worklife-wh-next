"use client";

import { useState } from "react";
import { geocodeAddress } from "@/lib/geocoder";
import { supabase } from "@/lib/supabase";

type SaveState = "idle" | "geocoding" | "saving";

function buildNzGeocodeQuery(address: string) {
  const trimmed = address.trim();
  if (/\b(new zealand|nz)\b/i.test(trimmed)) return trimmed;

  return `${trimmed}, New Zealand`;
}

export default function PropertyForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isSaving = saveState !== "idle";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    const trimmedTitle = title.trim();
    const trimmedAddress = address.trim();

    if (!trimmedTitle) {
      setErrorMessage("物件タイトルを入力してください。");
      return;
    }

    if (!trimmedAddress) {
      setErrorMessage("住所を入力してください。");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("ログインしてください。");
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

    const payload = {
      user_id: user.id,
      title: trimmedTitle,
      address: trimmedAddress,
      latitude,
      longitude,
    };

    const { error } = await supabase.from("saved_properties").insert(payload);

    if (error) {
      setSaveState("idle");
      setErrorMessage(error.message);
      return;
    }

    setTitle("");
    setAddress("");
    setSaveState("idle");
    setMessage(
      geocodeFailed
        ? "物件を保存しました。住所は保存しましたが、地図上の位置を取得できませんでした。編集画面から住所を確認してください。家賃や部屋数は、保存した物件の編集画面から追加できます。"
        : "物件を保存しました。家賃や部屋数は、保存した物件の編集画面から追加できます。",
    );

    onSaved();
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-3 rounded-2xl bg-white p-3 text-gray-900 shadow md:p-5"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">
          物件を保存する
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-700">
          まずは物件タイトルと住所だけ保存できます。家賃や部屋数はあとから追加できます。
        </p>
      </div>

      {errorMessage ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {message ? (
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">
          <p>{message}</p>
          <p className="mt-1 text-xs font-semibold text-blue-700">
            詳細を追加する場合は、保存済み物件カードの「編集」から入力できます。
          </p>
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-bold text-gray-900">物件タイトル</span>
        <input
          className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-900 placeholder:text-gray-500"
          placeholder="例: Hornby Share House"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-gray-900">住所</span>
        <input
          className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-900 placeholder:text-gray-500"
          placeholder="例: Hornby, Christchurch"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={240}
          required
        />
        <span className="mt-1 block text-xs font-medium text-gray-600">
          地図表示のため、できるだけ地区名や都市名まで入力してください。
        </span>
      </label>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {saveState === "geocoding"
          ? "住所を確認中..."
          : saveState === "saving"
            ? "保存中..."
            : "物件を保存"}
      </button>
    </form>
  );
}
