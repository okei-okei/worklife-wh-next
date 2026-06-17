"use client";

import type { ExperienceItem } from "@/lib/services/applicationWriter";

type Props = {
  item: ExperienceItem;
  onChange: (key: keyof ExperienceItem, value: string | boolean) => void;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 31 }, (_item, index) =>
  String(currentYear - index),
);
const months = Array.from({ length: 12 }, (_item, index) => String(index + 1));

function normalizeYearMonth(value: string | undefined) {
  if (!value) return { year: "", month: "" };

  const [year, month] = value.split("-");

  if (!year || !month) return { year: "", month: "" };

  return {
    year,
    month: String(Number(month)),
  };
}

export default function ExperiencePeriodFields({ item, onChange }: Props) {
  const legacyStart = normalizeYearMonth(item.startMonth);
  const legacyEnd = normalizeYearMonth(item.endMonth);
  const startYear = item.startYear || legacyStart.year;
  const startMonth = item.startMonth?.includes("-")
    ? legacyStart.month
    : item.startMonth || "";
  const endYear = item.endYear || legacyEnd.year;
  const endMonth = item.endMonth?.includes("-")
    ? legacyEnd.month
    : item.endMonth || "";
  const isCurrent = Boolean(item.isCurrent);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-2">
      <p className="text-sm font-bold text-gray-900">期間</p>
      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <label className="block">
          <span className="text-xs font-bold text-gray-700">開始年</span>
          <select
            value={startYear}
            onChange={(event) => onChange("startYear", event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
          >
            <option value="">未設定</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-gray-700">開始月</span>
          <select
            value={startMonth}
            onChange={(event) => onChange("startMonth", event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
          >
            <option value="">未設定</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}月
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-gray-700">終了年</span>
          <select
            value={endYear}
            onChange={(event) => onChange("endYear", event.target.value)}
            disabled={isCurrent}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900 disabled:bg-gray-100"
          >
            <option value="">未設定</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-gray-700">終了月</span>
          <select
            value={endMonth}
            onChange={(event) => onChange("endMonth", event.target.value)}
            disabled={isCurrent}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900 disabled:bg-gray-100"
          >
            <option value="">未設定</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}月
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 flex items-center gap-3 text-sm font-bold text-gray-900">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(event) => {
            onChange("isCurrent", event.target.checked);
            if (event.target.checked) {
              onChange("endYear", "");
              onChange("endMonth", "");
            }
          }}
          className="h-5 w-5"
        />
        現在も継続中
      </label>
    </div>
  );
}
