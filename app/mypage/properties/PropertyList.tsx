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
        <div
          key={p.id}
          className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-4 text-gray-900 shadow sm:flex-row md:p-6"
        >
          {/* LEFT */}
          <div className="min-w-0 space-y-1">
            <h2 className="break-words text-xl font-bold">{p.title}</h2>

            <p className="text-sm font-medium text-gray-700">
              エリア: {p.location || "-"}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${getStatusBadgeClassName(
                  p.status,
                )}`}
              >
                {p.status || "気になる"}
              </span>

              <select
                value={p.status || "気になる"}
                onChange={(event) => handleStatusChange(p, event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 sm:w-auto"
              >
                {propertyStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm font-medium text-gray-700">
              家賃: {p.rent_weekly ? `$${p.rent_weekly}/週` : "未設定"}
            </p>

            <p className="text-sm font-medium text-gray-700">
              住所: {p.address || "未設定"}
            </p>

            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm font-bold text-blue-700"
            >
              {p.url}
            </a>

            <p className="text-xs font-semibold text-gray-700">
              {p.latitude && p.longitude ? "📍 Geocoded" : "⚠️ No coordinates"}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2 sm:w-48">
            <Link
              href={buildInquiryHref(p)}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-center font-bold text-white sm:py-2"
            >
              問い合わせる
            </Link>

            <button
              onClick={() => onEdit(p)}
              className="w-full rounded-lg bg-gray-700 px-4 py-3 font-bold text-white sm:py-2"
            >
              編集
            </button>

            <button
              onClick={() => handleDelete(p.id)}
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white sm:py-2"
            >
              削除
            </button>
          </div>
        </div>
      ))}

      {properties.length === 0 && (
        <div className="rounded-2xl bg-white p-4 text-center font-medium text-gray-700 md:p-6">
          物件がまだありません
        </div>
      )}
    </div>
  );
}
