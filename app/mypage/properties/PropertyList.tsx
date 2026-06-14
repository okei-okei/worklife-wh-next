"use client";

import { supabase } from "@/lib/supabase";
import { Property } from "./types";

type Props = {
  properties: Property[];
  userId: string | null;
  onRefresh: () => void;
  onEdit: (property: Property) => void;
};

export default function PropertyList({
  properties,
  userId,
  onRefresh,
  onEdit,
}: Props) {
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
          className="bg-white p-6 rounded-2xl shadow flex justify-between"
        >
          {/* LEFT */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{p.title}</h2>

            <p className="text-sm text-gray-600">エリア: {p.location || "-"}</p>

            <p className="text-sm text-gray-600">
              家賃: {p.rent_weekly ? `$${p.rent_weekly}/週` : "未設定"}
            </p>

            <p className="text-sm text-gray-600">
              住所: {p.address || "未設定"}
            </p>

            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm break-all"
            >
              {p.url}
            </a>

            <p className="text-xs text-gray-400">
              {p.latitude && p.longitude ? "📍 Geocoded" : "⚠️ No coordinates"}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onEdit(p)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              編集
            </button>

            <button
              onClick={() => handleDelete(p.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              削除
            </button>
          </div>
        </div>
      ))}

      {properties.length === 0 && (
        <div className="bg-white p-6 rounded-2xl text-center text-gray-500">
          物件がまだありません
        </div>
      )}
    </div>
  );
}
