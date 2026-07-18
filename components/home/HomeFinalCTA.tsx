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
        className="right-[-10vw] top-0 h-[34svh] w-[100vw] md:left-[46vw] md:right-auto md:top-[10%] md:h-[56svh] md:w-[54vw]"
        imageClassName="object-[52%_50%]"
      />
      <div className="absolute right-0 top-0 h-[34svh] w-full bg-gradient-to-b from-transparent to-white md:hidden" />
      <div className="pointer-events-none absolute left-4 top-[32svh] font-serif text-7xl italic leading-none text-[#235347]/10 md:left-[6vw] md:top-[12%] md:text-[12rem]">
        07
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 pt-[34svh] md:min-h-[72svh] md:grid-cols-[minmax(0,430px)_1fr] md:items-center md:pt-0">
        <div className="relative z-10 bg-white/92 py-5 md:bg-transparent md:py-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            START YOUR LIFE PLAN
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight md:text-6xl">
            自分に合う海外生活を、
            <br />
            見つける。
          </h2>
          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-[#666666] md:text-base md:leading-7">
            仕事、住まい、通勤時間、生活費をまとめて比べられます。
          </p>
          <p className="mt-6 text-xs font-bold text-[#666666]">
            無料で利用できます
          </p>
          <Link
            href="/planner"
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#1E4D43] px-6 py-3 text-sm font-black text-white transition hover:bg-[#173d35] sm:w-auto"
          >
            生活設計を始める
          </Link>
        </div>
        <div className="hidden md:block" />
        <div className="border-t border-[#D8D8D4] pt-4 md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#666666] md:text-xs">
            WorkLife WH / Jobs / Homes / Planning / Real Guides
          </p>
        </div>
      </div>
    </section>
  );
}
