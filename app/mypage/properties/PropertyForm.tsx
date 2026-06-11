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
