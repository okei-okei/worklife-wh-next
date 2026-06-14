import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="
        flex
        min-h-[68vh]
        items-center
        justify-center
        bg-gradient-to-r
        from-blue-600
        to-cyan-500
        px-4
        py-12
        text-white
        md:min-h-[80vh]
        md:px-6
      "
    >
      <div className="min-w-0 max-w-4xl text-center">
        <h1 className="mb-5 whitespace-normal break-words text-3xl font-bold leading-tight sm:text-4xl md:mb-6 md:text-7xl">
          海外生活を、
          <br />
          もっとリアルに。
        </h1>

        <p className="mb-8 whitespace-normal break-words text-base font-semibold leading-7 text-white md:mb-10 md:text-2xl md:leading-9">
          家探し × 仕事探し × 生活設計を
          <br />
          ひとつのサービスで。
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/register"
            className="w-full rounded-xl bg-white px-6 py-4 text-center text-base font-bold text-blue-700 transition hover:bg-gray-100 sm:w-auto md:px-8 md:text-lg"
          >
            無料ではじめる
          </Link>

          <Link
            href="/login"
            className="w-full rounded-xl border-2 border-white px-6 py-4 text-center text-base font-bold text-white transition hover:bg-white hover:text-blue-700 sm:w-auto md:px-8 md:text-lg"
          >
            ログイン
          </Link>
        </div>

        <div className="mt-10 space-y-1 text-base font-semibold leading-7 text-white md:mt-12">
          <p>ニュージーランドのワーホリからスタート。</p>

          <p>今後、オーストラリア・カナダにも対応予定。</p>
        </div>
      </div>
    </section>
  );
}
