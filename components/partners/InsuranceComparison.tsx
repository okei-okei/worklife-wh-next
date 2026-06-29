"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { trackMetric } from "@/lib/analytics";
import {
  insuranceComparisonFields,
  insuranceFilters,
  insuranceRecommendations,
  insuranceServices,
} from "@/lib/constants/partners/insuranceServices";
import type { PartnerService } from "@/lib/constants/partners/types";

function formatValue(value: string | boolean | number | null | undefined) {
  if (value === true) return "○";
  if (value === false) return "—";
  if (value === null || value === undefined || value === "") return "要確認";
  return String(value);
}

function badgeClass(value: string | boolean | number | null | undefined) {
  if (value === true) return "bg-green-50 text-green-700";
  if (value === false || value == null) return "bg-gray-100 text-gray-600";
  return "bg-blue-50 text-blue-700";
}

function destinationUrl(service: PartnerService) {
  return service.affiliateLink || service.affiliateUrl || service.officialUrl;
}

function affiliateLabel(service: PartnerService) {
  if (service.affiliateStatus === "official") return "公式リンク";
  if (service.affiliateStatus === "available") return "広告・紹介リンク";
  if (service.affiliateStatus === "pending") return "提携申請中";
  return "広告リンクなし";
}

function MobileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-2">
      <p className="text-[11px] font-bold text-gray-600">{label}</p>
      <p className="mt-0.5 text-xs font-bold leading-5 text-gray-900">
        {value}
      </p>
    </div>
  );
}

function OfficialButton({ service }: { service: PartnerService }) {
  return (
    <a
      href={destinationUrl(service)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        void trackMetric(
          service.isAffiliate ? "affiliate_link_click" : "official_link_click",
          {
            eventType: "click",
            targetType: "partner_service",
            targetId: service.id,
            pagePath: "/partners/insurance",
            metadata: {
              serviceId: service.id,
              category: service.category,
              serviceName: service.name,
              targetUrl: destinationUrl(service),
              destinationUrl: destinationUrl(service),
              affiliateStatus: service.affiliateStatus || "none",
            },
          },
        );
      }}
      className="block w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
    >
      公式サイトで確認する
    </a>
  );
}

