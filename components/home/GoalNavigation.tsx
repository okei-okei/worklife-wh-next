import Link from "next/link";

const goals = [
  {
    title: "仕事を探す",
    description: "公開求人を見る",
    href: "/jobs",
    accent: "bg-blue-50 text-blue-700",
    mark: "J",
  },
  {
    title: "住まいを探す",
    description: "公開物件を見る",
    href: "/properties",
    accent: "bg-emerald-50 text-emerald-700",
    mark: "H",
  },
  {
    title: "渡航・生活を準備する",
    description: "チェックリストへ",
    href: "/mypage/checklist",
    accent: "bg-sky-50 text-sky-700",
    mark: "C",
  },
  {
    title: "仕事と住まいを比較する",
    description: "生活プランを確認",
    href: "/planner",
    accent: "bg-teal-50 text-teal-700",
    mark: "P",
  },
];

export default function GoalNavigation() {
  return (
    <section className="bg-white px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-lg font-black text-gray-900 md:text-2xl">
          今したいことから選ぶ
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {goals.map((goal) => (
            <Link
              key={goal.href}
              href={goal.href}
              className="group flex min-h-[132px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 md:min-h-[150px] md:p-4"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${goal.accent}`}
                aria-hidden="true"
              >
                {goal.mark}
              </span>
              <h3 className="mt-3 text-sm font-black leading-5 text-gray-900 md:text-base">
                {goal.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-600 md:text-sm">
                {goal.description}
              </p>
              <span className="mt-auto pt-2 text-xs font-black text-blue-700 md:text-sm">
                開く
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
