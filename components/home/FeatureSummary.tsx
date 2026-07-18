import Link from "next/link";

const metrics = [
  { value: "18分", label: "通勤時間" },
  { value: "$4,200", label: "月収" },
  { value: "$260/w", label: "家賃" },
  { value: "+$420", label: "毎月の残額" },
];

export default function FeatureSummary() {
  return (
    <section
      data-background-scene="planning"
      className="px-4 py-20 text-white md:px-6 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-200">
            LIFE PLANNING
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight md:text-5xl">
            暮らし全体を比べる
          </h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-white/80 md:text-base md:leading-7">
            通勤時間、家賃、収入、生活費をまとめて確認します。
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 border-y border-white/20 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="border-white/20 px-3 py-5 even:border-l md:border-l md:first:border-l-0 md:px-6 md:py-7"
            >
              <p className="text-3xl font-black leading-none tracking-tight text-white md:text-5xl">
                {metric.value}
              </p>
              <p className="mt-2 text-xs font-bold text-white/70 md:text-sm">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-xs font-semibold text-white/62">表示例です。</p>
          <Link
            href="/planner"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-black text-gray-950 transition hover:-translate-y-0.5 hover:bg-gray-100 sm:w-auto motion-reduce:hover:translate-y-0"
          >
            ライフプランナーで確認する
          </Link>
        </div>
      </div>
    </section>
  );
}
