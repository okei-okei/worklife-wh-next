"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CategoryChips, { type CategoryChip } from "@/components/ui/CategoryChips";

export type PartnerCategoryCardForSelector = {
  title: string;
  icon: string;
  description: string;
  href: string;
  buttonLabel: string;
  services: string[];
  comparisonItems: string[];
  categoryTags: string[];
};

const filterLabels: Record<string, string> = {
  all: "すべて",
  before_departure: "渡航前",
  money: "お金",
  communication: "通信",
  housing: "住居",
  infrastructure: "生活インフラ",
  learning: "学習",
  transport: "移動",
  work: "仕事",
  affiliate: "広告・紹介あり",
};

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-700 md:px-3 md:text-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function PartnerCategorySelector({
  cards,
}: {
  cards: PartnerCategoryCardForSelector[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const chips = useMemo<CategoryChip[]>(() => {
    const ids = [
      "all",
      "before_departure",
      "money",
      "communication",
      "housing",
      "infrastructure",
      "learning",
      "transport",
      "work",
      "affiliate",
    ];

    return ids.map((id) => ({
      id,
      label: filterLabels[id],
      count:
        id === "all"
          ? cards.length
          : cards.filter((card) => card.categoryTags.includes(id)).length,
    }));
  }, [cards]);

  const filteredCards =
    selectedCategory === "all"
      ? cards
      : cards.filter((card) => card.categoryTags.includes(selectedCategory));

  return (
    <>
      <section className="rounded-2xl bg-white p-3 shadow md:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">カテゴリー</h2>
            <p className="mt-1 hidden text-sm font-medium text-gray-700 md:block">
              興味のある準備テーマだけに絞り込めます。
            </p>
          </div>
          <p className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 md:px-3 md:text-sm">
            {filteredCards.length}件
          </p>
        </div>
        <CategoryChips
          categories={chips}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
          ariaLabel="比較カテゴリー"
        />
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {filteredCards.map((category) => (
          <article
            key={category.href}
            className="flex min-h-full flex-col rounded-2xl bg-white p-3 shadow md:p-5"
          >
            <div className="flex-1 space-y-3 md:space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-xl md:size-10"
                  >
                    {category.icon}
                  </span>
                  <h2 className="text-base font-bold text-gray-900 md:text-xl">
                    {category.title}
                  </h2>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-800 md:line-clamp-none">
                  {category.description}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold text-gray-900 md:text-sm">
                  代表サービス
                </p>
                <TagList items={category.services.slice(0, 3)} />
              </div>

              <div>
                <p className="mb-2 text-xs font-bold text-gray-900 md:text-sm">
                  比較できる項目
                </p>
                <TagList items={category.comparisonItems.slice(0, 4)} />
              </div>
            </div>

            <Link
              href={category.href}
              className="mt-4 block w-full rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-bold text-white hover:bg-blue-800 md:mt-5 md:px-4 md:py-3 md:text-base"
            >
              {category.buttonLabel}
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
