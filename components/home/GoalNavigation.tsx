"use client";

import HomeLineLink from "@/components/home/HomeLineLink";

const goals = [
  {
    number: "01",
    title: "仕事を探す",
    description: "求人を確認する",
    href: "/jobs",
  },
  {
    number: "02",
    title: "住まいを探す",
    description: "物件候補を見る",
    href: "/properties",
  },
  {
    number: "03",
    title: "渡航準備を進める",
    description: "手続きをチェック",
    href: "/mypage/checklist",
  },
  {
    number: "04",
    title: "生活プランを比較する",
    description: "収支と通勤を見る",
    href: "/planner",
  },
];

export default function GoalNavigation() {
  return (
    <section
      data-scene="hero"
      data-background-scene="hero"
      className="bg-white px-4 py-14 text-[#171717] md:px-6 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-7 border-t border-[#D8D8D4] pt-8 md:grid-cols-[0.42fr_0.58fr] md:gap-12 md:pt-12">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            CHOOSE YOUR NEXT STEP
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight md:text-4xl">
            今したいことから選ぶ
          </h2>
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-[#666666]">
            必要な情報からすぐに始められます。
          </p>
        </div>

        <div className="border-t border-[#D8D8D4] md:border-t-0">
          {goals.map((goal) => (
            <HomeLineLink
              key={goal.href}
              href={goal.href}
              number={goal.number}
              title={goal.title}
              description={goal.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
