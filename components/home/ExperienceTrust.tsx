import Link from "next/link";

export default function ExperienceTrust() {
  return (
    <section className="bg-white px-4 py-9 md:px-6 md:py-16">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-gray-950 text-white shadow-xl md:grid-cols-[0.92fr_1.08fr]">
        <div className="flex min-h-[220px] flex-col justify-between bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.32),transparent_34%),linear-gradient(135deg,#0f172a,#111827)] p-5 md:min-h-[360px] md:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-300">
            REAL EXPERIENCE
          </p>
          <p className="font-serif text-5xl italic leading-none text-white/20 md:text-8xl">
            WH
          </p>
        </div>
        <div className="p-5 md:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
            EDITORIAL POLICY
          </p>
          <h2 className="mt-3 text-xl font-black leading-tight text-white md:text-4xl">
            実際の海外生活をもとに発信
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-200 md:text-base md:leading-7">
            WorkLife WH編集部が、ニュージーランドでのワーキングホリデー経験と公式情報をもとに、仕事・住まい・生活情報を継続的に更新しています。
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {["実体験", "公式情報", "継続更新"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-white"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/about"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-black text-white hover:bg-white/15 sm:w-auto"
            >
              運営方針を見る
            </Link>
            <Link
              href="/articles"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-black text-gray-950 hover:bg-gray-100 sm:w-auto"
            >
              役立ち情報を見る
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
