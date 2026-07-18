import Link from "next/link";

const comparisons = [
  {
    number: "01",
    title: "SIM・eSIM",
    points: ["データ容量", "出発前購入"],
    href: "/partners/sim-esim",
  },
  {
    number: "02",
    title: "海外保険",
    points: ["医療補償", "ワーホリ対応"],
    href: "/partners/insurance",
  },
  {
    number: "03",
    title: "海外送金",
    points: ["手数料", "着金速度"],
    href: "/partners/money-transfer",
  },
];

export default function PopularPartners() {
  return (
    <section
      data-scene="information"
      data-background-scene="information"
      className="bg-[#F7F7F5] px-4 py-16 text-[#171717] md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
              COMPARE SERVICES
            </p>
            <h2 className="mt-2 text-xl font-black text-[#171717] md:text-4xl">
              渡航前後のサービスを比較する
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#666666]">
              通信、保険、お金の準備を分かりやすく整理しています。
            </p>
          </div>
          <Link
            href="/partners"
            className="shrink-0 text-xs font-black text-[#315C55] md:text-sm"
          >
            比較一覧へ
          </Link>
        </div>

        <div className="mt-6 divide-y divide-[#D8D8D4] border-y border-[#D8D8D4]">
          {comparisons.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group grid gap-3 py-5 transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center md:px-3"
            >
              <p className="font-serif text-4xl italic leading-none text-[#235347]/35 md:text-6xl">
                {item.number}
              </p>
              <div>
                <h3 className="text-lg font-black text-[#171717] md:text-2xl">
                  {item.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-[#D8D8D4] bg-white/70 px-2 py-1 text-[10px] font-bold text-[#666666]"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs font-black text-[#315C55] transition group-hover:translate-x-1 md:text-sm motion-reduce:group-hover:translate-x-0">
                比較を見る →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
