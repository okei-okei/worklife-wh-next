import Link from "next/link";

const comparisons = [
  {
    number: "01",
    label: "Mobile",
    title: "SIM・eSIM",
    description: "渡航前後に使える通信手段を比較できます。",
    points: ["データ容量", "出発前購入", "日本語対応"],
    href: "/partners/sim-esim",
  },
  {
    number: "02",
    label: "Insurance",
    title: "海外保険",
    description: "医療費や補償内容を契約前に整理できます。",
    points: ["医療補償", "ワーホリ対応", "請求方法"],
    href: "/partners/insurance",
  },
  {
    number: "03",
    label: "Money",
    title: "海外送金",
    description: "手数料、為替レート、着金速度を比較できます。",
    points: ["手数料", "着金速度", "アプリ対応"],
    href: "/partners/money-transfer",
  },
];

export default function PopularPartners() {
  return (
    <section className="bg-gray-50 px-4 py-9 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-700">
              COMPARE SERVICES
            </p>
            <h2 className="mt-2 text-xl font-black text-gray-900 md:text-4xl">
              渡航前後に役立つサービスを比較
            </h2>
          </div>
          <Link
            href="/partners"
            className="shrink-0 text-xs font-black text-blue-700 md:text-sm"
          >
            比較サービスをすべて見る
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4">
          {comparisons.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[1.35rem] border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 md:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-base font-black text-gray-900 md:text-lg">
                    {item.title}
                  </h3>
                </div>
                <p className="font-serif text-3xl italic text-emerald-600/40 md:text-5xl">
                  {item.number}
                </p>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                {item.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-700"
                  >
                    {point}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-black text-blue-700 transition group-hover:translate-x-0.5 md:text-sm">
                比較を見る
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
