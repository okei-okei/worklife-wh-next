"use client";

import Link from "next/link";

const goals = [
  {
    number: "01",
    title: "仕事を探す",
    description: "求人を確認する",
    href: "/jobs",
    shape:
      "min-h-[164px] rounded-t-[5rem] rounded-b-[1.5rem] bg-white/16 col-span-1",
  },
  {
    number: "02",
    title: "住まいを探す",
    description: "物件候補を見る",
    href: "/properties",
    shape:
      "min-h-[164px] rounded-t-[5rem] rounded-b-[1.5rem] bg-emerald-200/18 col-span-1",
  },
  {
    number: "03",
    title: "渡航準備を進める",
    description: "手続きをチェック",
    href: "/mypage/checklist",
    shape:
      "min-h-[104px] rounded-full bg-white/14 col-span-2 md:col-span-1",
  },
  {
    number: "04",
    title: "生活プランを比較する",
    description: "収支と通勤を見る",
    href: "/planner",
    shape:
      "min-h-[104px] rounded-full bg-sky-200/18 col-span-2 md:col-span-1",
  },
];

export default function GoalNavigation() {
  return (
    <section
      data-scene="hero" data-background-scene="hero"
      className="px-4 py-20 text-white md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">
          CHOOSE YOUR NEXT STEP
        </p>
        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-black leading-tight md:text-4xl">
            今したいことから選ぶ
          </h2>
          <p className="max-w-md text-sm font-semibold leading-6 text-white/78">
            必要な情報からすぐに始められます。
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:items-end md:gap-4">
          {goals.map((goal, index) => (
            <Link
              key={goal.href}
              href={goal.href}
              className={`group flex flex-col justify-between border border-white/18 p-4 text-white shadow-2xl shadow-slate-950/10 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/22 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:hover:translate-y-0 md:p-5 ${
                goal.shape
              } ${index === 0 ? "md:min-h-[260px]" : ""} ${
                index === 1 ? "md:min-h-[220px]" : ""
              } ${index === 2 ? "md:min-h-[156px]" : ""} ${
                index === 3 ? "md:min-h-[196px]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-black tracking-[0.2em] text-emerald-200">
                  {goal.number}
                </span>
                <span className="text-lg transition group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
                  →
                </span>
              </div>
              <div>
                <h3 className="text-base font-black leading-snug md:text-xl">
                  {goal.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs font-semibold text-white/75 md:text-sm">
                  {goal.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
