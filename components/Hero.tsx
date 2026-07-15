import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="
        relative
        flex
        min-h-[62vh]
        overflow-hidden
        items-center
        justify-center
        px-4
        py-10
        text-white
        md:min-h-[80vh]
        md:px-6
      "
    >
      <Image
        src="/nz-hero-landscape-1200.jpg"
        alt="ニュージーランドの山と湖の景色"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-blue-950/30 to-slate-950/55" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />

      <div className="relative z-10 min-w-0 max-w-4xl text-center">
        <h1 className="mb-3 whitespace-normal break-words text-lg font-bold leading-tight text-white drop-shadow sm:text-xl md:mb-5 md:text-3xl">
          ニュージーランドワーホリ総合情報サイト
        </h1>

        <p className="mb-4 whitespace-normal break-words text-3xl font-bold leading-tight sm:text-4xl md:mb-6 md:text-7xl">
          海外生活を、
          <br />
          もっとリアルに。
        </p>

        <p className="mx-auto mb-5 max-w-3xl whitespace-normal break-words text-sm font-semibold leading-7 text-white drop-shadow md:mb-10 md:text-xl md:leading-9">
          ニュージーランドワーホリの仕事探し、家探し、SIM・eSIM、銀行口座、海外送金、海外保険、生活設計、ライフプランナーまで、一つのサービスでサポートします。
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-center sm:gap-3">
          <Link
            href="/jobs"
            className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 md:px-6 md:text-base"
          >
            求人を探す
          </Link>

          <Link
            href="/properties"
            className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 md:px-6 md:text-base"
          >
            物件を探す
          </Link>
        </div>

        <div className="mt-2 flex flex-col justify-center gap-2 sm:flex-row sm:gap-3 md:mt-3">
          <Link
            href="/register"
            className="w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-gray-100 sm:w-auto md:px-6 md:text-base"
          >
            無料ではじめる
          </Link>

          <Link
            href="/login"
            className="w-full rounded-xl border-2 border-white px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white hover:text-blue-700 sm:w-auto md:px-6 md:text-base"
          >
            ログイン
          </Link>
        </div>

        <div className="mt-6 rounded-2xl bg-white/12 p-3 text-sm font-semibold leading-6 text-white shadow-lg ring-1 ring-white/25 backdrop-blur md:mt-12 md:p-4 md:text-base md:leading-7">
          <p>ニュージーランドのワーホリからスタート。</p>

          <p>今後、オーストラリア・カナダにも対応予定。</p>
        </div>
      </div>
    </section>
  );
}
