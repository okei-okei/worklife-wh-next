"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminLocation = {
  id: string;
  key: string;
  region: string;
  cityDistrict: string;
  locality: string;
  aliases: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt?: string | null;
  usage?: { jobs: number; properties: number };
};

type LocationForm = {
  id: string;
  region: string;
  cityDistrict: string;
  locality: string;
  aliases: string;
  displayOrder: string;
  isActive: boolean;
};

const emptyForm: LocationForm = {
  id: "",
  region: "",
  cityDistrict: "",
  locality: "",
  aliases: "",
  displayOrder: "0",
  isActive: true,
};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const pageSize = 20;

function toForm(location: AdminLocation): LocationForm {
  return {
    id: location.id,
    region: location.region,
    cityDistrict: location.cityDistrict,
    locality: location.locality,
    aliases: location.aliases.join(", "),
    displayOrder: String(location.displayOrder || 0),
    isActive: location.isActive,
  };
}

export default function AdminLocationsPage() {
  const [accessToken, setAccessToken] = useState("");
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
      | { locations?: AdminLocation[]; error?: string }
      | null;

    if (!response.ok) {
      setError(data?.error || "地域を取得できませんでした。");
      if (response.status === 401) window.location.replace("/login?redirect=/admin/locations");
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
    () =>
      Array.from(new Set(locations.map((location) => location.region)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [locations],
  );
  const cityDistricts = useMemo(
    () =>
      Array.from(
        new Set(
          locations
            .filter((location) => !regionFilter || location.region === regionFilter)
            .map((location) => location.cityDistrict),
        ),
      )
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [locations, regionFilter],
  );

  const filteredLocations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return locations.filter((location) => {
      if (regionFilter && location.region !== regionFilter) return false;
      if (cityFilter && location.cityDistrict !== cityFilter) return false;
      if (activeFilter === "active" && !location.isActive) return false;
      if (activeFilter === "inactive" && location.isActive) return false;
      if (!normalizedSearch) return true;
      return [
        location.region,
        location.cityDistrict,
        location.locality,
        location.key,
        ...location.aliases,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [activeFilter, cityFilter, locations, regionFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedLocations = filteredLocations.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveLocation = async () => {
    if (!accessToken || isSaving) return;
    setIsSaving(true);
    setError("");
    setMessage("");

    const payload = {
      id: form.id || undefined,
      region: form.region,
      cityDistrict: form.cityDistrict,
      locality: form.locality,
      aliases: form.aliases,
      displayOrder: form.displayOrder,
      isActive: form.isActive,
    };

    const response = await fetch("/api/admin/locations", {
      method: editingId ? "PATCH" : "POST",
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
      setError(data?.error || "地域を保存できませんでした。");
      return;
    }

    setMessage(editingId ? "地域を更新しました。" : "地域を追加しました。");
    resetForm();
    await loadLocations(accessToken);
  };

  const toggleLocationActive = async (location: AdminLocation) => {
    if (!accessToken || isSaving) return;
    const usageCount = (location.usage?.jobs || 0) + (location.usage?.properties || 0);
    const ok =
      location.isActive && usageCount > 0
        ? window.confirm(
            `この地域は公開求人${location.usage?.jobs || 0}件、公開物件${location.usage?.properties || 0}件で使用されています。無効化しても既存掲載には引き続き表示されます。`,
          )
        : true;
    if (!ok) return;

    setIsSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/locations", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: location.id,
        region: location.region,
        cityDistrict: location.cityDistrict,
        locality: location.locality,
        aliases: location.aliases,
        displayOrder: location.displayOrder,
        isActive: !location.isActive,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    setIsSaving(false);
    if (!response.ok) {
      setError(data?.error || "地域の状態を更新できませんでした。");
      return;
    }

    setMessage(location.isActive ? "地域を無効化しました。" : "地域を有効化しました。");
    await loadLocations(accessToken);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">WorkLife WH Admin</p>
            <h1 className="mt-1 text-2xl font-bold md:text-4xl">地域管理</h1>
            <p className="mt-2 text-sm font-medium text-gray-700">
              Region → City / District → Area / Suburb の3階層だけで管理します。
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

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <form
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              saveLocation();
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                {editingId ? "地域を編集" : "地域を追加"}
              </h2>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold"
                >
                  新規追加へ戻る
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-bold text-gray-700">
                  Region <span className="text-red-600">*</span>
                </span>
                <input
                  value={form.region}
                  onChange={(event) =>
                    setForm({ ...form, region: event.target.value })
                  }
                  className={inputClass}
                  placeholder="例: Auckland"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-700">
                  City / District <span className="text-red-600">*</span>
                </span>
                <input
                  value={form.cityDistrict}
                  onChange={(event) =>
                    setForm({ ...form, cityDistrict: event.target.value })
                  }
                  className={inputClass}
                  placeholder="例: North Shore"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-700">
                  Area / Suburb <span className="text-red-600">*</span>
                </span>
                <input
                  value={form.locality}
                  onChange={(event) =>
                    setForm({ ...form, locality: event.target.value })
                  }
                  className={inputClass}
                  placeholder="例: Browns Bay"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-700">
                  aliases（カンマ区切り）
                </span>
                <input
                  value={form.aliases}
                  onChange={(event) =>
                    setForm({ ...form, aliases: event.target.value })
                  }
                  className={inputClass}
                  placeholder="例: Browns Bay Central, East Coast Bays"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-700">表示順</span>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) =>
                    setForm({ ...form, displayOrder: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                />
                有効にする
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300"
            >
              {isSaving ? "保存中..." : editingId ? "更新する" : "追加する"}
            </button>
            <p className="mt-3 text-xs font-medium leading-5 text-gray-600">
              地域は物理削除せず、不要になった場合は無効化してください。既存掲載の地域文字列は自動変更しません。
            </p>
          </form>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-4">
              <label className="block">
                <span className="text-xs font-bold text-gray-700">Region</span>
                <select
                  value={regionFilter}
                  onChange={(event) => {
                    setRegionFilter(event.target.value);
                    setCityFilter("");
                    setPage(1);
                  }}
                  className={inputClass}
                >
                  <option value="">全て</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-700">
                  City / District
                </span>
                <select
                  value={cityFilter}
                  onChange={(event) => {
                    setCityFilter(event.target.value);
                    setPage(1);
                  }}
                  className={inputClass}
                >
                  <option value="">全て</option>
                  {cityDistricts.map((cityDistrict) => (
                    <option key={cityDistrict} value={cityDistrict}>
                      {cityDistrict}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-700">状態</span>
                <select
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(event.target.value as typeof activeFilter);
                    setPage(1);
                  }}
                  className={inputClass}
                >
                  <option value="all">全て</option>
                  <option value="active">有効</option>
                  <option value="inactive">無効</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-700">検索</span>
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className={inputClass}
                  placeholder="Area / Suburbを検索"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm font-bold text-gray-700 sm:flex-row sm:items-center sm:justify-between">
              <p>
                表示中: {filteredLocations.length}件 / 全{locations.length}件
              </p>
              <button
                type="button"
                onClick={() => loadLocations(accessToken)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold"
              >
                再読み込み
              </button>
            </div>

            {isLoading ? (
              <p className="mt-6 text-sm font-bold text-gray-700">読み込み中...</p>
            ) : (
              <div className="mt-4 space-y-3">
                {paginatedLocations.map((location) => (
                  <article
                    key={location.id}
                    className="rounded-xl border border-gray-200 p-3"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                            {location.region}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-700">
                            {location.cityDistrict}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                              location.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {location.isActive ? "有効" : "無効"}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-gray-950">
                          {location.locality}
                        </h3>
                        <p className="mt-1 break-all text-xs font-medium text-gray-600">
                          key: {location.key}
                        </p>
                        {location.aliases.length ? (
                          <p className="mt-1 text-xs font-medium text-gray-600">
                            aliases: {location.aliases.join(" / ")}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs font-bold text-gray-700">
                          使用中: 求人 {location.usage?.jobs || 0}件 / 物件{" "}
                          {location.usage?.properties || 0}件
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(location.id);
                            setForm(toForm(location));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold"
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleLocationActive(location)}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                        >
                          {location.isActive ? "無効化" : "有効化"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold disabled:opacity-40"
              >
                前へ
              </button>
              <p className="text-xs font-bold text-gray-700">
                {safePage} / {totalPages} ページ
              </p>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={safePage >= totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold disabled:opacity-40"
              >
                次へ
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
