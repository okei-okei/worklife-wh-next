"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ListingType = "job" | "property";

type AdminJob = {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  area?: string | null;
  address: string | null;
  hourly_rate: number | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  work_hours: number | null;
  weekly_hours?: number | null;
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
  city: string | null;
  area: string | null;
  address: string | null;
  rent_weekly: number | null;
  description: string | null;
  inquiry_method?: string | null;
  url: string | null;
  image_urls?: string[] | null;
  is_active: boolean | null;
};

type EditForm = {
  title: string;
  name: string;
  city: string;
  area: string;
  address: string;
  priceMin: string;
  priceMax: string;
  hours: string;
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
    city: job.city || "",
    area: job.area || "",
    address: job.address || "",
    priceMin: String(job.hourly_rate_min ?? job.hourly_rate ?? ""),
    priceMax: String(job.hourly_rate_max ?? ""),
    hours: String(job.weekly_hours ?? job.work_hours ?? ""),
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
    city: property.city || "",
    area: property.area || "",
    address: property.address || "",
    priceMin: String(property.rent_weekly ?? ""),
    priceMax: "",
    hours: "",
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

    const uploadedUrls: string[] = [];
    for (const [index, file] of imageFiles.entries()) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `admin-listings/${editing.type}/${editing.id}/${Date.now()}-${index}.${extension}`;
      const { error } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
    }

    return editing.type === "job" ? uploadedUrls.slice(0, 1) : uploadedUrls;
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
            city: form.city,
            area: form.area,
            address: form.address,
            hourly_rate: form.priceMin ? Number(form.priceMin) : null,
            hourly_rate_min: form.priceMin ? Number(form.priceMin) : null,
            hourly_rate_max: form.priceMax ? Number(form.priceMax) : null,
            work_hours: form.hours ? Number(form.hours) : null,
            weekly_hours: form.hours ? Number(form.hours) : null,
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
            city: form.city,
            area: form.area,
            address: form.address,
            rent_weekly: form.priceMin ? Number(form.priceMin) : null,
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
                <span className="text-sm font-bold">都市</span>
                <input
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-sm font-bold">エリア</span>
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
                    画像（{editing.type === "job" ? "1枚" : "最大10枚"}）
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple={editing.type === "property"}
                    onChange={(event) => handleImageFiles(event.target.files)}
                    className={inputClass}
                  />
                  <span className="mt-1 block text-xs font-medium text-gray-600">
                    jpg/png/webp に対応しています。選択した画像で既存画像を置き換えます。
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
