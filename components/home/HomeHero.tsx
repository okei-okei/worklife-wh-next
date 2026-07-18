import Link from "next/link";
import HomeHeroScrollEffect from "@/components/home/HomeHeroScrollEffect";
import HomeStartButton from "@/components/home/HomeStartButton";

export default function HomeHero() {
  return (
    <section
      data-home-hero
      data-background-scene="start"
      className="relative min-h-[620px] overflow-hidden px-4 pb-8 pt-24 text-white md:min-h-[760px] md:px-6 md:pb-16 md:pt-28"
    >
      <HomeHeroScrollEffect />
      <div className="pointer-events-none absolute right-[-1.5rem] top-20 z-10 hidden select-none text-right text-7xl font-semibold leading-none tracking-tight text-white/10 lg:block xl:text-8xl">
        WORK.
        <br />
        HOME.
        <br />
        LIFE.
      </div>

      <div className="relative z-10 mx-auto grid min-h-[500px] max-w-6xl gap-6 md:min-h-[616px] md:grid-cols-[minmax(0,600px)_1fr] md:items-center">
        <div
          data-home-hero-content
          className="min-w-0 transition-transform duration-300 motion-reduce:transition-none"
        >
          <p className="text-xs font-bold text-emerald-200 md:text-sm">
            ニュージーランド・ワーキングホリデー
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
            仕事探し、家探し、生活費、渡航準備をまとめて管理。
            <br className="hidden sm:block" />
            現地での経験をもとに、海外生活の選択を支えます。
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

        <div className="hidden w-full max-w-[280px] justify-self-end rounded-[2rem_2rem_2rem_5rem] border border-white/20 bg-white/10 p-4 text-white shadow-2xl shadow-slate-950/20 backdrop-blur md:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
            Life Plan Mock
          </p>
          <div className="mt-3 grid gap-2 text-sm font-bold">
            {[
              ["保存した求人", "時給・勤務時間を確認"],
              ["保存した物件", "家賃・場所を比較"],
              ["通勤時間", "地図で距離を確認"],
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
      <div
        data-home-hero-scroll
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-white/65 transition-opacity duration-300 md:block"
        aria-hidden="true"
      >
        Scroll
        <span className="mx-auto mt-2 block h-8 w-px bg-white/45" />
      </div>
    </section>
  );
}
