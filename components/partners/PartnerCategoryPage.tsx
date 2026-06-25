"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { trackMetric } from "@/lib/analytics";
import type {
  PartnerComparisonField,
  PartnerFilter,
  PartnerRecommendation,
  PartnerService,
} from "@/lib/constants/partners/types";

type Props = {
  title: string;
  description: string;
  categoryPath: string;
  services: PartnerService[];
  filters: PartnerFilter[];
  comparisonFields: PartnerComparisonField[];
  recommendations: PartnerRecommendation[];
  children?: ReactNode;
};

function formatValue(value: string | boolean | number | null | undefined) {
  if (value === true) return "○";
  if (value === false) return "—";
  if (value === null || value === undefined || value === "") return "要確認";
  return String(value);
}

function valueBadgeClass(value: string | boolean | number | null | undefined) {
  if (value === true) return "bg-green-50 text-green-700";
  if (value === false || value == null) return "bg-gray-100 text-gray-600";
  return "bg-blue-50 text-blue-700";
}

function getDestinationUrl(service: PartnerService) {
  return service.affiliateLink || service.affiliateUrl || service.officialUrl;
}

export default function PartnerCategoryPage({
  title,
  description,
  categoryPath,
  services,
  filters,
  comparisonFields,
  recommendations,
  children,
}: Props) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filteredServices = useMemo(() => {
    if (!activeFilters.length) return services;

    return services.filter((service) =>
      activeFilters.every((filter) => service.filterTags.includes(filter)),
    );
  }, [activeFilters, services]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    );
  };

  const handleClickService = async (service: PartnerService) => {
    await trackMetric(service.isAffiliate ? "affiliate_link_click" : "partner_clicked", {
      eventType: "click",
      pagePath: categoryPath,
      metadata: {
        category: service.category,
        serviceName: service.name,
        destinationUrl: getDestinationUrl(service),
      },
    });
  };

  const hasServices = services.length > 0;

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <p className="mb-2 text-sm font-bold text-blue-700">
            WorkLife WH 比較・おすすめ
          </p>
          <h1 className="text-2xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
            {description}
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-700">
          掲載サービスには広告・紹介リンクが含まれる場合があります。契約前に必ず公式サイトで最新情報をご確認ください。
        </section>

        {hasServices ? (
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <h2 className="text-xl font-bold text-gray-900">目的別おすすめ</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {recommendations.map((recommendation) => (
                <button
                  key={recommendation.title}
                  type="button"
                  onClick={() => {
                    if (recommendation.filterKey) {
                      setActiveFilters([recommendation.filterKey]);
                    }
                  }}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:bg-blue-50"
                >
                  <p className="font-bold text-gray-900">
                    {recommendation.title}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
                    {recommendation.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <p className="font-medium leading-7 text-gray-800">
              現在、このカテゴリの掲載情報を準備中です。契約前には必ず公式サイトで最新情報をご確認ください。
            </p>
          </section>
        )}

        {hasServices ? <section className="rounded-2xl bg-white p-4 shadow md:p-6">
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
            {activeFilters.length ? (
              <button
                type="button"
                onClick={() => setActiveFilters([])}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50"
              >
                条件をリセット
              </button>
            ) : null}
          </div>
        </section> : null}

        {hasServices ? <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="flex min-h-full flex-col rounded-2xl bg-white p-4 text-gray-900 shadow md:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      {service.serviceType}
                    </span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                      {service.countryCode}
                    </span>
                    {service.isAffiliate ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                        広告・紹介リンク
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-xl font-bold md:text-2xl">
                    {service.name}
                  </h3>
                </div>
              </div>

              <p className="mt-3 text-sm font-medium leading-6 text-gray-800">
                {service.shortDescription}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {comparisonFields.slice(0, 4).map((field) => (
                  <div key={field.key} className="rounded-xl bg-gray-50 p-3">
                    <p className="text-sm font-bold text-gray-600">
                      {field.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-gray-900">
                      {formatValue(service.comparison[field.key])}
                    </p>
                  </div>
                ))}
              </div>

              {service.priceNote ? (
                <p className="mt-4 text-sm font-medium leading-6 text-gray-800">
                  <span className="font-bold text-gray-900">料金目安:</span>{" "}
                  {service.priceNote}
                </p>
              ) : null}

              <div className="mt-4">
                <p className="text-sm font-bold text-gray-900">おすすめ対象</p>
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
                <p className="text-sm font-bold text-gray-900">注意点</p>
                <ul className="mt-2 space-y-1 text-sm font-medium leading-6 text-gray-800">
                  {service.cautions.slice(0, 2).map((caution) => (
                    <li key={caution}>・{caution}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-700">
                料金・条件・対応エリアは変更される場合があります。契約前に必ず公式サイトで最新情報をご確認ください。
              </p>

              <a
                href={getDestinationUrl(service)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  void handleClickService(service);
                }}
                className="mt-auto block w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
              >
                公式サイトを見る
              </a>
            </article>
          ))}
        </section> : null}

        {hasServices ? <section className="rounded-2xl bg-white p-4 shadow md:p-6">
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
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {service.serviceType}
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                    {service.countryCode}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-gray-900">
                  {service.name}
                </h3>
                <div className="mt-4 space-y-2">
                  {comparisonFields.slice(0, 8).map((field) => (
                    <div
                      key={field.key}
                      className="grid grid-cols-[120px_1fr] gap-3 rounded-xl bg-gray-50 p-3"
                    >
                      <p className="font-bold text-gray-700">{field.label}</p>
                      <p className="min-w-0 break-words font-medium leading-6 text-gray-900">
                        {formatValue(service.comparison[field.key])}
                      </p>
                    </div>
                  ))}
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

                <a
                  href={getDestinationUrl(service)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    void handleClickService(service);
                  }}
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
                  <th className="sticky left-0 top-0 z-20 min-w-48 bg-gray-50 px-4 py-4 font-bold">
                    サービス
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 px-4 py-4 font-bold">
                    種別
                  </th>
                  {comparisonFields.map((field) => (
                    <th
                      key={field.key}
                      className={`sticky top-0 z-10 px-4 py-4 font-bold ${
                        field.important ? "bg-blue-50" : "bg-gray-50"
                      }`}
                    >
                      {field.label}
                    </th>
                  ))}
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
                    <td className="sticky left-0 z-10 min-w-48 bg-white px-4 py-5 font-bold text-gray-900">
                      {service.name}
                    </td>
                    <td className="px-4 py-5 font-medium text-gray-800">
                      {service.serviceType}
                    </td>
                    {comparisonFields.map((field) => {
                      const value = service.comparison[field.key];
                      const isBoolean = typeof value === "boolean";
                      return (
                        <td
                          key={field.key}
                          className={`px-4 py-5 font-medium leading-6 text-gray-800 ${
                            field.important ? "bg-blue-50/40" : ""
                          }`}
                        >
                          {isBoolean ? (
                            <span
                              className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-sm font-bold ${valueBadgeClass(
                                value,
                              )}`}
                            >
                              {formatValue(value)}
                            </span>
                          ) : (
                            formatValue(value)
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-5">
                      <a
                        href={getDestinationUrl(service)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          void handleClickService(service);
                        }}
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
        </section> : null}

        {children}

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-700 md:p-5">
          WorkLife WHでは、契約前に条件を比較・確認しやすい形で情報を整理しています。掲載サービスには広告・紹介リンクが含まれる場合があります。掲載内容は料金、利用条件、対応エリア、ワーホリ・海外生活との相性などをもとに整理しています。実際に契約・申込みを行う前には、必ず各サービスの公式サイトで最新情報をご確認ください。
        </section>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          <Link
            href="/partners"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            比較・おすすめへ戻る
          </Link>
          <Link
            href="/mypage"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            マイページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
