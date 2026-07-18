import Link from "next/link";

const lifeLinks = [
  { number: "01", label: "求人を保存", href: "/mypage/jobs" },
  { number: "02", label: "物件を保存", href: "/mypage/properties" },
  { number: "03", label: "地図で比較", href: "/planner" },
];

export default function HomeValueStatement() {
  return (
    <section
      data-scene="work-home" data-background-scene="work-home"
      className="px-4 py-20 text-white md:px-6 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.58fr)_minmax(280px,0.42fr)] md:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">
              WORK AND HOME
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight md:text-5xl">
              仕事と住まいを
              <br />
              一緒に考える
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/80 md:text-base md:leading-7">
              気になる求人と物件を保存し、通勤しやすさまで確認できます。
            </p>
          </div>

          <div className="grid gap-3">
            {lifeLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-16 items-center justify-between gap-4 rounded-full border border-white/20 bg-white/12 px-4 py-3 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:px-5"
              >
                <span className="flex items-center gap-4">
                  <span className="text-[11px] font-black tracking-[0.22em] text-emerald-200">
                    {item.number}
                  </span>
                  <span className="text-sm font-black md:text-base">
                    {item.label}
                  </span>
                </span>
                <span className="text-lg transition group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
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
