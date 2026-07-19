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
      className="relative min-h-[98svh] overflow-hidden bg-white px-4 pb-10 pt-8 text-[#171717] md:min-h-[96svh] md:px-6 md:pb-20 md:pt-14"
    >
      <HomeImagePlane
        desktopSrc="/images/home/hero-desktop.webp"
        mobileSrc="/images/home/hero-mobile.webp"
        alt="ニュージーランドの空と街を感じる広い風景"
        priority
        sizes="(min-width: 768px) 56vw, 100vw"
        className="right-[-6vw] top-0 h-[44svh] w-[106vw] md:left-[44vw] md:right-auto md:top-0 md:h-[86svh] md:w-[56vw]"
        imageClassName="object-[50%_44%] md:object-[48%_50%] group-hover:scale-[1.01]"
      />
      <div className="absolute right-0 top-0 h-[44svh] w-full bg-gradient-to-b from-white/0 via-white/0 to-white md:hidden" />
      <div className="pointer-events-none absolute left-4 top-[43svh] hidden h-px w-[22vw] bg-[#D8D8D4] md:left-6 md:top-[76svh] md:block" />
      <div className="pointer-events-none absolute right-[-1.5rem] top-[49svh] select-none text-right font-serif text-7xl font-semibold italic leading-none tracking-tight text-[#235347]/10 md:right-auto md:left-[34%] md:top-[13%] md:text-[8rem]">
        WORK.
        <br />
        HOME.
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(98svh-5rem)] max-w-6xl content-end gap-8 pt-[46svh] md:min-h-[calc(96svh-5rem)] md:grid-cols-[minmax(0,460px)_1fr] md:content-center md:pt-0">
        <div
          data-home-hero-content
          className="min-w-0"
        >
          <p className="text-xs font-bold text-[#315C55] md:text-sm">
            ニュージーランド・ワーキングホリデー
          </p>
          <p className="mt-3 text-[34px] font-black leading-[1.02] tracking-tight text-[#171717] md:text-6xl">
            海外生活を、
            <br />
            もっとリアルに。
          </p>
          <h1 className="mt-4 max-w-md text-lg font-black leading-snug text-[#171717] md:text-2xl">
            ニュージーランドワーホリの仕事・住まい・生活を一つに
          </h1>
          <p className="mt-3 max-w-md text-sm font-medium leading-6 text-[#666666] md:text-base md:leading-7">
            仕事探し、家探し、生活費、渡航準備をまとめて管理。
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 md:max-w-md">
            {heroLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.variant === "primary"
                    ? "inline-flex min-h-11 items-center justify-center rounded-full bg-[#1E4D43] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#173d35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347]"
                    : "inline-flex min-h-11 items-center justify-center rounded-full border border-[#D8D8D4] bg-white/85 px-4 py-2 text-sm font-bold text-[#171717] transition hover:border-[#235347] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347]"
                }
              >
                {item.label}
                <span className="ml-2" aria-hidden="true">
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
