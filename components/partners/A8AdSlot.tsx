"use client";

import { trackMetric } from "@/lib/analytics";

type A8AdSlotProps = {
  html: string;
  className?: string;
  size?: "text" | "banner300x250" | "banner468x60" | "banner728x120" | "banner120x60";
  variant?: "card" | "button";
  analytics?: {
    serviceId: string;
    serviceName: string;
    category: string;
    provider?: string;
    network?: string;
    affiliateNetwork?: string;
    programId?: string;
    adType: string;
    pagePath?: string;
  };
};

export default function A8AdSlot({
  html,
  className = "",
  size = "banner300x250",
  variant = "card",
  analytics,
}: A8AdSlotProps) {
  const isWide = size === "banner728x120";
  const isButton = variant === "button";
  const reservedSizeClass =
    size === "banner300x250"
      ? "min-h-[250px] w-[300px]"
      : size === "banner468x60"
        ? "min-h-[60px] w-[468px]"
        : size === "banner728x120"
          ? "min-h-[120px] w-[728px]"
          : size === "banner120x60"
            ? "min-h-[60px] w-[120px]"
            : "";

  return (
    <div
      onClick={() => {
        if (!analytics) return;
        void trackMetric("affiliate_link_click", {
          eventType: "click",
          targetType: "affiliate_ad",
          targetId: analytics.serviceId,
          pagePath: analytics.pagePath || "/partners/sim-esim",
          metadata: {
            serviceId: analytics.serviceId,
            serviceName: analytics.serviceName,
            category: analytics.category,
            provider: analytics.provider || analytics.serviceId,
            network: analytics.network || analytics.affiliateNetwork || null,
            affiliateNetwork: analytics.affiliateNetwork || null,
            programId: analytics.programId || null,
            adType: analytics.adType,
          },
        });
      }}
      className={
        isButton
          ? className
          : `rounded-xl border border-amber-200 bg-amber-50/40 p-3 ${className}`
      }
    >
      {!isButton ? (
        <p className="mb-2 text-xs font-bold text-amber-700">
          広告・紹介リンク
        </p>
      ) : null}
      <div
        className={`a8-ad-slot mx-auto max-w-full overflow-hidden ${reservedSizeClass} ${
          isButton ? "a8-ad-slot--button" : ""
        } ${
          isWide ? "hidden md:block" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
