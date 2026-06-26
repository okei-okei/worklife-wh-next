"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocoder";
import NzLocationPicker from "@/components/NzLocationPicker";

export default function PropertyForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
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
        alert(data.error || "URLから情報を取得できませんでした");
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert("ログインしてください");

    const geo = await geocodeAddress(address);

    const { error } = await supabase.from("saved_properties").insert({
      user_id: user.id,
      title,
      url,
      location,
      address,
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
      latitude: geo.latitude,
      longitude: geo.longitude,
    });

    if (error) return alert(error.message);

    setTitle("");
    setUrl("");
    setLocation("");
    setAddress("");
    setRent("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
    setAvailableFrom("");
    setUtilitiesIncluded("");
    setPetsAllowed("");
    setSmokingAllowed("");

    onSaved();
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-5 rounded-2xl bg-white p-4 text-gray-900 shadow md:p-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">物件を保存する</h2>
        <p className="mt-1 text-sm font-medium text-gray-700">
          外部サイトで見つけた物件を、公開物件カードと近い項目で保存できます。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">物件名</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="例: City flat near station"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">物件URL</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleFetchFromUrl}
        disabled={isFetchingLink}
        className="w-full rounded-lg border border-blue-600 px-4 py-3 font-bold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
      >
        {isFetchingLink ? "取得中..." : "URLから物件内容を取得"}
      </button>

      <NzLocationPicker
        label="地域"
        value={location}
        onChange={setLocation}
        onSelectionChange={(selection) => setLocation(selection.label)}
        showCurrentLocation={false}
      />

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
          <span className="text-sm font-bold text-gray-900">週家賃</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 placeholder:text-gray-600"
            placeholder="300"
            type="number"
            min="0"
            step="0.01"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">ベッド</span>
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900"
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">光熱費込み</span>
          <select
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-base font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-base font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-base font-medium text-gray-900"
            value={smokingAllowed}
            onChange={(e) => setSmokingAllowed(e.target.value)}
          >
            <option value="">要確認</option>
            <option value="true">可</option>
            <option value="false">不可</option>
          </select>
        </label>
      </div>

      <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white sm:w-auto">
        物件を保存
      </button>
    </form>
  );
}
