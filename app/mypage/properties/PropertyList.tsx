"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getStatusBadgeClassName,
  propertyStatusOptions,
} from "@/lib/applicationStatus";
import { Property } from "./types";

type Props = {
  properties: Property[];
  userId: string | null;
  onRefresh: () => void;
  onEdit: (property: Property) => void;
};

function buildInquiryHref(property: Property) {
  const params = new URLSearchParams({
    saved_property_id: property.id,
  });

  return `/mypage/property-inquiry?${params.toString()}`;
}

function PropertyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-xs font-bold text-gray-600">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function formatUtilitiesIncluded(property: Property) {
  const value = property.utilities_included ?? property.bills_included;

  if (value === true) return "込み";
  if (value === false) return "別";
  return "要確認";
}

export default function PropertyList({
  properties,
  userId,
  onRefresh,
  onEdit,
}: Props) {
  const handleStatusChange = async (property: Property, status: string) => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase
      .from("saved_properties")
      .update({ status })
      .eq("id", property.id)
      .eq("user_id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    const confirmed = window.confirm("この物件を削除しますか？");
    if (!confirmed) return;

    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    onRefresh();
  };

  return (
    <div className="space-y-4">
      {properties.map((p) => (
        <article
          key={p.id}
          className="overflow-hidden rounded-2xl bg-white text-gray-900 shadow"
        >
          {p.image_urls?.length ? (
            <div className="flex gap-2 overflow-x-auto bg-gray-50 p-2">
              {p.image_urls.map((imageUrl, index) => (
                <div
                  key={`${p.id}-${imageUrl}`}
                  className="h-28 w-44 flex-none overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-52 md:h-36 md:w-56"
                >
                  {/* Supabase Storage URLs are configured at runtime. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`${p.title}の画像${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold md:text-2xl">
                  {p.title}
                </h2>
                <p className="mt-1 font-medium text-gray-800">
                  {p.location || "エリア未設定"}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${getStatusBadgeClassName(
                  p.status,
                )}`}
              >
                {p.status || "気になる"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <PropertyFact
                label="家賃"
                value={p.rent_weekly ? `$${p.rent_weekly}/週` : "未設定"}
              />
              <PropertyFact
                label="ベッド"
                value={p.bedrooms == null ? "未設定" : `${p.bedrooms}`}
              />
              <PropertyFact
                label="バス"
                value={p.bathrooms == null ? "未設定" : `${p.bathrooms}`}
              />
              <PropertyFact
                label="駐車場"
                value={
                  p.parking_spaces == null ? "未設定" : `${p.parking_spaces}`
                }
              />
              <PropertyFact
                label="入居可能日"
                value={p.available_from || "要確認"}
              />
              <PropertyFact
                label="光熱費"
                value={formatUtilitiesIncluded(p)}
              />
              <PropertyFact
                label="ペット"
                value={
                  p.pets_allowed === true
                    ? "可"
                    : p.pets_allowed === false
                      ? "不可"
                      : "要確認"
                }
              />
            </div>

            <div className="mt-4 grid gap-2 text-sm font-medium text-gray-800">
              {p.address ? (
                <p className="break-words">住所: {p.address}</p>
              ) : null}
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-bold text-blue-700"
                >
                  {p.url}
                </a>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={p.status || "気になる"}
                onChange={(event) => handleStatusChange(p, event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm font-bold text-gray-900 sm:w-auto"
              >
                {propertyStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <Link
                href={buildInquiryHref(p)}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
              >
                問い合わせる
              </Link>

              <button
                type="button"
                onClick={() => onEdit(p)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
              >
                編集
              </button>

              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 sm:w-auto"
              >
                削除
              </button>
            </div>
          </div>
        </article>
      ))}

      {properties.length === 0 && (
        <div className="rounded-2xl bg-white p-4 text-center font-medium text-gray-700 md:p-6">
          物件がまだありません
        </div>
      )}
    </div>
  );
}
