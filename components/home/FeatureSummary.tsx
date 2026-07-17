import Link from "next/link";

const features = [
  {
    title: "求人と物件をまとめて保存",
    description:
      "気になる仕事と住まいを保存し、あとから条件を見直せます。",
    href: "/mypage",
    mark: "01",
  },
  {
    title: "地図と生活費で比較",
    description:
      "通勤距離、家賃、収入を合わせて生活プランを確認できます。",
    href: "/planner",
    mark: "02",
  },
  {
    title: "渡航準備をチェックリストで管理",
    description:
      "SIM、銀行、送金、保険など準備項目を整理できます。",
    href: "/mypage/checklist",
    mark: "03",
  },
];

export default function FeatureSummary() {
  return (
    <section className="bg-gray-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold text-blue-700">Features</p>
            <h2 className="mt-1 text-lg font-black text-gray-900 md:text-2xl">
              WorkLife WHでできること
            </h2>
          </div>
          <Link href="/mypage" className="text-sm font-black text-blue-700">
            すべての機能を見る
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-black text-emerald-700">
                {feature.mark}
              </p>
              <h3 className="mt-2 text-base font-black text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="mt-3 inline-flex text-sm font-black text-blue-700"
              >
                詳細を見る
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
