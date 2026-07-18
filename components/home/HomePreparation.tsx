import Link from "next/link";

const prepareItems = [
  { label: "通信", href: "/partners/sim-esim" },
  { label: "保険", href: "/partners/insurance" },
  { label: "お金", href: "/partners/money-transfer" },
  { label: "手続き", href: "/mypage/checklist" },
  { label: "生活用品", href: "/partners/furniture" },
];

export default function HomePreparation() {
  return (
    <section
      data-background-scene="prepare"
      className="px-4 py-20 text-white md:px-6 md:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] md:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-100">
            PREPARATION
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight md:text-5xl">
            準備を一つずつ進める
          </h2>
          <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-white/80 md:text-base md:leading-7">
            SIM、保険、銀行、IRD、生活用品を確認できます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {prepareItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex min-h-14 items-center justify-between gap-3 rounded-full border border-white/18 bg-white/12 px-4 py-3 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                index === 4 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <span>{item.label}</span>
              <span className="transition group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
