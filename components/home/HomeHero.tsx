import { getImageProps } from "next/image";
import Link from "next/link";
import HomeStartButton from "@/components/home/HomeStartButton";

export default function HomeHero() {
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    src: "/images/home/hero-desktop.jpg",
    alt: "",
    width: 1200,
    height: 675,
    sizes: "100vw",
    priority: true,
  });
  const {
    props: mobileImageProps,
  } = getImageProps({
    src: "/images/home/hero-mobile.jpg",
    alt: "",
    width: 900,
    height: 506,
    sizes: "100vw",
    priority: true,
  });
  const { srcSet: mobileSrcSet, alt: mobileAlt, ...mobileImageRest } =
    mobileImageProps;

  return (
    <section className="relative min-h-[600px] overflow-hidden bg-slate-950 px-4 py-8 text-white md:min-h-[680px] md:px-6 md:py-16">
      <picture className="absolute inset-0 block">
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
        <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
        <img
          {...mobileImageRest}
          alt={mobileAlt}
          className="h-full w-full object-cover object-center"
        />
      </picture>
      <div className="absolute inset-0 bg-slate-950/55 md:bg-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/45 to-slate-950/75 md:bg-gradient-to-r md:from-slate-950/80 md:via-slate-950/45 md:to-slate-950/10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[536px] max-w-6xl gap-6 md:min-h-[552px] md:grid-cols-[minmax(0,620px)_1fr] md:items-center">
        <div className="min-w-0 rounded-3xl border border-white/15 bg-slate-950/28 p-4 shadow-2xl shadow-slate-950/20 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
            WorkLife WH
          </p>
          <p className="mt-3 text-4xl font-black leading-tight text-white drop-shadow md:text-7xl">
            海外生活を、
            <br />
            もっとリアルに。
          </p>
          <h1 className="mt-4 text-xl font-black leading-snug text-white md:text-3xl">
            ニュージーランドワーホリの仕事・住まい・生活を一つに
          </h1>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/90 md:text-base md:leading-7">
            仕事探し、家探し、生活費、渡航準備をまとめて管理。現地経験をもとに、あなたの海外生活を支えます。
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <HomeStartButton />
            <Link
              href="/articles"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/45 bg-white/12 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto md:px-5 md:text-base"
            >
              役立ち情報を見る
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/jobs" className="text-blue-100 hover:text-white">
              求人を見る
            </Link>
            <Link
              href="/properties"
              className="text-emerald-100 hover:text-white"
            >
              物件を見る
            </Link>
          </div>
        </div>

        <div className="hidden justify-self-end rounded-3xl border border-white/20 bg-white/14 p-4 text-white shadow-2xl shadow-slate-950/20 md:block">
          <p className="text-xs font-bold text-emerald-200">Plan Preview</p>
          <div className="mt-3 grid gap-2 text-sm font-bold">
            {[
              ["求人", "時給・勤務時間を保存"],
              ["物件", "家賃・場所を比較"],
              ["通勤時間", "地図で距離を確認"],
              ["月間収支", "生活費を見える化"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-slate-950/24 px-3 py-2"
              >
                <p className="text-[11px] text-white/65">{label}</p>
                <p className="mt-1 text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
