import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="
        min-h-[80vh]
        flex
        items-center
        justify-center
        bg-gradient-to-r
        from-blue-600
        to-cyan-500
        text-white
        px-6
      "
    >
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          海外生活を、
          <br />
          もっとリアルに。
        </h1>

        <p className="text-xl md:text-2xl mb-10">
          家探し × 仕事探し × 生活設計を
          <br />
          ひとつのサービスで。
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="
              inline-block
              bg-white
              text-blue-600
              px-8
              py-4
              rounded-xl
              font-semibold
              text-lg
              hover:bg-gray-100
              transition
            "
          >
            無料ではじめる
          </Link>

          <Link
            href="/login"
            className="
              inline-block
              border-2
              border-white
              px-8
              py-4
              rounded-xl
              font-semibold
              text-lg
              hover:bg-white
              hover:text-blue-600
              transition
            "
          >
            ログイン
          </Link>
        </div>

        <div className="mt-12 text-sm md:text-base opacity-90">
          <p>ニュージーランドのワーホリからスタート。</p>

          <p>今後、オーストラリア・カナダにも対応予定。</p>
        </div>
      </div>
    </section>
  );
}
