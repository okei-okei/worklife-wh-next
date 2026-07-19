import Link from "next/link";
import HomeImagePlane from "@/components/home/HomeImagePlane";

const prepareItems = [
  { label: "SIM・通信", href: "/partners/sim-esim" },
  { label: "保険", href: "/partners/insurance" },
  { label: "銀行・海外送金", href: "/partners/money-transfer" },
  { label: "IRD・手続き", href: "/mypage/checklist" },
  { label: "生活用品", href: "/partners/furniture" },
];

export default function HomePreparation() {
  return (
    <section
      data-scene="preparation"
      data-background-scene="preparation"
      className="relative overflow-hidden bg-[#F7F7F5] px-4 py-16 text-[#171717] md:px-6 md:py-32"
    >
      <HomeImagePlane
        desktopSrc="/images/home/preparation-desktop.webp"
        mobileSrc="/images/home/preparation-mobile.webp"
        alt="渡航準備を想起させる荷物と新生活の風景"
        sizes="(min-width: 768px) 76vw, 100vw"
        className="left-0 top-0 h-[40svh] w-full bg-[#F7F7F5] md:left-0 md:top-0 md:h-[64svh] md:w-[82vw]"
        imageClassName="object-[50%_45%] md:object-[50%_56%]"
      />
      <div className="mx-auto grid max-w-6xl gap-7 pt-[41svh] md:min-h-[88svh] md:grid-cols-[0.42fr_0.58fr] md:items-end md:pt-[50svh]">
        <div className="relative z-10 bg-[#F7F7F5]/92 py-5 md:bg-transparent md:py-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            PREPARATION
          </p>
          <h2 className="mt-3 max-w-[680px] text-balance text-2xl font-black leading-tight md:text-4xl xl:text-5xl">
            <span className="hidden sm:inline">
              渡航準備を、一つずつ
            </span>
            <span className="sm:hidden">
              渡航準備を
              <br />
              一つずつ
            </span>
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-sm font-medium leading-6 text-[#666666] md:text-base md:leading-7">
            SIM、保険、銀行、IRD、生活用品を確認できます。
          </p>
        </div>

        <div className="relative z-10 grid gap-2 border-y border-[#D8D8D4] py-2 md:grid-cols-2 md:gap-x-6">
          {prepareItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-12 items-center justify-between gap-3 border-b border-[#D8D8D4] py-2 text-sm font-black text-[#171717] transition last:border-b-0 hover:text-[#235347] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:min-h-14"
            >
              <span className="flex items-center gap-3">
                <span>{item.label}</span>
              </span>
              <span className="transition group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
