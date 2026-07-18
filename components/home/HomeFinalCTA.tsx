import Link from "next/link";

export default function HomeFinalCTA() {
  return (
    <section className="bg-gray-50 px-4 py-9 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gray-900 p-5 text-white md:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
              START YOUR LIFE PLAN
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight md:text-5xl">
              仕事と住まいを、
              <br className="hidden md:block" />
              一緒に考える。
            </h2>
          </div>
          <p className="max-w-md text-sm font-medium leading-6 text-gray-200 md:text-base md:leading-7">
            求人、物件、通勤時間、生活費をまとめて比較し、自分に合う生活プランを確認できます。
          </p>
        </div>
        <Link
          href="/planner"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-black text-gray-900 transition hover:-translate-y-0.5 hover:bg-gray-100 sm:w-auto"
        >
          ライフプランナーを使う
        </Link>
        <div className="mt-8 border-t border-white/15 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35 md:text-xs">
            WorkLife WH / Jobs / Homes / Planning / Real Guides
          </p>
        </div>
      </div>
    </section>
  );
}
