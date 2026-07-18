import Link from "next/link";

const goals = [
  {
    number: "01",
    label: "FIND A JOB",
    title: "仕事を探す",
    description: "公開求人を見る",
    href: "/jobs",
    accent: "bg-blue-50 text-blue-700",
    mark: "J",
  },
  {
    number: "02",
    label: "FIND A HOME",
    title: "住まいを探す",
    description: "公開物件を見る",
    href: "/properties",
    accent: "bg-emerald-50 text-emerald-700",
    mark: "H",
  },
  {
    number: "03",
    label: "PREPARE",
    title: "渡航準備を進める",
    description: "チェックリストへ",
    href: "/mypage/checklist",
    accent: "bg-sky-50 text-sky-700",
    mark: "C",
  },
  {
    number: "04",
    label: "COMPARE",
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
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {goals.map((goal) => (
            <Link
              key={goal.href}
              href={goal.href}
              className="group flex min-h-[136px] flex-col rounded-3xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 motion-reduce:hover:translate-y-0 md:min-h-[170px] md:p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl font-black leading-none text-gray-100 md:text-5xl">
                  {goal.number}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${goal.accent}`}
                  aria-hidden="true"
                >
                  {goal.mark}
                </span>
              </div>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                {goal.label}
              </p>
              <h3 className="mt-2 text-sm font-black leading-5 text-gray-900 md:text-base">
                {goal.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-600 md:text-sm">
                {goal.description}
              </p>
              <span className="mt-auto pt-2 text-xs font-black text-blue-700 transition group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 md:text-sm">
                開く →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
