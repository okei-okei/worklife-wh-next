import HomeImagePlane from "@/components/home/HomeImagePlane";
import HomeLineLink from "@/components/home/HomeLineLink";

const lifeLinks = [
  { label: "公開求人を見る", href: "/jobs" },
  { label: "気になる求人を保存", href: "/mypage/jobs" },
  { label: "応募メールを作成", href: "/mypage/job-application" },
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
        className="left-0 top-0 h-[42svh] w-full bg-[#F3F0EA] md:left-0 md:top-[10%] md:h-[76svh] md:w-[66vw]"
        imageClassName="object-[50%_42%] md:object-[54%_58%]"
      />
      <div className="mx-auto grid max-w-6xl gap-7 pt-[43svh] md:min-h-[88svh] md:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] md:items-center md:pt-0">
        <div className="hidden md:block" />
        <div className="relative z-10 bg-[#F3F0EA]/92 py-6 md:bg-transparent md:py-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            JOB SEARCH
          </p>
          <h2 className="home-heading mt-3 max-w-[680px] text-2xl font-black leading-tight md:text-4xl xl:text-5xl">
            <span className="hidden sm:inline">
              <span className="home-nowrap">ニュージーランド</span>で<span className="home-nowrap">仕事を探す</span>
            </span>
            <span className="sm:hidden">
              <span className="home-nowrap">ニュージーランド</span>で
              <br />
              <span className="home-nowrap">仕事を探す</span>
            </span>
          </h2>
          <p className="home-copy mt-4 max-w-md text-sm font-medium leading-6 text-[#666666] md:max-w-lg md:text-base md:leading-7">
            <span className="home-nowrap">公開求人</span>を確認し、気になる仕事を保存できます。
          </p>

          <div className="mt-7 border-t border-[#D8D8D4]">
            {lifeLinks.map((item) => (
              <HomeLineLink
                key={item.href}
                href={item.href}
                title={item.label}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
