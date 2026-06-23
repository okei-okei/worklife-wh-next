"use client";

import { useMemo, useState } from "react";
import { simServices, type SimService } from "@/lib/constants/simServices";

type FilterKey =
  | "esim"
  | "localSim"
  | "preDeparture"
  | "unlimited"
  | "callSms"
  | "nzLocal"
  | "shortTerm"
  | "longTerm";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "esim", label: "eSIMのみ" },
  { key: "localSim", label: "現地SIM" },
  { key: "preDeparture", label: "日本出発前に購入可" },
  { key: "unlimited", label: "データ無制限" },
  { key: "callSms", label: "通話/SMSあり" },
  { key: "nzLocal", label: "NZ現地向け" },
  { key: "shortTerm", label: "短期向け" },
  { key: "longTerm", label: "長期向け" },
];

function yesNo(value: boolean) {
  return value ? "可" : "要確認";
}

function markLabel(value: boolean) {
  return value ? "○" : "—";
}

function typeLabel(type: SimService["type"]) {
  if (type === "Physical SIM") return "物理SIM";
  if (type === "Both") return "両方";
  return "eSIM";
}

function getDestinationUrl(service: SimService) {
  return service.affiliateUrl || service.officialUrl;
}

function matchesFilter(service: SimService, filter: FilterKey) {
  switch (filter) {
    case "esim":
      return service.type === "eSIM" || service.type === "Both";
    case "localSim":
      return service.type === "Physical SIM" || service.type === "Both";
    case "preDeparture":
      return service.canBuyBeforeDeparture;
    case "unlimited":
      return service.hasUnlimitedData;
    case "callSms":
      return service.hasCallSms;
    case "nzLocal":
      return service.audienceTags.includes("nz_local");
    case "shortTerm":
      return service.audienceTags.includes("short_term");
    case "longTerm":
      return service.audienceTags.includes("long_term");
  }
}

function ServiceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-xs font-bold text-gray-600">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function BooleanBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-sm font-bold ${
        value ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {markLabel(value)}
    </span>
  );
}

function ComparisonItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 rounded-xl bg-gray-50 p-3">
      <p className="font-bold text-gray-700">{label}</p>
      <p className="min-w-0 break-words font-medium leading-6 text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default function SimEsimComparison() {
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);

  const filteredServices = useMemo(() => {
    if (activeFilters.length === 0) return simServices;

    return simServices.filter((service) =>
      activeFilters.every((filter) => matchesFilter(service, filter)),
    );
  }, [activeFilters]);

  const toggleFilter = (filter: FilterKey) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">絞り込み</h2>
            <p className="mt-1 text-sm font-medium text-gray-700">
              条件を複数選ぶと、すべてに当てはまるサービスだけを表示します。
            </p>
          </div>
          <p className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
            {filteredServices.length}件
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.key);

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => toggleFilter(filter.key)}
                className={`rounded-lg px-4 py-3 text-sm font-bold ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
          {activeFilters.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50"
            >
              条件をリセット
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredServices.map((service) => (
          <article
            key={service.id}
            className="flex min-h-full flex-col rounded-2xl bg-white p-4 text-gray-900 shadow md:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {typeLabel(service.type)}
                  </span>
                  {service.isAffiliate ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      広告・紹介リンク
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-xl font-bold md:text-2xl">
                  {service.name}
                </h3>
              </div>
              <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                {service.coverage}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <ServiceFact
                label="出発前購入"
                value={yesNo(service.canBuyBeforeDeparture)}
              />
              <ServiceFact
                label="通話/SMS"
                value={yesNo(service.hasCallSms)}
              />
              <ServiceFact
                label="テザリング"
                value={yesNo(service.allowsTethering)}
              />
              <ServiceFact
                label="アプリ管理"
                value={yesNo(service.appManagement)}
              />
              <ServiceFact
                label="データ"
                value={service.hasUnlimitedData ? "無制限系あり" : "容量別"}
              />
              <ServiceFact label="最終確認" value={service.lastCheckedAt} />
            </div>

            <div className="mt-4 space-y-3 text-sm font-medium leading-6 text-gray-800">
              <p>
                <span className="font-bold text-gray-900">料金目安:</span>{" "}
                {service.priceNote}
              </p>
              <p>
                <span className="font-bold text-gray-900">データ容量:</span>{" "}
                {service.dataNote}
              </p>
              <p>
                <span className="font-bold text-gray-900">利用期間:</span>{" "}
                {service.durationNote}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-bold text-gray-900">おすすめ対象</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {service.recommendedFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-bold text-gray-900">注意点</p>
              <ul className="mt-2 space-y-1 text-sm font-medium leading-6 text-gray-800">
                {service.cautions.map((caution) => (
                  <li key={caution}>・{caution}</li>
                ))}
              </ul>
            </div>

            <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs font-medium leading-5 text-gray-700">
              料金・データ容量・対応エリアは変更される場合があります。契約前に必ず公式サイトで最新情報をご確認ください。
            </p>

            <div className="mt-auto pt-4">
              <a
                href={getDestinationUrl(service)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
              >
                公式サイトを見る
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">比較表</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
            各サービスの特徴を横並びで比較できます。料金や対応内容は変更される場合があるため、申込前に公式サイトで最新情報を確認してください。
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700 md:hidden">
            スマホでは見やすいようにサービスごとの比較カードで表示しています。
          </p>
          <p className="mt-2 hidden text-sm font-medium text-gray-600 md:block">
            横にスクロールできます。
          </p>
        </div>

        <div className="space-y-4 md:hidden">
          {filteredServices.map((service) => (
            <article
              key={`mobile-${service.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {typeLabel(service.type)}
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                    {service.coverage}
                  </span>
                  {service.canBuyBeforeDeparture ? (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                      出発前購入可
                    </span>
                  ) : null}
                  {service.hasUnlimitedData ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                      データ多め
                    </span>
                  ) : null}
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {service.name}
                </h3>
              </div>

              <div className="mt-4 space-y-2">
                <ComparisonItem label="料金目安" value={service.priceNote} />
                <ComparisonItem label="データ容量" value={service.dataNote} />
                <ComparisonItem label="利用期間" value={service.durationNote} />
                <ComparisonItem
                  label="出発前購入"
                  value={yesNo(service.canBuyBeforeDeparture)}
                />
                <ComparisonItem
                  label="通話/SMS"
                  value={yesNo(service.hasCallSms)}
                />
                <ComparisonItem
                  label="テザリング"
                  value={yesNo(service.allowsTethering)}
                />
              </div>

              <div className="mt-4">
                <p className="font-bold text-gray-900">おすすめ対象</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {service.recommendedFor.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="font-bold text-gray-900">注意点</p>
                <ul className="mt-2 space-y-1 font-medium leading-6 text-gray-700">
                  {service.cautions.map((caution) => (
                    <li key={caution}>・{caution}</li>
                  ))}
                </ul>
              </div>

              <a
                href={getDestinationUrl(service)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
              >
                公式サイトを見る
              </a>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="min-w-[1180px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-900">
                <th className="sticky left-0 top-0 z-20 min-w-44 bg-gray-50 px-4 py-4 font-bold">
                  サービス
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-4 py-4 font-bold">
                  種別
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-4 py-4 font-bold">
                  対応国
                </th>
                <th className="sticky top-0 z-10 bg-blue-50 px-4 py-4 font-bold">
                  出発前購入
                </th>
                <th className="sticky top-0 z-10 bg-blue-50 px-4 py-4 font-bold">
                  データ容量
                </th>
                <th className="sticky top-0 z-10 bg-blue-50 px-4 py-4 font-bold">
                  利用期間
                </th>
                <th className="sticky top-0 z-10 bg-blue-50 px-4 py-4 font-bold">
                  通話/SMS
                </th>
                <th className="sticky top-0 z-10 bg-blue-50 px-4 py-4 font-bold">
                  テザリング
                </th>
                <th className="sticky top-0 z-10 bg-blue-50 px-4 py-4 font-bold">
                  料金目安
                </th>
                <th className="sticky top-0 z-10 bg-gray-50 px-4 py-4 font-bold">
                  公式
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-gray-100 align-top hover:bg-gray-50"
                >
                  <td className="sticky left-0 z-10 min-w-44 bg-white px-4 py-5 font-bold text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-4 py-5 font-medium text-gray-800">
                    {typeLabel(service.type)}
                  </td>
                  <td className="px-4 py-5 font-medium text-gray-800">
                    {service.coverage}
                  </td>
                  <td className="bg-blue-50/40 px-4 py-5 font-medium text-gray-800">
                    <BooleanBadge value={service.canBuyBeforeDeparture} />
                  </td>
                  <td className="bg-blue-50/40 px-4 py-5 font-medium leading-6 text-gray-800">
                    {service.dataNote}
                  </td>
                  <td className="bg-blue-50/40 px-4 py-5 font-medium leading-6 text-gray-800">
                    {service.durationNote}
                  </td>
                  <td className="bg-blue-50/40 px-4 py-5 font-medium text-gray-800">
                    <BooleanBadge value={service.hasCallSms} />
                  </td>
                  <td className="bg-blue-50/40 px-4 py-5 font-medium text-gray-800">
                    <BooleanBadge value={service.allowsTethering} />
                  </td>
                  <td className="bg-blue-50/40 px-4 py-5 font-medium leading-6 text-gray-800">
                    {service.priceNote}
                  </td>
                  <td className="px-4 py-5">
                    <a
                      href={getDestinationUrl(service)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg border border-gray-300 bg-white px-3 py-2 font-bold text-gray-900 hover:bg-gray-50"
                    >
                      見る
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
