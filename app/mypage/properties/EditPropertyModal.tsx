"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Property } from "./types";
import { geocodeAddress } from "@/lib/geocoder";

type Props = {
  property: Property | null;
  userId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

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

  useEffect(() => {
    if (!property) return;

    const timer = window.setTimeout(() => {
      setTitle(property.title || "");
      setUrl(property.url || "");
      setLocation(property.location || "Auckland CBD");
      setAddress(property.address || "");
      setRent(property.rent_weekly?.toString() || "");
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

    // 🔥 住所変更時は自動ジオコード
    if (address && address !== property.address) {
      const geo = await geocodeAddress(address);
      latitude = geo.latitude;
      longitude = geo.longitude;
    }

    const { error } = await supabase
      .from("saved_properties")
      .update({
        title,
        url,
        location,
        address,
        rent_weekly: rent ? Number(rent) : null,
        latitude,
        longitude,
      })
      .eq("id", property.id)
      .eq("user_id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("更新しました");

    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-[500px] space-y-3">
        <h2 className="text-xl font-bold">物件編集</h2>

        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
        />

        <input
          className="w-full border p-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
        />

        <select
          className="w-full border p-2 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option>Auckland CBD</option>
          <option>North Shore</option>
          <option>Mount Eden</option>
          <option>Newmarket</option>
          <option>Onehunga</option>
          <option>Wellington</option>
          <option>Christchurch</option>
        </select>

        <input
          className="w-full border p-2 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="住所"
        />

        <input
          className="w-full border p-2 rounded"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          placeholder="家賃（週）"
          type="number"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            キャンセル
          </button>

          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
}
