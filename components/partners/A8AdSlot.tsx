"use client";

import { trackMetric } from "@/lib/analytics";

type A8AdSlotProps = {
  html: string;
  className?: string;
  size?: "text" | "banner300x250" | "banner728x120" | "banner120x60";
  variant?: "card" | "button";
  analytics?: {
    serviceId: string;
    serviceName: string;
    category: string;
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
        className={`a8-ad-slot mx-auto max-w-full overflow-hidden ${
          isButton ? "a8-ad-slot--button" : ""
        } ${
          isWide ? "hidden md:block" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
