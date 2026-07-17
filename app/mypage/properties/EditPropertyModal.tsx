"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Property } from "./types";
import { geocodeAddress } from "@/lib/geocoder";
import NzLocationPicker from "@/components/NzLocationPicker";
import type { NzLocation } from "@/lib/constants/nzLocations";
import { getNormalizedLocationPayload } from "@/lib/locationDisplay";

type Props = {
  property: Property | null;
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

function buildNzGeocodeQuery(address: string, location?: string | null) {
  const parts = [address.trim(), location?.trim()]
    .filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index);

  const query = parts.join(", ");
  if (/\b(new zealand|nz)\b/i.test(query)) return query;

  return `${query}, New Zealand`;
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

export default function EditPropertyModal({
  property,
  userId,
  onClose,
  onUpdated,
}: Props) {
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
  const [selectedLocation, setSelectedLocation] = useState<NzLocation | null>(
    null,
  );

  useEffect(() => {
    if (!property) return;

    const timer = window.setTimeout(() => {
      setTitle(property.title || "");
      setUrl(property.url || "");
      setLocation(property.location || "");
      setAddress(property.address || "");
      setRent(property.rent_weekly?.toString() || "");
      setBedrooms(property.bedrooms?.toString() || "");
      setBathrooms(property.bathrooms?.toString() || "");
      setParkingSpaces(property.parking_spaces?.toString() || "");
      setAvailableFrom(property.available_from || "");
      const utilitiesValue =
        property.utilities_included ?? property.bills_included;
      setUtilitiesIncluded(
        utilitiesValue == null ? "" : String(utilitiesValue),
      );
      setPetsAllowed(
        property.pets_allowed == null ? "" : String(property.pets_allowed),
      );
      setSmokingAllowed(
        property.smoking_allowed == null
          ? ""
          : String(property.smoking_allowed),
      );
      setSelectedLocation(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [property]);

  if (!property) return null;

  const handleUpdate = async () => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    const confirmed = window.confirm("更新しますか？");
    if (!confirmed) return;

    let latitude = property.latitude;
    let longitude = property.longitude;
    const trimmedTitle = title.trim();
    const trimmedAddress = address.trim();
    const trimmedLocation = location.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedAddress) {
      alert("物件タイトルと住所を入力してください");
      return;
    }

    if (
      trimmedAddress !== (property.address || "").trim() ||
      trimmedLocation !== (property.location || "").trim()
    ) {
      const geo = await geocodeAddress(
        buildNzGeocodeQuery(trimmedAddress, trimmedLocation),
      );

      if (geo.latitude && geo.longitude) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const normalizedLocationPayload = selectedLocation
      ? getNormalizedLocationPayload(selectedLocation)
      : {};

    const fullPayload = {
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
      latitude,
      longitude,
    };

    const compatiblePayload = {
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
      latitude,
      longitude,
    };

    const basicPayload = {
      title: trimmedTitle,
      url: trimmedUrl || null,
      location: trimmedLocation || null,
      address: trimmedAddress,
      rent_weekly: rent ? Number(rent) : null,
      latitude,
      longitude,
      ...normalizedLocationPayload,
    };

    const attempts: Array<Record<string, unknown>> = [
      fullPayload,
      compatiblePayload,
      basicPayload,
    ];
    let lastError: { message?: string } | null = null;

    for (const payload of attempts) {
      const { error } = await supabase
        .from("saved_properties")
        .update(payload)
        .eq("id", property.id)
        .eq("user_id", userId);

      if (!error) {
        alert("更新しました");
        onUpdated();
        onClose();
        return;
      }

      lastError = error;

      if (!isMissingColumnError(error)) {
        break;
      }
    }

    if (lastError) {
      alert(lastError.message);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 text-gray-900 shadow-xl md:p-6">
        <h2 className="text-xl font-bold">物件編集</h2>
        <p className="mt-1 text-sm font-medium text-gray-700">
          <span className="font-bold text-red-600">*</span>{" "}
          は必須項目です。その他の項目は未入力でも更新できます。
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-gray-900">
              物件名
              <RequiredMark />
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-900">物件URL</span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
            />
          </label>
        </div>

        <div className="mt-4">
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
                searchText:
                  selection.searchText || selection.label.toLowerCase(),
                isActive: true,
              });
            }}
            showCurrentLocation={false}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-gray-900">
              住所
              <RequiredMark />
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="住所"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-900">週家賃</span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="300"
              type="number"
              min="0"
              step="0.01"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="text-sm font-bold text-gray-900">ベッド</span>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
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
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
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
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
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
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
              type="date"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-bold text-gray-900">光熱費込み</span>
            <select
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
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
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
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
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
              value={smokingAllowed}
              onChange={(e) => setSmokingAllowed(e.target.value)}
            >
              <option value="">要確認</option>
              <option value="true">可</option>
              <option value="false">不可</option>
            </select>
          </label>
        </div>

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
