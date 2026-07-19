import Link from "next/link";
import HomeImagePlane from "@/components/home/HomeImagePlane";

const comparisons = [
  {
    title: "SIM・eSIM",
    points: ["データ容量", "出発前購入"],
    href: "/partners/sim-esim",
  },
  {
    title: "海外保険",
    points: ["医療補償", "ワーホリ対応"],
    href: "/partners/insurance",
  },
  {
    title: "海外送金",
    points: ["手数料", "着金速度"],
    href: "/partners/money-transfer",
  },
];

export default function PopularPartners() {
  return (
    <section
      data-scene="partners"
      data-background-scene="partners"
      className="relative overflow-hidden bg-[#F7F7F5] px-4 py-16 text-[#171717] md:px-6 md:py-28"
    >
      <HomeImagePlane
        desktopSrc="/images/home/partners-desktop.webp"
        mobileSrc="/images/home/partners-mobile.webp"
        alt="通信や送金など渡航前後のサービス比較を想起する写真"
        sizes="(min-width: 768px) 100vw, 100vw"
        className="left-0 top-0 h-[260px] w-full bg-[#F7F7F5] md:left-0 md:top-0 md:h-[58svh] md:w-full"
        imageClassName="object-[50%_42%] md:object-[54%_56%]"
      />
      <div className="absolute inset-x-0 top-[190px] h-[70px] bg-gradient-to-b from-transparent via-[#F7F7F5]/35 to-[#F7F7F5] md:top-0 md:h-[58svh] md:via-[#F7F7F5]/20" />
      <div className="relative z-10 mx-auto max-w-6xl pt-[270px] md:min-h-[86svh] md:pt-[46svh]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
              COMPARE SERVICES
            </p>
            <h2 className="home-heading mt-2 max-w-[680px] text-xl font-black text-[#171717] md:text-4xl">
              <span className="home-nowrap">渡航前後の</span>
              <span className="home-nowrap">サービスを比較する</span>
            </h2>
            <p className="home-copy mt-2 max-w-xl text-sm font-medium leading-6 text-[#666666]">
              通信、保険、お金の準備を分かりやすく整理しています。
            </p>
          </div>
          <Link
            href="/partners"
            className="home-link-label shrink-0 whitespace-nowrap text-xs font-black text-[#315C55] md:text-sm"
          >
            比較一覧へ
          </Link>
        </div>

        <div className="mt-6 divide-y divide-[#D8D8D4] border-y border-[#D8D8D4]">
          {comparisons.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group grid gap-3 py-5 transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-3"
            >
              <div>
                <h3 className="home-heading text-lg font-black text-[#171717] md:text-2xl">
                  {item.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.points.map((point) => (
                    <span
                      key={point}
                      className="home-link-label rounded-full border border-[#D8D8D4] bg-white/70 px-2 py-1 text-[10px] font-bold text-[#666666]"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
              <p className="home-link-label whitespace-nowrap text-xs font-black text-[#315C55] transition group-hover:translate-x-1 md:text-sm motion-reduce:group-hover:translate-x-0">
                比較を見る →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
