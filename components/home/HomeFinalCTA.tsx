import Link from "next/link";

export default function HomeFinalCTA() {
  return (
    <section
      data-scene="final" data-background-scene="final"
      className="px-4 pb-24 pt-10 text-white md:px-6 md:pb-32 md:pt-16"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
          START YOUR LIFE PLAN
        </p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black leading-tight md:text-6xl">
              自分に合う海外生活を、
              <br />
              見つける。
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/82 md:text-base md:leading-7">
              仕事、住まい、通勤時間、生活費をまとめて比べられます。
            </p>
          </div>
          <div className="md:text-right">
            <p className="mb-3 text-xs font-bold text-emerald-300">
              無料で利用できます
            </p>
            <Link
              href="/planner"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-gray-950 transition hover:-translate-y-0.5 hover:bg-gray-100 sm:w-auto motion-reduce:hover:translate-y-0"
            >
              生活設計を始める
            </Link>
          </div>
        </div>
        <div className="mt-12 border-t border-white/15 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45 md:text-xs">
            WorkLife WH / Jobs / Homes / Planning / Real Guides
          </p>
        </div>
      </div>
    </section>
  );
}
