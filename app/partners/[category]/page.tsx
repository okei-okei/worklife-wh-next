"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LeadPartnerButton } from "../_components/LeadPartnerButton";
import { getPartnerCategoryLabel } from "../_components/partnerCategories";

type Partner = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  url: string | null;
  country: string | null;
  display_order: number | null;
};

export default function PartnerCategoryPage() {
  const params = useParams<{ category: string }>();
  const category = params.category;

  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("partners")
        .select("id, category, name, description, url, country, display_order")
        .eq("category", category)
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
  }, [category]);

  const categoryLabel = getPartnerCategoryLabel(category);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH パートナー案内
            </p>
            <h1 className="text-4xl font-bold">{categoryLabel}</h1>
            <p className="mt-2 text-gray-600">
              生活開始に必要なサービスを比較しやすい形で整理していきます。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/partners"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              提携サービス一覧
            </Link>
            <Link
              href="/mypage"
              className="rounded-lg bg-gray-500 px-4 py-2 text-white"
            >
              ← マイページ
            </Link>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow">
          {isLoading ? (
            <p className="text-gray-600">読み込み中...</p>
          ) : partners.length === 0 ? (
            <div>
              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                準備中
              </div>
              <p className="leading-7 text-gray-600">
                現在、このカテゴリの提携サービスは準備中です。将来、管理画面から追加されたサービスがここに表示されます。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {partners.map((partner) => (
                <article
                  key={partner.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-blue-700">
                        {partner.country || "NZ"}
                      </p>
                      <h2 className="text-2xl font-bold">{partner.name}</h2>
                    </div>

                    <LeadPartnerButton
                      category={partner.category}
                      partnerName={partner.name}
                      destinationUrl={partner.url}
                      sourcePage={`/partners/${category}`}
                    />
                  </div>

                  <p className="leading-7 text-gray-600">
                    {partner.description || "サービス説明を準備中です。"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
