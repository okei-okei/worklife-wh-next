"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PublicProperty = {
  id: string;
  title: string;
  city: string | null;
  area: string | null;
  address: string | null;
  rent_weekly: number | null;
  description: string | null;
  url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingPropertyId, setSavingPropertyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("public_properties")
        .select(
          "id, title, city, area, address, rent_weekly, description, url, latitude, longitude",
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        setMessage("物件情報の読み込みに失敗しました。");
        setProperties([]);
      } else {
        setProperties((data || []) as PublicProperty[]);
      }

      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  const handleSaveProperty = async (property: PublicProperty) => {
    setMessage("");
    setSavingPropertyId(property.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavingPropertyId(null);
      router.push("/login");
      return;
    }

    const saveUrl = property.url || "";
    const { data: existingProperty, error: existingError } = await supabase
      .from("saved_properties")
      .select("id")
      .eq("user_id", user.id)
      .eq("url", saveUrl)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      setMessage("保存状況の確認に失敗しました。時間をおいて再度お試しください。");
      setSavingPropertyId(null);
      return;
    }

    if (existingProperty) {
      setMessage("すでに保存済みです。");
      setSavingPropertyId(null);
      return;
    }

    const { error } = await supabase.from("saved_properties").insert({
      user_id: user.id,
      title: property.title,
      url: saveUrl,
      location: property.area || property.city || "",
      address: property.address || property.area || property.city || "",
      rent_weekly: property.rent_weekly,
      latitude: property.latitude,
      longitude: property.longitude,
    });

    if (error) {
      console.error(error);
      setMessage("保存に失敗しました。時間をおいて再度お試しください。");
    } else {
      setMessage("マイページの保存リストに追加しました。");
    }

    setSavingPropertyId(null);
  };

  const formatRent = (rentWeekly: number | null) => {
    if (rentWeekly === null) {
      return "家賃未設定";
    }

    return `週 $${rentWeekly.toLocaleString()}`;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 公開物件
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">
              ワーホリ向け物件
            </h1>
            <p className="mt-2 text-base font-medium leading-7 text-gray-800">
              運営または掲載者が公開した物件を確認し、気になる物件をマイページへ保存できます。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/mypage"
              className="w-full rounded-lg bg-white px-4 py-3 text-center font-bold text-gray-900 shadow sm:w-auto sm:py-2"
            >
              マイページ
            </Link>
            <Link
              href="/company/submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-bold text-white sm:w-auto sm:py-2"
            >
              掲載申請
            </Link>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 font-bold text-blue-800">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="font-medium text-gray-800">
              物件情報を読み込み中です...
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">公開物件は準備中です</h2>
            <p className="mt-2 leading-7 text-gray-800">
              掲載申請が承認されると、このページに物件が表示されます。
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {properties.map((property) => (
              <article
                key={property.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{property.title}</h2>
                    <p className="mt-1 font-medium text-gray-800">
                      {property.city || "都市未設定"}
                      {property.area ? ` / ${property.area}` : ""}
                    </p>
                  </div>

                  <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                    {formatRent(property.rent_weekly)}
                  </div>
                </div>

                {property.description && (
                  <p className="mt-4 leading-7 text-gray-700">
                    {property.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSaveProperty(property)}
                    disabled={savingPropertyId === property.id}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:bg-gray-300 sm:w-auto sm:py-2"
                  >
                    {savingPropertyId === property.id ? "保存中..." : "保存する"}
                  </button>

                  {property.url && (
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto sm:py-2"
                    >
                      物件ページを見る
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
