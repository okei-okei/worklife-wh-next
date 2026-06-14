"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  PARTNER_CATEGORIES,
  getPartnerCategoryLabel,
} from "./_components/partnerCategories";

type Partner = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  url: string | null;
  country: string | null;
  display_order: number | null;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("partners")
        .select("id, category, name, description, url, country, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setPartners([]);
        setIsLoading(false);
        return;
      }

      setPartners((data || []) as Partner[]);
      setIsLoading(false);
    };

    loadPartners();
  }, []);

  const countsByCategory = useMemo(() => {
    return partners.reduce<Record<string, number>>((counts, partner) => {
      counts[partner.category] = (counts[partner.category] || 0) + 1;
      return counts;
    }, {});
  }, [partners]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH パートナー案内
            </p>
            <h1 className="text-4xl font-bold">提携サービス一覧</h1>
            <p className="mt-2 text-gray-600">
              生活開始に必要なサービスをカテゴリ別に確認できます。
            </p>
          </div>

          <Link
            href="/mypage"
            className="rounded-lg bg-gray-500 px-4 py-2 text-white"
          >
            ← マイページ
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {PARTNER_CATEGORIES.map((category) => (
            <Link
              key={category.key}
              href={`/partners/${category.key}`}
              className="rounded-2xl bg-white p-5 shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{category.label}</h2>
                  <p className="mt-2 leading-7 text-gray-600">
                    {category.description}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  {countsByCategory[category.key] || 0}件
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">掲載中サービス</h2>

          {isLoading ? (
            <p className="text-gray-600">読み込み中...</p>
          ) : partners.length === 0 ? (
            <p className="leading-7 text-gray-600">
              現在、掲載中の提携サービスは準備中です。将来、管理画面から追加されたサービスがここに表示されます。
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {partners.slice(0, 6).map((partner) => (
                <Link
                  key={partner.id}
                  href={`/partners/${partner.category}`}
                  className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="text-sm font-bold text-blue-700">
                    {getPartnerCategoryLabel(partner.category)}
                  </div>
                  <h3 className="mt-1 text-xl font-bold">{partner.name}</h3>
                  <p className="mt-2 line-clamp-2 text-gray-600">
                    {partner.description || "サービス説明を準備中です。"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
