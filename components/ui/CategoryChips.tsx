"use client";

export type CategoryChip = {
  id: string;
  label: string;
  count?: number;
};

type CategoryChipsProps = {
  categories: CategoryChip[];
  selectedId: string;
  onSelect: (id: string) => void;
  ariaLabel?: string;
};

export default function CategoryChips({
  categories,
  selectedId,
  onSelect,
  ariaLabel = "カテゴリー選択",
}: CategoryChipsProps) {
  return (
    <div
      aria-label={ariaLabel}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible"
    >
      {categories.map((category) => {
        const isSelected = selectedId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition md:text-sm ${
              isSelected
                ? "bg-blue-700 text-white"
                : "bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50"
            }`}
          >
            {category.label}
            {typeof category.count === "number" ? (
              <span
                className={`ml-1 text-[10px] ${
                  isSelected ? "text-blue-100" : "text-gray-600"
                }`}
              >
                {category.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
