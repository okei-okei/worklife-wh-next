"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const goals = [
  {
    number: "01",
    label: "FIND A JOB",
    title: "仕事を探す",
    description: "ニュージーランドの求人を確認する",
    href: "/jobs",
    accent: "bg-blue-50 text-blue-700",
    mark: "J",
    imageClass: "object-[42%_50%]",
  },
  {
    number: "02",
    label: "FIND A HOME",
    title: "住まいを探す",
    description: "公開物件から候補を探す",
    href: "/properties",
    accent: "bg-emerald-50 text-emerald-700",
    mark: "H",
    imageClass: "object-[57%_50%]",
  },
  {
    number: "03",
    label: "PREPARE",
    title: "渡航準備を進める",
    description: "必要な手続きをチェックする",
    href: "/mypage/checklist",
    accent: "bg-sky-50 text-sky-700",
    mark: "C",
    imageClass: "object-[50%_44%]",
  },
  {
    number: "04",
    label: "COMPARE",
    title: "生活プランを比較する",
    description: "仕事・住まい・生活費を考える",
    href: "/planner",
    accent: "bg-teal-50 text-teal-700",
    mark: "P",
    imageClass: "object-[62%_52%]",
  },
];

export default function GoalNavigation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeGoal = goals[activeIndex] ?? goals[0];

  return (
    <section
      data-home-scene="work-home"
      className="bg-white/90 px-4 py-8 backdrop-blur-[1px] md:px-6 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
          CHOOSE YOUR NEXT STEP
        </p>
        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="text-xl font-black text-gray-900 md:text-4xl">
            今したいことから選ぶ
          </h2>
          <p className="max-w-md text-sm font-medium leading-6 text-gray-600">
            あなたの状況に合う入口から始められます。
          </p>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {goals.map((goal, index) => (
              <Link
                key={goal.href}
                href={goal.href}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`group flex min-h-[136px] flex-col rounded-3xl border p-3 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 motion-reduce:hover:translate-y-0 lg:min-h-0 lg:grid lg:grid-cols-[116px_minmax(0,1fr)] lg:items-center lg:gap-5 lg:p-5 ${
                  activeIndex === index
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-white even:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 lg:block">
                  <span className="text-3xl font-black leading-none text-gray-200 lg:text-7xl">
                    {goal.number}
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black lg:hidden ${goal.accent}`}
                    aria-hidden="true"
                  >
                    {goal.mark}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 lg:mt-0">
                    {goal.label}
                  </p>
                  <h3 className="mt-2 text-sm font-black leading-5 text-gray-900 md:text-base lg:text-xl">
                    {goal.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-600 md:text-sm">
                    {goal.description}
                  </p>
                  <span className="mt-auto inline-flex pt-2 text-xs font-black text-blue-700 transition group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 md:text-sm">
                    開く →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="sticky top-24 hidden overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-950 lg:block">
            <div className="relative aspect-[4/5]">
              {goals.map((goal, index) => (
                <Image
                  key={goal.href}
                  src="/images/home/hero-desktop.webp"
                  alt=""
                  fill
                  sizes="420px"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${goal.imageClass} ${
                    activeIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/82 via-gray-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200">
                  {activeGoal.label}
                </p>
                <p className="mt-3 text-3xl font-black">{activeGoal.title}</p>
                <p className="mt-2 text-sm font-semibold text-white/85">
                  {activeGoal.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
