"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "保存する",
    description: "気になる求人と物件をまとめて保存します。",
    href: "/mypage",
    mark: "01",
    label: "SAVE",
    mockTitle: "保存した候補",
    mock: ["Cafe Staff", "Hornby Share House", "Checklist"],
    className: "from-blue-50 to-emerald-50",
  },
  {
    title: "比較する",
    description: "通勤時間と毎月の生活費を確認します。",
    href: "/planner",
    mark: "02",
    label: "COMPARE",
    mockTitle: "生活プラン",
    mock: ["通勤 18分", "家賃 $260/w", "月間収支 +$420"],
    className: "from-sky-50 to-blue-100",
  },
  {
    title: "準備する",
    description: "渡航前後の手続きをチェックします。",
    href: "/mypage/checklist",
    mark: "03",
    label: "PREPARE",
    mockTitle: "渡航準備",
    mock: ["SIM", "銀行", "海外保険"],
    className: "from-emerald-50 to-teal-100",
  },
];

export default function FeatureSummary() {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    if (!mediaQuery.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) return;
        const index = Number(
          (visibleEntry.target as HTMLElement).dataset.stepIndex,
        );
        if (!Number.isNaN(index)) setActiveIndex(index);
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0.25, 0.5, 0.75],
      },
    );

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      data-home-scene="life-plan"
      className="bg-gray-50/90 px-4 py-9 backdrop-blur-[1px] md:px-6 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              WHAT YOU CAN DO
            </p>
            <h2 className="mt-2 text-xl font-black text-gray-900 md:text-4xl">
              海外生活に必要なことを、一つに
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-gray-600">
              候補の保存から生活設計まで、順番に進められます。
            </p>
          </div>
          <Link href="/mypage" className="text-sm font-black text-blue-700">
            すべての機能を見る
          </Link>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-10">
          <div className="sticky top-24 hidden h-[520px] overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-4 lg:block">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`absolute inset-4 rounded-[1.5rem] bg-gradient-to-br p-5 transition-opacity duration-500 motion-reduce:transition-none ${feature.className} ${
                  activeIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">
                  {feature.label}
                </p>
                <p className="mt-4 text-6xl font-black text-gray-900/10">
                  {feature.mark}
                </p>
                <div className="mt-10 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <p className="text-xs font-black text-gray-500">
                    {feature.mockTitle}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {feature.mock.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-gray-100 bg-white px-3 py-3 text-sm font-black text-gray-900"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:block">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                data-step-index={index}
                className="grid gap-4 rounded-3xl border border-gray-200 bg-white p-4 lg:min-h-[420px] lg:content-center lg:border-0 lg:bg-transparent lg:p-0"
              >
                <div
                  className={`rounded-3xl bg-gradient-to-br p-4 lg:hidden ${feature.className}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                    {feature.label}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {feature.mock.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-gray-900 shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:max-w-xl">
                  <p className="text-5xl font-black leading-none text-gray-100 lg:text-8xl">
                    {feature.mark}
                  </p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                    {feature.label}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-gray-900 md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="mt-3 inline-flex text-sm font-black text-blue-700"
                  >
                    詳細を見る →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
