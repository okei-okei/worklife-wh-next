import Link from "next/link";

export default function ExperienceTrust() {
  return (
    <section
      data-scene="final" data-background-scene="final"
      className="px-4 py-20 text-white md:px-6 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-6 border-y border-white/18 py-10 md:grid-cols-[0.42fr_0.58fr] md:items-center md:py-14">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
            REAL EXPERIENCE
          </p>
          <h2 className="mt-3 text-xl font-black leading-tight text-white md:text-4xl">
            実際の海外生活をもとに発信
          </h2>
        </div>
        <div>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-200 md:text-base md:leading-7">
            WorkLife WH編集部が、ニュージーランドでのワーホリ経験と公式情報をもとに、仕事・住まい・生活情報を更新しています。
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {["実体験", "公式情報", "継続更新"].map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-center text-sm font-black text-white"
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
