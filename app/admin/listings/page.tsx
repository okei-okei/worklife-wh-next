"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ListingType = "job" | "property";

type AdminJob = {
  id: string;
  title: string;
  company: string | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  city: string | null;
  area?: string | null;
  address: string | null;
  hourly_rate: number | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  work_hours: number | null;
  weekly_hours?: number | null;
  employment_type?: string | null;
  start_date?: string | null;
  accommodation_available?: boolean | null;
  japanese_ok?: boolean | null;
  english_level?: string | null;
  visa_conditions?: string | null;
  visa_support?: boolean | null;
  description: string | null;
  application_method?: string | null;
  apply_url: string | null;
  image_url?: string | null;
  is_active: boolean | null;
};

type AdminProperty = {
  id: string;
  title: string;
  owner_name: string | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  suburb?: string | null;
  city: string | null;
  area: string | null;
  address: string | null;
  rent_weekly: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  available_from?: string | null;
  pets_allowed?: boolean | null;
  smoking_allowed?: boolean | null;
  furnished?: boolean | null;
  utilities_included?: boolean | null;
  bills_included?: boolean | null;
  description: string | null;
  inquiry_method?: string | null;
  url: string | null;
  image_urls?: string[] | null;
  is_active: boolean | null;
};

type EditForm = {
  title: string;
  name: string;
  countryCode: string;
  region: string;
  district: string;
  suburb: string;
  city: string;
  area: string;
  address: string;
  priceMin: string;
  priceMax: string;
  hours: string;
  employmentType: string;
  startDate: string;
  accommodationAvailable: boolean;
  japaneseOk: boolean;
  englishLevel: string;
  visaConditions: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  availableFrom: string;
  petsAllowed: string;
  smokingAllowed: string;
  furnished: boolean;
  utilitiesIncluded: boolean;
  description: string;
  method: string;
  url: string;
  imageUrl: string;
  imageUrls: string[];
  isActive: boolean;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function jobToForm(job: AdminJob): EditForm {
  return {
    title: job.title || "",
    name: job.company || "",
    countryCode: job.country_code || "NZ",
    region: job.region || "",
    district: job.district || job.city || "",
    suburb: job.suburb || job.area || "",
    city: job.city || job.district || "",
    area: job.area || job.suburb || "",
    address: job.address || "",
    priceMin: String(job.hourly_rate_min ?? job.hourly_rate ?? ""),
    priceMax: String(job.hourly_rate_max ?? ""),
    hours: String(job.weekly_hours ?? job.work_hours ?? ""),
    employmentType: job.employment_type || "",
    startDate: job.start_date || "",
    accommodationAvailable: Boolean(job.accommodation_available),
    japaneseOk: Boolean(job.japanese_ok),
    englishLevel: job.english_level || "",
    visaConditions: job.visa_conditions || "",
    bedrooms: "",
    bathrooms: "",
    parkingSpaces: "",
    availableFrom: "",
    petsAllowed: "",
    smokingAllowed: "",
    furnished: false,
    utilitiesIncluded: false,
    description: job.description || "",
    method: job.application_method || "",
    url: job.apply_url || "",
    imageUrl: job.image_url || "",
    imageUrls: job.image_url ? [job.image_url] : [],
    isActive: job.is_active !== false,
  };
}

function propertyToForm(property: AdminProperty): EditForm {
  return {
    title: property.title || "",
    name: property.owner_name || "",
    countryCode: property.country_code || "NZ",
    region: property.region || "",
    district: property.district || property.city || "",
    suburb: property.suburb || property.area || "",
    city: property.city || property.district || "",
    area: property.area || property.suburb || "",
    address: property.address || "",
    priceMin: String(property.rent_weekly ?? ""),
    priceMax: "",
    hours: "",
    employmentType: "",
    startDate: "",
    accommodationAvailable: false,
    japaneseOk: false,
    englishLevel: "",
    visaConditions: "",
    bedrooms: String(property.bedrooms ?? ""),
    bathrooms: String(property.bathrooms ?? ""),
    parkingSpaces: String(property.parking_spaces ?? ""),
    availableFrom: property.available_from || "",
    petsAllowed:
      property.pets_allowed === null || property.pets_allowed === undefined
        ? ""
        : String(property.pets_allowed),
    smokingAllowed:
      property.smoking_allowed === null ||
      property.smoking_allowed === undefined
        ? ""
        : String(property.smoking_allowed),
    furnished: Boolean(property.furnished),
    utilitiesIncluded: Boolean(
      property.utilities_included ?? property.bills_included,
    ),
    description: property.description || "",
    method: property.inquiry_method || "",
    url: property.url || "",
    imageUrl: property.image_urls?.[0] || "",
    imageUrls: property.image_urls || [],
    isActive: property.is_active !== false,
  };
}

export default function AdminListingsPage() {
  const [accessToken, setAccessToken] = useState("");
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [selectedType, setSelectedType] = useState<ListingType>("job");
  const [editing, setEditing] = useState<{
    type: ListingType;
    id: string;
  } | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadListings = useCallback(async (token: string) => {
    setIsLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/admin/listings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await response.json().catch(() => null)) as
      | {
          jobs?: AdminJob[];
          properties?: AdminProperty[];
          error?: string;
        }
      | null;

    if (!response.ok) {
      setErrorMessage(data?.error || "掲載データを取得できませんでした。");
      if (response.status === 401) window.location.replace("/login?redirect=/admin/listings");
      if (response.status === 403) window.location.replace("/");
      setIsLoading(false);
      return;
    }

    setJobs(data?.jobs || []);
    setProperties(data?.properties || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login?redirect=/admin/listings");
        return;
      }

      setAccessToken(session.access_token);
      await loadListings(session.access_token);
    };

    initialize();
  }, [loadListings]);

  const beginEdit = (type: ListingType, item: AdminJob | AdminProperty) => {
    setEditing({ type, id: item.id });
    setForm(type === "job" ? jobToForm(item as AdminJob) : propertyToForm(item as AdminProperty));
    setMessage("");
    setErrorMessage("");
    setImageFiles([]);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(null);
    setImageFiles([]);
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files || !editing) return;
    const accepted = Array.from(files).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );
    setImageFiles(editing.type === "job" ? accepted.slice(0, 1) : accepted.slice(0, 10));
  };

  const uploadImages = async () => {
    if (!editing || imageFiles.length === 0) {
      return form?.imageUrls || [];
    }

    const formData = new FormData();
    formData.append("prefix", `admin-listings/${editing.type}/${editing.id}`);
    imageFiles.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/listing-images", {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: formData,
    });
    const data = (await response.json().catch(() => null)) as
      | { imageUrls?: string[]; error?: string }
      | null;

    if (!response.ok || !data?.imageUrls) {
      throw new Error(data?.error || "画像の保存に失敗しました。");
    }

    return editing.type === "job" ? data.imageUrls.slice(0, 1) : data.imageUrls;
  };

  const saveListing = async () => {
    if (!editing || !form || !accessToken) return;
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    let uploadedImageUrls = form.imageUrls;
    try {
      uploadedImageUrls = await uploadImages();
    } catch (error) {
      setIsSaving(false);
      setErrorMessage(
        error instanceof Error
          ? `画像のアップロードに失敗しました: ${error.message}`
          : "画像のアップロードに失敗しました。",
      );
      return;
    }

    const payload =
      editing.type === "job"
        ? {
            type: "job",
            id: editing.id,
            title: form.title,
            company: form.name,
            country_code: form.countryCode,
            region: form.region,
            district: form.district,
            suburb: form.suburb,
            city: form.city || form.district,
            area: form.area || form.suburb,
            address: form.address,
            hourly_rate: form.priceMin ? Number(form.priceMin) : null,
            hourly_rate_min: form.priceMin ? Number(form.priceMin) : null,
            hourly_rate_max: form.priceMax ? Number(form.priceMax) : null,
            work_hours: form.hours ? Number(form.hours) : null,
            weekly_hours: form.hours ? Number(form.hours) : null,
            employment_type: form.employmentType,
            start_date: form.startDate || null,
            accommodation_available: form.accommodationAvailable,
            japanese_ok: form.japaneseOk,
            english_level: form.englishLevel,
            visa_conditions: form.visaConditions,
            visa_support:
              /ワーホリ|working holiday|work visa|就労/i.test(
                form.visaConditions,
              ),
            description: form.description,
            application_method: form.method,
            apply_url: form.url,
            image_url: uploadedImageUrls[0] || null,
            is_active: form.isActive,
          }
        : {
            type: "property",
            id: editing.id,
            title: form.title,
            owner_name: form.name,
            country_code: form.countryCode,
            region: form.region,
            district: form.district,
            suburb: form.suburb,
            city: form.city || form.district,
            area: form.area || form.suburb,
            address: form.address,
            rent_weekly: form.priceMin ? Number(form.priceMin) : null,
            bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
            bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
            parking_spaces: form.parkingSpaces
              ? Number(form.parkingSpaces)
              : null,
            available_from: form.availableFrom || null,
            pets_allowed:
              form.petsAllowed === "" ? null : form.petsAllowed === "true",
            smoking_allowed:
              form.smokingAllowed === ""
                ? null
                : form.smokingAllowed === "true",
            furnished: form.furnished,
            utilities_included: form.utilitiesIncluded,
            bills_included: form.utilitiesIncluded,
            description: form.description,
            inquiry_method: form.method,
            url: form.url,
            image_urls: uploadedImageUrls,
            is_active: form.isActive,
          };

    const response = await fetch("/api/admin/listings", {
      method: "PATCH",
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
      setErrorMessage(data?.error || "掲載内容を更新できませんでした。");
      return;
    }

    setMessage("掲載内容を更新しました。");
    cancelEdit();
    await loadListings(accessToken);
  };

  const deleteListing = async (type: ListingType, id: string) => {
    if (!accessToken) return;
    const ok = window.confirm("この掲載を削除します。よろしいですか？");
    if (!ok) return;

    setMessage("");
    setErrorMessage("");

    const response = await fetch(`/api/admin/listings?type=${type}&id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setErrorMessage(data?.error || "掲載を削除できませんでした。");
      return;
    }

    setMessage("掲載を削除しました。");
    await loadListings(accessToken);
  };

  const items = selectedType === "job" ? jobs : properties;

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              WorkLife WH Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-4xl">
              公開掲載の管理
            </h1>
            <p className="mt-2 text-sm font-medium text-gray-700">
              承認済みの公開求人・公開物件を編集、非公開化、削除できます。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/submissions"
              className="rounded-md bg-slate-900 px-4 py-3 text-center font-bold text-white"
            >
              掲載申請管理
            </Link>
            <Link
              href="/admin"
              className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900"
            >
              ダッシュボード
            </Link>
          </div>
        </header>

        {message ? (
          <p className="rounded-xl border border-green-200 bg-green-50 p-4 font-bold text-green-700">
            {message}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {[
                ["job", `求人 ${jobs.length}`],
                ["property", `物件 ${properties.length}`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedType(key as ListingType);
                    cancelEdit();
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-bold ${
                    selectedType === key
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => loadListings(accessToken)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 sm:w-auto"
            >
              再読み込み
            </button>
          </div>

          {isLoading ? (
            <p className="mt-6 font-bold text-gray-700">読み込み中...</p>
          ) : items.length === 0 ? (
            <p className="mt-6 font-bold text-gray-700">掲載はまだありません。</p>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {items.map((item) => {
                const isJob = selectedType === "job";
                const job = item as AdminJob;
                const property = item as AdminProperty;
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    {(isJob ? job.image_url : property.image_urls?.[0]) ? (
                      <div className="mb-4 overflow-hidden rounded-xl bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(isJob ? job.image_url : property.image_urls?.[0]) || ""}
                          alt=""
                          className="aspect-[16/9] w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {isJob ? "求人" : "物件"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.is_active === false
                                ? "bg-gray-100 text-gray-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {item.is_active === false ? "非公開" : "公開中"}
                          </span>
                        </div>
                        <h2 className="break-words text-xl font-bold">
                          {item.title}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-gray-700">
                          {isJob
                            ? job.company || "会社名未設定"
                            : property.owner_name || "管理者名未設定"}
                          {" / "}
                          {item.area || item.city || "地域未設定"}
                        </p>
                      </div>
                      <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                        {isJob
                          ? `$${job.hourly_rate_min ?? job.hourly_rate ?? "-"}${job.hourly_rate_max ? ` - $${job.hourly_rate_max}` : ""}/時`
                          : property.rent_weekly
                            ? `$${property.rent_weekly}/週`
                            : "家賃未設定"}
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                      {item.description || "説明未設定"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                      {isJob
                        ? job.application_method || "応募方法未設定"
                        : property.inquiry_method || "問い合わせ方法未設定"}
                    </p>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => beginEdit(selectedType, item)}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white sm:w-auto"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteListing(selectedType, item.id)}
                        className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white sm:w-auto"
                      >
                        削除
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {editing && form ? (
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <h2 className="text-xl font-bold">
              {editing.type === "job" ? "求人を編集" : "物件を編集"}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-sm font-bold">タイトル</span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-sm font-bold">
                  {editing.type === "job" ? "会社名" : "管理者・オーナー名"}
                </span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-sm font-bold">国</span>
                <select
                  value={form.countryCode}
                  onChange={(event) =>
                    setForm({ ...form, countryCode: event.target.value })
                  }
                  className={inputClass}
                >
                  <option value="NZ">New Zealand</option>
                  <option value="AU">Australia</option>
                  <option value="CA">Canada</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">Region</span>
                <input
                  value={form.region}
                  onChange={(event) =>
                    setForm({ ...form, region: event.target.value })
                  }
                  className={inputClass}
                  placeholder="例: Auckland"
                />
              </label>
              <label>
                <span className="text-sm font-bold">City / District</span>
                <input
                  value={form.district}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      district: event.target.value,
                      city: event.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="例: Auckland"
                />
              </label>
              <label>
                <span className="text-sm font-bold">Area / Suburb</span>
                <input
                  value={form.suburb}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      suburb: event.target.value,
                      area: event.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="例: Auckland CBD"
                />
              </label>
              <label>
                <span className="text-sm font-bold">都市（表示用）</span>
                <input
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-sm font-bold">エリア（表示用）</span>
                <input
                  value={form.area}
                  onChange={(event) =>
                    setForm({ ...form, area: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">住所</span>
                <input
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-sm font-bold">
                  {editing.type === "job" ? "時給下限" : "週家賃"}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceMin}
                  onChange={(event) =>
                    setForm({ ...form, priceMin: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              {editing.type === "job" ? (
                <>
                  <label>
                    <span className="text-sm font-bold">時給上限</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.priceMax}
                      onChange={(event) =>
                        setForm({ ...form, priceMax: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">週勤務時間</span>
                    <input
                      type="number"
                      min="0"
                      value={form.hours}
                      onChange={(event) =>
                        setForm({ ...form, hours: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                </>
              ) : null}
              {editing.type === "job" ? (
                <>
                  <label>
                    <span className="text-sm font-bold">採用形態</span>
                    <select
                      value={form.employmentType}
                      onChange={(event) =>
                        setForm({ ...form, employmentType: event.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">未設定</option>
                      {[
                        "Full-time",
                        "Part-time",
                        "Casual",
                        "Seasonal",
                        "Fixed-term",
                        "Internship",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-sm font-bold">勤務開始可能日</span>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        setForm({ ...form, startDate: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">必要な英語レベル</span>
                    <select
                      value={form.englishLevel}
                      onChange={(event) =>
                        setForm({ ...form, englishLevel: event.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">未設定</option>
                      <option value="初級">初級</option>
                      <option value="中級">中級</option>
                      <option value="上級">上級</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-sm font-bold">ビザ条件</span>
                    <select
                      value={form.visaConditions}
                      onChange={(event) =>
                        setForm({ ...form, visaConditions: event.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">未設定</option>
                      <option value="ワーホリビザ可">ワーホリビザ可</option>
                      <option value="学生ビザ可">学生ビザ可</option>
                      <option value="就労可能なビザ必須">
                        就労可能なビザ必須
                      </option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 font-bold">
                    <input
                      type="checkbox"
                      checked={form.accommodationAvailable}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          accommodationAvailable: event.target.checked,
                        })
                      }
                      className="h-5 w-5"
                    />
                    住み込み可能
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 font-bold">
                    <input
                      type="checkbox"
                      checked={form.japaneseOk}
                      onChange={(event) =>
                        setForm({ ...form, japaneseOk: event.target.checked })
                      }
                      className="h-5 w-5"
                    />
                    日本語対応あり
                  </label>
                </>
              ) : (
                <>
                  <label>
                    <span className="text-sm font-bold">ベッドルーム数</span>
                    <input
                      type="number"
                      min="0"
                      value={form.bedrooms}
                      onChange={(event) =>
                        setForm({ ...form, bedrooms: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">バスルーム数</span>
                    <input
                      type="number"
                      min="0"
                      value={form.bathrooms}
                      onChange={(event) =>
                        setForm({ ...form, bathrooms: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">駐車場数</span>
                    <input
                      type="number"
                      min="0"
                      value={form.parkingSpaces}
                      onChange={(event) =>
                        setForm({ ...form, parkingSpaces: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">入居可能日</span>
                    <input
                      type="date"
                      value={form.availableFrom}
                      onChange={(event) =>
                        setForm({ ...form, availableFrom: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">ペット</span>
                    <select
                      value={form.petsAllowed}
                      onChange={(event) =>
                        setForm({ ...form, petsAllowed: event.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">要確認</option>
                      <option value="true">ペット可</option>
                      <option value="false">ペット不可</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-sm font-bold">喫煙</span>
                    <select
                      value={form.smokingAllowed}
                      onChange={(event) =>
                        setForm({ ...form, smokingAllowed: event.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">要確認</option>
                      <option value="true">喫煙可</option>
                      <option value="false">喫煙不可</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 font-bold">
                    <input
                      type="checkbox"
                      checked={form.furnished}
                      onChange={(event) =>
                        setForm({ ...form, furnished: event.target.checked })
                      }
                      className="h-5 w-5"
                    />
                    家具付き
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 font-bold">
                    <input
                      type="checkbox"
                      checked={form.utilitiesIncluded}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          utilitiesIncluded: event.target.checked,
                        })
                      }
                      className="h-5 w-5"
                    />
                    光熱費込み
                  </label>
                </>
              )}
              <label className="md:col-span-2">
                <span className="text-sm font-bold">
                  {editing.type === "job" ? "職務内容" : "物件説明"}
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  rows={5}
                  className={inputClass}
                />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">
                  {editing.type === "job" ? "応募方法" : "問い合わせ方法"}
                </span>
                <textarea
                  value={form.method}
                  onChange={(event) =>
                    setForm({ ...form, method: event.target.value })
                  }
                  rows={3}
                  className={inputClass}
                />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">
                  {editing.type === "job" ? "応募URL" : "物件URL"}
                </span>
                <input
                  value={form.url}
                  onChange={(event) =>
                    setForm({ ...form, url: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <div className="md:col-span-2">
                <label className="block">
                  <span className="text-sm font-bold">
                    画像（{editing.type === "job" ? "1枚" : "物件は最大10枚"}）
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple={editing.type === "property"}
                    onChange={(event) => handleImageFiles(event.target.files)}
                    className={inputClass}
                  />
                  <span className="mt-1 block text-xs font-medium text-gray-600">
                    ファイルまたは写真フォルダから選択できます。選択した画像で既存画像を置き換えます。
                  </span>
                </label>

                {form.imageUrls.length || imageFiles.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {imageFiles.length
                      ? imageFiles.map((file) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs font-bold text-blue-700"
                          >
                            新規: {file.name}
                          </div>
                        ))
                      : form.imageUrls.map((imageUrl) => (
                          <div key={imageUrl} className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt=""
                              className="aspect-[4/3] w-full object-cover"
                            />
                          </div>
                        ))}
                  </div>
                ) : null}
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 font-bold">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                  className="h-5 w-5"
                />
                公開する
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-bold text-gray-900 sm:w-auto"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={saveListing}
                disabled={isSaving}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:bg-gray-300 sm:w-auto"
              >
                {isSaving ? "保存中..." : "保存する"}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
