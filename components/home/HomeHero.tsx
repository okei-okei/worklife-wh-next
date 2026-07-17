import Image from "next/image";
import Link from "next/link";
import HomeStartButton from "@/components/home/HomeStartButton";

export default function HomeHero() {
  return (
    <section className="bg-gradient-to-b from-white via-blue-50/70 to-white px-4 py-6 md:px-6 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            WorkLife WH
          </p>
          <p className="mt-3 text-3xl font-black leading-tight text-gray-900 md:text-6xl">
            海外生活を、
            <br />
            もっとリアルに。
          </p>
          <h1 className="mt-4 text-xl font-black leading-snug text-gray-900 md:text-3xl">
            ニュージーランドワーホリの仕事・住まい・生活設計を一つに
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-700 md:text-base md:leading-7">
            ニュージーランドでの仕事探し、家探し、生活費、SIM、銀行、海外送金、渡航準備を、実体験と便利な管理機能でサポートします。
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <HomeStartButton />
            <Link
              href="/articles"
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto md:px-5 md:text-base"
            >
              役立ち情報を見る
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/jobs" className="text-blue-700 hover:text-blue-900">
              求人を見る
            </Link>
            <Link
              href="/properties"
              className="text-emerald-700 hover:text-emerald-900"
            >
              物件を見る
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
          <Image
            src="/nz-hero-landscape-1200.jpg"
            alt="ニュージーランドの湖と山並みの景色"
            width={1200}
            height={800}
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 46vw"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4 text-white">
            <p className="text-xs font-bold">New Zealand Working Holiday</p>
            <p className="mt-1 text-sm font-medium leading-5">
              仕事、住まい、生活費をまとめて考えるための入口です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
