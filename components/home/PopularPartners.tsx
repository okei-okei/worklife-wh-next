import Link from "next/link";

const comparisons = [
  {
    title: "SIM/eSIM",
    description: "渡航前後に使える通信手段を比較できます。",
    href: "/partners/sim-esim",
  },
  {
    title: "海外保険",
    description: "医療費や補償内容を契約前に整理できます。",
    href: "/partners/insurance",
  },
  {
    title: "海外送金",
    description: "手数料、為替レート、着金速度を比較できます。",
    href: "/partners/money-transfer",
  },
];

export default function PopularPartners() {
  return (
    <section className="bg-gray-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-700">Compare</p>
            <h2 className="mt-1 text-lg font-black text-gray-900 md:text-2xl">
              比較・おすすめ
            </h2>
          </div>
          <Link href="/partners" className="text-sm font-black text-blue-700">
            比較サービスをすべて見る
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {comparisons.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <h3 className="text-base font-black text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                {item.description}
              </p>
              <p className="mt-3 text-sm font-black text-blue-700">
                比較を見る
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
