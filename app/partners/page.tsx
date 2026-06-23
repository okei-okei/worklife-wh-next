"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdDisclosureNotice from "@/components/AdDisclosureNotice";
import { supabase } from "@/lib/supabase";
import { trackMetric } from "@/lib/analytics";
import { LeadPartnerButton } from "./_components/LeadPartnerButton";
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
  is_affiliate?: boolean | null;
  affiliate_note?: string | null;
  recommended_for?: string | null;
  caution_note?: string | null;
  price_note?: string | null;
  official_url?: string | null;
};

function isMissingColumnError(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("column") ||
      error?.message?.includes("schema cache"),
  );
}

function normalizeCategory(category: string | null) {
  if (category === "remittance") return "money_transfer";
  if (category === "english") return "school";

  return category || "all";
}

function PartnersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromQuery = normalizeCategory(searchParams.get("category"));

  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedCategory = categoryFromQuery;

  useEffect(() => {
    trackMetric("comparison_page_view", {
      eventType: "page_view",
      pagePath: "/partners",
      metadata: { category: categoryFromQuery },
    });
  }, [categoryFromQuery]);

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);

      const extendedSelect =
        "id, category, name, description, url, country, display_order, is_affiliate, affiliate_note, recommended_for, caution_note, price_note, official_url";

      const baseSelect =
        "id, category, name, description, url, country, display_order";

      const extendedResult = await supabase
        .from("partners")
        .select(extendedSelect)
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!extendedResult.error) {
        setPartners((extendedResult.data || []) as Partner[]);
        setIsLoading(false);
        return;
      }

      if (!isMissingColumnError(extendedResult.error)) {
        console.error(extendedResult.error);
        setPartners([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("partners")
        .select(baseSelect)
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
      const category = normalizeCategory(partner.category);
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});
  }, [partners]);

  const filteredPartners = useMemo(() => {
    if (selectedCategory === "all") return partners;

    return partners.filter(
      (partner) => normalizeCategory(partner.category) === selectedCategory,
    );
  }, [partners, selectedCategory]);

  useEffect(() => {
    if (!isLoading && filteredPartners.length) {
      trackMetric("comparison_card_view", { eventType: "content", pagePath: "/partners", metadata: { category: selectedCategory, count: filteredPartners.length } });
    }
  }, [filteredPartners.length, isLoading, selectedCategory]);

  const selectedCategoryDefinition = PARTNER_CATEGORIES.find(
    (category) => category.key === selectedCategory,
  );

  const handleSelectCategory = (category: string) => {
    if (category === "all") {
      router.replace("/partners");
      return;
    }

    router.replace(`/partners?category=${category}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 比較・おすすめ
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">
              生活準備サービスをカテゴリ別に確認
            </h1>
            <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
              SIM、保険、銀行、送金、生活インフラなどをカテゴリ別に比較し、公式情報を確認するためのページです。
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/mypage/checklist"
              className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
            >
              チェックリストへ戻る
            </Link>
          </div>
        </section>

        <AdDisclosureNotice />

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">カテゴリ</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSelectCategory("all")}
              className={`rounded-lg px-4 py-3 text-sm font-bold ${
                selectedCategory === "all"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              すべて
            </button>
            {PARTNER_CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => handleSelectCategory(category.key)}
                className={`rounded-lg px-4 py-3 text-sm font-bold ${
                  selectedCategory === category.key
                    ? "bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {category.label}
                <span className="ml-2 text-xs">
                  {countsByCategory[category.key] || 0}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory === "all"
                ? "すべてのカテゴリ"
                : getPartnerCategoryLabel(selectedCategory)}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
              {selectedCategoryDefinition?.description ||
                "カテゴリ別に、生活開始に必要なサービスを確認できます。"}
            </p>
          </div>

          {isLoading ? (
            <p className="font-medium text-gray-700">読み込み中...</p>
          ) : filteredPartners.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                準備中
              </div>
              <p className="font-medium leading-7 text-gray-800">
                このカテゴリの掲載サービスは準備中です。まずはチェックリストで必要な準備を確認し、公式情報もあわせて確認してください。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredPartners.map((partner) => {
                const destinationUrl = partner.official_url || partner.url;

                return (
                  <article
                    key={partner.id}
                    className="flex min-h-full flex-col justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {getPartnerCategoryLabel(
                            normalizeCategory(partner.category),
                          )}
                        </span>
                        {partner.is_affiliate ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            広告/紹介リンク
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {partner.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-gray-700">
                          {partner.country || "NZ"}
                        </p>
                      </div>

                      <p className="text-sm font-medium leading-6 text-gray-800">
                        {partner.description || "サービス説明を準備中です。"}
                      </p>

                      <div className="space-y-2 text-sm font-medium leading-6 text-gray-800">
                        <p>
                          <span className="font-bold text-gray-900">
                            向いている人:
                          </span>{" "}
                          {partner.recommended_for ||
                            "条件を比較しながら自分に合う選択肢を確認したい人"}
                        </p>
                        <p>
                          <span className="font-bold text-gray-900">
                            注意点:
                          </span>{" "}
                          {partner.caution_note ||
                            "契約前に料金、期間、解約条件、最新キャンペーンを公式サイトで確認してください。"}
                        </p>
                        {partner.price_note ? (
                          <p>
                            <span className="font-bold text-gray-900">
                              料金メモ:
                            </span>{" "}
                            {partner.price_note}
                          </p>
                        ) : null}
                        {partner.affiliate_note ? (
                          <p>
                            <span className="font-bold text-gray-900">
                              紹介リンクについて:
                            </span>{" "}
                            {partner.affiliate_note}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4">
                      <LeadPartnerButton
                        category={normalizeCategory(partner.category)}
                        partnerName={partner.name}
                        destinationUrl={destinationUrl}
                        sourcePage="/partners"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <AdDisclosureNotice detail />

        <div className="flex justify-end">
          <Link href="/mypage" className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto">マイページへ戻る</Link>
        </div>
      </div>
    </main>
  );
}

export default function PartnersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
          <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 font-bold shadow md:p-6">
            読み込み中...
          </div>
        </main>
      }
    >
      <PartnersPageContent />
    </Suspense>
  );
}