export default function InsuranceComparison() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    void trackMetric("partner_category_view", {
      eventType: "page_view",
      targetType: "partner_category",
      targetId: "/partners/insurance",
      pagePath: "/partners/insurance",
      metadata: {
        categoryPath: "/partners/insurance",
        serviceCount: insuranceServices.length,
      },
    });
  }, []);

  const filteredServices =
    activeFilters.length === 0
      ? insuranceServices
      : insuranceServices.filter((service) =>
          activeFilters.every((filter) => service.filterTags.includes(filter)),
        );

  const toggleFilter = (filter: string) => {
    void trackMetric("partner_filter_use", {
      eventType: "filter",
      targetType: "partner_category",
      targetId: "/partners/insurance",
      pagePath: "/partners/insurance",
      metadata: { categoryPath: "/partners/insurance", filter },
    });
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "ホーム", href: "/" },
                { label: "比較・おすすめ", href: "/partners" },
                { label: "海外保険" },
              ]}
            />
          </div>
          <p className="mb-2 text-sm font-bold text-blue-700">
            WorkLife WH 比較・おすすめ
          </p>
          <h1 className="text-2xl font-bold md:text-4xl">海外保険比較</h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
            ニュージーランドのワーホリ・留学・旅行に向けて、医療費補償、携行品、賠償責任、加入タイミングなどを比較・整理できます。
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-700">
          このページはランキングではなく、契約前に確認すべき条件を整理する比較ページです。保険料、補償範囲、加入条件は変更される場合があります。申込前に必ず公式サイトで最新情報をご確認ください。
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">目的別おすすめ</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
                目的に近い項目を選ぶと、その条件に合うサービスだけに絞り込めます。
              </p>
            </div>
            <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
              比較・整理
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {insuranceRecommendations.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  void trackMetric("partner_recommendation_click", {
                    eventType: "click",
                    targetType: "partner_recommendation",
                    targetId: item.filterKey || item.title,
                    pagePath: "/partners/insurance",
                    metadata: {
                      categoryPath: "/partners/insurance",
                      recommendationTitle: item.title,
                      filterKey: item.filterKey || null,
                    },
                  });
                  if (item.filterKey) setActiveFilters([item.filterKey]);
                }}
                className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-left hover:bg-blue-50 md:p-4"
              >
                <p className="text-sm font-bold text-gray-900 md:text-base">
                  {item.title}
                </p>
                <p className="mt-1 text-xs font-medium leading-5 text-gray-700 md:text-sm md:leading-6">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </section>

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
            {insuranceFilters.map((filter) => {
              const isActive = activeFilters.includes(filter.key);
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => toggleFilter(filter.key)}
                  className={`rounded-lg px-3 py-2 text-sm font-bold md:px-4 md:py-3 ${
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
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 md:px-4 md:py-3"
              >
                条件をリセット
              </button>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">比較カード</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
              スマホでは主要情報だけをカードで確認できます。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredServices.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-gray-200 bg-white p-3"
              >
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    {service.serviceType}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700">
                    {affiliateLabel(service)}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-gray-900">
                  {service.name}
                </h3>
                <p className="line-clamp-2 mt-1 text-xs font-medium leading-5 text-gray-700">
                  {service.shortDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {service.recommendedFor.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-gray-50 p-2.5">
                  <p className="text-[11px] font-bold text-gray-700">注意点</p>
                  <p className="line-clamp-2 mt-1 text-xs font-medium leading-5 text-gray-700">
                    {service.cautions.slice(0, 2).join(" / ")}
                  </p>
                </div>
                <div className="mt-3">
                  <OfficialButton service={service} />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-2">
            {filteredServices.map((service) => (
              <article
                key={`desktop-${service.id}`}
                className="flex min-h-full flex-col rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {service.serviceType}
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                    {service.countryCode}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                    {affiliateLabel(service)}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-gray-900 md:text-2xl">
                  {service.name}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-gray-800">
                  {service.shortDescription}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {insuranceComparisonFields.slice(0, 4).map((field) => (
                    <MobileFact
                      key={field.key}
                      label={field.label}
                      value={formatValue(service.comparison[field.key])}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-bold text-gray-900">おすすめ用途</p>
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
                    {service.cautions.slice(0, 2).map((item) => (
                      <li key={item}>・{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs font-medium leading-5 text-gray-700">
                  保険料・補償条件は変更される場合があります。契約前に必ず公式サイトで最新情報をご確認ください。
                </p>
                <div className="mt-auto pt-4">
                  <OfficialButton service={service} />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5">
            <h3 className="text-base font-bold text-gray-900 md:text-xl">
              詳細比較表
            </h3>
            <p className="mt-1 text-xs font-medium leading-5 text-gray-700 md:text-sm md:leading-6">
              詳しく比較したい場合は、横にスクロールして各項目を確認できます。
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-[980px] border-collapse text-left text-xs md:min-w-[1280px] md:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-900">
                    <th className="sticky left-0 z-20 min-w-36 bg-gray-50 px-2 py-2 font-bold md:min-w-48 md:px-4 md:py-4">
                      サービス
                    </th>
                    {insuranceComparisonFields.map((field) => (
                      <th
                        key={field.key}
                        className={`px-2 py-2 font-bold md:px-4 md:py-4 ${
                          field.important ? "bg-blue-50" : "bg-gray-50"
                        }`}
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="bg-gray-50 px-2 py-2 font-bold md:px-4 md:py-4">
                      公式サイト
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => (
                    <tr
                      key={`table-${service.id}`}
                      className="border-b border-gray-100 align-top hover:bg-gray-50"
                    >
                      <td className="sticky left-0 z-10 min-w-36 bg-white px-2 py-2 font-bold text-gray-900 md:min-w-48 md:px-4 md:py-5">
                        {service.name}
                      </td>
                      {insuranceComparisonFields.map((field) => {
                        const value = service.comparison[field.key];
                        const isBoolean = typeof value === "boolean";
                        return (
                          <td
                            key={field.key}
                            className={`px-2 py-2 font-medium leading-5 text-gray-800 md:px-4 md:py-5 md:leading-6 ${
                              field.important ? "bg-blue-50/40" : ""
                            }`}
                          >
                            {isBoolean ? (
                              <span
                                className={`inline-flex min-w-10 justify-center rounded-full px-2 py-1 text-xs font-bold md:min-w-16 md:px-3 md:text-sm ${badgeClass(
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
                      <td className="min-w-36 px-2 py-2 md:px-4 md:py-5">
                        <OfficialButton service={service} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">関連記事</h2>
          <article className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                海外保険
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                NZ
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-gray-900">
              ニュージーランドワーホリに海外保険は必要？選び方と比較ポイント
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
              海外保険が必要な理由、日本との違い、ワーホリ・旅行・長期滞在別の比較ポイントを整理します。
            </p>
            <Link
              href="/articles/nz-working-holiday-insurance-guide"
              className="mt-4 inline-flex rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50"
            >
              記事を読む
            </Link>
          </article>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-700 md:p-5">
          WorkLife WHでは、契約前に条件を比較・確認しやすい形で情報を整理しています。保険商品は、料金、補償条件、加入条件、対応エリア、サポート体制が変更される場合があります。契約・申込みを行う前には、必ず各サービスの公式サイトで最新情報をご確認ください。
        </section>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          <Link
            href="/mypage/checklist"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            チェックリストへ戻る
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
