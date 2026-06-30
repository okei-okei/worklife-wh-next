"use client";

import { trackMetric } from "@/lib/analytics";

type ArticleReferralBoxProps = {
  title: string;
  description: string;
  label?: string;
  href: string;
  provider: string;
  category: string;
  disclosure?: string;
  pagePath?: string;
  articleSlug?: string;
};

export default function ArticleReferralBox({
  title,
  description,
  label = "紹介リンク",
  href,
  provider,
  category,
  disclosure,
  pagePath,
  articleSlug,
}: ArticleReferralBoxProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
          {label}
        </span>
        <span className="text-xs font-bold text-gray-700">{provider}</span>
      </div>
      <h3 className="mt-3 text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
        {description}
      </p>
      {disclosure ? (
        <p className="mt-2 text-xs font-medium leading-5 text-amber-900">
          {disclosure}
        </p>
      ) : null}
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        onClick={() => {
          void trackMetric("affiliate_link_click", {
            eventType: "click",
            targetType: "article_referral",
            targetId: provider,
            pagePath,
            metadata: {
              articleSlug,
              provider,
              category,
              linkType: "text_referral",
            },
          });
        }}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
      >
        {title}
      </a>
    </div>
  );
}
