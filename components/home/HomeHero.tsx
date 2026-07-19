import Link from "next/link";
import HomeImagePlane from "@/components/home/HomeImagePlane";

const heroLinks = [
  { href: "/jobs", label: "求人を探す", variant: "primary" },
  { href: "/properties", label: "物件を探す", variant: "primary" },
  { href: "/register", label: "会員登録", variant: "secondary" },
  { href: "/login", label: "ログイン", variant: "secondary" },
];

export default function HomeHero() {
  return (
    <section
      data-home-hero
      data-scene="hero"
      data-background-scene="hero"
      className="relative min-h-[100svh] overflow-hidden bg-white px-4 pb-8 pt-3 text-[#171717] md:min-h-[96svh] md:px-6 md:pb-20 md:pt-14"
    >
      <HomeImagePlane
        desktopSrc="/images/home/hero-desktop.webp"
        mobileSrc="/images/home/hero-mobile.webp"
        alt="ニュージーランドの空と街を感じる広い風景"
        priority
        sizes="(min-width: 768px) 56vw, 100vw"
        className="left-0 top-0 h-[36svh] w-full bg-white sm:h-[40svh] md:left-[44vw] md:top-0 md:h-[86svh] md:w-[56vw]"
        imageClassName="object-[50%_45%] md:object-[48%_50%] group-hover:scale-[1.01]"
      />
      <div className="absolute right-0 top-0 h-[36svh] w-full bg-gradient-to-b from-white/0 via-white/0 to-white sm:h-[40svh] md:hidden" />
      <div className="pointer-events-none absolute left-4 top-[43svh] hidden h-px w-[22vw] bg-[#D8D8D4] md:left-6 md:top-[76svh] md:block" />
      <div className="pointer-events-none absolute right-[-1.5rem] top-[49svh] hidden select-none text-right font-serif text-7xl font-semibold italic leading-none tracking-tight text-[#235347]/10 md:right-auto md:left-[34%] md:top-[13%] md:block md:text-[8rem]">
        <span className="block">WORK.</span>
        <span className="block">HOME.</span>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-4 pt-[36svh] sm:pt-[40svh] md:min-h-[calc(96svh-5rem)] md:grid-cols-[minmax(0,460px)_1fr] md:content-center md:gap-8 md:pt-0">
        <div
          data-home-hero-content
          className="min-w-0"
        >
          <p className="text-xs font-bold text-[#315C55] md:text-sm">
            ニュージーランド・ワーキングホリデー
          </p>
          <p className="mt-2 max-w-[620px] text-balance text-[32px] font-black leading-[1.03] tracking-tight text-[#171717] md:mt-3 md:text-6xl">
            <span className="block sm:inline">海外生活を、</span>
            <span className="block sm:inline">もっとリアルに。</span>
          </p>
          <h1 className="mt-3 max-w-[680px] text-balance text-[17px] font-black leading-snug text-[#171717] [word-break:auto-phrase] md:mt-4 md:text-2xl">
            <span className="hidden sm:inline">
              ニュージーランドワーホリの仕事・住まい・生活を一つに
            </span>
            <span className="sm:hidden">
              ニュージーランドワーホリの
              <br />
              仕事・住まい・生活を一つに
            </span>
          </h1>
          <p className="mt-2 max-w-md text-pretty text-sm font-medium leading-6 text-[#666666] md:mt-3 md:text-base md:leading-7">
            <span className="sm:hidden">
              仕事・住まい・生活準備を
              <br />
              まとめて確認できます。
            </span>
            <span className="hidden sm:inline">
              仕事探し、家探し、生活費、渡航準備をまとめて管理。
            </span>
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 md:mt-5 md:max-w-md">
            {heroLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.variant === "primary"
                    ? "inline-flex min-h-[42px] min-w-0 whitespace-nowrap items-center justify-center rounded-full bg-[#1E4D43] px-3 py-2 text-[13px] font-bold text-white transition hover:bg-[#173d35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] sm:text-sm"
                    : "inline-flex min-h-[42px] min-w-0 whitespace-nowrap items-center justify-center rounded-full border border-[#D8D8D4] bg-white/85 px-3 py-2 text-[13px] font-bold text-[#171717] transition hover:border-[#235347] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] sm:text-sm"
                }
              >
                {item.label}
                <span className="ml-1.5 hidden min-[360px]:inline" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
