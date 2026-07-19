import Link from "next/link";
import HomeImagePlane from "@/components/home/HomeImagePlane";

const metrics = [
  { value: "求人", label: "選ぶ" },
  { value: "物件", label: "選ぶ" },
  { value: "通勤", label: "確認" },
  { value: "残額", label: "確認" },
];

export default function FeatureSummary() {
  return (
    <section
      data-scene="simulator"
      data-background-scene="simulator"
      className="relative overflow-hidden bg-white px-4 py-16 text-[#171717] md:px-6 md:py-32"
    >
      <HomeImagePlane
        desktopSrc="/images/home/simulator-desktop.webp"
        mobileSrc="/images/home/simulator-mobile.webp"
        alt="住宅地と都市をつなぐ道路から収支と通勤を想起する風景"
        sizes="(min-width: 768px) 68vw, 100vw"
        className="right-0 top-0 h-[42svh] w-full bg-white md:right-[-8vw] md:top-[10%] md:h-[76svh] md:w-[68vw]"
        imageClassName="object-[50%_44%] md:object-[50%_58%]"
      />
      <div className="pointer-events-none absolute left-4 top-[42svh] h-px w-[42vw] bg-[#D8D8D4] md:left-[6vw] md:top-[20%] md:w-[22vw]" />
      <div className="mx-auto grid max-w-6xl gap-7 pt-[43svh] md:min-h-[88svh] md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] md:items-center md:pt-0">
        <div className="relative z-10 bg-white/92 py-5 md:bg-transparent md:py-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            TRIAL SIMULATION
          </p>
          <h2 className="home-heading mt-3 max-w-[700px] text-2xl font-black leading-tight md:text-4xl xl:text-5xl">
            <span className="hidden sm:inline">
              <span className="home-nowrap">海外生活を</span>
              <span className="home-nowrap">シミュレーションする</span>
            </span>
            <span className="sm:hidden">
              <span className="home-nowrap">海外生活を</span>
              <br />
              <span className="home-nowrap">シミュレーションする</span>
            </span>
          </h2>
          <p className="home-copy mt-4 max-w-xl text-sm font-medium leading-6 text-[#666666] md:text-base md:leading-7">
            <span className="sm:hidden">
              求人と物件を選んで、<span className="home-nowrap">月に残るお金</span>を確認できます。
            </span>
            <span className="hidden lg:inline">
              <span className="home-nowrap">公開求人と物件</span>を一つずつ選び、
              <br />
              <span className="home-nowrap">月に残るお金</span>と通勤しやすさを確認できます。
            </span>
            <span className="hidden sm:inline lg:hidden">
              <span className="home-nowrap">公開求人と物件</span>を選び、<span className="home-nowrap">月に残るお金</span>を確認できます。
            </span>
          </p>

        <div className="mt-7 grid grid-cols-2 border-y border-[#D8D8D4]">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="border-[#D8D8D4] px-3 py-4 even:border-l md:px-5 md:py-5"
            >
              <p className="text-3xl font-black leading-none tracking-tight text-[#171717] md:text-4xl">
                {metric.value}
              </p>
              <p className="mt-2 text-xs font-bold text-[#666666] md:text-sm">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/simulator"
            className="inline-flex min-h-11 w-full whitespace-nowrap items-center justify-center rounded-full bg-[#1E4D43] px-4 py-2 text-sm font-black text-white transition hover:bg-[#173d35] sm:w-auto"
          >
            <span className="home-link-label sm:hidden">シミュレーションする</span>
            <span className="home-link-label hidden sm:inline">海外生活をシミュレーションする</span>
          </Link>
          <p className="text-xs font-semibold text-[#666666]">
            登録不要・保存なし
          </p>
        </div>
      </div>
      <div className="hidden md:block" />
      </div>
    </section>
  );
}
