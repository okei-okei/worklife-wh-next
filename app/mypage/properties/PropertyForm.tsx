"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocoder";

export default function PropertyForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("Auckland CBD");
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState("");
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
      latitude: geo.latitude,
      longitude: geo.longitude,
    });

    if (error) return alert(error.message);

    setTitle("");
    setUrl("");
    setLocation("Auckland CBD");
    setAddress("");
    setRent("");

    onSaved();
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <input
        className="w-full border p-3 rounded"
        placeholder="物件名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        className="w-full border p-3 rounded"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />

      <button
        type="button"
        onClick={handleFetchFromUrl}
        disabled={isFetchingLink}
        className="rounded-lg border border-blue-600 px-4 py-2 font-bold text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isFetchingLink ? "取得中..." : "URLから物件内容を取得"}
      </button>

      {/* エリア（選択式） */}
      <select
        className="w-full border p-3 rounded"
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
        <option>Hamilton</option>
      </select>

      <input
        className="w-full border p-3 rounded"
        placeholder="詳細住所"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        className="w-full border p-3 rounded"
        placeholder="家賃（週）"
        type="number"
        value={rent}
        onChange={(e) => setRent(e.target.value)}
      />

      <button className="bg-blue-600 text-white px-6 py-3 rounded">保存</button>
    </form>
  );
}
