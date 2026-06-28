"use client";

import { useEffect, useState } from "react";
import A8AdSlot from "@/components/partners/A8AdSlot";
import { trackMetric } from "@/lib/analytics";
import { getA8AdHtml } from "@/lib/constants/partners/a8Ads";
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

function getAnalytics(service: SimService, adType: string) {
  return {
    serviceId: service.id,
    serviceName: service.name,
    category: "sim-esim",
    affiliateNetwork: service.affiliateNetwork,
    programId: service.programId,
    adType,
    pagePath: "/partners/sim-esim",
  };
}

function trackOfficialClick(service: SimService) {
  void trackMetric("official_link_click", {
    eventType: "click",
    targetType: "partner_service",
    targetId: service.id,
    pagePath: "/partners/sim-esim",
    metadata: {
      serviceId: service.id,
      serviceName: service.name,
      category: "sim-esim",
      affiliateStatus: service.affiliateStatus || "none",
      targetUrl: getDestinationUrl(service),
    },
  });
}

function isAffiliateAvailable(service: SimService) {
  return service.affiliateStatus === "available" && Boolean(service.textAdKey);
}

function affiliateStatusLabel(service: SimService) {
  if (service.affiliateStatus === "available") return "広告・紹介リンク";
  if (service.affiliateStatus === "pending") return "提携申請中";
  return null;
}

function affiliateNetworkLabel(service: SimService) {
  if (service.affiliateStatus === "available") return "A8提携中";
  if (
    service.affiliateStatus === "none" &&
    service.audienceTags.includes("local_sim")
  ) {
    return "現地SIM";
  }
  return null;
}

function japaneseSupportLabel(service: SimService) {
  if (
    ["trifa", "japan-global-esim", "world-esim", "glocal-esim"].includes(
      service.id,
    )
  ) {
    return "要確認";
  }
  return service.coverage === "NZ" ? "英語中心" : "要確認";
}

function AffiliateAction({ service }: { service: SimService }) {
  const textAdHtml = getA8AdHtml(service.textAdKey);

  if (isAffiliateAvailable(service) && textAdHtml) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-bold text-amber-700">広告・紹介リンク</p>
        <A8AdSlot
          html={textAdHtml}
          size="text"
          variant="button"
          analytics={getAnalytics(service, "text")}
        />
      </div>
    );
  }

  return (
    <a
      href={getDestinationUrl(service)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackOfficialClick(service)}
      className="block w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
    >
      公式サイトで確認する
    </a>
  );
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

function MobileComparisonItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-2">
      <p className="text-[11px] font-bold text-gray-600">{label}</p>
      <p className="mt-0.5 text-xs font-bold leading-5 text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default function SimEsimComparison() {
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const mobileBannerAds = simServices
    .filter((service) => service.primaryAdKey)
    .map((service) => ({
      service,
      html: getA8AdHtml(service.primaryAdKey),
    }))
    .filter((ad): ad is { service: SimService; html: string } =>
      Boolean(ad.html),
    );
  const japanGlobalWideAd = getA8AdHtml(
    simServices.find((service) => service.id === "japan-global-esim")
      ?.wideAdKey,
  );

  const filteredServices =
    activeFilters.length === 0
      ? simServices
      : simServices.filter((service) =>
          activeFilters.every((filter) => matchesFilter(service, filter)),
        );

  const toggleFilter = (filter: FilterKey) => {
    void trackMetric("partner_filter_use", {
      eventType: "filter",
      targetType: "partner_category",
      targetId: "/partners/sim-esim",
      pagePath: "/partners/sim-esim",
      metadata: { categoryPath: "/partners/sim-esim", filter },
    });
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    );
  };

  useEffect(() => {
    void trackMetric("partner_category_view", {
      eventType: "page_view",
      targetType: "partner_category",
      targetId: "/partners/sim-esim",
      pagePath: "/partners/sim-esim",
      metadata: { categoryPath: "/partners/sim-esim", serviceCount: simServices.length },
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">目的別おすすめ</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
              出発前準備、長期滞在、現地SIMなど、使い方に合わせて候補を絞れます。
            </p>
          </div>
          <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            広告・紹介リンクを含む場合があります
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              title: "出発前に準備したい",
              body: "eSIMを日本出発前に購入し、到着直後から通信を使いたい方向けです。",
              tags: ["trifa", "JAPAN&GLOBAL eSIM", "Airalo"],
            },
            {
              title: "長期滞在・現地生活",
              body: "通話/SMSや店舗サポートも含めて、NZ現地SIMを検討したい方向けです。",
              tags: ["Spark", "One NZ", "2degrees"],
            },
            {
              title: "価格やプランを比較したい",
              body: "複数サービスの容量、期間、料金目安を見比べたい方向けです。",
              tags: ["Nomad", "MobiMatter", "Skinny"],
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-gray-50 p-3">
              <h3 className="text-sm font-bold text-gray-900 md:text-base">
                {item.title}
              </h3>
              <p className="mt-1 text-xs font-medium leading-5 text-gray-700 md:text-sm md:leading-6">
                {item.body}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
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

      <section className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-2">
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
                  {affiliateStatusLabel(service) ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        service.affiliateStatus === "available"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {affiliateStatusLabel(service)}
                    </span>
                  ) : null}
                  {affiliateNetworkLabel(service) ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                      {affiliateNetworkLabel(service)}
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

            {service.primaryAdKey ? (
              <div className="mt-4 hidden md:block">
                <A8AdSlot
                  html={getA8AdHtml(service.primaryAdKey) ?? ""}
                  size="banner300x250"
                  analytics={getAnalytics(service, "banner300x250")}
                />
              </div>
            ) : null}

            <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs font-medium leading-5 text-gray-700">
              料金・データ容量・対応エリアは変更される場合があります。契約前に必ず公式サイトで最新情報をご確認ください。
            </p>

            <div className="mt-auto pt-4">
              <AffiliateAction service={service} />
              {service.affiliateStatus === "pending" ? (
                <p className="mt-2 text-xs font-medium leading-5 text-gray-600">
                  現在は提携申請中のため、広告リンクではなく公式サイトのみを案内しています。
                </p>
              ) : null}
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

        <div className="space-y-3 md:hidden">
          {filteredServices.map((service) => (
            <article
              key={`mobile-${service.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-3"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    {typeLabel(service.type)}
                  </span>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                    {service.coverage}
                  </span>
                  {affiliateStatusLabel(service) ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        service.affiliateStatus === "available"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {affiliateStatusLabel(service)}
                    </span>
                  ) : null}
                  {affiliateNetworkLabel(service) ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700">
                      {affiliateNetworkLabel(service)}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  {service.name}
                </h3>
                <p className="line-clamp-2 text-xs font-medium leading-5 text-gray-700">
                  {service.dataNote}
                </p>
              </div>

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

              <div className="mt-3 grid grid-cols-2 gap-2">
                <MobileComparisonItem
                  label="出発前購入"
                  value={yesNo(service.canBuyBeforeDeparture)}
                />
                <MobileComparisonItem
                  label="長期滞在向き"
                  value={
                    service.audienceTags.includes("long_term")
                      ? "向き"
                      : "要確認"
                  }
                />
                <MobileComparisonItem
                  label="通話/SMS"
                  value={yesNo(service.hasCallSms)}
                />
                <MobileComparisonItem
                  label="テザリング"
                  value={yesNo(service.allowsTethering)}
                />
                <MobileComparisonItem
                  label="日本語サポート"
                  value={japaneseSupportLabel(service)}
                />
                <MobileComparisonItem
                  label="料金目安"
                  value={service.priceNote}
                />
              </div>

              <div className="mt-3 rounded-lg bg-gray-50 p-2.5">
                <p className="text-[11px] font-bold text-gray-700">注意点</p>
                <p className="line-clamp-2 mt-1 text-xs font-medium leading-5 text-gray-700">
                  {service.cautions.slice(0, 2).join(" / ")}
                </p>
              </div>

              <div className="mt-3">
                <AffiliateAction service={service} />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 md:hidden">
          <h3 className="text-base font-bold text-gray-900">詳細比較表</h3>
          <p className="mt-1 text-xs font-medium leading-5 text-gray-700">
            詳しく比較したい場合は、横にスクロールして各項目を確認できます。
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-900">
                  <th className="sticky left-0 z-20 min-w-32 bg-gray-50 px-2 py-2 font-bold">
                    サービス
                  </th>
                  <th className="px-2 py-2 font-bold">種別</th>
                  <th className="px-2 py-2 font-bold">出発前</th>
                  <th className="px-2 py-2 font-bold">長期</th>
                  <th className="px-2 py-2 font-bold">通話/SMS</th>
                  <th className="px-2 py-2 font-bold">テザリング</th>
                  <th className="px-2 py-2 font-bold">データ</th>
                  <th className="px-2 py-2 font-bold">公式</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr
                    key={`mobile-table-${service.id}`}
                    className="border-b border-gray-100 align-top"
                  >
                    <td className="sticky left-0 z-10 min-w-32 bg-white px-2 py-2 font-bold text-gray-900">
                      {service.name}
                    </td>
                    <td className="px-2 py-2 font-medium text-gray-700">
                      {typeLabel(service.type)}
                    </td>
                    <td className="px-2 py-2 font-medium text-gray-700">
                      {markLabel(service.canBuyBeforeDeparture)}
                    </td>
                    <td className="px-2 py-2 font-medium text-gray-700">
                      {service.audienceTags.includes("long_term") ? "○" : "—"}
                    </td>
                    <td className="px-2 py-2 font-medium text-gray-700">
                      {markLabel(service.hasCallSms)}
                    </td>
                    <td className="px-2 py-2 font-medium text-gray-700">
                      {markLabel(service.allowsTethering)}
                    </td>
                    <td className="px-2 py-2 font-medium leading-5 text-gray-700">
                      {service.hasUnlimitedData ? "無制限系あり" : "容量別"}
                    </td>
                    <td className="min-w-40 px-2 py-2">
                      <AffiliateAction service={service} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                    {isAffiliateAvailable(service) ? (
                      <div className="min-w-48">
                        <p className="mb-2 text-xs font-bold text-amber-700">
                          広告・紹介リンク
                        </p>
                        <A8AdSlot
                          html={getA8AdHtml(service.textAdKey) ?? ""}
                          size="text"
                          variant="button"
                          analytics={getAnalytics(service, "text")}
                        />
                      </div>
                    ) : (
                      <a
                        href={getDestinationUrl(service)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackOfficialClick(service)}
                        className="inline-flex rounded-lg border border-gray-300 bg-white px-3 py-2 font-bold text-gray-900 hover:bg-gray-50"
                      >
                        確認する
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {mobileBannerAds.length > 0 ? (
        <section className="rounded-2xl bg-white p-4 shadow md:hidden">
          <h2 className="text-base font-bold text-gray-900">広告バナー</h2>
          <p className="mt-1 text-xs font-medium leading-5 text-gray-700">
            掲載サービスには広告・紹介リンクが含まれる場合があります。
          </p>
          <div className="mt-3 space-y-3">
            {mobileBannerAds.map((ad) => (
              <A8AdSlot
                key={ad.service.id}
                html={ad.html}
                size="banner300x250"
                className="mx-auto"
                analytics={getAnalytics(ad.service, "banner300x250")}
              />
            ))}
          </div>
        </section>
      ) : null}

      {japanGlobalWideAd ? (
        <section className="hidden rounded-2xl bg-white p-4 shadow md:block md:p-6">
          <A8AdSlot
            html={japanGlobalWideAd}
            size="banner728x120"
            analytics={getAnalytics(
              simServices.find((service) => service.id === "japan-global-esim") ||
                simServices[0],
              "banner728x120",
            )}
          />
        </section>
      ) : null}
    </div>
  );
}
