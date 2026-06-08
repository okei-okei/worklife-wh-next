"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  title: string;
  url: string;
  location: string | null;
  rent_weekly: number | null;
};

export default function MyPropertiesPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [rentWeekly, setRentWeekly] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from("saved_properties")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (data) {
      setProperties(data);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("この物件を削除しますか？");

    if (!confirmed) return;

    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchProperties();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase.from("saved_properties").insert({
      user_id: user.id,
      title,
      url,
      location,
      rent_weekly: rentWeekly ? Number(rentWeekly) : null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("物件を保存しました");

    setTitle("");
    setUrl("");
    setLocation("");
    setRentWeekly("");

    fetchProperties();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">保存した物件</h1>

          <Link
            href="/mypage"
            className="
              bg-gray-500
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            ← マイページへ戻る
          </Link>
        </div>

        <form
          onSubmit={handleSave}
          className="
            bg-white
            p-6
            rounded-2xl
            shadow
            mb-8
            space-y-4
          "
        >
          <input
            type="text"
            placeholder="物件名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="url"
            placeholder="Trade Me URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="住所"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="number"
            placeholder="週家賃 ($)"
            value={rentWeekly}
            onChange={(e) => setRentWeekly(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="
              bg-green-600
              text-white
              px-6
              py-3
              rounded-lg
            "
          >
            保存する
          </button>
        </form>

        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="
                bg-white
                p-6
                rounded-2xl
                shadow
              "
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">{property.title}</h2>

                  <p className="mt-2">住所: {property.location || "未設定"}</p>

                  <p>
                    週家賃:{" "}
                    {property.rent_weekly
                      ? `$${property.rent_weekly}`
                      : "未設定"}
                  </p>

                  <a
                    href={property.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      text-blue-600
                      break-all
                    "
                  >
                    {property.url}
                  </a>
                </div>

                <button
                  onClick={() => handleDelete(property.id)}
                  className="
                    bg-red-500
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    h-fit
                  "
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
