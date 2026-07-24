"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { LocationOption } from "@/lib/locations/locationMaster";

type AddLevel = "region" | "city_district" | "locality";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export default function AdminLocationsPage() {
  const [accessToken, setAccessToken] = useState("");
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [regionName, setRegionName] = useState("");
  const [cityParentRegion, setCityParentRegion] = useState("");
  const [cityName, setCityName] = useState("");
  const [localityParentRegion, setLocalityParentRegion] = useState("");
  const [localityParentCity, setLocalityParentCity] = useState("");
  const [localityName, setLocalityName] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLocations = useCallback(async (token: string) => {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/locations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await response.json().catch(() => null)) as
      | { locations?: LocationOption[]; error?: string }
      | null;

    if (!response.ok) {
      setError(data?.error || "地域選択肢を取得できませんでした。");
      if (response.status === 401) {
        window.location.replace("/login?redirect=/admin/locations");
      }
      if (response.status === 403) window.location.replace("/");
      setIsLoading(false);
      return;
    }

    setLocations(data?.locations || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login?redirect=/admin/locations");
        return;
      }

      setAccessToken(session.access_token);
      await loadLocations(session.access_token);
    };

    initialize();
  }, [loadLocations]);

  const regions = useMemo(
    () => uniqueSorted(locations.map((location) => location.region)),
    [locations],
  );
  const cityDistricts = useMemo(
    () =>
      uniqueSorted(
        locations
          .filter((location) => location.region === localityParentRegion)
          .map((location) => location.cityDistrict),
      ),
    [locations, localityParentRegion],
  );
  const filteredLocations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return locations.filter((location) => {
      if (!normalizedSearch) return true;
      return [
        location.region,
        location.cityDistrict,
        location.locality,
        location.key,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [locations, search]);

  const addOption = async (level: AddLevel) => {
    if (!accessToken || isSaving) return;
    setIsSaving(true);
    setError("");
    setMessage("");

    const payload =
      level === "region"
        ? { level, name: regionName }
        : level === "city_district"
          ? {
              level,
              name: cityName,
              parentRegion: cityParentRegion,
            }
          : {
              level,
              name: localityName,
              parentRegion: localityParentRegion,
              parentCityDistrict: localityParentCity,
            };

    const response = await fetch("/api/admin/locations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    setIsSaving(false);
    if (!response.ok) {
      setError(data?.error || "選択肢を追加できませんでした。");
      return;
    }

    setMessage("選択肢を追加しました。公開求人・公開物件の絞り込みにも反映されます。");
    if (level === "region") setRegionName("");
    if (level === "city_district") setCityName("");
    if (level === "locality") setLocalityName("");
    await loadLocations(accessToken);
  };

  const addExistingListingLocation = async (location: LocationOption) => {
    if (!accessToken || isSaving) return;
    setIsSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/locations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: location.level || "locality",
        name:
          location.level === "region"
            ? location.region
            : location.level === "city_district"
              ? location.cityDistrict
              : location.locality,
        parentRegion: location.region,
        parentCityDistrict: location.cityDistrict,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    setIsSaving(false);
    if (!response.ok) {
      setError(data?.error || "選択肢へ追加できませんでした。");
      return;
    }

    setMessage("既存掲載で使用中の地域を選択肢へ追加しました。");
    await loadLocations(accessToken);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">WorkLife WH Admin</p>
            <h1 className="mt-1 text-2xl font-bold md:text-4xl">地域選択肢管理</h1>
            <p className="mt-2 text-sm font-medium text-gray-700">
              既存地域は変更せず、新しい選択肢だけを3階層で追加します。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/listings"
              className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900"
            >
              公開掲載管理
            </Link>
            <Link
              href="/admin"
              className="rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white"
            >
              ダッシュボード
            </Link>
          </div>
        </header>

        {message ? (
          <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          <form
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              addOption("region");
            }}
          >
            <h2 className="text-lg font-bold">Regionを追加</h2>
            <p className="mt-1 text-xs font-medium leading-5 text-gray-600">
              例: Auckland、Canterbury、Wellington
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-gray-700">
                新しいRegion名
              </span>
              <input
                value={regionName}
                onChange={(event) => setRegionName(event.target.value)}
                className={inputClass}
                placeholder="例: Auckland"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300"
            >
              Regionを追加
            </button>
          </form>

          <form
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              addOption("city_district");
            }}
          >
            <h2 className="text-lg font-bold">City / Districtを追加</h2>
            <p className="mt-1 text-xs font-medium leading-5 text-gray-600">
              選択したRegion内に新しいCity / Districtを追加します。
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-gray-700">Region</span>
              <select
                value={cityParentRegion}
                onChange={(event) => setCityParentRegion(event.target.value)}
                className={inputClass}
              >
                <option value="">Regionを選択</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-bold text-gray-700">
                新しいCity / District名
              </span>
              <input
                value={cityName}
                onChange={(event) => setCityName(event.target.value)}
                className={inputClass}
                placeholder="例: North Shore"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300"
            >
              City / Districtを追加
            </button>
          </form>

          <form
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              addOption("locality");
            }}
          >
            <h2 className="text-lg font-bold">Area / Suburbを追加</h2>
            <p className="mt-1 text-xs font-medium leading-5 text-gray-600">
              RegionとCity / Districtを選び、地域名を追加します。
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-gray-700">Region</span>
              <select
                value={localityParentRegion}
                onChange={(event) => {
                  setLocalityParentRegion(event.target.value);
                  setLocalityParentCity("");
                }}
                className={inputClass}
              >
                <option value="">Regionを選択</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-bold text-gray-700">
                City / District
              </span>
              <select
                value={localityParentCity}
                onChange={(event) => setLocalityParentCity(event.target.value)}
                disabled={!localityParentRegion}
                className={inputClass}
              >
                <option value="">
                  {localityParentRegion
                    ? "City / Districtを選択"
                    : "先にRegionを選択"}
                </option>
                {cityDistricts.map((cityDistrict) => (
                  <option key={cityDistrict} value={cityDistrict}>
                    {cityDistrict}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-bold text-gray-700">
                新しいArea / Suburb名
              </span>
              <input
                value={localityName}
                onChange={(event) => setLocalityName(event.target.value)}
                className={inputClass}
                placeholder="例: Browns Bay"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300"
            >
              地域を追加
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-bold">現在の選択肢</h2>
              <p className="mt-1 text-xs font-medium text-gray-600">
                既存選択肢と管理画面から追加した選択肢を統合表示しています。
              </p>
            </div>
            <label className="block md:w-72">
              <span className="text-xs font-bold text-gray-700">検索</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={inputClass}
                placeholder="Region / City / Area"
              />
            </label>
          </div>

          {isLoading ? (
            <p className="mt-5 text-sm font-bold text-gray-700">読み込み中...</p>
          ) : (
            <div className="mt-4 max-h-[520px] overflow-y-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 text-xs font-bold text-gray-700">
                  <tr>
                    <th className="px-3 py-3">Region</th>
                    <th className="px-3 py-3">City / District</th>
                    <th className="px-3 py-3">Area / Suburb</th>
                    <th className="px-3 py-3">区分</th>
                    <th className="px-3 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.slice(0, 200).map((location) => (
                    <tr
                      key={`${location.key}-${location.databaseId || ""}`}
                      className="border-t border-gray-100"
                    >
                      <td className="px-3 py-2 font-bold">{location.region}</td>
                      <td className="px-3 py-2">{location.cityDistrict || "-"}</td>
                      <td className="px-3 py-2">{location.locality || "-"}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                          {location.level === "region"
                            ? "Region"
                            : location.level === "city_district"
                              ? "City / District"
                              : "Area / Suburb"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {location.origin === "listing" ? (
                          <button
                            type="button"
                            onClick={() => addExistingListingLocation(location)}
                            disabled={isSaving}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 disabled:opacity-50"
                          >
                            選択肢へ追加
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-gray-500">
                            {location.origin === "admin"
                              ? "管理者追加"
                              : location.origin === "master"
                                ? "地域マスタ"
                                : "既存候補"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
