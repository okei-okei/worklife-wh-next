import Link from "next/link";

const features = [
  {
    title: "求人と物件をまとめて保存",
    description:
      "気になる仕事と住まいを保存し、あとから条件を見直せます。",
    href: "/mypage",
    mark: "01",
    label: "SAVE",
    mock: ["Saved jobs", "Saved homes", "Checklist"],
  },
  {
    title: "地図と生活費で比較",
    description:
      "通勤距離、家賃、収入を合わせて生活プランを確認できます。",
    href: "/planner",
    mark: "02",
    label: "COMPARE",
    mock: ["Route 18 min", "Rent $260/w", "Balance +$420"],
  },
  {
    title: "チェックリストで準備管理",
    description:
      "SIM、銀行、送金、保険など準備項目を整理できます。",
    href: "/mypage/checklist",
    mark: "03",
    label: "PREPARE",
    mock: ["SIM", "Bank", "Insurance"],
  },
];

export default function FeatureSummary() {
  return (
    <section className="bg-gray-50 px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              WHAT YOU CAN DO
            </p>
            <h2 className="mt-2 text-xl font-black text-gray-900 md:text-4xl">
              WorkLife WHでできること
            </h2>
          </div>
          <Link href="/mypage" className="text-sm font-black text-blue-700">
            すべての機能を見る
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:gap-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="grid gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_280px] md:items-center md:p-5 odd:md:grid-cols-[280px_minmax(0,1fr)]"
            >
              <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-emerald-50 p-4 odd:md:order-first even:md:order-last">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                  UI Preview
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
              <div>
                <p className="text-5xl font-black leading-none text-gray-100">
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
    </section>
  );
}
