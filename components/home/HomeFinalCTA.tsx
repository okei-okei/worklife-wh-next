import Link from "next/link";
import HomeImagePlane from "@/components/home/HomeImagePlane";

export default function HomeFinalCTA() {
  return (
    <section
      data-scene="final"
      data-background-scene="final"
      className="relative overflow-hidden bg-white px-4 pb-20 pt-10 text-[#171717] md:px-6 md:pb-28 md:pt-14"
    >
      <HomeImagePlane
        desktopSrc="/images/home/final-desktop.webp"
        mobileSrc="/images/home/final-mobile.webp"
        alt="ニュージーランドの広い空と未来を感じる夕景"
        sizes="(min-width: 768px) 54vw, 100vw"
        className="left-0 top-0 h-[42svh] w-full bg-white md:left-[42vw] md:right-auto md:top-[8%] md:h-[70svh] md:w-[58vw]"
        imageClassName="object-[50%_42%] md:object-[52%_60%]"
      />
      <div className="absolute inset-x-0 top-[30svh] h-[12svh] bg-gradient-to-b from-transparent via-white/35 to-white md:hidden" />
      <div className="mx-auto grid max-w-6xl gap-8 pt-[42svh] md:min-h-[86svh] md:grid-cols-[minmax(0,430px)_1fr] md:items-center md:pt-0">
        <div className="relative z-10 bg-white/92 py-5 md:bg-transparent md:py-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            START YOUR LIFE PLAN
          </p>
          <h2 className="home-heading mt-3 max-w-[760px] text-3xl font-black leading-tight md:text-5xl xl:text-6xl">
            <span className="hidden sm:inline">
              <span className="home-nowrap">自分に合う海外生活を、</span>
              <span className="home-nowrap">見つける。</span>
            </span>
            <span className="sm:hidden">
              <span className="home-nowrap">自分に合う海外生活を、</span>
              <br />
              <span className="home-nowrap">見つける。</span>
            </span>
          </h2>
          <p className="home-copy mt-4 max-w-md text-sm font-medium leading-6 text-[#666666] md:text-base md:leading-7">
            仕事、住まい、通勤時間、生活費をまとめて比べられます。
          </p>
          <p className="mt-6 text-xs font-bold text-[#666666]">
            無料で利用できます
          </p>
          <Link
            href="/register"
            className="home-link-label mt-3 inline-flex min-h-12 w-full whitespace-nowrap items-center justify-center rounded-full bg-[#1E4D43] px-6 py-3 text-sm font-black text-white transition hover:bg-[#173d35] sm:w-auto"
          >
            会員登録して保存を始める
          </Link>
        </div>
        <div className="hidden md:block" />
        <div className="border-t border-[#D8D8D4] pt-4 md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#666666] md:text-xs">
            <span className="home-nowrap">WorkLife WH</span> / Jobs / Homes / Planning / Real Guides
          </p>
        </div>
      </div>
    </section>
  );
}
