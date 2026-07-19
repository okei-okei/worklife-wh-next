import HomeImagePlane from "@/components/home/HomeImagePlane";
import HomeLineLink from "@/components/home/HomeLineLink";

const lifeLinks = [
  { number: "01", label: "公開求人を見る", href: "/jobs" },
  { number: "02", label: "気になる求人を保存", href: "/mypage/jobs" },
  { number: "03", label: "応募メールを作成", href: "/mypage/job-application" },
];

export default function HomeValueStatement() {
  return (
    <section
      data-scene="jobs"
      data-background-scene="jobs"
      className="relative overflow-hidden bg-[#F3F0EA] px-4 py-16 text-[#171717] md:px-6 md:py-32"
    >
      <HomeImagePlane
        desktopSrc="/images/home/jobs-desktop.webp"
        mobileSrc="/images/home/jobs-mobile.webp"
        alt="ニュージーランドのカフェや街で働く日常"
        sizes="(min-width: 768px) 66vw, 100vw"
        className="left-0 top-0 h-[40svh] w-full md:left-0 md:top-[10%] md:h-[76svh] md:w-[66vw]"
        imageClassName="object-[56%_48%]"
      />
      <div className="pointer-events-none absolute left-4 top-[41svh] font-serif text-7xl italic leading-none text-[#235347]/10 md:left-[58%] md:top-[14%] md:text-[12rem]">
        02
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 pt-[42svh] md:min-h-[88svh] md:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] md:items-center md:pt-0">
        <div className="hidden md:block" />
        <div className="relative z-10 bg-[#F3F0EA]/92 py-6 md:bg-transparent md:py-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            JOB SEARCH
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight md:text-5xl">
            ニュージーランドで
            <br />
            仕事を探す
          </h2>
          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-[#666666] md:text-base md:leading-7">
            公開求人を確認し、気になる仕事を保存できます。
          </p>

          <div className="mt-7 border-t border-[#D8D8D4]">
            {lifeLinks.map((item) => (
              <HomeLineLink
                key={item.href}
                href={item.href}
                number={item.number}
                title={item.label}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
