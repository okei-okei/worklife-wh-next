"use client";

import JsonLd from "@/components/seo/JsonLd";
import type { PartnerFaqItem } from "@/lib/constants/partnerFaqs";

type SeoFaqSectionProps = {
  title?: string;
  items: PartnerFaqItem[];
};

export default function SeoFaqSection({
  title = "よくある質問",
  items,
}: SeoFaqSectionProps) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow md:p-6">
      <JsonLd data={jsonLd} />
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-xl border border-gray-200 bg-gray-50 p-3 open:bg-white md:p-4"
          >
            <summary className="cursor-pointer text-sm font-bold text-gray-900 md:text-base">
              {item.question}
            </summary>
            <p className="mt-3 text-sm font-medium leading-6 text-gray-700">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
