"use client";

import { useState } from "react";
import NzLocationPicker from "@/components/NzLocationPicker";
import type { NzLocation } from "@/lib/constants/nzLocations";
import { geocodeAddress } from "@/lib/geocoder";
import { getNormalizedLocationPayload } from "@/lib/locationDisplay";
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

export default function PropertyForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<NzLocation | null>(
    null,
  );
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [utilitiesIncluded, setUtilitiesIncluded] = useState("");
  const [petsAllowed, setPetsAllowed] = useState("");
  const [smokingAllowed, setSmokingAllowed] = useState("");
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
          kind: "property",
        }),
      });

      const data = (await response.json()) as {
        title?: string;
        rentWeekly?: number | null;
        address?: string;
        error?: string;
      };

      if (!response.ok) {
        setFormError(data.error || "URLから情報を取得できませんでした。");
        return;
      }

      if (data.title && !title) setTitle(data.title);
      if (data.rentWeekly && !rent) setRent(String(data.rentWeekly));
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
    const trimmedLocation = location.trim();

    if (!trimmedTitle) {
      setTitleError("物件タイトルを入力してください");
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
      url: trimmedUrl || null,
      location: trimmedLocation || null,
      address: trimmedAddress,
      rent_weekly: rent ? Number(rent) : null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      parking_spaces: parkingSpaces ? Number(parkingSpaces) : null,
      available_from: availableFrom || null,
      utilities_included:
        utilitiesIncluded === "" ? null : utilitiesIncluded === "true",
      bills_included:
        utilitiesIncluded === "" ? null : utilitiesIncluded === "true",
      pets_allowed: petsAllowed === "" ? null : petsAllowed === "true",
      smoking_allowed:
        smokingAllowed === "" ? null : smokingAllowed === "true",
      status: "気になる",
      latitude,
      longitude,
    };

    const compatiblePayload = {
      user_id: user.id,
      title: trimmedTitle,
      url: trimmedUrl || null,
      location: trimmedLocation || null,
      address: trimmedAddress,
      rent_weekly: rent ? Number(rent) : null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      parking_spaces: parkingSpaces ? Number(parkingSpaces) : null,
      utilities_included:
        utilitiesIncluded === "" ? null : utilitiesIncluded === "true",
      bills_included:
        utilitiesIncluded === "" ? null : utilitiesIncluded === "true",
      status: "気になる",
      latitude,
      longitude,
    };

    const basicPayload = {
      user_id: user.id,
      title: trimmedTitle,
      url: trimmedUrl || null,
      location: trimmedLocation || null,
      address: trimmedAddress,
      rent_weekly: rent ? Number(rent) : null,
      status: "気になる",
      latitude,
      longitude,
      ...getNormalizedLocationPayload(selectedLocation),
    };

    const attempts: Array<Record<string, unknown>> = [
      fullPayload,
      compatiblePayload,
      basicPayload,
    ];
    let lastError: { message?: string } | null = null;

    for (const payload of attempts) {
      const { error } = await supabase.from("saved_properties").insert(payload);

      if (!error) {
        lastError = null;
        break;
      }

      lastError = error;
      if (!isMissingColumnError(error)) break;
    }

    if (lastError) {
      setSaveState("idle");
      setFormError(lastError.message || "物件を保存できませんでした。");
      return;
    }

    setTitle("");
    setUrl("");
    setLocation("");
    setSelectedLocation(null);
    setAddress("");
    setRent("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
    setAvailableFrom("");
    setUtilitiesIncluded("");
    setPetsAllowed("");
    setSmokingAllowed("");
    setSaveState("idle");
    setMessage(
      geocodeFailed
        ? "物件を保存しましたが、住所から地図上の位置を取得できませんでした。住所を確認して編集してください。"
        : "物件を保存しました。家賃や部屋数は、保存した物件の編集画面から追加できます。",
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
          物件を保存する
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
            物件名
            <RequiredMark />
          </span>
          <input
            id="saved-property-title"
            className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base ${
              titleError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="例: City flat near station"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            aria-invalid={Boolean(titleError)}
            aria-describedby={
              titleError ? "saved-property-title-error" : undefined
            }
          />
          {titleError ? (
            <p id="saved-property-title-error" className="mt-1 text-xs font-bold text-red-600">
              {titleError}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">物件URL</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleFetchFromUrl}
        disabled={isFetchingLink || isSaving}
        className="w-full rounded-lg border border-blue-600 px-3 py-2 text-sm font-bold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2 md:px-4 md:py-3 md:text-base"
      >
        {isFetchingLink ? "取得中..." : "URLから物件内容を取得"}
      </button>

      <NzLocationPicker
        label="地域（検索・絞り込み用）"
        value={location}
        onChange={setLocation}
        onSelectionChange={(selection) => {
          setLocation(selection.label);
          setSelectedLocation({
            id: selection.id || "",
            linzId: selection.linzId ?? null,
            countryCode: selection.countryCode,
            region: selection.region,
            district: selection.district,
            area: selection.area,
            territorialAuthority:
              selection.territorialAuthority || selection.district,
            majorName: selection.majorName || null,
            suburbLocality: selection.suburbLocality || selection.area,
            additionalNames: [],
            latitude: null,
            longitude: null,
            label: selection.label,
            searchText: selection.searchText || selection.label.toLowerCase(),
            isActive: true,
          });
        }}
        showCurrentLocation={false}
      />

      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">
            住所
            <RequiredMark />
          </span>
          <input
            id="saved-property-address"
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
              addressError ? "saved-property-address-error" : undefined
            }
          />
          {addressError ? (
            <p id="saved-property-address-error" className="mt-1 text-xs font-bold text-red-600">
              {addressError}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">週家賃</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-600 md:p-3 md:text-base"
            placeholder="300"
            type="number"
            min="0"
            step="0.01"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-4">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">ベッド</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            type="number"
            min="0"
            step="0.5"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">バス</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            type="number"
            min="0"
            step="0.5"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">駐車場</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            type="number"
            min="0"
            step="1"
            value={parkingSpaces}
            onChange={(e) => setParkingSpaces(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">入居可能日</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">光熱費込み</span>
          <select
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            value={utilitiesIncluded}
            onChange={(e) => setUtilitiesIncluded(e.target.value)}
          >
            <option value="">要確認</option>
            <option value="true">光熱費込み</option>
            <option value="false">光熱費別</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">ペット可</span>
          <select
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            value={petsAllowed}
            onChange={(e) => setPetsAllowed(e.target.value)}
          >
            <option value="">要確認</option>
            <option value="true">可</option>
            <option value="false">不可</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">喫煙</span>
          <select
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 md:p-3 md:text-base"
            value={smokingAllowed}
            onChange={(e) => setSmokingAllowed(e.target.value)}
          >
            <option value="">要確認</option>
            <option value="true">可</option>
            <option value="false">不可</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
